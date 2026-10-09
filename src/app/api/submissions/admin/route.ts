import { z } from "zod";
import { listAdminSubmissions, reviewSubmission } from "@/lib/submissions/service";
import { reviewSchema, submissionIdSchema, versionSchema } from "@/lib/submissions/schema";
import { bearer, readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const schema = z.union([
  z.object({ action: z.literal("list") }).strict(),
  reviewSchema.extend({ action: z.literal("review"), id: submissionIdSchema, version: versionSchema }).strict(),
]);
export async function POST(request: Request) {
  try {
    const input = schema.parse(await readSubmissionBody(request)); const key = bearer(request);
    if (input.action === "list") return submissionJson({ submissions: await listAdminSubmissions(key) });
    const { id, version, decision, note, websiteChecked, backlinkChecked } = input;
    return submissionJson({ submission: await reviewSubmission(key, id, version, { decision, note, websiteChecked, backlinkChecked }) });
  } catch (error) { return submissionFailure(error); }
}
