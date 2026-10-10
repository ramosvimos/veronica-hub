import type { Metadata } from "next";
import "@/components/submissions/submission-styles.css";
import { SubmissionAdmin } from "@/components/submissions/submission-admin";

export const metadata: Metadata = { title: "Submission review", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function SubmissionAdminPage() {
  return <div className="veronica-submissions pdf-container py-10 md:py-14"><h1 className="mb-4 text-3xl font-bold">Submission review</h1><p className="mb-8 max-w-3xl leading-7 text-muted-foreground">Private editorial workspace. Verify the official website for every listing and the visible Veronica Hub backlink for free submissions. Paid submissions require server-confirmed payment. Rejected paid submissions require a full refund and provider-record verification.</p><SubmissionAdmin /></div>;
}
