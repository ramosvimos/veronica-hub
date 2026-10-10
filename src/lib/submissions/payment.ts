import { randomUUID } from "node:crypto";
import { z } from "zod";
import { assertAdminAccess, assertSubmissionAccess } from "./access";
import { paidSubmissionConfiguration } from "./config";
import { submissionIdSchema, versionSchema } from "./schema";
import { mutateSubmissionRecord, readSubmissionRecord, updateSubmissionFromProvider } from "./store";
import { privateSubmission, SubmissionError, type CheckoutAttempt, type SubmissionRecord } from "./types";
import {
  createProviderCheckout, retrieveProviderCheckout, retrieveProviderRefund, validateProviderCheckout,
  validateProviderRefund, verifyProviderWebhook, PAID_SUBMISSION_PURPOSE,
  type PaidProviderConfiguration, type ProviderCheckoutSession, type ProviderWebhookEvent,
} from "./payment-provider";

const mismatch = () => new SubmissionError("payment_mismatch", "The payment does not match this saved submission.", 409);
const stateError = () => new SubmissionError("state", "This submission is not awaiting a payment. Refresh its private status.", 409);
const MAX_ATTEMPTS = 10;
const MAX_EVENT_RECEIPTS = 64;
const MAX_AMBIGUOUS_RETRY_MS = 23 * 60 * 60 * 1000;

async function requirePayments(existingPayments = false) {
  const config = await paidSubmissionConfiguration(undefined, existingPayments);
  if (!config.ready) throw new SubmissionError("payments_disabled", config.message, 503);
  return config.provider;
}
function paymentFor(record: SubmissionRecord, config: PaidProviderConfiguration) {
  if (record.serviceType !== "paid" || !record.payment || record.payment.environment !== config.environment) throw mismatch();
  return record.payment;
}
export function paidReviewDeadline(confirmedAt: string): string {
  const date = new Date(confirmedAt);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid payment confirmation time");
  let days = 0;
  while (days < 7) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days++;
  }
  return date.toISOString();
}
function attemptFor(record: SubmissionRecord, session: ProviderCheckoutSession, config: PaidProviderConfiguration): CheckoutAttempt {
  const payment = paymentFor(record, config);
  const attempt = payment.attempts.find(value => value.id === session.metadata.attemptId);
  if (!attempt || (attempt.sessionId && attempt.sessionId !== session.id) || attempt.expiresAt !== session.expires_at) throw mismatch();
  validateProviderCheckout(session, config, { submissionId: record.id, attemptId: attempt.id });
  return attempt;
}

async function applyProviderSession(id: string, session: ProviderCheckoutSession, config: PaidProviderConfiguration, event?: ProviderWebhookEvent) {
  return updateSubmissionFromProvider(id, current => {
    const payment = paymentFor(current, config);
    const attempt = attemptFor(current, session, config);
    if (event && payment.events.some(receipt => receipt.id === event.id)) return current;
    const now = new Date().toISOString();
    const successfulEvent = event && ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)
      && event.data.object.payment_status === "paid";
    const confirmedAt = successfulEvent ? new Date(Math.min(Date.now(), event.created * 1000)).toISOString() : now;
    const events = event ? [...payment.events, { id: event.id, type: event.type, receivedAt: now }].slice(-MAX_EVENT_RECEIPTS) : payment.events;
    const attempts = payment.attempts.map(item => item.id === attempt.id ? {
      ...item, sessionId: session.id,
      ...(session.status === "expired" && session.payment_status === "unpaid" ? { expiredVerifiedAt: item.expiredVerifiedAt || now } : {}),
    } : item);
    if (session.payment_status === "paid") {
      if (session.status !== "complete" || !session.payment_intent) throw mismatch();
      if (payment.status === "paid") {
        if (payment.sessionId !== session.id || payment.paymentIntentId !== session.payment_intent) throw mismatch();
        // A replay can record a receipt, but never undo a review, refund or withdrawal.
        const earlier = confirmedAt < payment.paidAt!;
        return event || earlier ? { ...current, payment: { ...payment, events,
          ...(earlier ? { paidAt: confirmedAt, reviewDueAt: paidReviewDeadline(confirmedAt) } : {}),
        } } : current;
      }
      const terminal = current.status === "withdrawn" || current.status === "rejected";
      if (!terminal && current.status !== "awaiting-payment") throw mismatch();
      return { ...current, status: terminal ? current.status : "paid-awaiting-review", payment: {
        ...payment, attempts, events, status: "paid", paidAt: confirmedAt, reviewDueAt: paidReviewDeadline(confirmedAt),
        sessionId: session.id, paymentIntentId: session.payment_intent, refundStatus: terminal ? "pending" : payment.refundStatus,
      } };
    }
    // Older expired/unpaid notifications must never downgrade a confirmed payment.
    if (payment.status === "paid") return event ? { ...current, payment: { ...payment, events } } : current;
    if (!event && attempt.sessionId === session.id && (session.status !== "expired" || attempt.expiredVerifiedAt)) return current;
    return { ...current, payment: { ...payment, attempts, events } };
  });
}

function newAttempt(): CheckoutAttempt {
  const now = Date.now(); const id = randomUUID();
  return { id, idempotencyKey: `veronica-submission-${id}`, createdAt: new Date(now).toISOString(), expiresAt: Math.floor(now / 1000) + 3600 };
}

export async function startSubmissionCheckout(id: string, token: string) {
  submissionIdSchema.parse(id);
  const first = await readSubmissionRecord(id);
  assertSubmissionAccess(first, token);
  const config = await requirePayments();
  paymentFor(first!, config);
  // Persist the request identity BEFORE talking to Stripe. Concurrent callers and
  // requests retried after a lost response therefore use the same idempotency key.
  let record = await updateSubmissionFromProvider(id, current => {
    assertSubmissionAccess(current, token);
    const payment = paymentFor(current, config);
    if (current.status !== "awaiting-payment" || payment.status !== "awaiting-payment") throw stateError();
    const last = payment.attempts.at(-1);
    if (last && !last.expiredVerifiedAt) return current;
    if (payment.attempts.length >= MAX_ATTEMPTS) throw new SubmissionError("payment_reconciliation", "Checkout needs editorial reconciliation before another attempt.", 409);
    return { ...current, payment: { ...payment, attempts: [...payment.attempts, newAttempt()] } };
  });
  let attempt = record.payment!.attempts.at(-1)!;
  let session: ProviderCheckoutSession;
  if (attempt.sessionId) {
    session = await retrieveProviderCheckout(config, attempt.sessionId);
  } else {
    if (Date.now() - Date.parse(attempt.createdAt) >= MAX_AMBIGUOUS_RETRY_MS) {
      // Stripe may discard an idempotency key after 24 hours. Never blindly make
      // another charge after an ambiguous/crashed request loses its safe window.
      throw new SubmissionError("payment_reconciliation", "An earlier Checkout request needs provider reconciliation. No new payment session was requested.", 409);
    }
    session = await createProviderCheckout(config, { submissionId: id, attemptId: attempt.id, idempotencyKey: attempt.idempotencyKey, expiresAt: attempt.expiresAt });
  }
  record = await applyProviderSession(id, session, config);
  if (session.status === "expired" && session.payment_status === "unpaid") {
    // Rotation is allowed ONLY after an authoritative fetch/response established
    // the preceding session is expired and unpaid; orphan attempts never rotate.
    record = await updateSubmissionFromProvider(id, current => {
      assertSubmissionAccess(current, token);
      const payment = paymentFor(current, config);
      if (current.status !== "awaiting-payment" || payment.status !== "awaiting-payment") throw stateError();
      const last = payment.attempts.at(-1)!;
      if (last.id !== attempt.id) return current; // Another caller already rotated it.
      if (!last.expiredVerifiedAt || payment.attempts.length >= MAX_ATTEMPTS) throw new SubmissionError("payment_reconciliation", "Checkout needs editorial reconciliation before another attempt.", 409);
      return { ...current, payment: { ...payment, attempts: [...payment.attempts, newAttempt()] } };
    });
    attempt = record.payment!.attempts.at(-1)!;
    session = attempt.sessionId ? await retrieveProviderCheckout(config, attempt.sessionId) : await createProviderCheckout(config, {
      submissionId: id, attemptId: attempt.id, idempotencyKey: attempt.idempotencyKey, expiresAt: attempt.expiresAt,
    });
    record = await applyProviderSession(id, session, config);
  }
  assertSubmissionAccess(record, token);
  if (record.status !== "awaiting-payment" || record.payment?.status !== "awaiting-payment") {
    return { submission: privateSubmission(record), checkoutUrl: null };
  }
  if (session.status !== "open" || session.payment_status !== "unpaid" || !session.url) {
    throw new SubmissionError("payment_pending", "Checkout is processing or unavailable. Refresh your private status before retrying; do not pay again.", 409);
  }
  return { submission: privateSubmission(record), checkoutUrl: session.url };
}

export async function receiveSubmissionWebhook(rawBody: string, signature: string) {
  const config = await requirePayments(true);
  const event = verifyProviderWebhook(rawBody, signature, config);
  if (event.livemode !== (config.environment === "live")) throw mismatch();
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type)) return { received: true, ignored: true };
  // The authenticated snapshot is used ONLY to discard notifications for other
  // applications. All relevant payment facts still come from a fresh provider GET.
  if (event.data.object.metadata?.purpose !== PAID_SUBMISSION_PURPOSE) return { received: true, ignored: true };
  const session = await retrieveProviderCheckout(config, event.data.object.id);
  // A shared Stripe account can send unrelated sessions: acknowledge those, but
  // never persist their data or infer authorization from their metadata.
  if (session.metadata.purpose !== PAID_SUBMISSION_PURPOSE) return { received: true, ignored: true };
  submissionIdSchema.parse(session.metadata.submissionId);
  const current = await readSubmissionRecord(session.metadata.submissionId);
  if (!current) throw mismatch();
  attemptFor(current, session, config);
  await applyProviderSession(current.id, session, config, event);
  return { received: true };
}

export const refundIdSchema = z.string().max(100).regex(/^re_[A-Za-z0-9]+$/);
export async function verifySubmissionRefund(key: string, id: string, version: number, refundId: string) {
  assertAdminAccess(key); submissionIdSchema.parse(id); versionSchema.parse(version); refundIdSchema.parse(refundId);
  const config = await requirePayments(true);
  const current = await readSubmissionRecord(id);
  if (!current) throw mismatch();
  const payment = paymentFor(current, config);
  if (payment.refundStatus !== "pending" || payment.status !== "paid" || !payment.sessionId || !payment.paymentIntentId) throw new SubmissionError("state", "This submission has no pending full refund to verify.", 409);
  if (current.version !== version) throw new SubmissionError("conflict", "This submission changed. Refresh before verifying its refund.", 409);
  // Refund objects lack livemode. Re-verify the original Checkout under this
  // account/environment, then require the refund to match its PaymentIntent.
  const session = await retrieveProviderCheckout(config, payment.sessionId);
  attemptFor(current, session, config);
  if (session.status !== "complete" || session.payment_status !== "paid" || session.payment_intent !== payment.paymentIntentId) throw mismatch();
  const refund = await retrieveProviderRefund(config, refundId);
  validateProviderRefund(refund, payment.paymentIntentId);
  const verified = await mutateSubmissionRecord(id, version, latest => {
    assertAdminAccess(key);
    const latestPayment = paymentFor(latest, config);
    if (latestPayment.refundStatus !== "pending" || latestPayment.paymentIntentId !== refund.payment_intent || latestPayment.sessionId !== session.id) throw mismatch();
    return { ...latest, payment: { ...latestPayment, refundStatus: "refunded", refundId: refund.id, refundVerifiedAt: new Date().toISOString() } };
  });
  return privateSubmission(verified);
}
