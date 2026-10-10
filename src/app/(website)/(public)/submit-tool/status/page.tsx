import type { Metadata } from "next";
import "@/components/submissions/submission-styles.css";
import { SubmissionStatus } from "@/components/submissions/submission-status";

export const metadata: Metadata = { title: "Private submission status", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default function SubmissionStatusPage() {
  return <div className="veronica-submissions pdf-container py-10 md:py-14"><h1 className="mb-4 text-3xl font-bold">Private submission status</h1><p className="mb-8 max-w-3xl leading-7 text-muted-foreground">Check payment confirmation, review decisions and refund status, or manage your submission using your saved private access details. Returning from checkout does not itself confirm payment.</p><SubmissionStatus /></div>;
}
