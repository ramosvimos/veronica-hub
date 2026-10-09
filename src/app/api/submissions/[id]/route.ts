import { z } from "zod";
import { changeSubmission } from "@/lib/submissions/service";
import { versionSchema } from "@/lib/submissions/schema";
import { bearer, readSubmissionBody, submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const schema = z.object({ version: versionSchema, action: z.enum(["edit", "resubmit", "withdraw"]), input: z.unknown().optional() }).strict();
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const input = schema.parse(await readSubmissionBody(request)); const { id } = await context.params;
    return submissionJson({ submission: await changeSubmission(id, bearer(request), input.version, input.action, input.input) });
  } catch (error) { return submissionFailure(error); }
}
