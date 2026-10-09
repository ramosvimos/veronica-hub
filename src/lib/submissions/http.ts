import { ZodError } from "zod";
import { SubmissionError } from "./types";
const headers = {
  "Cache-Control": "no-store, private, max-age=0", "Pragma": "no-cache", "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
};
export function submissionJson(data: unknown, status = 200) { return Response.json(data, { status, headers }); }
export function bearer(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}
function actualRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new SubmissionError("origin", "Use this website to submit the request.", 403);
  const authority = request.headers.get("host");
  if (authority === null) return url.origin;
  // Next may reconstruct request.url with an internal hostname. Host remains the
  // browser's actual authority. Never trust X-Forwarded-Host/Proto for this check.
  if (!authority || authority !== authority.trim() || /[\\/@?#,%\s]/.test(authority)
    || !/^(?:\[[0-9a-f:.]+\]|[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::[0-9]{1,5})?$/i.test(authority)) {
    throw new SubmissionError("origin", "Use this website to submit the request.", 403);
  }
  try {
    const actual = new URL(`${url.protocol}//${authority}`);
    if (actual.username || actual.password || actual.pathname !== "/" || actual.search || actual.hash) throw new Error("Invalid Host");
    if (!actual.hostname.startsWith("[") && !actual.hostname.split(".").every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) throw new Error("Invalid hostname");
    return actual.origin;
  } catch { throw new SubmissionError("origin", "Use this website to submit the request.", 403); }
}
export async function readSubmissionBody(request: Request): Promise<unknown> {
  if (new URL(request.url).search) throw new SubmissionError("validation", "Do not include private credentials in URL parameters.");
  const origin = request.headers.get("origin");
  const expectedOrigin = actualRequestOrigin(request);
  if ((origin && origin !== expectedOrigin) || request.headers.get("sec-fetch-site") === "cross-site") throw new SubmissionError("origin", "Use this website to submit the request.", 403);
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("content-type") || "")) throw new SubmissionError("validation", "Send a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new SubmissionError("validation", "The request body is required.");
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16384) { await reader.cancel(); throw new SubmissionError("validation", "The request is too large.", 413); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new SubmissionError("validation", "Send valid JSON."); }
}
export function submissionFailure(error: unknown) {
  if (error instanceof SubmissionError) return submissionJson({ error: error.message, code: error.code }, error.status);
  if (error instanceof ZodError) return submissionJson({ error: "Please check the form fields.", code: "validation", issues: error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) }, 400);
  // Never return raw storage errors, submitted email addresses, tokens, keys or stack traces.
  return submissionJson({ error: "The request could not be completed. Refresh the private status before retrying a change. If a new submission response was lost, do not assume it failed; duplicate submissions remain blocked.", code: "unavailable" }, 503);
}
