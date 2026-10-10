import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { SubmissionError } from "./types";

export interface PaidProviderConfiguration {
  secretKey: string;
  webhookSecret: string;
  origin: string;
  environment: "test" | "live";
}

export interface CheckoutAttemptInput {
  submissionId: string;
  attemptId: string;
  idempotencyKey: string;
  expiresAt: number;
}

export const PAID_SUBMISSION_PURPOSE = "veronica-paid-submission-v1";
export const PAID_SUBMISSION_AMOUNT = 990;
export const PAID_SUBMISSION_CURRENCY = "usd";
// Pin the REST contract rather than inheriting an account's mutable default.
// https://docs.stripe.com/api/versioning
const PAYMENT_PROVIDER_API_VERSION = "2026-09-30.endive";
const PAYMENT_PROVIDER_API_ORIGIN = "https://api.stripe.com";
const PROVIDER_TIMEOUT_MS = 10_000;
const WEBHOOK_TOLERANCE_SECONDS = 300;

const identifier = z.string().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);
const sessionIdentifier = z.string().max(200).regex(/^cs_[A-Za-z0-9_]+$/);
const refundIdentifier = z.string().max(200).regex(/^re_[A-Za-z0-9_]+$/);
const intentIdentifier = z.string().max(200).regex(/^pi_[A-Za-z0-9_]+$/);
const timestamp = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const metadataSchema = z.object({
  purpose: z.string().min(1).max(100),
  submissionId: identifier,
  attemptId: identifier,
}).strict();

function safeCheckoutUrl(value: string) {
  try {
    const url = new URL(value);
    // Stripe's opaque fragment is required by hosted Checkout and is preserved.
    return value === value.trim() && !/[\s\\]/.test(value)
      && url.protocol === "https:" && url.hostname === "checkout.stripe.com"
      && !url.username && !url.password && !url.port && !url.search
      && url.pathname.startsWith("/c/pay/");
  } catch { return false; }
}

const checkoutSchema = z.object({
  id: sessionIdentifier,
  url: z.string().max(8192).refine(safeCheckoutUrl).nullable(),
  mode: z.enum(["payment", "setup", "subscription"]),
  status: z.enum(["open", "complete", "expired"]),
  payment_status: z.enum(["paid", "unpaid", "no_payment_required"]),
  amount_total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().regex(/^[a-z]{3}$/),
  livemode: z.boolean(),
  expires_at: timestamp,
  payment_intent: intentIdentifier.nullable(),
  metadata: metadataSchema,
  client_reference_id: identifier,
}).refine(session => session.status !== "open" || session.url !== null)
  .refine(session => session.url === null || (safeCheckoutUrl(session.url) && new URL(session.url).pathname === `/c/pay/${session.id}`))
  .refine(session => session.payment_status !== "paid" || (session.status === "complete" && session.payment_intent !== null));
export type ProviderCheckoutSession = z.infer<typeof checkoutSchema>;

const refundSchema = z.object({
  id: refundIdentifier,
  amount: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: z.string().regex(/^[a-z]{3}$/),
  payment_intent: intentIdentifier.nullable(),
  status: z.enum(["pending", "requires_action", "succeeded", "failed", "canceled"]).nullable(),
});
export type ProviderRefund = z.infer<typeof refundSchema>;

// The signed purpose allows unrelated shared-account events to be ignored before
// retrieval. These two bounded snapshot hints never replace authoritative GETs.
const eventSnapshotSchema = z.object({
  id: identifier,
  metadata: z.preprocess(value => {
    if (value && typeof value === "object" && !Array.isArray(value)
      && "purpose" in value && typeof value.purpose === "string") return { purpose: value.purpose };
    return undefined;
  }, z.object({ purpose: z.string().max(100).optional() }).optional()),
  payment_status: z.preprocess(value => typeof value === "string" ? value : undefined, z.string().max(100).optional()),
}).transform(({ id, metadata, payment_status }) => ({
  id,
  ...(metadata ? { metadata } : {}),
  ...(payment_status !== undefined ? { payment_status } : {}),
}));

// Everything else, including customer details and private metadata, is discarded.
const webhookSchema = z.object({
  id: z.string().max(200).regex(/^evt_[A-Za-z0-9_]+$/),
  type: z.string().min(1).max(200).regex(/^[a-z0-9_.]+$/),
  created: timestamp,
  livemode: z.boolean(),
  data: z.object({ object: eventSnapshotSchema }),
});
export type ProviderWebhookEvent = z.infer<typeof webhookSchema>;

function providerFailure() {
  return new SubmissionError("payment_provider", "The payment provider could not verify this request. Please try again later.", 502);
}
function bindingFailure() {
  return new SubmissionError("payment_mismatch", "The provider payment does not match this submission.", 409);
}
function webhookFailure() {
  return new SubmissionError("payment_webhook", "The payment notification could not be verified.", 400);
}

function assertConfiguration(config: PaidProviderConfiguration) {
  if (!config || !["test", "live"].includes(config.environment)
    || typeof config.secretKey !== "string"
    || !new RegExp(`^(?:sk|rk)_${config.environment}_[A-Za-z0-9]+$`).test(config.secretKey)) throw providerFailure();
}

function statusReturnUrl(config: PaidProviderConfiguration) {
  try {
    const url = new URL(config.origin);
    const localTest = config.environment === "test" && url.protocol === "http:"
      && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.origin !== config.origin || (url.protocol !== "https:" && !localTest)
      || url.username || url.password || url.search || url.hash) throw providerFailure();
    return `${config.origin}/submit-tool/status`;
  } catch { throw providerFailure(); }
}

async function providerRequest(config: PaidProviderConfiguration, path: string, body?: URLSearchParams, idempotencyKey?: string): Promise<unknown> {
  assertConfiguration(config);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const response = await fetch(`${PAYMENT_PROVIDER_API_ORIGIN}${path}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        Accept: "application/json",
        "Stripe-Version": PAYMENT_PROVIDER_API_VERSION,
        ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      ...(body ? { body: body.toString() } : {}),
      cache: "no-store",
      redirect: "error",
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok || response.redirected) throw providerFailure();
    return await response.json();
  } catch {
    // Do not return Stripe's errors, request data, credentials, or response bodies.
    throw providerFailure();
  } finally { clearTimeout(timeout); }
}

function parseCheckout(value: unknown): ProviderCheckoutSession {
  const parsed = checkoutSchema.safeParse(value);
  if (!parsed.success) throw providerFailure();
  return parsed.data;
}

export function validateProviderCheckout(session: ProviderCheckoutSession, config: PaidProviderConfiguration, expected: Pick<CheckoutAttemptInput, "submissionId" | "attemptId">): void {
  const parsed = checkoutSchema.safeParse(session);
  if (!parsed.success) throw bindingFailure();
  const checkout = parsed.data;
  if (checkout.mode !== "payment" || checkout.amount_total !== PAID_SUBMISSION_AMOUNT
    || checkout.currency !== PAID_SUBMISSION_CURRENCY || checkout.livemode !== (config.environment === "live")
    || checkout.metadata.purpose !== PAID_SUBMISSION_PURPOSE
    || checkout.metadata.submissionId !== expected.submissionId || checkout.metadata.attemptId !== expected.attemptId
    || checkout.client_reference_id !== expected.submissionId) throw bindingFailure();
}

export function validateProviderRefund(refund: ProviderRefund, paymentIntentId: string): void {
  const parsed = refundSchema.safeParse(refund);
  if (!parsed.success || !intentIdentifier.safeParse(paymentIntentId).success
    || parsed.data.status !== "succeeded" || parsed.data.amount !== PAID_SUBMISSION_AMOUNT
    || parsed.data.currency !== PAID_SUBMISSION_CURRENCY || parsed.data.payment_intent !== paymentIntentId) throw bindingFailure();
}

export async function createProviderCheckout(config: PaidProviderConfiguration, input: CheckoutAttemptInput): Promise<ProviderCheckoutSession> {
  assertConfiguration(config);
  const parsed = z.object({
    submissionId: z.string().uuid(),
    attemptId: z.string().uuid(),
    idempotencyKey: z.string().min(1).max(255).regex(/^[A-Za-z0-9._:-]+$/),
    expiresAt: timestamp,
  }).strict().safeParse(input);
  if (!parsed.success) throw providerFailure();
  const returnUrl = statusReturnUrl(config);
  const body = new URLSearchParams({
    mode: "payment",
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": PAID_SUBMISSION_CURRENCY,
    "line_items[0][price_data][unit_amount]": String(PAID_SUBMISSION_AMOUNT),
    "line_items[0][price_data][product_data][name]": "Veronica Hub paid submission",
    "line_items[0][quantity]": "1",
    "adaptive_pricing[enabled]": "false",
    "automatic_tax[enabled]": "false",
    allow_promotion_codes: "false",
    client_reference_id: input.submissionId,
    "metadata[purpose]": PAID_SUBMISSION_PURPOSE,
    "metadata[submissionId]": input.submissionId,
    "metadata[attemptId]": input.attemptId,
    success_url: returnUrl,
    cancel_url: returnUrl,
    // These values belong to the durable attempt. Never regenerate on retry.
    expires_at: String(input.expiresAt),
  });
  const checkout = parseCheckout(await providerRequest(config, "/v1/checkout/sessions", body, input.idempotencyKey));
  validateProviderCheckout(checkout, config, input);
  if (checkout.expires_at !== input.expiresAt) throw bindingFailure();
  return checkout;
}

export async function retrieveProviderCheckout(config: PaidProviderConfiguration, sessionId: string): Promise<ProviderCheckoutSession> {
  if (!sessionIdentifier.safeParse(sessionId).success) throw providerFailure();
  const checkout = parseCheckout(await providerRequest(config, `/v1/checkout/sessions/${sessionId}`));
  if (checkout.id !== sessionId) throw providerFailure();
  return checkout;
}

export async function retrieveProviderRefund(config: PaidProviderConfiguration, refundId: string): Promise<ProviderRefund> {
  if (!refundIdentifier.safeParse(refundId).success) throw providerFailure();
  const parsed = refundSchema.safeParse(await providerRequest(config, `/v1/refunds/${refundId}`));
  if (!parsed.success || parsed.data.id !== refundId) throw providerFailure();
  return parsed.data;
}

// https://docs.stripe.com/webhooks#verify-manually
export function verifyProviderWebhook(rawBody: string, signature: string, config: PaidProviderConfiguration, nowSeconds = Math.floor(Date.now() / 1000)): ProviderWebhookEvent {
  if (typeof rawBody !== "string" || !rawBody || Buffer.byteLength(rawBody, "utf8") > 262_144
    || typeof signature !== "string" || !signature || signature.length > 8192 || /[\r\n\u0000]/.test(signature)
    || !Number.isSafeInteger(nowSeconds) || nowSeconds <= 0
    || !config || !["test", "live"].includes(config.environment)
    || typeof config.webhookSecret !== "string" || !/^whsec_[A-Za-z0-9]+$/.test(config.webhookSecret)) throw webhookFailure();
  let signedTimestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of signature.split(",")) {
    const match = /^([a-z0-9]+)=([^=,\s]+)$/.exec(part.trim());
    if (!match) throw webhookFailure();
    const [, key, value] = match;
    if (key === "t") {
      if (signedTimestamp !== undefined || !/^[1-9][0-9]{0,15}$/.test(value)) throw webhookFailure();
      signedTimestamp = value;
    } else if (key === "v1") {
      if (!/^[a-f0-9]{64}$/.test(value)) throw webhookFailure();
      signatures.push(value);
    }
    // Other schemes (including Stripe's fake test v0) never authorize a request.
  }
  const time = Number(signedTimestamp);
  if (!signedTimestamp || !signatures.length || !Number.isSafeInteger(time)
    || Math.abs(nowSeconds - time) > WEBHOOK_TOLERANCE_SECONDS) throw webhookFailure();
  const expected = createHmac("sha256", config.webhookSecret).update(`${signedTimestamp}.${rawBody}`, "utf8").digest();
  // Evaluate every supplied v1 signature, without an early-success shortcut.
  let matches = 0;
  for (const value of signatures) matches |= Number(timingSafeEqual(expected, Buffer.from(value, "hex")));
  if (!matches) throw webhookFailure();
  let value: unknown;
  try { value = JSON.parse(rawBody); } catch { throw webhookFailure(); }
  const event = webhookSchema.safeParse(value);
  if (!event.success || event.data.livemode !== (config.environment === "live")
    || event.data.created > nowSeconds + WEBHOOK_TOLERANCE_SECONDS) throw webhookFailure();
  return event.data;
}
