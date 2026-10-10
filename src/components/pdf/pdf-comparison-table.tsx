import Link from "next/link";
import type { PdfTool } from "@/data/pdf-catalog";
import { PdfToolIcon } from "./pdf-tool-icon";
import { pdfToolExternalRel } from "@/lib/pdf-outbound-links";

export function PdfComparisonTable({ tools }: { tools: PdfTool[] }) {
  const rows: { label: string; value: (tool: PdfTool) => string }[] = [
    { label: "Listing relationship", value: (tool) => tool.ownedProject ? "Our project · shared ownership with Veronica Hub" : tool.reciprocalSubmission ? "Community submission · reciprocal link" : "Third-party editorial listing" },
    { label: "Best for", value: (tool) => tool.bestFor },
    { label: "Pricing", value: (tool) => tool.pricing },
    { label: "Pricing checked", value: (tool) => tool.pricingEvidence?.checkedOn || "Not verified" },
    { label: "Data processing", value: (tool) => tool.processing },
    { label: "Platform", value: (tool) => tool.platform },
    { label: "Registration", value: (tool) => tool.registration },
    { label: "Free access", value: (tool) => tool.freeLimits },
    { label: "Main limitation", value: (tool) => tool.limitation },
  ];
  return <div className="pdf-table-scroll" role="region" aria-label="Tool comparison table" tabIndex={0}>
    <table className="pdf-compare-table"><caption className="sr-only">Features and limitations of {tools.map((tool) => tool.name).join(", ")}</caption><thead><tr><th scope="col">Compare</th>{tools.map((tool) => <th scope="col" key={tool.slug}><Link href={`/item/${tool.slug}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}><PdfToolIcon tool={tool} size={24} /> <span>{tool.name}</span></Link></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{tools.map((tool) => <td key={tool.slug}>{row.value(tool)}</td>)}</tr>)}<tr><th scope="row">Official sources</th>{tools.map((tool) => <td key={tool.slug}>{tool.sources.map((source) => <div className="mb-2" key={source.url}><a href={source.url} target="_blank" rel={pdfToolExternalRel(tool)}>{source.label} ↗</a></div>)}</td>)}</tr></tbody></table>
  </div>;
}
