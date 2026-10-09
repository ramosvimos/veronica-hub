import { z } from "zod";
import { getPrivateSubmission } from "@/lib/submissions/service";
import { readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const schema = z.object({ id: z.string().max(100), token: z.string().max(256) }).strict();
export async function POST(request: Request) {
  try { const input = schema.parse(await readSubmissionBody(request)); return submissionJson({ submission: await getPrivateSubmission(input.id, input.token) }); }
  catch (error) { return submissionFailure(error); }
}
