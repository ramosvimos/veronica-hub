// Adapted from the source directory's atomic file store and optimistic-version database updates.
import { mkdir, open, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { submissionConfiguration, type SubmissionConfiguration, type SubmissionDatabase } from "./config";
import { submissionSchema, submissionIdSchema, websiteKey } from "./schema";
import { SubmissionError, type SubmissionRecord } from "./types";

export const MAX_PENDING_SUBMISSIONS = 200;
export const MAX_NEW_SUBMISSIONS_PER_DAY = 50;
const isPending = (record: SubmissionRecord) => record.status === "awaiting-backlink-review" || record.status === "free-awaiting-review";
const intakeFull = () => new SubmissionError("capacity", "Submission intake is temporarily full. Please try again after pending reviews clear or the 24-hour intake window resets. No new submission was saved.", 429);
const pendingFull = () => new SubmissionError("capacity", "The review queue is full. Your existing submission is unchanged; try resubmitting after pending reviews clear.", 429);
const dayCutoff = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
type EnabledConfiguration = Exclude<SubmissionConfiguration, { mode: "disabled" }>;
const statuses = new Set(["awaiting-backlink-review", "free-awaiting-review", "approved", "rejected", "withdrawn"]);
function decode(value: unknown): SubmissionRecord {
  const record = value as SubmissionRecord;
  if (!record || !submissionIdSchema.safeParse(record.id).success || !/^[a-f0-9]{64}$/.test(record.tokenHash)
    || !Number.isSafeInteger(record.version) || record.version < 0 || !statuses.has(record.status)
    || typeof record.urlKey !== "string" || typeof record.createdAt !== "string" || typeof record.updatedAt !== "string") {
    throw new SubmissionError("storage_invalid", "Submission storage could not be read safely.", 503);
  }
  const input = submissionSchema.parse(record.input);
  const validTime = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  if (record.urlKey !== websiteKey(input.url) || !validTime(record.createdAt) || !validTime(record.updatedAt)
    || [record.websiteVerifiedAt, record.backlinkVerifiedAt, record.reviewedAt].some(value => value !== undefined && !validTime(value))) {
    throw new SubmissionError("storage_invalid", "Submission storage could not be read safely.", 503);
  }
  return { ...record, input };
}
export async function requireSubmissionStorage(): Promise<EnabledConfiguration> {
  const config = await submissionConfiguration();
  if (config.mode === "disabled") throw new SubmissionError("disabled", "Submissions are currently closed. No request was saved.", 503);
  return config;
}
async function readLocal(directory: string): Promise<SubmissionRecord[]> {
  try {
    const raw = await readFile(path.join(directory, "records.json"), "utf8");
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("Unexpected storage format");
    return data.map(decode);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
async function lockedLocal<T>(directory: string, operation: (records: SubmissionRecord[]) => T): Promise<T> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lockPath = path.join(directory, ".mutation.lock");
  const deadline = Date.now() + 5000;
  let lock;
  while (!lock) {
    try { lock = await open(lockPath, "wx", 0o600); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() >= deadline) throw new SubmissionError("busy", "Submission storage is busy. Please retry shortly.", 409);
      await new Promise(resolve => setTimeout(resolve, 25));
    }
  }
  const temporary = path.join(directory, `.records.${randomUUID()}.tmp`);
  try {
    const records = await readLocal(directory);
    const result = operation(records);
    await writeFile(temporary, JSON.stringify(records), { mode: 0o600, flag: "wx" });
    await rename(temporary, path.join(directory, "records.json"));
    return result;
  } finally {
    await unlink(temporary).catch(() => undefined);
    await lock.close();
    await unlink(lockPath);
  }
}
type DatabaseRow = { record: string };
async function readDatabase(db: SubmissionDatabase, id: string) {
  const row = await db.prepare("SELECT record FROM veronica_submissions WHERE id = ?").bind(id).first<DatabaseRow>();
  return row ? decode(JSON.parse(row.record)) : null;
}
function isDuplicateError(error: unknown) { return /unique|constraint/i.test(String(error)); }
function duplicate() { return new SubmissionError("duplicate", "This website already has a listing or submission. Use the original submission ID and private token to manage it.", 409); }
export async function readSubmissionRecord(id: string): Promise<SubmissionRecord | null> {
  const config = await requireSubmissionStorage();
  if (!submissionIdSchema.safeParse(id).success) return null;
  return config.mode === "local" ? (await readLocal(config.directory)).find(record => record.id === id) || null : readDatabase(config.db, id);
}
export async function listSubmissionRecords(status?: SubmissionRecord["status"]): Promise<SubmissionRecord[]> {
  const config = await requireSubmissionStorage();
  if (config.mode === "local") return (await readLocal(config.directory)).filter(record => !status || record.status === status);
  const query = status ? "SELECT record FROM veronica_submissions WHERE status = ? ORDER BY created_at DESC, id DESC" : "SELECT record FROM veronica_submissions ORDER BY created_at DESC, id DESC";
  const statement = config.db.prepare(query);
  const rows = await (status ? statement.bind(status) : statement).all<DatabaseRow>();
  if (!rows.success) throw new Error("Database query failed");
  return rows.results.map(row => decode(JSON.parse(row.record))).filter(record => !status || record.status === status);
}
export async function insertSubmissionRecord(record: SubmissionRecord) {
  const config = await requireSubmissionStorage();
  if (config.mode === "local") return lockedLocal(config.directory, records => {
    if (records.some(existing => existing.urlKey === record.urlKey || existing.id === record.id)) throw duplicate();
    if (records.filter(isPending).length >= MAX_PENDING_SUBMISSIONS || records.filter(existing => existing.createdAt >= dayCutoff()).length >= MAX_NEW_SUBMISSIONS_PER_DAY) throw intakeFull();
    records.push(record);
    return record;
  });
  try {
    const result = await config.db.prepare("INSERT INTO veronica_submissions (id, version, url_key, listing_slug, status, record, created_at, updated_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM veronica_submissions WHERE status IN ('awaiting-backlink-review', 'free-awaiting-review')) < ? AND (SELECT COUNT(*) FROM veronica_submissions WHERE created_at >= ?) < ?")
      .bind(record.id, record.version, record.urlKey, null, record.status, JSON.stringify(record), record.createdAt, record.updatedAt, MAX_PENDING_SUBMISSIONS, dayCutoff(), MAX_NEW_SUBMISSIONS_PER_DAY).run();
    if (!result.success) throw new Error("Database insert failed");
    if (result.meta.changes !== 1) throw intakeFull();
    return record;
  } catch (error) { if (isDuplicateError(error)) throw duplicate(); throw error; }
}
export async function mutateSubmissionRecord(id: string, expectedVersion: number, transform: (record: SubmissionRecord) => SubmissionRecord) {
  const config = await requireSubmissionStorage();
  function nextRecord(current: SubmissionRecord | null): SubmissionRecord {
    if (!current) throw new SubmissionError("unauthorized", "The submission ID or private token is incorrect.", 401);
    // Authorization is inside transform and is performed before revealing a version conflict.
    const next = transform(current);
    if (current.version !== expectedVersion) throw new SubmissionError("conflict", "This submission changed. Refresh its private status before trying again.", 409);
    if (next.id !== current.id || next.tokenHash !== current.tokenHash || next.createdAt !== current.createdAt) throw new Error("Submission identity cannot change");
    return { ...next, version: current.version + 1, updatedAt: new Date().toISOString() };
  }
  if (config.mode === "local") return lockedLocal(config.directory, records => {
    const index = records.findIndex(record => record.id === id);
    const next = nextRecord(records[index] || null);
    if (records.some(record => record.id !== id && (record.urlKey === next.urlKey || (next.listingSlug && record.listingSlug === next.listingSlug)))) throw duplicate();
    if (isPending(next) && !isPending(records[index]) && records.filter(isPending).length >= MAX_PENDING_SUBMISSIONS) throw pendingFull();
    records[index] = next;
    return next;
  });
  const current = await readDatabase(config.db, id);
  const next = nextRecord(current);
  const enteringQueue = isPending(next) && !!current && !isPending(current);
  try {
    const result = await config.db.prepare("UPDATE veronica_submissions SET version = ?, url_key = ?, listing_slug = ?, status = ?, record = ?, updated_at = ? WHERE id = ? AND version = ? AND (? = 0 OR (SELECT COUNT(*) FROM veronica_submissions WHERE status IN ('awaiting-backlink-review', 'free-awaiting-review')) < ?)")
      .bind(next.version, next.urlKey, next.listingSlug || null, next.status, JSON.stringify(next), next.updatedAt, id, expectedVersion, enteringQueue ? 1 : 0, MAX_PENDING_SUBMISSIONS).run();
    if (!result.success) throw new Error("Database update failed");
    if (result.meta.changes !== 1) {
      if (enteringQueue && (await readDatabase(config.db, id))?.version === expectedVersion) throw pendingFull();
      throw new SubmissionError("conflict", "This submission changed. Refresh its private status before trying again.", 409);
    }
    return next;
  } catch (error) { if (isDuplicateError(error)) throw duplicate(); throw error; }
}
