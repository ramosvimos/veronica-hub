import type { PdfTool } from "@/data/pdf-catalog";
import { submissionConfiguration } from "./config";
import { listSubmissionRecords } from "./store";
import { submissionSchema } from "./schema";
import type { SubmissionRecord } from "./types";

function projectPublicTool(record: SubmissionRecord): PdfTool | undefined {
  if (record.status !== "approved" || !record.websiteVerifiedAt || !record.backlinkVerifiedAt || !record.reviewedAt || record.listingSlug !== `submission-${record.id}`) return undefined;
  const result = submissionSchema.safeParse(record.input);
  if (!result.success) return undefined;
  const input = result.data;
  // An explicit allowlist: never spread private input or records into a public listing.
  return {
    slug: record.listingSlug, name: input.name, initials: input.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "VH",
    websiteDomain: new URL(input.url).hostname.replace(/^www\./, ""), description: input.description,
    categories: [input.category], pricing: input.pricing, processing: input.processing,
    platform: "Check the official website", registration: "Check the official website",
    freeLimits: "Publisher-reported pricing. Confirm current limits on the official website.",
    bestFor: input.description, limitation: "Capabilities and terms can change. Check the official source before use.",
    features: [], url: input.url, sources: [{ label: "Publisher's official source", url: input.sourceUrl }],
    reciprocalSubmission: true, featured: false, reviewedOn: record.reviewedAt.slice(0, 10), evidenceStatus: "reviewed",
  };
}
export async function getPublishedSubmissionTools(): Promise<PdfTool[]> {
  if ((await submissionConfiguration()).mode === "disabled") return [];
  // No cache or stale fallback: withdrawal immediately removes a submission from all consumers.
  const records = await listSubmissionRecords("approved");
  return records.map(projectPublicTool).filter((tool): tool is PdfTool => !!tool);
}
export async function getPublishedSubmissionTool(slug: string): Promise<PdfTool | undefined> {
  if (!/^submission-[a-f0-9-]{36}$/.test(slug)) return undefined;
  return (await getPublishedSubmissionTools()).find(tool => tool.slug === slug);
}
