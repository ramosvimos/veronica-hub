// Adapted from the current directory's free submission schema; no paid or account paths.
import { z } from "zod";
import { pdfCategories } from "@/data/pdf-catalog";

export const pricingOptions = ["Free", "Freemium", "Paid", "Open source", "Not verified"] as const;
export const processingOptions = ["Cloud", "Local", "Self-hosted", "Mixed", "Not applicable", "Not verified"] as const;
export function isPublicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash && !url.port
      && host.length <= 253 && host.split(".").length >= 2
      && host.split(".").every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
      && /[a-z]/.test(host.split(".").at(-1) || "")
      && !/(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(host)
      && !/(?:^|\.)(?:example\.(?:com|org|net)|home\.arpa)$/.test(host);
  } catch { return false; }
}
const publicUrl = z.string().trim().max(500).refine(isPublicHttpsUrl, "Use a public HTTPS URL without login details, query parameters or fragments.");
export const submissionSchema = z.object({
  submissionType: z.literal("free").default("free"),
  name: z.string().trim().min(2).max(80),
  url: publicUrl,
  email: z.string().trim().email().max(160),
  category: z.string().trim().refine(value => pdfCategories.some(category => category.slug === value), "Choose an available category."),
  description: z.string().trim().min(10, "Add a description of at least 10 characters.").max(1000),
  pricing: z.enum(pricingOptions).default("Not verified"),
  processing: z.enum(processingOptions).default("Not verified"),
  sourceUrl: z.union([z.literal(""), publicUrl]).optional(),
  backlinkUrl: publicUrl,
  confirmed: z.literal(true),
  website: z.string().max(0).optional(),
}).strict().transform(input => ({ ...input, sourceUrl: input.sourceUrl || input.url }));
export type SubmissionInput = z.infer<typeof submissionSchema>;
export const submissionIdSchema = z.string().uuid();
export const versionSchema = z.number().int().nonnegative();
export const reviewSchema = z.object({
  decision: z.enum(["verify", "approve", "reject", "withdraw"]),
  note: z.string().trim().min(10).max(500),
  websiteChecked: z.boolean().optional(),
  backlinkChecked: z.boolean().optional(),
}).strict();
export function websiteKey(value: string) {
  const url = new URL(value);
  return url.hostname.toLowerCase().replace(/^www\./, "");
}
