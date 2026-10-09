import type { PdfTool } from "@/data/pdf-catalog";

// Paid submission links use sponsored. Free and seeded listing links use nofollow.
// Blog links have a separate policy.
export function pdfToolExternalRel(tool: Pick<PdfTool, "paidSubmission" | "reciprocalSubmission">): string {
  if (tool.paidSubmission) return "noopener noreferrer sponsored";
  return "noopener noreferrer nofollow";
}
