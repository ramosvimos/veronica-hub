"use client";

// The original review form's separate editorial decision and backlink attestation
// are retained; a dedicated server-verified key replaces account authentication.
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SubmissionPayment } from "./submission-payment";
import { SubmissionSummary } from "./submission-fields";
import { inputClass, isPaidSubmission, isPendingSubmission, statusLabels, panelClass, primaryButtonClass, secondaryButtonClass, submissionRequest, SubmissionRequestError, useSubmissionReadiness, type SubmissionRecord } from "./submission-client";

type ReviewDecision = "verify" | "approve" | "reject" | "withdraw";
type ReviewDetails = { note: string; websiteChecked: boolean; backlinkChecked: boolean };

function ReviewCard({ submission, busy, review, verifyRefund }: { submission: SubmissionRecord; busy: boolean; review: (decision: ReviewDecision, details: ReviewDetails) => Promise<void>; verifyRefund: (refundId: string) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [refundId, setRefundId] = useState("");
  const [websiteChecked, setWebsiteChecked] = useState(false);
  const [backlinkChecked, setBacklinkChecked] = useState(false);
  const [error, setError] = useState("");
  const [confirmWithdrawal, setConfirmWithdrawal] = useState(false);
  const paid = isPaidSubmission(submission);
  const paymentConfirmed = !paid || (submission.payment?.status === "paid" && Boolean(submission.payment.paidAt));
  const verified = paymentConfirmed && Boolean(submission.websiteVerifiedAt && (paid || submission.backlinkVerifiedAt));
  async function decide(decision: ReviewDecision) {
    if (note.trim().length < 10) { setError("Add an editorial note of at least 10 characters."); return; }
    if (decision === "verify" && (!websiteChecked || (!paid && !backlinkChecked))) { setError(paid ? "Open the official website and confirm the website check before saving verification." : "Open both pages and confirm both checks before saving verification."); return; }
    if (decision === "approve" && !verified) { setError(paid ? "Save the website verification before approving." : "Save the website and backlink verification before approving."); return; }
    setError(""); await review(decision, { note: note.trim(), websiteChecked, backlinkChecked });
  }
  return <article className={panelClass} aria-labelledby={`review-${submission.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-xl font-semibold" id={`review-${submission.id}`}>{submission.input.name}</h2><span className="rounded-full bg-secondary px-3 py-1 text-sm capitalize">{statusLabels[submission.status]}</span></div>
    <p className="mt-2 break-all text-xs text-muted-foreground">{submission.id} · Revision {submission.version}</p>
    <SubmissionSummary input={submission.input} />
    <SubmissionPayment submission={submission} />
    <div className="my-5 flex flex-wrap gap-5 text-sm"><a href={submission.input.url} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">Open official website ↗</a>{!paid && <a href={submission.input.backlinkUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">Open backlink page ↗</a>}{submission.input.sourceUrl && <a href={submission.input.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-primary underline underline-offset-4">Open reference ↗</a>}</div>
    <p className="mb-4 text-sm text-muted-foreground">Website: {submission.websiteVerifiedAt ? "verified" : "not verified"} · Backlink: {paid ? "not required" : submission.backlinkVerifiedAt ? "verified" : "not verified"}</p>
    {submission.verificationNote && <div className="mb-5 rounded-lg bg-background/60 p-4"><h3 className="mb-2 text-sm font-semibold">Saved verification note</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{submission.verificationNote}</p></div>}
    {submission.reviewNote && <div className="mb-5 rounded-lg bg-background/60 p-4"><h3 className="mb-2 text-sm font-semibold">Saved review note</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{submission.reviewNote}</p></div>}
    {submission.status === "approved" && submission.listingSlug && <Link className="text-sm text-primary underline underline-offset-4" href={`/item/${encodeURIComponent(submission.listingSlug)}`}>View published listing</Link>}
    {(submission.status === "approved" || (paid && submission.status === "awaiting-payment")) && <fieldset disabled={busy} className="mt-6 space-y-4"><legend className="mb-3 text-base font-semibold">{submission.status === "awaiting-payment" ? "Withdraw an unpaid application" : "Withdraw a published listing"}</legend><label className="block text-sm font-medium">Withdrawal note *<textarea className={inputClass} value={note} onChange={event => setNote(event.target.value)} minLength={10} maxLength={500} rows={3} /><span className="mt-2 block font-normal text-muted-foreground">10–500 characters. The submitter can read this note.</span></label>{error && <p className="rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}{!confirmWithdrawal ? <button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => setConfirmWithdrawal(true)}>{submission.status === "awaiting-payment" ? "Withdraw unpaid application" : "Withdraw published listing"}</button> : <div className="rounded-lg border border-destructive/60 p-4"><p className="mb-4 text-sm leading-6">{submission.status === "awaiting-payment" ? "Withdraw this unpaid application and release its review queue capacity? This does not cancel an open payment checkout. Keep the payment history: any late confirmed payment will require a full manual refund. This paid record cannot be resubmitted." : paid ? "Remove this listing from the public directory? This paid record cannot be resubmitted, and withdrawal does not itself confirm a refund." : "Remove this listing from the public directory? The submitter can resubmit it, but a fresh editorial review will be required."}</p><div className="flex flex-wrap gap-3"><button type="button" className={primaryButtonClass} disabled={busy} onClick={() => void decide("withdraw")}>Confirm withdrawal</button><button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => setConfirmWithdrawal(false)}>Keep listing</button></div></div>}</fieldset>}
    {isPendingSubmission(submission.status) && paymentConfirmed && <fieldset disabled={busy} className="space-y-4"><legend className="mb-3 text-base font-semibold">Editorial review</legend>
      <p className="text-sm leading-6 text-muted-foreground">Open and inspect the submitted pages yourself. These controls record your manual checks; they do not automatically verify the product or its claims.</p>
      <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1.5 h-4 w-4 shrink-0" checked={websiteChecked} onChange={event => setWebsiteChecked(event.target.checked)} /><span>I opened the official website and checked the tool’s identity and submitted information.</span></label>
      {!paid && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" className="mt-1.5 h-4 w-4 shrink-0" checked={backlinkChecked} onChange={event => setBacklinkChecked(event.target.checked)} /><span>I opened the backlink page and confirmed a visible link to the Veronica Hub homepage.</span></label>}
      <label className="block text-sm font-medium">Review note *<textarea className={inputClass} value={note} onChange={event => setNote(event.target.value)} minLength={10} maxLength={500} rows={3} /><span className="mt-2 block font-normal text-muted-foreground">10–500 characters. The submitter can read this note. Do not include secrets or internal-only information.</span></label>
      {error && <p className="rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" className={secondaryButtonClass} disabled={busy || verified || !websiteChecked || (!paid && !backlinkChecked)} onClick={() => void decide("verify")}>{verified ? "Manual checks saved" : "Save manual verification"}</button><button type="button" className={primaryButtonClass} disabled={busy || !verified} onClick={() => void decide("approve")}>Approve & publish</button><button type="button" className={secondaryButtonClass} disabled={busy} onClick={() => void decide("reject")}>Reject submission</button></div>
      {!verified && <p className="text-sm text-muted-foreground">{paid ? "Approval is available after confirmed payment and saved manual website verification." : "Approval is available after both manual checks have been saved."}</p>}
      {paid && <p className="text-sm leading-6 text-muted-foreground">Rejecting this paid submission creates a full USD 9.90 refund obligation. It does not send money automatically. Complete the refund in the provider dashboard, then verify its provider refund record here.</p>}
    </fieldset>}
    {paid && !paymentConfirmed && <p className="mt-5 text-sm leading-6 text-muted-foreground">Editorial decisions are unavailable until the server confirms payment. A checkout redirect does not establish payment.</p>}
    {paid && submission.payment?.refundStatus === "pending" && <form className="mt-6 space-y-4 rounded-lg border border-amber-400/60 p-4" onSubmit={event => { event.preventDefault(); if (!/^re_[A-Za-z0-9]+$/.test(refundId.trim())) { setError("Enter the provider refund ID starting with re_."); return; } setError(""); void verifyRefund(refundId.trim()); }}>
      <h3 className="font-semibold">Full refund awaiting operator completion</h3>
      <p className="text-sm leading-6">Issue the full USD 9.90 refund for this payment in the provider dashboard first. Paste its refund record ID below. This action retrieves and verifies the provider record; it does not issue a refund or merely mark one complete.</p>
      <label className="block text-sm font-medium">Provider refund ID<input className={inputClass} value={refundId} onChange={event => setRefundId(event.target.value)} placeholder="re_…" pattern="re_[A-Za-z0-9]+" maxLength={100} required disabled={busy} autoComplete="off" spellCheck={false} /></label>
      {error && <p role="alert" className="text-sm">{error}</p>}
      <button className={primaryButtonClass} type="submit" disabled={busy}>Verify completed provider refund</button>
    </form>}
  </article>;
}

export function SubmissionAdmin() {
  const { readiness, error: readinessError, loading, retry } = useSubmissionReadiness();
  const [key, setKey] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionRecord[] | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function list(secret: string) {
    const result = await submissionRequest<{ submissions: SubmissionRecord[] }>("/api/submissions/admin", { method: "POST", headers: { Authorization: `Bearer ${secret}` }, body: JSON.stringify({ action: "list" }) });
    setSubmissions(result.submissions);
  }
  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy("list"); setError(""); setMessage("");
    try { await list(key.trim()); setActiveKey(key.trim()); setKey(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not load submissions."); }
    finally { setBusy(""); }
  }
  async function refresh() {
    if (busy) return;
    setBusy("list"); setError(""); setMessage("");
    try { await list(activeKey); setMessage("Latest submissions loaded."); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not refresh submissions."); }
    finally { setBusy(""); }
  }
  async function review(submission: SubmissionRecord, decision: ReviewDecision, details: ReviewDetails) {
    if (busy) return;
    setBusy(submission.id); setError(""); setMessage("");
    try {
      const result = await submissionRequest<{ submission: SubmissionRecord }>("/api/submissions/admin", { method: "POST", headers: { Authorization: `Bearer ${activeKey}` }, body: JSON.stringify({ action: "review", id: submission.id, version: submission.version, decision, ...details }) });
      setSubmissions(current => current?.map(record => record.id === result.submission.id ? result.submission : record) || []);
      setMessage(decision === "verify" ? isPaidSubmission(result.submission) ? "Manual website check saved. This paid submission still needs an approval decision." : "Manual website and backlink checks saved. This submission still needs an approval decision." : decision === "approve" ? "Submission approved and published." : decision === "withdraw" ? submission.status === "awaiting-payment" ? "Unpaid application withdrawn. An open checkout is not canceled; any late confirmed payment will require a full manual refund." : "Listing withdrawn from the public directory. The withdrawal note is available to the submitter." : isPaidSubmission(result.submission) ? "Submission rejected. A full USD 9.90 refund is pending manual completion and provider verification." : "Submission rejected; the review note is available in its private status view.");
    } catch (error) {
      if (error instanceof SubmissionRequestError && error.status === 409) {
        try { await list(activeKey); setError(`${error.message} The list has been refreshed; review the latest revision before retrying.`); }
        catch { setError(`${error.message} Refresh the list before another decision.`); }
      } else setError(error instanceof Error ? error.message : "Could not confirm the review. Refresh the list before trying again.");
    } finally { setBusy(""); }
  }
  async function verifyRefund(submission: SubmissionRecord, refundId: string) {
    if (busy) return;
    setBusy(submission.id); setError(""); setMessage("");
    try {
      const result = await submissionRequest<{ submission: SubmissionRecord }>("/api/submissions/admin", { method: "POST", headers: { Authorization: `Bearer ${activeKey}` }, body: JSON.stringify({ action: "verify-refund", id: submission.id, version: submission.version, refundId }) });
      setSubmissions(current => current?.map(record => record.id === result.submission.id ? result.submission : record) || []);
      if (result.submission.payment?.refundStatus !== "refunded" || !result.submission.payment.refundVerifiedAt) throw new Error("Full refund completion was not verified. Refresh the list before retrying.");
      setMessage("Full USD 9.90 refund verified against the payment provider’s completed refund record.");
    } catch (error) {
      if (error instanceof SubmissionRequestError && error.status === 409) {
        try { await list(activeKey); setError(`${error.message} The list has been refreshed; review the latest revision before retrying.`); }
        catch { setError(`${error.message} Refresh the list before another verification.`); }
      } else setError(error instanceof Error ? error.message : "Could not verify the provider refund. Completion has not been confirmed.");
    } finally { setBusy(""); }
  }
  function lock() { setKey(""); setActiveKey(""); setSubmissions(null); setError(""); setMessage(""); }

  return <div className="max-w-4xl space-y-6">
    {!submissions && <form className={panelClass} onSubmit={unlock}>
      <h2 className="mb-3 text-xl font-semibold">Unlock editorial review</h2>
      <p className="mb-5 text-sm leading-6 text-muted-foreground">Use the dedicated submission admin key configured on the server. It is kept only in this page’s memory and sent in the authorization header, never in a URL or browser storage.</p>
      <div className="mb-5 text-sm" role="status">{loading ? "Checking review availability…" : readinessError || (readiness?.ready && readiness.adminReady ? "Editorial review is available." : "Editorial review is unavailable. Configure submission storage and a dedicated admin key on the server.")}{readiness?.mode === "local" && <p className="mt-2">Local development mode. Changes apply only to this environment.</p>}</div>
      {!loading && (!readiness?.ready || !readiness.adminReady || readinessError) && <button type="button" className={`${secondaryButtonClass} mb-5`} onClick={retry}>Check availability again</button>}
      <label className="mb-5 block text-sm font-medium">Dedicated admin key<input className={inputClass} type="password" value={key} onChange={event => setKey(event.target.value)} minLength={32} required autoComplete="off" spellCheck={false} disabled={Boolean(busy)} /></label>
      <button type="submit" className={primaryButtonClass} disabled={Boolean(busy) || loading || !readiness?.ready || !readiness.adminReady}>{busy ? "Loading…" : "Load submissions"}</button>
    </form>}
    {error && <p className="rounded-lg border border-destructive p-4 text-sm" role="alert">{error}</p>}
    {message && <p className="rounded-lg border border-primary/50 p-4 text-sm" role="status">{message}</p>}
    {submissions && <><div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{submissions.length} submission{submissions.length === 1 ? "" : "s"}</p><div className="flex flex-wrap gap-3"><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => void refresh()}>{busy === "list" ? "Refreshing…" : "Refresh list"}</button><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={lock}>Lock review session</button></div></div>{busy && <p role="status" className="text-sm text-muted-foreground">Saving or loading the latest information…</p>}{submissions.length === 0 ? <p className={panelClass}>No submissions are waiting or recorded in this environment.</p> : submissions.map(submission => <ReviewCard key={`${submission.id}:${submission.version}`} submission={submission} busy={Boolean(busy)} review={(decision, details) => review(submission, decision, details)} verifyRefund={refundId => verifyRefund(submission, refundId)} />)}</>}
  </div>;
}
