// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createHmac, randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { createSubmission, getPrivateSubmission, changeSubmission, reviewSubmission } from "@/lib/submissions/service";
import { paidReviewDeadline, receiveSubmissionWebhook, startSubmissionCheckout, verifySubmissionRefund } from "@/lib/submissions/payment";
import { submissionReadiness } from "@/lib/submissions/config";
import { getPublishedSubmissionTools } from "@/lib/submissions/public";
import { readSubmissionRecord } from "@/lib/submissions/store";
import { type SubmissionRecord } from "@/lib/submissions/types";
import { type ProviderCheckoutSession, type ProviderRefund } from "@/lib/submissions/payment-provider";
import { POST as checkoutRoute } from "@/app/api/submissions/checkout/route";
import { POST as webhookRoute } from "@/app/api/submissions/webhook/route";
import { POST as adminRoute } from "@/app/api/submissions/admin/route";

const cloud = vi.hoisted(() => ({ db: undefined as unknown }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: async () => ({ env: { VERONICA_SUBMISSIONS_DB: cloud.db } }) }));
const key = "isolated-test-editor-key-not-a-real-secret";
// Construct unmistakable mock credentials only inside the test process. No provider
// request leaves fetch mocks, and no real credential belongs in repository content.
const fixtureSecret = (mode: "test" | "live") => ["sk", mode, "0".repeat(24)].join("_");
const webhookKey = ["whsec", "0".repeat(24)].join("_");
const input = {
  submissionType: "paid", name: "Independent Tool", url: "https://independent-tool.dev", email: "publisher@independent-tool.dev",
  category: "productivity", description: "A focused open tool for organizing research notes.", pricing: "Free", processing: "Cloud", confirmed: true,
};
let directory: string; let sqlite: DatabaseSync | undefined;
let sessions: Map<string, ProviderCheckoutSession>; let idempotency: Map<string, string>; let refunds: Map<string, ProviderRefund>;
let provider: ReturnType<typeof vi.fn>; let loseCreationResponse = false;
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "veronica-paid-test-"));
  vi.stubEnv("NODE_ENV", "test"); vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "local"); vi.stubEnv("VERONICA_SUBMISSIONS_DIR", directory);
  vi.stubEnv("VERONICA_SUBMISSIONS_ADMIN_KEY", key); vi.stubEnv("VERONICA_PAID_SUBMISSIONS_ENABLED", "true");
  vi.stubEnv("VERONICA_PAYMENT_ENVIRONMENT", "test"); vi.stubEnv("VERONICA_STRIPE_SECRET_KEY", fixtureSecret("test"));
  vi.stubEnv("VERONICA_STRIPE_WEBHOOK_SECRET", webhookKey); vi.stubEnv("VERONICA_PAYMENT_ORIGIN", "https://residentevilveronica.com");
  vi.stubEnv("VERONICA_LOCAL_TEST_PAYMENTS", "true"); vi.stubEnv("VERONICA_LIVE_PAYMENTS_ENABLED", "false");
  cloud.db = undefined; sessions = new Map(); idempotency = new Map(); refunds = new Map(); loseCreationResponse = false;
  provider = vi.fn(async (url: string, init: RequestInit = {}) => {
    if (!url.startsWith("https://api.stripe.com/v1/")) throw new Error("Unapproved mock endpoint");
    if (init.method === "POST") {
      if (url !== "https://api.stripe.com/v1/checkout/sessions") throw new Error("Refund creation is forbidden in these tests");
      const headers = new Headers(init.headers); const idem = headers.get("idempotency-key")!;
      if (!idempotency.has(idem)) {
        const body = new URLSearchParams(String(init.body)); const id = `cs_test_${sessions.size + 1}`;
        const session: ProviderCheckoutSession = {
          id, url: `https://checkout.stripe.com/c/pay/${id}#opaqueProviderFragment`, mode: "payment", status: "open", payment_status: "unpaid",
          amount_total: 990, currency: "usd", livemode: false, expires_at: Number(body.get("expires_at")), payment_intent: null,
          client_reference_id: body.get("client_reference_id")!,
          metadata: { purpose: body.get("metadata[purpose]")!, submissionId: body.get("metadata[submissionId]")!, attemptId: body.get("metadata[attemptId]")! },
        };
        sessions.set(id, session); idempotency.set(idem, id);
      }
      if (loseCreationResponse) { loseCreationResponse = false; throw new Error("Mock connection dropped AFTER provider saved session"); }
      return Response.json(sessions.get(idempotency.get(idem)!));
    }
    if (url.includes("/checkout/sessions/")) return Response.json(sessions.get(url.split("/").at(-1)!));
    if (url.includes("/refunds/")) return Response.json(refunds.get(url.split("/").at(-1)!));
    throw new Error("Unexpected mock provider request");
  });
  vi.stubGlobal("fetch", provider);
});
afterEach(async () => { sqlite?.close(); sqlite = undefined; cloud.db = undefined; vi.unstubAllGlobals(); vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }); });
async function configureD1(migrate = true) {
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(await readFile("database/001_free_submissions.sql", "utf8"));
  if (migrate) sqlite.exec(await readFile("database/002_paid_submissions.sql", "utf8"));
  cloud.db = { prepare(query: string) {
    let values: SQLInputValue[] = [];
    return {
      bind(...next: SQLInputValue[]) { values = next; return this; },
      async first() { return sqlite!.prepare(query).get(...values) || null; },
      async all() { return { results: sqlite!.prepare(query).all(...values), success: true }; },
      async run() { return { success: true, meta: { changes: Number(sqlite!.prepare(query).run(...values).changes) } }; },
    };
  } };
  vi.stubEnv("VERONICA_SUBMISSIONS_MODE", "d1");
}
function sign(raw: string, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${createHmac("sha256", webhookKey).update(`${timestamp}.${raw}`).digest("hex")}`;
}
function eventFor(session: ProviderCheckoutSession, type = "checkout.session.completed", id = `evt_${randomUUID().replace(/-/g, "")}`) {
  const raw = JSON.stringify({ id, type, created: Math.floor(Date.now() / 1000), livemode: false, data: { object: { id: session.id, metadata: { purpose: session.metadata.purpose }, payment_status: session.payment_status } } });
  return { raw, signature: sign(raw) };
}
async function notify(session: ProviderCheckoutSession, type?: string, id?: string) {
  const event = eventFor(session, type, id); return receiveSubmissionWebhook(event.raw, event.signature);
}
function markPaid(session: ProviderCheckoutSession) {
  Object.assign(session, { status: "complete", payment_status: "paid", payment_intent: `pi_payment${sessions.size}`, url: null });
}
async function paidSubmission() {
  const created = await createSubmission(input);
  await startSubmissionCheckout(created.submission.id, created.token);
  const session = [...sessions.values()].at(-1)!; markPaid(session); await notify(session);
  return { ...created, session, submission: await getPrivateSubmission(created.submission.id, created.token) };
}
function request(route: string, body: unknown, token?: string) {
  return new Request(`https://residentevilveronica.com${route}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://residentevilveronica.com", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
}
async function overwriteRecord(record: SubmissionRecord) {
  if (sqlite) { sqlite.prepare("UPDATE veronica_submissions SET record = ?, status = ?, version = ? WHERE id = ?").run(JSON.stringify(record), record.status, record.version, record.id); return; }
  await writeFile(path.join(directory, "records.json"), JSON.stringify([record]));
}

for (const mode of ["local", "d1"] as const) {
  describe(`${mode} isolated payment integration`, () => {
    beforeEach(async () => { if (mode === "d1") await configureD1(); });
    it("keeps service fee separate from product pricing, confirms payment, reviews website, publishes sponsored and withdraws", async () => {
      const created = await createSubmission(input);
      expect(created.submission).toMatchObject({ serviceType: "paid", status: "awaiting-payment", input: { pricing: "Free", backlinkUrl: "" }, payment: { status: "awaiting-payment", amount: 990, currency: "usd" } });
      await expect(reviewSubmission(key, created.submission.id, 0, { decision: "approve", note: "Payment not yet confirmed." })).rejects.toMatchObject({ code: "state" });
      expect(await getPublishedSubmissionTools()).toEqual([]);
      const checkout = await startSubmissionCheckout(created.submission.id, created.token);
      expect(checkout.checkoutUrl).toMatch(/^https:\/\/checkout.stripe.com\//);
      const session = [...sessions.values()][0]; markPaid(session); await notify(session);
      const paid = await getPrivateSubmission(created.submission.id, created.token);
      expect(paid.status).toBe("paid-awaiting-review"); expect(paid.payment?.reviewDueAt).toBe(paidReviewDeadline(paid.payment!.paidAt!));
      await expect(reviewSubmission(key, paid.id, paid.version, { decision: "approve", note: "Website check not saved yet." })).rejects.toMatchObject({ code: "checks_required" });
      const checked = await reviewSubmission(key, paid.id, paid.version, { decision: "verify", note: "I inspected the public website.", websiteChecked: true });
      expect(checked.backlinkVerifiedAt).toBeUndefined();
      const approved = await reviewSubmission(key, paid.id, checked.version, { decision: "approve", note: "Editorial relevance is confirmed." });
      expect((await getPublishedSubmissionTools())[0]).toMatchObject({ paidSubmission: true, reciprocalSubmission: false, pricing: "Free" });
      const serialized = JSON.stringify(await getPublishedSubmissionTools());
      for (const secret of [created.token, input.email, session.id, session.payment_intent, "payment", "reviewNote", "backlinkUrl"]) expect(serialized).not.toContain(secret);
      const withdrawn = await changeSubmission(paid.id, created.token, approved.version, "withdraw");
      expect(withdrawn.payment?.refundStatus).toBe("none"); expect(await getPublishedSubmissionTools()).toEqual([]);
      await expect(changeSubmission(paid.id, created.token, withdrawn.version, "resubmit", input)).rejects.toMatchObject({ code: "state" });
    });
    it("preserves free service with a Paid-priced tool, never opening Checkout", async () => {
      const created = await createSubmission({ ...input, submissionType: "free", pricing: "Paid", backlinkUrl: "https://independent-tool.dev/friends" });
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toMatchObject({ code: "payment_mismatch" });
      expect(provider).not.toHaveBeenCalled();
      const checked = await reviewSubmission(key, created.submission.id, 0, { decision: "verify", note: "Website and backlink both checked.", websiteChecked: true, backlinkChecked: true });
      await reviewSubmission(key, checked.id, checked.version, { decision: "approve", note: "Free reciprocal submission approved." });
      expect((await getPublishedSubmissionTools())[0]).toMatchObject({ paidSubmission: false, reciprocalSubmission: true, pricing: "Paid" });
    });
    it("uses one durable idempotent attempt across concurrent calls and lost provider responses", async () => {
      const created = await createSubmission(input); loseCreationResponse = true;
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toMatchObject({ code: "payment_provider" });
      const pending = await readSubmissionRecord(created.submission.id);
      expect(pending!.payment!.attempts).toHaveLength(1); expect(pending!.payment!.attempts[0].sessionId).toBeUndefined();
      const results = await Promise.all(Array.from({ length: 4 }, () => startSubmissionCheckout(created.submission.id, created.token)));
      expect(new Set(results.map(value => value.checkoutUrl)).size).toBe(1); expect(sessions.size).toBe(1); expect(idempotency.size).toBe(1);
      expect((await readSubmissionRecord(created.submission.id))!.payment!.attempts).toHaveLength(1);
      const bodies = provider.mock.calls.filter(([, init]) => init.method === "POST").map(([, init]) => String(init.body));
      expect(new Set(bodies).size).toBe(1);
      for (const body of bodies) { expect(body).not.toContain(created.token); expect(body).not.toContain(encodeURIComponent(input.email)); expect(body).not.toContain("token"); }
      const lastBody = new URLSearchParams(bodies[0]); expect(lastBody.get("success_url")).toBe("https://residentevilveronica.com/submit-tool/status");
    });
    it("accepts a webhook arriving before a lost creation response is persisted, without creating a second checkout", async () => {
      const created = await createSubmission(input); loseCreationResponse = true;
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toThrow();
      const session = [...sessions.values()][0]; markPaid(session); await notify(session);
      expect((await getPrivateSubmission(created.submission.id, created.token)).payment?.status).toBe("paid");
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toMatchObject({ code: "state" });
      expect(sessions.size).toBe(1);
    });
    it("rotates only a verified expired unpaid session and ignores its late notification after payment", async () => {
      const created = await createSubmission(input); await startSubmissionCheckout(created.submission.id, created.token);
      const expired = [...sessions.values()][0]; Object.assign(expired, { status: "expired", url: null });
      const results = await Promise.all([startSubmissionCheckout(created.submission.id, created.token), startSubmissionCheckout(created.submission.id, created.token)]);
      expect(results[0].checkoutUrl).toBe(results[1].checkoutUrl); expect(sessions.size).toBe(2);
      const paid = [...sessions.values()][1]; markPaid(paid); await notify(paid);
      await notify(expired, "checkout.session.expired");
      const record = await getPrivateSubmission(created.submission.id, created.token);
      expect(record.status).toBe("paid-awaiting-review"); expect(record.payment?.status).toBe("paid");
    });
    it("fails closed for an old ambiguous attempt instead of allowing idempotency expiry to create another charge", async () => {
      const created = await createSubmission(input); loseCreationResponse = true;
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toThrow();
      const record = (await readSubmissionRecord(created.submission.id))!;
      record.payment!.attempts[0].createdAt = new Date(Date.now() - 24 * 3600 * 1000).toISOString(); await overwriteRecord(record);
      provider.mockClear();
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toMatchObject({ code: "payment_reconciliation" });
      expect(provider).not.toHaveBeenCalled(); expect(sessions.size).toBe(1);
    });
    it("handles duplicate and concurrent events atomically and cannot undo rejection/refund obligations", async () => {
      const created = await createSubmission(input); await startSubmissionCheckout(created.submission.id, created.token);
      const session = [...sessions.values()][0]; markPaid(session);
      const event = eventFor(session, "checkout.session.completed", "evt_samereceipt");
      await Promise.all(Array.from({ length: 5 }, () => receiveSubmissionWebhook(event.raw, event.signature)));
      const current = await getPrivateSubmission(created.submission.id, created.token);
      const due = current.payment?.reviewDueAt;
      const rejected = await reviewSubmission(key, current.id, current.version, { decision: "reject", note: "The product is outside our editorial scope." });
      expect(rejected.payment?.refundStatus).toBe("pending");
      await receiveSubmissionWebhook(event.raw, event.signature);
      await notify(session, "checkout.session.async_payment_succeeded");
      const after = await getPrivateSubmission(current.id, created.token);
      expect(after.status).toBe("rejected"); expect(after.payment).toMatchObject({ refundStatus: "pending", reviewDueAt: due });
      expect((await readSubmissionRecord(current.id))!.payment!.events.filter(value => value.id === "evt_samereceipt")).toHaveLength(1);
      await expect(changeSubmission(current.id, created.token, after.version, "resubmit", input)).rejects.toMatchObject({ code: "state" });
      await expect(reviewSubmission(key, current.id, after.version, { decision: "approve", note: "This should remain rejected." })).rejects.toMatchObject({ code: "state" });
    });
    it("preserves withdrawal when payment arrives late and keeps a full refund pending", async () => {
      const created = await createSubmission(input); const checkout = await startSubmissionCheckout(created.submission.id, created.token);
      await changeSubmission(created.submission.id, created.token, checkout.submission.version, "withdraw");
      const session = [...sessions.values()][0]; markPaid(session); await notify(session);
      expect(await getPrivateSubmission(created.submission.id, created.token)).toMatchObject({ status: "withdrawn", payment: { status: "paid", refundStatus: "pending" } });
      expect(await getPublishedSubmissionTools()).toEqual([]);
    });
    it("lets an editor release abandoned unpaid capacity without losing late payment obligations", async () => {
      const created = await createSubmission(input); const checkout = await startSubmissionCheckout(created.submission.id, created.token);
      const withdrawn = await reviewSubmission(key, created.submission.id, checkout.submission.version, { decision: "withdraw", note: "Abandoned unpaid Checkout removed from the review queue." });
      expect(withdrawn.status).toBe("withdrawn"); expect(withdrawn.payment?.status).toBe("awaiting-payment");
      const session = [...sessions.values()][0]; markPaid(session); await notify(session);
      expect(await getPrivateSubmission(created.submission.id, created.token)).toMatchObject({ status: "withdrawn", payment: { status: "paid", refundStatus: "pending" } });
      expect(await getPublishedSubmissionTools()).toEqual([]);
    });
    it("does not mark a refund complete until a succeeded full provider refund matches the verified original payment", async () => {
      const created = await paidSubmission();
      const rejected = await reviewSubmission(key, created.submission.id, created.submission.version, { decision: "reject", note: "This is not eligible for the directory." });
      const good: ProviderRefund = { id: "re_verified1", status: "succeeded", amount: 990, currency: "usd", payment_intent: created.session.payment_intent };
      for (const patch of [{ status: "pending" }, { status: "failed" }, { amount: 989 }, { currency: "eur" }, { payment_intent: "pi_anotherorder" }]) {
        refunds.set(good.id, { ...good, ...patch } as ProviderRefund);
        await expect(verifySubmissionRefund(key, rejected.id, rejected.version, good.id)).rejects.toMatchObject({ code: "payment_mismatch" });
        expect((await getPrivateSubmission(rejected.id, created.token)).payment?.refundStatus).toBe("pending");
      }
      refunds.set(good.id, good);
      await expect(verifySubmissionRefund(created.token, rejected.id, rejected.version, good.id)).rejects.toMatchObject({ code: "unauthorized" });
      await expect(verifySubmissionRefund(key, rejected.id, rejected.version - 1, good.id)).rejects.toMatchObject({ code: "conflict" });
      const refunded = await verifySubmissionRefund(key, rejected.id, rejected.version, good.id);
      expect(refunded.payment?.refundStatus).toBe("refunded"); expect(refunded.payment?.refundVerifiedAt).toBeTruthy();
      expect((await readSubmissionRecord(rejected.id))!.payment!.refundId).toBe(good.id);
      expect(JSON.stringify(refunded)).not.toContain(good.id); expect(JSON.stringify(refunded)).not.toContain(created.session.payment_intent);
      expect(provider.mock.calls.filter(([, init]) => init.method === "POST").every(([url]) => url.endsWith("/checkout/sessions"))).toBe(true);
      await notify(created.session); expect((await getPrivateSubmission(rejected.id, created.token)).payment?.refundStatus).toBe("refunded");
    });
    it("keeps webhook and refund reconciliation working after new paid intake is switched off", async () => {
      const created = await createSubmission(input); await startSubmissionCheckout(created.submission.id, created.token);
      vi.stubEnv("VERONICA_PAID_SUBMISSIONS_ENABLED", "false");
      expect((await submissionReadiness()).paidReady).toBe(false);
      await expect(startSubmissionCheckout(created.submission.id, created.token)).rejects.toMatchObject({ code: "payments_disabled" });
      const session = [...sessions.values()][0]; markPaid(session); await notify(session);
      const paid = await getPrivateSubmission(created.submission.id, created.token);
      const rejected = await reviewSubmission(key, paid.id, paid.version, { decision: "reject", note: "Rejected after intake was paused." });
      refunds.set("re_paused", { id: "re_paused", status: "succeeded", amount: 990, currency: "usd", payment_intent: session.payment_intent });
      expect((await verifySubmissionRefund(key, paid.id, rejected.version, "re_paused")).payment?.refundStatus).toBe("refunded");
    });
    it("rejects forged amount, currency, mode, environment, intent, client reference and attempt bindings", async () => {
      const created = await createSubmission(input); await startSubmissionCheckout(created.submission.id, created.token);
      const session = [...sessions.values()][0]; markPaid(session); const good = structuredClone(session);
      for (const patch of [
        { amount_total: 999 }, { currency: "eur" }, { mode: "subscription" }, { livemode: true }, { payment_intent: null },
        { client_reference_id: randomUUID() }, { metadata: { ...good.metadata, attemptId: randomUUID() } },
        { expires_at: good.expires_at + 1 },
      ]) {
        Object.assign(session, good, patch);
        await expect(notify(session)).rejects.toMatchObject({ code: expect.stringMatching(/^payment_(mismatch|provider)$/) });
        expect((await getPrivateSubmission(created.submission.id, created.token)).payment?.status).toBe("awaiting-payment");
      }
      Object.assign(session, good); await notify(session);
      expect((await getPrivateSubmission(created.submission.id, created.token)).payment?.status).toBe("paid");
    });
    it("atomically reserves paid pending capacity before Checkout and includes paid creation in daily intake", async () => {
      const initial = await createSubmission(input); const template = (await readSubmissionRecord(initial.submission.id))!;
      async function seed(count: number, recent: boolean) {
        const at = new Date(Date.now() - (recent ? 1000 : 48 * 3600 * 1000)).toISOString();
        const records = Array.from({ length: count }, (_, i): SubmissionRecord => ({ ...template, id: randomUUID(), version: 0,
          createdAt: at, updatedAt: at, urlKey: `reserved-${i}.dev`, input: { ...template.input, url: `https://reserved-${i}.dev` } }));
        if (!sqlite) { await writeFile(path.join(directory, "records.json"), JSON.stringify(records)); return; }
        sqlite.exec("DELETE FROM veronica_submissions");
        const insert = sqlite.prepare("INSERT INTO veronica_submissions (id,version,url_key,listing_slug,status,record,created_at,updated_at) VALUES (?,?,?,NULL,?,?,?,?)");
        for (const record of records) insert.run(record.id, record.version, record.urlKey, record.status, JSON.stringify(record), record.createdAt, record.updatedAt);
      }
      await seed(199, false);
      let results = await Promise.allSettled(Array.from({ length: 3 }, (_, i) => createSubmission({ ...input, url: `https://slot-${i}.dev` })));
      expect(results.filter(value => value.status === "fulfilled")).toHaveLength(1);
      for (const result of results) if (result.status === "rejected") expect(result.reason.code).toBe("capacity");
      expect(provider).not.toHaveBeenCalled();
      await seed(49, true);
      results = await Promise.allSettled(Array.from({ length: 3 }, (_, i) => createSubmission({ ...input, url: `https://day-${i}.dev` })));
      expect(results.filter(value => value.status === "fulfilled")).toHaveLength(1);
      for (const result of results) if (result.status === "rejected") expect(result.reason.code).toBe("capacity");
    });
    it("locks paid edits after Checkout, prevents fee-type changes, and denies cross-record tokens", async () => {
      const created = await createSubmission(input);
      const edit = await changeSubmission(created.submission.id, created.token, 0, "edit", { ...input, description: "An improved accurate description before paying." });
      await expect(changeSubmission(edit.id, created.token, edit.version, "edit", { ...input, submissionType: "free", backlinkUrl: "https://independent-tool.dev/link" })).rejects.toMatchObject({ code: "state" });
      await expect(startSubmissionCheckout(edit.id, "0".repeat(64))).rejects.toMatchObject({ code: "unauthorized" });
      const checkout = await startSubmissionCheckout(edit.id, created.token);
      await expect(changeSubmission(edit.id, created.token, checkout.submission.version, "edit", input)).rejects.toMatchObject({ code: "state" });
    });
  });
}

describe("payment configuration, migration and HTTP boundary", () => {
  it("requires every explicit paid config setting and keeps free intake enabled", async () => {
    for (const [name, bad] of [["VERONICA_PAID_SUBMISSIONS_ENABLED", ""], ["VERONICA_PAYMENT_ENVIRONMENT", "unknown"], ["VERONICA_STRIPE_SECRET_KEY", fixtureSecret("live")], ["VERONICA_STRIPE_WEBHOOK_SECRET", ""], ["VERONICA_PAYMENT_ORIGIN", "https://residentevilveronica.com/status?token=bad"], ["VERONICA_PAYMENT_ORIGIN", "https://askpdf.top"], ["VERONICA_PAYMENT_ORIGIN", "https://other-domain.dev"], ["VERONICA_LOCAL_TEST_PAYMENTS", ""]]) {
      const previous = process.env[name]; vi.stubEnv(name, bad);
      expect(await submissionReadiness()).toMatchObject({ ready: true, paidReady: false });
      await expect(createSubmission(input)).rejects.toMatchObject({ code: "payments_disabled" }); vi.stubEnv(name, previous);
    }
    expect(provider).not.toHaveBeenCalled();
    await expect(readFile(path.join(directory, "records.json"), "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });
  it("keeps legacy v1 D1 free/token rows working until an authorized v2 migration is applied", async () => {
    await configureD1(false); expect(await submissionReadiness()).toMatchObject({ ready: true, paidReady: false });
    const free = await createSubmission({ ...input, submissionType: "free", backlinkUrl: "https://independent-tool.dev/link" });
    const raw = (await readSubmissionRecord(free.submission.id))!; delete raw.serviceType; await overwriteRecord(raw);
    await expect(createSubmission({ ...input, url: "https://another-paid-tool.dev" })).rejects.toMatchObject({ code: "payments_disabled" });
    expect((await getPrivateSubmission(free.submission.id, free.token)).serviceType).toBe("free");
    sqlite!.exec(await readFile("database/002_paid_submissions.sql", "utf8"));
    expect((await submissionReadiness()).paidReady).toBe(true);
    expect((await getPrivateSubmission(free.submission.id, free.token)).status).toBe("awaiting-backlink-review");
    const edited = await changeSubmission(free.submission.id, free.token, 0, "edit", { ...raw.input, description: "Updated legacy free submission after migration." });
    const checked = await reviewSubmission(key, edited.id, edited.version, { decision: "verify", note: "Legacy website and backlink verified.", websiteChecked: true, backlinkChecked: true });
    const approved = await reviewSubmission(key, checked.id, checked.version, { decision: "approve", note: "Legacy token and editorial workflow preserved." });
    expect(approved.status).toBe("approved"); expect((await getPublishedSubmissionTools())[0].reciprocalSubmission).toBe(true);
    expect((await createSubmission({ ...input, url: "https://another-paid-tool.dev" })).submission.status).toBe("awaiting-payment");
  });
  it("does not allow live payments in local storage and requires the separate live sales flag in D1", async () => {
    vi.stubEnv("VERONICA_PAYMENT_ENVIRONMENT", "live"); vi.stubEnv("VERONICA_STRIPE_SECRET_KEY", fixtureSecret("live"));
    vi.stubEnv("VERONICA_LIVE_PAYMENTS_ENABLED", "true"); expect((await submissionReadiness()).paidReady).toBe(false);
    await configureD1(); vi.stubEnv("VERONICA_LIVE_PAYMENTS_ENABLED", "false"); expect((await submissionReadiness()).paidReady).toBe(false);
    vi.stubEnv("VERONICA_LIVE_PAYMENTS_ENABLED", "true"); expect((await submissionReadiness()).paidReady).toBe(true); expect(provider).not.toHaveBeenCalled();
  });
  it("allows a loopback return origin only for explicitly isolated local test payments", async () => {
    vi.stubEnv("VERONICA_PAYMENT_ORIGIN", "http://localhost:3000"); expect((await submissionReadiness()).paidReady).toBe(true);
    await configureD1(); expect((await submissionReadiness()).paidReady).toBe(false);
  });
  it("computes seven business days in UTC without inventing a holiday calendar", () => {
    expect(paidReviewDeadline("2026-10-09T16:30:00.000Z")).toBe("2026-10-20T16:30:00.000Z");
    expect(paidReviewDeadline("2026-10-10T16:30:00.000Z")).toBe("2026-10-20T16:30:00.000Z");
  });
  it("keeps checkout tokens out of URLs, rejects cross-origin requests and verifies the exact webhook raw body", async () => {
    const created = await createSubmission(input);
    const invalid = await checkoutRoute(request("/api/submissions/checkout?token=secret", { id: created.submission.id }, created.token)); expect(invalid.status).toBe(400);
    const cross = request("/api/submissions/checkout", { id: created.submission.id }, created.token); cross.headers.set("Origin", "https://untrusted.dev");
    expect((await checkoutRoute(cross)).status).toBe(403);
    const response = await checkoutRoute(request("/api/submissions/checkout", { id: created.submission.id }, created.token));
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toContain("no-store");
    expect(JSON.stringify(await response.json())).not.toContain(created.token);
    const session = [...sessions.values()][0]; markPaid(session); const event = eventFor(session);
    const changed = new Request("https://residentevilveronica.com/api/submissions/webhook", { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": event.signature }, body: `${event.raw} ` });
    expect((await webhookRoute(changed)).status).toBe(400);
    const valid = new Request("https://residentevilveronica.com/api/submissions/webhook", { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": event.signature }, body: event.raw });
    expect((await webhookRoute(valid)).status).toBe(200);
    const huge = new Request("https://residentevilveronica.com/api/submissions/webhook", { method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(262145) }); expect((await webhookRoute(huge)).status).toBe(413);
  });
  it("ignores unrelated event types and bounds durable provider receipts without downgrading a replay", async () => {
    const created = await paidSubmission(); const version = created.submission.version;
    await notify(created.session, "customer.created"); expect((await getPrivateSubmission(created.submission.id, created.token)).version).toBe(version);
    for (let i = 0; i < 68; i++) await notify(created.session, "checkout.session.completed", `evt_receipt${i}`);
    expect((await readSubmissionRecord(created.submission.id))!.payment!.events).toHaveLength(64);
    await notify(created.session, "checkout.session.completed", "evt_receipt0");
    expect((await getPrivateSubmission(created.submission.id, created.token)).payment?.status).toBe("paid");
  });
  it("requires same-origin admin authorization for refund verification", async () => {
    const created = await paidSubmission(); const rejected = await reviewSubmission(key, created.submission.id, created.submission.version, { decision: "reject", note: "Refund is owed after this rejection." });
    refunds.set("re_admin", { id: "re_admin", status: "succeeded", amount: 990, currency: "usd", payment_intent: created.session.payment_intent });
    const body = { action: "verify-refund", id: rejected.id, version: rejected.version, refundId: "re_admin" };
    expect((await adminRoute(request("/api/submissions/admin", body, created.token))).status).toBe(401);
    const cross = request("/api/submissions/admin", body, key); cross.headers.set("Origin", "https://untrusted.dev"); expect((await adminRoute(cross)).status).toBe(403);
    const valid = await adminRoute(request("/api/submissions/admin", body, key)); expect(valid.status).toBe(200); expect((await valid.json()).submission.payment.refundStatus).toBe("refunded");
  });
  it("acknowledges unrelated shared-account Checkout snapshots without fetching or storing them", async () => {
    for (const metadata of [undefined, {}, { purpose: "another-product" }]) {
      const raw = JSON.stringify({ id: "evt_unrelated", type: "checkout.session.completed", created: Math.floor(Date.now() / 1000), livemode: false, data: { object: { id: "cs_unrelated", ...(metadata ? { metadata } : {}) } } });
      expect(await receiveSubmissionWebhook(raw, sign(raw))).toEqual({ received: true, ignored: true });
    }
    expect(provider).not.toHaveBeenCalled();
  });
  it("uses a signed successful paid event time for SLA and only moves an existing deadline earlier", async () => {
    const created = await createSubmission(input); await startSubmissionCheckout(created.submission.id, created.token);
    const session = [...sessions.values()][0]; markPaid(session);
    // A signed expired notification can discover a now-paid session, but its old
    // event time must not falsely become the confirmation time.
    const old = Math.floor(Date.now() / 1000) - 2 * 86400;
    let raw = JSON.stringify({ id: "evt_first", type: "checkout.session.expired", created: old, livemode: false, data: { object: { id: session.id, metadata: session.metadata, payment_status: "unpaid" } } });
    await receiveSubmissionWebhook(raw, sign(raw));
    const first = await getPrivateSubmission(created.submission.id, created.token);
    expect(Date.parse(first.payment!.paidAt!)).toBeGreaterThan(old * 1000);
    const rejected = await reviewSubmission(key, first.id, first.version, { decision: "reject", note: "This product does not fit the directory." });
    raw = JSON.stringify({ id: "evt_earlierpaid", type: "checkout.session.completed", created: old, livemode: false, data: { object: { id: session.id, metadata: session.metadata, payment_status: "paid" } } });
    await receiveSubmissionWebhook(raw, sign(raw));
    const updated = await getPrivateSubmission(rejected.id, created.token);
    expect(updated.status).toBe("rejected"); expect(updated.payment?.refundStatus).toBe("pending");
    expect(updated.payment?.paidAt).toBe(new Date(old * 1000).toISOString());
    expect(updated.payment?.reviewDueAt).toBe(paidReviewDeadline(updated.payment!.paidAt!));
    await notify(session); expect((await getPrivateSubmission(rejected.id, created.token)).payment?.reviewDueAt).toBe(updated.payment?.reviewDueAt);
  });

});
