import { submissionReadiness } from "@/lib/submissions/config";
import { submissionJson, submissionFailure } from "@/lib/submissions/http";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return submissionJson(await submissionReadiness()); } catch (error) { return submissionFailure(error); }
}
