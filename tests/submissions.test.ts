// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import type { SubmissionRecord } from "@/lib/submissions/types";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { createSubmission, getPrivateSubmission, changeSubmission, reviewSubmission, listAdminSubmissions } from "@/lib/submissions/service";
import { getPublishedSubmissionTools, getPublishedSubmissionTool } from "@/lib/submissions/public";
import { submissionReadiness } from "@/lib/submissions/config";
import { pdfTools } from "@/data/pdf-catalog";
import { submissionSchema } from "@/lib/submissions/schema";
import { POST as createRoute } from "@/app/api/submissions/route";
import { POST as statusRoute } from "@/app/api/submissions/status/route";
import { POST as adminRoute } from "@/app/api/submissions/admin/route";
import { PATCH as editRoute } from "@/app/api/submissions/[id]/route";

const cloud = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: async () => ({ env: { VERONICA_SUBMISSIONS_DB: cloud.db } }) }));
const key = "local-test-editor-key-never-used-in-production";
const input = {
  submissionType: "free", name: "Northstar Notes", url: "https://northstar-tool.dev", email: "private@northstar-tool.dev",
  category: "productivity", description: "A team notebook for organizing research and ideas.", pricing: "Freemium", processing: "Cloud",
  backlinkUrl: "https://northstar-tool.dev/friends", sourceUrl: "https://northstar-tool.dev/docs", confirmed: true, website: "",
};
let directory: string;
let sqlite: DatabaseSync | undefined;
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "veronica-submissions-test-"));
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "local");
  vi.stubEnv("VERONICA_SUBMISSIONS_DIR", directory); vi.stubEnv("VERONICA_SUBMISSIONS_ADMIN_KEY", key);
  cloud.db = undefined;
});
afterEach(async () => { sqlite?.close(); sqlite = undefined; cloud.db = undefined; vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });
function request(url: string, body: unknown, authorization?: string, method = "POST") {
  return new Request(`https://veronicahub.com${url}`, { method, headers: { "Content-Type": "application/json", ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}) }, body: JSON.stringify(body) });
}
async function configureD1() {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile(path.join(process.cwd(), "database/001_free_submissions.sql"), "utf8"));
  cloud.db = {
    prepare(query: string) {
      let values: SQLInputValue[] = [];
      return {
        bind(...next: SQLInputValue[]) { values = next; return this; },
        async first() { return sqlite!.prepare(query).get(...values) || null; },
        async all() { return { results: sqlite!.prepare(query).all(...values), success: true }; },
        async run() { return { success: true, meta: { changes: Number(sqlite!.prepare(query).run(...values).changes) } }; },
      };
    },
  };
  vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "d1");
}
async function rawRecord(id: string): Promise<SubmissionRecord> {
  if (sqlite) return JSON.parse((sqlite.prepare("SELECT record FROM veronica_submissions WHERE id = ?").get(id) as { record: string }).record);
  return JSON.parse(await readFile(path.join(directory, "records.json"), "utf8")).find((record: SubmissionRecord) => record.id === id);
}
async function seedRecords(records: SubmissionRecord[]) {
  if (!sqlite) return writeFile(path.join(directory, "records.json"), JSON.stringify(records));
  sqlite.exec("DELETE FROM veronica_submissions");
  const statement = sqlite.prepare("INSERT INTO veronica_submissions (id, version, url_key, listing_slug, status, record, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  for (const record of records) statement.run(record.id, record.version, record.urlKey, record.listingSlug || null, record.status, JSON.stringify(record), record.createdAt, record.updatedAt);
}
function fixtureRecords(template: SubmissionRecord, count: number, recent = false): SubmissionRecord[] {
  const createdAt = new Date(Date.now() - (recent ? 1000 : 48 * 60 * 60 * 1000)).toISOString();
  return Array.from({ length: count }, (_, index) => ({ ...template, id: randomUUID(), version: 0, status: "awaiting-backlink-review", createdAt, updatedAt: createdAt,
    urlKey: `capacity-${index}.dev`, input: { ...template.input, url: `https://capacity-${index}.dev` },
  }));
}
for (const mode of ["local", "d1"] as const) {
  describe(`${mode} lifecycle and concurrency`, () => {
    beforeEach(async () => { if (mode === "d1") await configureD1(); });
    it("creates, checks both manually, approves, publishes safely, and withdraws immediately", async () => {
      const created = await createSubmission(input);
      expect(created.token).toMatch(/^[a-f0-9]{64}$/);
      expect(created.submission.status).toBe("awaiting-backlink-review");
      expect(JSON.stringify(created.submission)).not.toContain("tokenHash");
      expect(await getPublishedSubmissionTools()).toEqual([]);
      await expect(reviewSubmission(key, created.submission.id, 0, { decision: "approve", note: "A well researched tool." })).rejects.toMatchObject({ code: "checks_required" });
      await expect(reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "I opened the website.", websiteChecked: true })).rejects.toMatchObject({ code: "checks_required" });
      const checked = await reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "Website works; visible link points to Veronica Hub.", websiteChecked: true, backlinkChecked: true });
      expect(checked.status).toBe("free-awaiting-review");
      const approved = await reviewSubmission(key, checked.id, checked.version, { decision: "approve", note: "Editorial source and relevant category confirmed." });
      const published = await getPublishedSubmissionTools();
      expect(published).toHaveLength(1); expect(published[0].slug).toBe(`submission-${created.submission.id}`);
      expect(published[0].reciprocalSubmission).toBe(true);
      const json = JSON.stringify(published);
      for (const value of [input.email, created.token, "tokenHash", "reviewNote", "backlinkUrl"]) expect(json).not.toContain(value);
      expect(await getPublishedSubmissionTool(published[0].slug)).toEqual(published[0]);
      await expect(changeSubmission(approved.id, created.token, approved.version, "edit", input)).rejects.toMatchObject({ code: "state" });
      const withdrawn = await changeSubmission(approved.id, created.token, approved.version, "withdraw");
      expect(withdrawn.status).toBe("withdrawn"); expect(withdrawn.listingSlug).toBeUndefined();
      expect(await getPublishedSubmissionTools()).toEqual([]);
      expect(await getPublishedSubmissionTool(published[0].slug)).toBeUndefined();
      const resubmitted = await changeSubmission(withdrawn.id, created.token, withdrawn.version, "resubmit", { ...input, description: "Updated capabilities with a fully revised description." });
      expect(resubmitted.status).toBe("awaiting-backlink-review"); expect(resubmitted.backlinkVerifiedAt).toBeUndefined();
    });
    it("lets an authorized editor withdraw publication without a submitter token", async () => {
      const created = await createSubmission(input);
      const checked = await reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "Website and visible reciprocal link verified.", websiteChecked: true, backlinkChecked: true });
      const approved = await reviewSubmission(key, checked.id, checked.version, { decision: "approve", note: "Listing meets the editorial criteria." });
      expect(await getPublishedSubmissionTools()).toHaveLength(1);
      await expect(reviewSubmission(created.token, approved.id, approved.version, { decision: "withdraw", note: "Withdrawn after a quality review." })).rejects.toMatchObject({ code: "unauthorized" });
      const withdrawn = await reviewSubmission(key, approved.id, approved.version, { decision: "withdraw", note: "Withdrawn after a quality review." });
      expect(withdrawn.status).toBe("withdrawn"); expect(withdrawn.listingSlug).toBeUndefined();
      expect(await getPublishedSubmissionTools()).toEqual([]);
      expect((await getPrivateSubmission(withdrawn.id, created.token)).reviewNote).toBe("Withdrawn after a quality review.");
    });
    it("supports rejection and resubmission without preserving obsolete checks", async () => {
      const { submission, token } = await createSubmission(input);
      const checked = await reviewSubmission(key, submission.id, 0, { decision: "verify", note: "Website and backlink manually checked.", websiteChecked: true, backlinkChecked: true });
      const rejected = await reviewSubmission(key, submission.id, checked.version, { decision: "reject", note: "Please make the description more specific." });
      expect((await getPrivateSubmission(submission.id, token)).reviewNote).toBe(rejected.reviewNote);
      const next = await changeSubmission(submission.id, token, rejected.version, "resubmit", { ...input, description: "A more specific description for the editorial reviewer." });
      expect(next.status).toBe("awaiting-backlink-review"); expect(next.websiteVerifiedAt).toBeUndefined(); expect(next.reviewNote).toBeUndefined();
      expect(await getPublishedSubmissionTools()).toEqual([]);
    });
    it("denies missing, incorrect and cross-record tokens on reads and every mutation", async () => {
      const first = await createSubmission(input);
      const second = await createSubmission({ ...input, url: "https://other-tool.dev" });
      for (const token of ["", "bad", "0".repeat(64), second.token]) {
        await expect(getPrivateSubmission(first.submission.id, token)).rejects.toMatchObject({ code: "unauthorized" });
        for (const action of ["edit", "withdraw", "resubmit"] as const) {
          await expect(changeSubmission(first.submission.id, token, 0, action, input)).rejects.toMatchObject({ code: "unauthorized" });
        }
      }
      await expect(listAdminSubmissions(first.token)).rejects.toMatchObject({ code: "unauthorized" });
      await expect(reviewSubmission(first.token, first.submission.id, 0, { decision: "reject", note: "This should not be allowed." })).rejects.toMatchObject({ code: "unauthorized" });
      expect((await getPrivateSubmission(first.submission.id, first.token)).version).toBe(0);
    });
    it("blocks duplicate concurrent submissions and stale concurrent writes", async () => {
      const results = await Promise.allSettled([createSubmission(input), createSubmission({ ...input, url: `${input.url}/` })]);
      expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
      expect(results.filter(result => result.status === "rejected")).toHaveLength(1);
      const created = results.find(result => result.status === "fulfilled")!;
      if (created.status !== "fulfilled") throw new Error("Expected a saved submission");
      const { submission, token } = created.value;
      const changes = await Promise.allSettled([
        changeSubmission(submission.id, token, 0, "edit", { ...input, description: "An updated description in the first tab." }),
        changeSubmission(submission.id, token, 0, "edit", { ...input, description: "An updated description in the second tab." }),
      ]);
      expect(changes.filter(change => change.status === "fulfilled")).toHaveLength(1);
      const failed = changes.find(change => change.status === "rejected");
      expect(failed && failed.status === "rejected" && failed.reason.code).toBe("conflict");
      expect((await getPrivateSubmission(submission.id, token)).version).toBe(1);
    });
    it("atomically limits a rolling 24-hour intake window and returns no token on rejection", async () => {
      const initial = await createSubmission(input);
      await seedRecords(fixtureRecords(await rawRecord(initial.submission.id), 48, true));
      const attempts = await Promise.allSettled(Array.from({ length: 4 }, (_, i) => createSubmission({ ...input, url: `https://concurrent-${i}.dev` })));
      expect(attempts.filter(result => result.status === "fulfilled")).toHaveLength(2);
      const failures = attempts.filter(result => result.status === "rejected");
      expect(failures).toHaveLength(2);
      for (const result of failures) if (result.status === "rejected") expect(result.reason).toMatchObject({ code: "capacity", status: 429 });
      const response = await createRoute(request("/api/submissions", { ...input, url: "https://over-capacity.dev" }));
      expect(response.status).toBe(429); expect(await response.json()).not.toHaveProperty("token");
      expect(await listAdminSubmissions(key)).toHaveLength(50);
    });
    it("allows intake after old records leave the rolling window", async () => {
      const initial = await createSubmission(input);
      await seedRecords(fixtureRecords(await rawRecord(initial.submission.id), 50));
      expect((await createSubmission(input)).submission.status).toBe("awaiting-backlink-review");
    });
    it("bounds pending capacity and prevents a resubmission capacity bypass", async () => {
      const initial = await createSubmission(input);
      const template = await rawRecord(initial.submission.id);
      await seedRecords(fixtureRecords(template, 199));
      const last = await createSubmission(input);
      await expect(createSubmission({ ...input, url: "https://pending-capacity.dev" })).rejects.toMatchObject({ code: "capacity", status: 429 });
      expect(await listAdminSubmissions(key)).toHaveLength(200);
      const withdrawn = await changeSubmission(last.submission.id, last.token, 0, "withdraw");
      const saved = await rawRecord(last.submission.id);
      await seedRecords([saved, ...fixtureRecords(template, 200)]);
      await expect(changeSubmission(withdrawn.id, last.token, withdrawn.version, "resubmit")).rejects.toMatchObject({ code: "capacity", status: 429 });
      expect((await getPrivateSubmission(withdrawn.id, last.token)).status).toBe("withdrawn");
    });
    it("blocks edits onto another record's website", async () => {
      const first = await createSubmission(input);
      const second = await createSubmission({ ...input, url: "https://second-tool.dev" });
      await expect(changeSubmission(second.submission.id, second.token, 0, "edit", input)).rejects.toMatchObject({ code: "duplicate" });
      expect((await getPrivateSubmission(first.submission.id, first.token)).version).toBe(0);
    });
  });
}
describe("configuration, input validation and HTTP privacy", () => {
  it("stores only token hashes on disk", async () => {
    const { token } = await createSubmission(input);
    const file = await readFile(path.join(directory, "records.json"), "utf8");
    expect(file).not.toContain(token); expect(JSON.parse(file)[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });
  it("fails closed with no mode, production local mode, missing key or missing D1", async () => {
    for (const [mode, nodeEnv, admin] of [["", "test", key], ["local", "production", key], ["local", "test", ""], ["d1", "production", key]]) {
      vi.stubEnv("VERONICA_SUBMISSIONS_MODE", mode); vi.stubEnv("NODE_ENV", nodeEnv); vi.stubEnv("VERONICA_SUBMISSIONS_ADMIN_KEY", admin);
      expect((await submissionReadiness()).ready).toBe(false);
      await expect(createSubmission(input)).rejects.toMatchObject({ code: "disabled" });
      expect(await getPublishedSubmissionTools()).toEqual([]);
    }
  });
  it("allows production only with the dedicated ready D1 binding and no local fallback", async () => {
    await configureD1(); vi.stubEnv("NODE_ENV", "production");
    expect((await submissionReadiness()).ready).toBe(true);
    expect((await createSubmission(input)).submission.status).toBe("awaiting-backlink-review");
    await expect(readFile(path.join(directory, "records.json"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
    cloud.db = undefined;
    await expect(createSubmission({ ...input, url: "https://new-tool.dev" })).rejects.toMatchObject({ code: "disabled" });
  });
  it("requires the dedicated schema sentinel for D1", async () => {
    await configureD1(); expect((await submissionReadiness()).ready).toBe(true);
    sqlite!.exec("DELETE FROM veronica_submission_meta");
    expect((await submissionReadiness()).ready).toBe(false);
  });
  it("rejects paid submission paths, invalid categories, unsafe URLs, bots and extra fields", () => {
    for (const patch of [
      { submissionType: "paid" }, { category: "invented" }, { url: "http://northstar-tool.dev" }, { url: "https://127.0.0.1" },
      { url: "https://0x7f000001" }, { url: "https://2130706433" }, { url: "https://internal.local" }, { url: "https://user:password@northstar-tool.dev" },
      { sourceUrl: "javascript:alert(1)" }, { url: "https://northstar-tool.dev/?token=secret" }, { backlinkUrl: "" },
      { confirmed: false }, { website: "bot content" }, { iconDataUrl: "data:fake" }, { description: "short" }, { email: "invalid" },
    ]) expect(submissionSchema.safeParse({ ...input, ...patch }).success).toBe(false);
  });
  it("uses one normalized domain per listing across create, edit and approval", async () => {
    const seededUrl = new URL(pdfTools[0].url); seededUrl.pathname = "/a-completely-different-product";
    const seededInput = { ...input, url: seededUrl.toString() };
    await expect(createSubmission(seededInput)).rejects.toMatchObject({ code: "duplicate" });
    const created = await createSubmission(input);
    await expect(createSubmission({ ...input, url: "https://www.northstar-tool.dev/second-product" })).rejects.toMatchObject({ code: "duplicate" });
    await expect(changeSubmission(created.submission.id, created.token, 0, "edit", seededInput)).rejects.toMatchObject({ code: "duplicate" });
    const checked = await reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "Manually checked the website and backlink.", websiteChecked: true, backlinkChecked: true });
    const added = { ...pdfTools[0], slug: "test-only-seeded-collision", url: `${input.url}/official-product` };
    pdfTools.push(added);
    try {
      await expect(reviewSubmission(key, checked.id, checked.version, { decision: "approve", note: "This website is now seeded independently." })).rejects.toMatchObject({ code: "duplicate" });
      expect(await getPublishedSubmissionTools()).toEqual([]);
    } finally { pdfTools.splice(pdfTools.indexOf(added), 1); }
  });
  it("invalidates saved manual checks after editing", async () => {
    const created = await createSubmission(input);
    const checked = await reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "All manual verification completed.", websiteChecked: true, backlinkChecked: true });
    const edited = await changeSubmission(checked.id, created.token, checked.version, "edit", input);
    expect(edited.status).toBe("awaiting-backlink-review"); expect(edited.backlinkVerifiedAt).toBeUndefined();
  });
  it("API supports private create/status/edit/admin without credentials in URLs", async () => {
    const response = await createRoute(request("/api/submissions", input));
    expect(response.status).toBe(201); expect(response.headers.get("cache-control")).toContain("no-store"); expect(response.headers.get("x-robots-tag")).toContain("noindex");
    const body = await response.json();
    expect(JSON.stringify(body.submission)).not.toContain("tokenHash");
    const status = await statusRoute(request("/api/submissions/status", { id: body.submission.id, token: body.token }));
    expect(status.status).toBe(200); expect(JSON.stringify(await status.json())).not.toContain(body.token);
    const denied = await statusRoute(request("/api/submissions/status", { id: body.submission.id, token: "0".repeat(64) }));
    expect(denied.status).toBe(401); expect(JSON.stringify(await denied.json())).not.toContain(input.email);
    const changed = await editRoute(request(`/api/submissions/${body.submission.id}`, { version: 0, action: "edit", input }, body.token, "PATCH"), { params: Promise.resolve({ id: body.submission.id }) });
    expect(changed.status).toBe(200);
    const list = await adminRoute(request("/api/submissions/admin", { action: "list" }, key));
    expect(list.status).toBe(200); expect((await list.json()).submissions).toHaveLength(1);
    const unsafeUrl = await statusRoute(request("/api/submissions/status?token=secret", { id: body.submission.id, token: body.token }));
    expect(unsafeUrl.status).toBe(400);
  });
  it("uses a validated actual Host when Next reconstructs the URL hostname", async () => {
    vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "");
    const local = new Request("http://localhost:3187/api/submissions", {
      method: "POST", headers: { "Content-Type": "application/json", Host: "127.0.0.1:3187", Origin: "http://127.0.0.1:3187", "Sec-Fetch-Site": "same-origin" }, body: JSON.stringify(input),
    });
    const result = await createRoute(local);
    expect(result.status).toBe(503); expect((await result.json()).code).toBe("disabled");
    const publicHost = new Request("https://internal-next.local/api/submissions", {
      method: "POST", headers: { "Content-Type": "application/json", Host: "residentevilveronica.com", Origin: "https://residentevilveronica.com" }, body: JSON.stringify(input),
    });
    expect((await createRoute(publicHost)).status).toBe(503);
  });
  it("rejects spoofed origins, scheme or port changes, and ignores forwarded host/protocol", async () => {
    for (const origin of ["https://untrusted.dev", "http://localhost:3187", "http://127.0.0.1:9999", "https://127.0.0.1:3187", "null"]) {
      const spoofed = new Request("http://localhost:3187/api/submissions", {
        method: "POST", headers: { "Content-Type": "application/json", Host: "127.0.0.1:3187", Origin: origin, "X-Forwarded-Host": "untrusted.dev", "X-Forwarded-Proto": "https" }, body: JSON.stringify(input),
      });
      expect((await createRoute(spoofed)).status).toBe(403);
    }
    const spoofedWithoutHost = request("/api/submissions", input);
    spoofedWithoutHost.headers.set("Origin", "https://untrusted.dev"); spoofedWithoutHost.headers.set("X-Forwarded-Host", "untrusted.dev");
    expect((await createRoute(spoofedWithoutHost)).status).toBe(403);
  });
  it("rejects malformed actual Host authorities even without an Origin header", async () => {
    for (const host of ["user@localhost:3187", "localhost:3187/path", "bad host", "localhost:99999", "localhost:3187#fragment", "localhost:3187,evil.dev", "[::1", "bad..host", "bad_host", "evil.dev\\@localhost"]) {
      const malformed = request("/api/submissions", input); malformed.headers.set("Host", host);
      expect((await createRoute(malformed)).status).toBe(403);
    }
  });
  it("rejects cross-site posts and oversized JSON, and never fakes success when disabled", async () => {
    const crossSite = request("/api/submissions", input); crossSite.headers.set("Origin", "https://untrusted.dev");
    expect((await createRoute(crossSite)).status).toBe(403);
    expect((await createRoute(request("/api/submissions", { ...input, description: "a".repeat(17000) }))).status).toBe(413);
    vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "");
    const disabled = await createRoute(request("/api/submissions", input));
    expect(disabled.status).toBe(503); expect((await disabled.json()).code).toBe("disabled");
  });
});
