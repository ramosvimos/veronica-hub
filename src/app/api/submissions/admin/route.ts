import { z } from "zod";
import { refundIdSchema, verifySubmissionRefund } from "@/lib/submissions/payment";
import { listAdminSubmissions, reviewSubmission } from "@/lib/submissions/service";
import { reviewSchema, submissionIdSchema, versionSchema } from "@/lib/submissions/schema";
import { bearer, readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const schema = z.union([
  z.object({ action: z.literal("list") }).strict(),
  z.object({ action: z.literal("verify-refund"), id: submissionIdSchema, version: versionSchema, refundId: refundIdSchema }).strict(),
  reviewSchema.extend({ action: z.literal("review"), id: submissionIdSchema, version: versionSchema }).strict(),
]);
export async function POST(request: Request) {
  try {
    const input = schema.parse(await readSubmissionBody(request)); const key = bearer(request);
    if (input.action === "list") return submissionJson({ submissions: await listAdminSubmissions(key) });
    if (input.action === "verify-refund") return submissionJson({ submission: await verifySubmissionRefund(key, input.id, input.version, input.refundId) });
    const { id, version, decision, note, websiteChecked, backlinkChecked } = input;
    return submissionJson({ submission: await reviewSubmission(key, id, version, { decision, note, websiteChecked, backlinkChecked }) });
  } catch (error) { return submissionFailure(error); }
}
