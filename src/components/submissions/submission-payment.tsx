"use client";

import { useState } from "react";
import { isPaidSubmission, primaryButtonClass, safeCheckoutUrl, submissionRequest, useSubmissionReadiness, secondaryButtonClass, type SubmissionRecord } from "./submission-client";

export function SubmissionPayment({ submission }: { submission: SubmissionRecord }) {
  if (!isPaidSubmission(submission)) return null;
  const payment = submission.payment;
  const confirmed = payment?.status === "paid" && Boolean(payment.paidAt);
  const refunded = payment?.refundStatus === "refunded" && Boolean(payment.refundVerifiedAt);
  return <section className="my-5 rounded-lg border border-border bg-background/60 p-4" aria-label="Payment and review status">
    <h3 className="mb-3 font-semibold">Paid submission · USD 9.90 one-time</h3>
    <p className="text-sm leading-6">No backlink is required. Payment does not guarantee publication, placement, traffic or ranking.</p>
    <dl className="mt-3 space-y-3 text-sm">
      <div><dt className="text-muted-foreground">Payment</dt><dd>{confirmed ? `Confirmed by the server on ${new Date(payment!.paidAt!).toLocaleString(undefined, { timeZone: "UTC", timeZoneName: "short" })}` : "Not yet confirmed by the server. Returning from checkout does not replace server confirmation."}</dd></div>
      <div><dt className="text-muted-foreground">Manual review timeframe</dt><dd>{confirmed && payment?.reviewDueAt ? `Within 7 business days after confirmed payment (Monday–Friday, UTC; no holiday calendar). Review due by ${new Date(payment.reviewDueAt).toLocaleString(undefined, { timeZone: "UTC", timeZoneName: "short" })}.` : "Within 7 business days after confirmed payment (Monday–Friday, UTC; no holiday calendar). A review deadline will appear after the server confirms payment."}</dd></div>
      <div><dt className="text-muted-foreground">Refund</dt><dd>{refunded ? `Full refund verified with the payment provider on ${new Date(payment!.refundVerifiedAt!).toLocaleString(undefined, { timeZone: "UTC", timeZoneName: "short" })}. Your bank may take additional time to show it.` : payment?.refundStatus === "pending" || payment?.refundStatus === "refunded" ? "Full refund pending. An operator must complete it with the payment provider; completion has not been verified." : "If the paid submission is rejected, you are owed a full USD 9.90 refund. Withdrawal alone does not confirm a refund."}</dd></div>
    </dl>
  </section>;
}

type CheckoutProps = { submission: SubmissionRecord; token: string; saved: boolean; disabled?: boolean; onBusyChange?: (busy: boolean) => void; onUpdate: (record: SubmissionRecord) => void };

export function SubmissionCheckout(props: CheckoutProps) {
  if (!isPaidSubmission(props.submission) || props.submission.status !== "awaiting-payment" || props.submission.payment?.status === "paid") return null;
  return <ActiveSubmissionCheckout {...props} />;
}

function ActiveSubmissionCheckout({ submission, token, saved, disabled = false, onBusyChange, onUpdate }: CheckoutProps) {
  const { readiness, loading, error: availabilityError, retry } = useSubmissionReadiness();
  const ready = readiness?.ready === true && readiness.paidReady === true;
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  async function prepare() {
    if (!saved || !token || busy || disabled || url || !ready) return;
    setBusy(true); onBusyChange?.(true); setError("");
    try {
      const result = await submissionRequest<{ submission: SubmissionRecord; checkoutUrl: string | null }>("/api/submissions/checkout", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: submission.id }) });
      if (result.submission?.id !== submission.id) throw new Error("The checkout response did not match this submission. Refresh your private status before retrying.");
      if (result.checkoutUrl === null && (result.submission.status !== "awaiting-payment" || result.submission.payment?.status === "paid")) {
        onUpdate(result.submission); return;
      }
      const checkoutUrl = safeCheckoutUrl(result.checkoutUrl, token);
      onUpdate(result.submission); setUrl(checkoutUrl);
    } catch (error) { setError(`${error instanceof Error ? error.message : "Could not prepare checkout."} Keep your saved ID and token. Use the private status page to confirm the latest state; do not create another submission or assume a charge succeeded.`); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <section className="mt-6 rounded-lg border border-primary/40 p-4" aria-label="Secure payment checkout">
    <h3 className="mb-3 font-semibold">Continue to payment</h3>
    <p className="mb-4 text-sm leading-6">Pay USD 9.90 once through the payment provider. Save your submission ID and private token before leaving this page. Return to private status with both details after checkout; payment confirmation is checked on the server.</p>
    <p className="mb-4 text-sm text-muted-foreground" role="status">{loading ? "Checking secure checkout availability…" : availabilityError || readiness?.paidMessage || (ready ? "Paid checkout is available." : "Paid checkout is currently closed. Your saved application has not been charged by this page.")}</p>
    {!loading && !ready && <button type="button" className={`${secondaryButtonClass} mb-4`} disabled={disabled || busy} onClick={retry}>Check checkout availability again</button>}
    {!url || !ready || disabled || !saved ? <button className={primaryButtonClass} type="button" disabled={!saved || !token || busy || disabled || loading || !ready} onClick={() => void prepare()}>{busy ? "Preparing checkout…" : "Prepare secure checkout"}</button> : <a className={primaryButtonClass} href={url} rel="noreferrer" referrerPolicy="no-referrer">Continue to secure checkout · USD 9.90</a>}
    {!saved && <p className="mt-3 text-sm text-muted-foreground">Confirm that you have saved both private access details to enable checkout.</p>}
    {error && <p className="mt-3 rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}
  </section>;
}
