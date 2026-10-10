"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { SubmissionCheckout, SubmissionPayment } from "./submission-payment";
import { inputFromForm, SubmissionFields, SubmissionSummary } from "./submission-fields";
import { inputClass, isPaidSubmission, isPendingSubmission, statusLabels, panelClass, primaryButtonClass, secondaryButtonClass, submissionRequest, SubmissionRequestError, type SubmissionInput, type SubmissionRecord } from "./submission-client";

const statusDescriptions = {
  "awaiting-payment": "Your application is saved. Editorial review begins only after the server confirms payment.",
  "paid-awaiting-review": "Payment has been confirmed. An editor will check your official website and make a publication decision. No backlink is required.",
  "awaiting-backlink-review": "Awaiting website and backlink checks. An editor must verify both before a publication decision.",
  "free-awaiting-review": "Website and backlink checks are saved. Your submission is awaiting an editorial publication decision.",
  rejected: "This submission was not accepted. Read the review note, edit the details if needed, and resubmit for a new review.",
  approved: "This submission has been approved. To make changes, first withdraw the listing, then resubmit it for a new review.",
  withdrawn: "This submission is withdrawn and is not a published directory listing. You can resubmit it for a new review.",
};

export function SubmissionStatus() {
  const [id, setId] = useState("");
  const [token, setToken] = useState("");
  const [activeToken, setActiveToken] = useState("");
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmWithdrawal, setConfirmWithdrawal] = useState(false);
  const [checkoutSaved, setCheckoutSaved] = useState(false);

  async function fetchStatus(recordId: string, secret: string) {
    const result = await submissionRequest<{ submission: SubmissionRecord }>("/api/submissions/status", { method: "POST", body: JSON.stringify({ id: recordId, token: secret }) });
    setSubmission(result.submission);
    return result.submission;
  }
  async function open(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    setBusy("open"); setError(""); setMessage("");
    try { await fetchStatus(id.trim(), token.trim()); setActiveToken(token.trim()); setToken(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not load the submission."); }
    finally { setBusy(""); }
  }
  async function refresh() {
    if (!submission || busy) return;
    setBusy("refresh"); setError(""); setMessage("");
    try { await fetchStatus(submission.id, activeToken); setMessage("Latest status loaded."); setEditing(false); setConfirmWithdrawal(false); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not refresh the status."); }
    finally { setBusy(""); }
  }
  async function change(action: "edit" | "resubmit" | "withdraw", input?: SubmissionInput) {
    if (!submission || busy) return;
    setBusy(action); setError(""); setMessage("");
    try {
      const result = await submissionRequest<{ submission: SubmissionRecord }>(`/api/submissions/${encodeURIComponent(submission.id)}`, { method: "PATCH", headers: { Authorization: `Bearer ${activeToken}` }, body: JSON.stringify({ version: submission.version, action, ...(input ? { input } : {}) }) });
      setSubmission(result.submission); setEditing(false); setConfirmWithdrawal(false);
      setMessage(action === "edit" ? isPaidSubmission(result.submission) ? "Changes saved. Website verification must be completed before publication." : "Changes saved. Website and backlink checks must be completed again." : action === "withdraw" ? "Submission withdrawn." : "Submission returned to the editorial review queue. Previous checks have been reset.");
    } catch (error) {
      if (error instanceof SubmissionRequestError && error.status === 409) {
        try { await fetchStatus(submission.id, activeToken); setEditing(false); setConfirmWithdrawal(false); setError(`${error.message} Latest status loaded; review it before trying again.`); }
        catch { setError(`${error.message} Refresh the status before making another change.`); }
      } else setError(error instanceof Error ? error.message : "Could not confirm the change. Refresh the status before trying again.");
    } finally { setBusy(""); }
  }
  function lock() {
    setId(""); setToken(""); setActiveToken(""); setSubmission(null); setCheckoutSaved(false); setEditing(false); setConfirmWithdrawal(false); setError(""); setMessage("");
  }

  if (!submission) return <form onSubmit={open} className={`${panelClass} max-w-2xl`}>
    <h2 className="mb-3 text-xl font-semibold">Open a private submission</h2>
    <p className="mb-6 text-sm leading-6 text-muted-foreground">Enter the ID and private management token shown after submission. They are sent only to this site’s submission service and are never added to the page address or browser storage.</p>
    <label className="mb-5 block text-sm font-medium">Submission ID<input className={inputClass} value={id} onChange={event => setId(event.target.value)} required autoComplete="off" spellCheck={false} disabled={Boolean(busy)} /></label>
    <label className="mb-5 block text-sm font-medium">Private management token<input className={inputClass} type="password" value={token} onChange={event => setToken(event.target.value)} required autoComplete="off" spellCheck={false} disabled={Boolean(busy)} /></label>
    {error && <p className="mb-4 rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}
    <button type="submit" className={primaryButtonClass} disabled={Boolean(busy)}>{busy ? "Opening…" : "View submission"}</button>
    <p className="mt-6 text-sm leading-6 text-muted-foreground"><strong>Lost your token?</strong> Automated recovery is not configured. A submission cannot be recovered or claimed using email alone.</p>
  </form>;

  const paid = isPaidSubmission(submission);
  const canEdit = paid ? submission.status === "awaiting-payment" && submission.payment?.checkoutStarted === false : isPendingSubmission(submission.status) || submission.status === "rejected";

  return <div className="max-w-4xl space-y-6">
    <section className={panelClass} aria-labelledby="submission-status-heading">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-sm font-semibold capitalize text-primary">{statusLabels[submission.status]}</p><h2 className="text-2xl font-bold" id="submission-status-heading">{submission.input.name}</h2></div><div className="flex flex-wrap gap-2"><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => void refresh()}>{busy === "refresh" ? "Refreshing…" : "Refresh status"}</button><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={lock}>Close private view</button></div></div>
      <p className="mt-5 leading-7">{paid && submission.status === "rejected" ? "This paid submission was not accepted. A full refund is owed; see the server-confirmed refund status below. This record cannot be resubmitted." : paid && submission.status === "withdrawn" ? "This submission is withdrawn and is not a published directory listing. This paid record cannot be resubmitted. See the payment and refund status below." : paid && submission.status === "approved" ? "This submission has been approved. You can withdraw the public listing. Paid submissions cannot be edited or resubmitted after checkout begins." : statusDescriptions[submission.status]}</p>
      <SubmissionPayment submission={submission} />
      {paid && submission.status === "awaiting-payment" && <label className="mt-5 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={checkoutSaved} onChange={event => setCheckoutSaved(event.target.checked)} /><span>I have securely saved my submission ID and private token before leaving for checkout.</span></label>}
      <SubmissionCheckout submission={submission} token={activeToken} saved={checkoutSaved} disabled={Boolean(busy) || editing || confirmWithdrawal} onBusyChange={active => setBusy(active ? "checkout" : "")} onUpdate={setSubmission} />
      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Submission ID</dt><dd className="break-all">{submission.id}</dd></div><div><dt className="text-muted-foreground">Last updated</dt><dd>{new Date(submission.updatedAt).toLocaleString()}</dd></div><div><dt className="text-muted-foreground">Website check</dt><dd>{submission.websiteVerifiedAt ? "Manually verified" : "Not yet verified"}</dd></div><div><dt className="text-muted-foreground">Backlink check</dt><dd>{paid ? "Not required for paid submissions" : submission.backlinkVerifiedAt ? "Manually verified" : "Not yet verified"}</dd></div></dl>
      {submission.verificationNote && <div className="mt-5 rounded-lg bg-background/60 p-4"><h3 className="mb-2 text-sm font-semibold">{paid ? "Website verification note" : "Website and backlink verification note"}</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{submission.verificationNote}</p></div>}
      {submission.reviewNote && <div className="mt-5 rounded-lg bg-background/60 p-4"><h3 className="mb-2 text-sm font-semibold">Editorial review note</h3><p className="whitespace-pre-wrap break-words text-sm leading-6">{submission.reviewNote}</p></div>}
      {submission.status === "approved" && submission.listingSlug && <Link href={`/item/${encodeURIComponent(submission.listingSlug)}`} className="mt-5 inline-block text-primary underline underline-offset-4">View directory listing</Link>}
      {message && <p className="mt-5 rounded-lg border border-primary/50 p-3 text-sm" role="status">{message}</p>}
      {error && <p className="mt-5 rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}
    </section>
    {editing ? <form className={panelClass} onSubmit={event => { event.preventDefault(); void change(submission.status === "withdrawn" ? "resubmit" : "edit", inputFromForm(event.currentTarget)); }}>
      <h2 className="mb-5 text-xl font-semibold">{submission.status === "withdrawn" ? "Edit & resubmit your tool" : "Edit submission details"}</h2><SubmissionFields initial={submission.input} disabled={Boolean(busy)} />
      <p className="mt-5 text-sm text-muted-foreground">{paid ? "Changes are allowed only before checkout starts. The submission service and fee cannot be changed." : "Saving changes resets website and backlink verification. A rejected submission stays rejected until you resubmit it."}</p>
      <div className="mt-6 flex flex-wrap gap-3"><button type="submit" className={primaryButtonClass} disabled={Boolean(busy)}>{busy ? "Saving…" : submission.status === "withdrawn" ? "Save & resubmit for review" : "Save changes"}</button><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => setEditing(false)}>Cancel edits</button></div>
    </form> : <section className={panelClass}><h2 className="mb-3 text-xl font-semibold">Submitted details</h2><SubmissionSummary input={submission.input} /><div className="mt-6 flex flex-wrap gap-3">
      {!paid && submission.status === "withdrawn" && <button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => { setEditing(true); setError(""); setMessage(""); }}>Edit & resubmit</button>}
      {canEdit && <button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => { setEditing(true); setError(""); setMessage(""); }}>Edit details</button>}
      {!paid && (submission.status === "rejected" || submission.status === "withdrawn") && <button type="button" className={primaryButtonClass} disabled={Boolean(busy)} onClick={() => void change("resubmit")}>{busy === "resubmit" ? "Resubmitting…" : "Resubmit for review"}</button>}
      {submission.status !== "withdrawn" && !confirmWithdrawal && <button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => setConfirmWithdrawal(true)}>Withdraw submission</button>}
    </div>
      {confirmWithdrawal && <div className="mt-5 rounded-lg border border-destructive/70 p-4"><p className="mb-4 text-sm leading-6">{paid ? "Withdraw this paid submission? Any public listing will be removed, and this paid record cannot be resubmitted. Withdrawal does not itself confirm a refund. A payment confirmed after withdrawal will be flagged for a full manual refund; check the private payment status." : "Withdraw this submission? If it is approved, its public listing will be removed. You can resubmit it later, but a new editorial review will be required."}</p><div className="flex flex-wrap gap-3"><button type="button" className={primaryButtonClass} disabled={Boolean(busy)} onClick={() => void change("withdraw")}>{busy === "withdraw" ? "Withdrawing…" : "Confirm withdrawal"}</button><button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => setConfirmWithdrawal(false)}>Keep submission</button></div></div>}
    </section>}
    <p className="text-sm leading-6 text-muted-foreground">No automated email updates are configured. Keep your saved ID and token to return here. Closing this view clears the credentials from this page.</p>
  </div>;
}
