"use client";

import { useEffect, useState } from "react";
import type { SubmissionStatus } from "@/lib/submissions/types";

export type SubmissionInput = {
  submissionType: "free";
  name: string;
  url: string;
  email: string;
  category: string;
  description: string;
  pricing: "Free" | "Freemium" | "Paid" | "Open source" | "Not verified";
  processing: "Cloud" | "Local" | "Self-hosted" | "Mixed" | "Not applicable" | "Not verified";
  sourceUrl?: string;
  backlinkUrl: string;
  confirmed: true;
  website: string;
};
export type SubmissionRecord = {
  id: string;
  status: SubmissionStatus;
  input: SubmissionInput;
  createdAt: string;
  updatedAt: string;
  version: number;
  reviewNote?: string;
  verificationNote?: string;
  listingSlug?: string;
  websiteVerifiedAt?: string;
  backlinkVerifiedAt?: string;
};
export type Readiness = { ready: boolean; mode: "local" | "d1" | "disabled"; message: string; adminReady: boolean };

export class SubmissionRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function submissionRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, { ...options, cache: "no-store", headers: { "Content-Type": "application/json", ...options.headers } });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new SubmissionRequestError(typeof result?.error === "string" ? result.error : "The request could not be completed. Please try again.", response.status);
  if (!result) throw new SubmissionRequestError("The server returned an unreadable response. Please refresh the status before trying a change again.", response.status);
  return result as T;
}

export function useSubmissionReadiness() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    submissionRequest<Readiness>("/api/submissions/readiness", { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setReadiness(result); })
      .catch(error => { if (!controller.signal.aborted) { setReadiness(null); setError(error instanceof Error ? error.message : "Could not check submission availability."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);
  return { readiness, error, loading, retry: () => { setLoading(true); setError(""); setAttempt(value => value + 1); } };
}

export const statusLabels: Record<SubmissionStatus, string> = {
  "awaiting-backlink-review": "Awaiting website & backlink checks",
  "free-awaiting-review": "Awaiting editorial decision",
  approved: "Approved", rejected: "Rejected", withdrawn: "Withdrawn",
};
export function isPendingSubmission(status: SubmissionStatus) {
  return status === "awaiting-backlink-review" || status === "free-awaiting-review";
}

export const inputClass = "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground disabled:opacity-60";
export const primaryButtonClass = "inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass = "inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-2.5 font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";
export const panelClass = "rounded-2xl border border-border bg-card/50 p-5 sm:p-7";
