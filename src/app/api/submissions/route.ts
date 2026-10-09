import { createSubmission } from "@/lib/submissions/service";
import { readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { return submissionJson(await createSubmission(await readSubmissionBody(request)), 201); }
  catch (error) { return submissionFailure(error); }
}
