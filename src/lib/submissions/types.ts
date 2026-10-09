import type { SubmissionInput } from "./schema";
export type SubmissionStatus = "awaiting-backlink-review" | "free-awaiting-review" | "approved" | "rejected" | "withdrawn";
export type SubmissionRecord = {
  id: string; tokenHash: string; urlKey: string; createdAt: string; updatedAt: string; version: number;
  input: SubmissionInput; status: SubmissionStatus;
  websiteVerifiedAt?: string; backlinkVerifiedAt?: string; verificationNote?: string;
  reviewedAt?: string; reviewNote?: string; listingSlug?: string;
};
export type PrivateSubmission = Omit<SubmissionRecord, "tokenHash" | "urlKey">;
export function privateSubmission(record: SubmissionRecord): PrivateSubmission {
  return {
    id: record.id, input: record.input, createdAt: record.createdAt, updatedAt: record.updatedAt,
    version: record.version, status: record.status,
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
