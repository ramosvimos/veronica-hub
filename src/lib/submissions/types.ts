import type { SubmissionInput } from "./schema";
export type SubmissionStatus = "awaiting-backlink-review" | "free-awaiting-review" | "awaiting-payment" | "paid-awaiting-review" | "approved" | "rejected" | "withdrawn";
export type CheckoutAttempt = {
  id: string; idempotencyKey: string; createdAt: string; expiresAt: number;
  sessionId?: string; expiredVerifiedAt?: string;
};
export type SubmissionPayment = {
  amount: 990; currency: "usd"; environment: "test" | "live";
  status: "awaiting-payment" | "paid"; attempts: CheckoutAttempt[];
  events: { id: string; type: string; receivedAt: string }[];
  paidAt?: string; reviewDueAt?: string; sessionId?: string; paymentIntentId?: string;
  refundStatus: "none" | "pending" | "refunded"; refundId?: string; refundVerifiedAt?: string;
};
export type SubmissionRecord = {
  id: string; tokenHash: string; urlKey: string; createdAt: string; updatedAt: string; version: number;
  serviceType?: "free" | "paid"; // Absent on existing v1 free records; normalized when read.
  input: SubmissionInput; status: SubmissionStatus; payment?: SubmissionPayment;
  websiteVerifiedAt?: string; backlinkVerifiedAt?: string; verificationNote?: string;
  reviewedAt?: string; reviewNote?: string; listingSlug?: string;
};
export type PrivatePayment = Pick<SubmissionPayment, "amount" | "currency" | "status" | "paidAt" | "reviewDueAt" | "refundStatus" | "refundVerifiedAt"> & { checkoutStarted: boolean };
export type PrivateSubmission = Omit<SubmissionRecord, "tokenHash" | "urlKey" | "payment"> & { serviceType: "free" | "paid"; payment?: PrivatePayment };
export function privateSubmission(record: SubmissionRecord): PrivateSubmission {
  const payment = record.payment;
  return {
    id: record.id, input: record.input, createdAt: record.createdAt, updatedAt: record.updatedAt,
    version: record.version, status: record.status, serviceType: record.serviceType || "free",
    ...(payment ? { payment: {
      amount: payment.amount, currency: payment.currency, status: payment.status, checkoutStarted: payment.attempts.length > 0,
      refundStatus: payment.refundStatus,
      ...(payment.paidAt ? { paidAt: payment.paidAt } : {}), ...(payment.reviewDueAt ? { reviewDueAt: payment.reviewDueAt } : {}),
      ...(payment.refundVerifiedAt ? { refundVerifiedAt: payment.refundVerifiedAt } : {}),
    } } : {}),
    ...(record.websiteVerifiedAt ? { websiteVerifiedAt: record.websiteVerifiedAt } : {}),
    ...(record.backlinkVerifiedAt ? { backlinkVerifiedAt: record.backlinkVerifiedAt } : {}),
    ...(record.verificationNote ? { verificationNote: record.verificationNote } : {}),
    ...(record.reviewedAt ? { reviewedAt: record.reviewedAt } : {}),
    ...(record.reviewNote ? { reviewNote: record.reviewNote } : {}),
    ...(record.listingSlug ? { listingSlug: record.listingSlug } : {}),
  };
}
export class SubmissionError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message); this.name = "SubmissionError"; }
}
