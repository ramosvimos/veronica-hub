import type { Metadata } from "next";
import "@/components/submissions/submission-styles.css";
import { SubmissionForm } from "@/components/submissions/submission-form";

export const metadata: Metadata = { title: "Submit a tool", description: "Submit an AI, productivity or developer tool to Veronica Hub for editorial review. Choose free submission with a backlink or paid submission without one when available.", alternates: { canonical: "/submit-tool" }, robots: { index: false, follow: true }, referrer: "no-referrer" };
export default function SubmitToolPage() {
  return <div className="veronica-submissions pdf-container py-10 md:py-14"><div className="mb-9 max-w-3xl"><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Veronica Hub · Submit your tool</p><h1 className="mb-4 text-3xl font-bold md:text-4xl">Useful tools deserve to be found.</h1><p className="text-lg leading-8 text-muted-foreground">Share your AI, productivity or developer tool. Choose a free submission with a visible backlink, or a one-time USD 9.90 submission without a backlink when available. Every listing needs editorial approval.</p></div><SubmissionForm /></div>;
}
