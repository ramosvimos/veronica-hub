import { siteConfig } from "@/config/site";
export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<{ success: boolean; meta: { changes?: number } }>;
}
export interface SubmissionDatabase { prepare(query: string): D1Statement; }
export type SubmissionConfiguration = { mode: "disabled" } | { mode: "local"; directory: string } | { mode: "d1"; db: SubmissionDatabase };
let cloudflareModule: Promise<typeof import("@opennextjs/cloudflare")> | undefined;
export const SCHEMA_ID = "veronica-hub-free-submissions-v1";
export async function submissionConfiguration(): Promise<SubmissionConfiguration> {
  const mode = process.env.VERONICA_SUBMISSIONS_MODE;
  if (!adminKeyConfigured()) return { mode: "disabled" };
  if (mode === "local" && process.env.NODE_ENV !== "production") {
    return { mode, directory: process.env.VERONICA_SUBMISSIONS_DIR || `${process.cwd()}/.veronica-submissions` };
  }
  if (mode !== "d1") return { mode: "disabled" };
  try {
    const { getCloudflareContext } = await (cloudflareModule ??= import("@opennextjs/cloudflare"));
    const context = await getCloudflareContext({ async: true });
    const env = context.env as unknown as { VERONICA_SUBMISSIONS_DB?: SubmissionDatabase };
    const db = env.VERONICA_SUBMISSIONS_DB;
    if (!db || typeof db.prepare !== "function") return { mode: "disabled" };
    const marker = await db.prepare("SELECT app FROM veronica_submission_meta WHERE id = 1").first<{ app: string }>();
    if (marker?.app !== SCHEMA_ID) return { mode: "disabled" };
    // The application never creates/migrates a production database at runtime.
    const schema = await db.prepare("SELECT id, version, url_key, listing_slug, status, record FROM veronica_submissions LIMIT 0").all();
    if (!schema.success) return { mode: "disabled" };
    return { mode, db };
  } catch { return { mode: "disabled" }; }
}
export function adminKeyConfigured() { return (process.env.VERONICA_SUBMISSIONS_ADMIN_KEY || "").length >= 32; }
export async function submissionReadiness() {
  const config = await submissionConfiguration();
  const paid = await paidSubmissionConfiguration(config);
  return {
    paidReady: paid.ready, paidMessage: paid.message,
    ready: config.mode !== "disabled", mode: config.mode, adminReady: adminKeyConfigured(),
    message: config.mode === "local" ? "Local development mode. Submissions are stored on this computer and are not sent to a live service."
      : config.mode === "d1" ? "Free submissions are open. Every website and backlink requires manual editorial review."
      : "Submissions are currently closed. No request will be saved until dedicated storage is configured.",
  };
}

export const PAYMENT_SCHEMA_ID = "veronica-hub-paid-submissions-v2";
export type PaidConfiguration = { ready: false; message: string } | { ready: true; provider: import("./payment-provider").PaidProviderConfiguration; message: string };
export async function paidSubmissionConfiguration(storage?: SubmissionConfiguration, existingPayments = false): Promise<PaidConfiguration> {
  const disabled = { ready: false as const, message: "Paid submissions are currently closed. No payment will be requested." };
  if (!existingPayments && process.env.VERONICA_PAID_SUBMISSIONS_ENABLED !== "true") return disabled;
  const config = storage || await submissionConfiguration();
  if (config.mode === "disabled") return disabled;
  const environment = process.env.VERONICA_PAYMENT_ENVIRONMENT;
  const secretKey = process.env.VERONICA_STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.VERONICA_STRIPE_WEBHOOK_SECRET || "";
  const rawOrigin = process.env.VERONICA_PAYMENT_ORIGIN || "";
  if ((environment !== "test" && environment !== "live") || !new RegExp(`^sk_${environment}_[A-Za-z0-9]{16,}$`).test(secretKey)
    || !/^whsec_[A-Za-z0-9]{16,}$/.test(webhookSecret)) return disabled;
  if (environment === "live" && ((!existingPayments && process.env.VERONICA_LIVE_PAYMENTS_ENABLED !== "true") || config.mode !== "d1")) return disabled;
  if (config.mode === "local" && (environment !== "test" || process.env.VERONICA_LOCAL_TEST_PAYMENTS !== "true")) return disabled;
  let origin: string;
  try {
    const url = new URL(rawOrigin);
    const local = environment === "test" && config.mode === "local" && url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((!local && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash || rawOrigin.replace(/\/$/, "") !== url.origin) return disabled;
    origin = url.origin;
    if (!local && origin !== new URL(siteConfig.url).origin) return disabled;
  } catch { return disabled; }
  if (config.mode === "d1") {
    try {
      const marker = await config.db.prepare("SELECT app FROM veronica_submission_payment_meta WHERE id = 1").first<{ app: string }>();
      if (marker?.app !== PAYMENT_SCHEMA_ID) return disabled;
      const schema = await config.db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'veronica_submissions'").first<{ sql: string }>();
      if (!schema?.sql.includes("'awaiting-payment'") || !schema.sql.includes("'paid-awaiting-review'")) return disabled;
    } catch { return disabled; }
  }
  return { ready: true, provider: { secretKey, webhookSecret, origin, environment }, message: environment === "test" ? "Test payment mode only. No live charge is enabled." : "One-time USD 9.90 submission review; no backlink required." };
}
