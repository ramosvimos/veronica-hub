import { z } from "zod";
import { startSubmissionCheckout } from "@/lib/submissions/payment";
import { submissionIdSchema } from "@/lib/submissions/schema";
import { bearer, readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const schema = z.object({ id: submissionIdSchema }).strict();
export async function POST(request: Request) {
  try {
    const input = schema.parse(await readSubmissionBody(request));
    return submissionJson(await startSubmissionCheckout(input.id, bearer(request)));
  } catch (error) { return submissionFailure(error); }
}
