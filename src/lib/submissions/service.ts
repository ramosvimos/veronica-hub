import { randomBytes, randomUUID } from "node:crypto";
import { pdfTools } from "@/data/pdf-catalog";
import { submissionSchema, submissionIdSchema, versionSchema, reviewSchema, websiteKey } from "./schema";
import { assertAdminAccess, assertSubmissionAccess, tokenDigest } from "./access";
import { insertSubmissionRecord, readSubmissionRecord, mutateSubmissionRecord, listSubmissionRecords, requireSubmissionStorage } from "./store";
import { privateSubmission, SubmissionError, type SubmissionRecord } from "./types";

function assertNotSeeded(url: string) {
  if (pdfTools.some(tool => websiteKey(tool.url) === websiteKey(url))) throw new SubmissionError("duplicate", "This website is already listed in the directory.", 409);
}
function clearReview(record: SubmissionRecord): SubmissionRecord {
  const next = { ...record };
  delete next.websiteVerifiedAt; delete next.backlinkVerifiedAt; delete next.verificationNote;
  delete next.reviewedAt; delete next.reviewNote; delete next.listingSlug;
  return next;
}
export async function createSubmission(value: unknown) {
  await requireSubmissionStorage();
  const input = submissionSchema.parse(value);
  assertNotSeeded(input.url);
  const token = randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const record: SubmissionRecord = {
    id: randomUUID(), tokenHash: tokenDigest(token), urlKey: websiteKey(input.url), createdAt: now, updatedAt: now,
    version: 0, input, status: "awaiting-backlink-review",
  };
  await insertSubmissionRecord(record);
  return { submission: privateSubmission(record), token };
}
export async function getPrivateSubmission(id: string, token: string) {
  const record = await readSubmissionRecord(id);
  assertSubmissionAccess(record, token);
  return privateSubmission(record!);
}
export async function changeSubmission(id: string, token: string, version: number, action: "edit" | "resubmit" | "withdraw", inputValue?: unknown) {
  submissionIdSchema.parse(id); versionSchema.parse(version);
  // Validate and authorize inside the mutation, including cross-record requests.
  const record = await mutateSubmissionRecord(id, version, current => {
    assertSubmissionAccess(current, token);
    if (action === "withdraw") {
      if (current.status === "withdrawn") throw new SubmissionError("state", "This submission is already withdrawn.", 409);
      return { ...clearReview(current), status: "withdrawn" };
    }
    if (action !== "edit" && action !== "resubmit") throw new SubmissionError("validation", "Unknown submission action.");
    if (action === "edit" && (current.status === "approved" || current.status === "withdrawn")) {
      throw new SubmissionError("state", "Withdraw an approved listing before changing it, then resubmit for review.", 409);
    }
    if (action === "resubmit" && current.status !== "rejected" && current.status !== "withdrawn") {
      throw new SubmissionError("state", "Only a rejected or withdrawn submission can be resubmitted.", 409);
    }
    const input = submissionSchema.parse(inputValue ?? current.input);
    assertNotSeeded(input.url);
    return {
      ...clearReview(current), input, urlKey: websiteKey(input.url),
      status: action === "edit" && current.status === "rejected" ? "rejected" : "awaiting-backlink-review",
    };
  });
  return privateSubmission(record);
}
export async function listAdminSubmissions(key: string) {
  assertAdminAccess(key);
  return (await listSubmissionRecords()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(privateSubmission);
}
// Adapted from verifyPdfSubmissionBacklink/reviewPdfSubmission: never fetch publisher URLs.
// An editor must personally inspect both the working website and the visible reciprocal link.
export async function reviewSubmission(key: string, id: string, version: number, value: unknown) {
  assertAdminAccess(key); submissionIdSchema.parse(id); versionSchema.parse(version);
  const review = reviewSchema.parse(value);
  const record = await mutateSubmissionRecord(id, version, current => {
    assertAdminAccess(key);
    if (review.decision === "withdraw") {
      if (current.status !== "approved") throw new SubmissionError("state", "Only an approved listing can be withdrawn by editorial review.", 409);
      return { ...clearReview(current), status: "withdrawn", reviewedAt: new Date().toISOString(), reviewNote: review.note };
    }
    if (review.decision === "verify") {
      if (current.status !== "awaiting-backlink-review") throw new SubmissionError("state", "Only a submission awaiting checks can be verified.", 409);
      if (review.websiteChecked !== true || review.backlinkChecked !== true) throw new SubmissionError("checks_required", "Manually open the website and backlink page, then confirm both checks.", 409);
      const now = new Date().toISOString();
      return { ...current, status: "free-awaiting-review", websiteVerifiedAt: now, backlinkVerifiedAt: now, verificationNote: review.note };
    }
    if (!["awaiting-backlink-review", "free-awaiting-review"].includes(current.status)) throw new SubmissionError("state", "Only a pending submission can receive a review decision.", 409);
    if (review.decision === "approve") {
      if (current.status !== "free-awaiting-review" || !current.websiteVerifiedAt || !current.backlinkVerifiedAt) {
        throw new SubmissionError("checks_required", "Save the manual website and backlink checks before approving.", 409);
      }
      submissionSchema.parse(current.input); assertNotSeeded(current.input.url);
      const slug = `submission-${current.id}`;
      if (pdfTools.some(tool => tool.slug === slug)) throw new SubmissionError("duplicate", "This listing address already exists.", 409);
      return { ...current, status: "approved", reviewedAt: new Date().toISOString(), reviewNote: review.note, listingSlug: slug };
    }
    return { ...current, status: "rejected", reviewedAt: new Date().toISOString(), reviewNote: review.note, listingSlug: undefined };
  });
  return privateSubmission(record);
}
