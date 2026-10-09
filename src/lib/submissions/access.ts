// Token access replaces the original account/email claiming flow entirely.
import { createHash, timingSafeEqual } from "node:crypto";
import { adminKeyConfigured } from "./config";
import { SubmissionError, type SubmissionRecord } from "./types";
export const tokenDigest = (token: string) => createHash("sha256").update(token).digest("hex");
export function assertSubmissionAccess(record: SubmissionRecord | null, token: string) {
  const valid = typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
  const candidate = tokenDigest(valid ? token : "invalid");
  const expected = record?.tokenHash && /^[a-f0-9]{64}$/.test(record.tokenHash) ? record.tokenHash : "0".repeat(64);
  const matches = timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(candidate, "hex"));
  if (!record || !valid || !matches) throw new SubmissionError("unauthorized", "The submission ID or private token is incorrect.", 401);
}
export function assertAdminAccess(key: string) {
  const expected = process.env.VERONICA_SUBMISSIONS_ADMIN_KEY || "";
  if (!adminKeyConfigured()) throw new SubmissionError("disabled", "Editorial review is not configured.", 503);
  const matches = timingSafeEqual(Buffer.from(tokenDigest(expected), "hex"), Buffer.from(tokenDigest(typeof key === "string" ? key : ""), "hex"));
  if (!matches) throw new SubmissionError("unauthorized", "The admin key is incorrect.", 401);
}
