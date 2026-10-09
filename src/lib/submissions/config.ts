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
  return {
    ready: config.mode !== "disabled", mode: config.mode, adminReady: adminKeyConfigured(),
    message: config.mode === "local" ? "Local development mode. Submissions are stored on this computer and are not sent to a live service."
      : config.mode === "d1" ? "Free submissions are open. Every website and backlink requires manual editorial review."
      : "Submissions are currently closed. No request will be saved until dedicated storage is configured.",
  };
}
