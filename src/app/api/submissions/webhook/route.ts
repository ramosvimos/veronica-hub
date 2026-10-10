import { receiveSubmissionWebhook } from "@/lib/submissions/payment";
import { submissionFailure, submissionJson } from "@/lib/submissions/http";
import { SubmissionError } from "@/lib/submissions/types";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (new URL(request.url).search) throw new SubmissionError("validation", "URL parameters are not accepted.");
    if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") || "")) throw new SubmissionError("validation", "A JSON notification is required.", 415);
    const reader = request.body?.getReader();
    if (!reader) throw new SubmissionError("payment_webhook", "The notification body is required.");
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 262144) { await reader.cancel(); throw new SubmissionError("validation", "The notification is too large.", 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    // Fatal UTF-8 decoding rejects transformations that could change signed bytes.
    const rawBody = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return submissionJson(await receiveSubmissionWebhook(rawBody, request.headers.get("stripe-signature") || ""));
  } catch (error) { return submissionFailure(error); }
}
