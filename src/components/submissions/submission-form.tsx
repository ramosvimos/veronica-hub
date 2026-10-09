"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { inputFromForm, SubmissionFields, SubmissionSummary } from "./submission-fields";
import { inputClass, statusLabels, panelClass, primaryButtonClass, secondaryButtonClass, submissionRequest, SubmissionRequestError, useSubmissionReadiness, type SubmissionInput, type SubmissionRecord } from "./submission-client";

export function SubmissionForm() {
  const { readiness, error: availabilityError, loading, retry } = useSubmissionReadiness();
  const [draft, setDraft] = useState<SubmissionInput | null>(null);
  const [initial, setInitial] = useState<SubmissionInput | undefined>();
  const [created, setCreated] = useState<{ submission: SubmissionRecord; token: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [tokenHidden, setTokenHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const backlinkField = useRef<HTMLTextAreaElement>(null);
  const backlinkHtml = `<a href="${siteConfig.url}/" target="_blank" rel="nofollow noopener">Veronica Hub — useful AI, productivity &amp; developer tools</a>`;

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = inputFromForm(event.currentTarget);
    setInitial(value); setDraft(value); setError("");
  }
  async function submit() {
    if (!draft || busy || !readiness?.ready) return;
    setBusy(true); setError("");
    try {
      const result = await submissionRequest<{ submission: SubmissionRecord; token: string }>("/api/submissions", { method: "POST", body: JSON.stringify(draft) });
      if (!result.submission?.id || !result.token) throw new Error("The server did not return your private access details. Do not assume the submission is complete.");
      setCreated(result); setDraft(null); setInitial(undefined);
    } catch (error) { const detail = error instanceof Error ? error.message : "Could not confirm your submission."; const uncertain = !(error instanceof SubmissionRequestError) || error.status >= 500; setError(uncertain ? `${detail} If the response was lost, your request may already have been saved. Retrying may be rejected as a duplicate. A lost private token cannot be recovered through email.` : detail); }
    finally { setBusy(false); }
  }
  async function copyBacklink() {
    backlinkField.current?.focus(); backlinkField.current?.select();
    try { await navigator.clipboard.writeText(backlinkHtml); setCopyMessage("Backlink HTML copied."); }
    catch { setCopyMessage("Clipboard is unavailable. Select and copy the HTML above."); }
  }

  if (created) return <section className={`${panelClass} max-w-3xl`} aria-labelledby="submission-created">
    <p className="mb-3 text-sm font-semibold text-primary" role="status">Submission saved · {statusLabels[created.submission.status]}</p>
    <h2 className="mb-4 text-2xl font-bold" id="submission-created">Save your private access details now</h2>
    <p className="mb-5 leading-7">Your tool is awaiting editorial review. Submission is free; publication is not guaranteed.</p>
    <div className="mb-6 rounded-lg border border-amber-400/60 bg-amber-400/10 p-4 text-sm leading-6"><strong>This token is shown only once.</strong> Save the submission ID and private token somewhere secure before leaving or reloading. Anyone with both can access and change this submission. We cannot recover a lost token or let you claim a submission using email alone.</div>
    <label className="mb-5 block text-sm font-medium">Submission ID<input className={inputClass} value={created.submission.id} readOnly onFocus={event => event.currentTarget.select()} /></label>
    {!tokenHidden ? <><label className="block text-sm font-medium">Private management token<textarea className={`${inputClass} font-mono`} value={created.token} readOnly rows={3} spellCheck={false} autoComplete="off" onFocus={event => event.currentTarget.select()} /></label><label className="my-5 flex items-start gap-3 text-sm"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={saved} onChange={event => setSaved(event.target.checked)} /><span>I have securely saved both my submission ID and private token.</span></label><button type="button" className={secondaryButtonClass} disabled={!saved} onClick={() => { setTokenHidden(true); setCreated({ ...created, token: "" }); }}>Hide the token</button></> : <p className="my-5 text-sm text-muted-foreground">Token hidden. Use your saved copy to manage the submission.</p>}
    {(saved || tokenHidden) && <Link className={`${primaryButtonClass} mt-5 sm:ml-3`} href="/submit-tool/status">Manage your submission</Link>}
    <p className="mt-5 text-sm leading-6 text-muted-foreground">There are no automated email updates. Check the private status page with your saved ID and token.</p>
  </section>;

  return <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
    <div>
      <ol className="mb-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="Submission steps"><li aria-current={!draft ? "step" : undefined} className={!draft ? "font-semibold text-foreground" : ""}>1. Tool details</li><li aria-current={draft ? "step" : undefined} className={draft ? "font-semibold text-foreground" : ""}>2. Review & submit</li><li>3. Editorial review</li></ol>
      <div className="mb-6 rounded-lg border p-4 text-sm leading-6" role="status">
        {loading ? "Checking whether submissions are open…" : readiness?.message || availabilityError}
        {readiness?.mode === "local" && <p className="mt-2 font-medium">Local development mode: records stay in this environment and are not a public launch.</p>}
        {(!loading && (!readiness?.ready || availabilityError)) && <button type="button" className={`${secondaryButtonClass} mt-3`} onClick={retry}>Check availability again</button>}
      </div>
      {!draft ? <form className={panelClass} onSubmit={preview}>
        <h2 className="mb-5 text-xl font-semibold">Tell us about your tool</h2>
        <SubmissionFields initial={initial} />
        <button type="submit" className={`${primaryButtonClass} mt-6`} disabled={loading || !readiness?.ready}>Review submission</button>
        {!loading && !readiness?.ready && <p className="mt-3 text-sm text-muted-foreground">Submission is unavailable until the service is ready. Your details have not been sent.</p>}
      </form> : <section className={panelClass} aria-labelledby="submission-preview">
        <h2 className="mb-3 text-xl font-semibold" id="submission-preview">Review your submission</h2>
        <p className="mb-3 text-sm text-muted-foreground">Check these details before sending them to the Veronica Hub review team.</p>
        <SubmissionSummary input={draft} />
        <div className="my-6 flex justify-between rounded-lg bg-background/60 p-4"><span>Free submission · backlink required</span><strong>$0</strong></div>
        <p className="mb-5 text-sm leading-6 text-muted-foreground">An editor must verify the official website and visible backlink before approval. There is no promised review date, placement, traffic or ranking.</p>
        {error && <p className="mb-4 rounded-lg border border-destructive p-3 text-sm" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" className={primaryButtonClass} onClick={() => void submit()} disabled={busy || !readiness?.ready}>{busy ? "Submitting…" : "Submit for free review"}</button><button type="button" className={secondaryButtonClass} onClick={() => { setDraft(null); setError(""); }} disabled={busy}>Edit details</button></div>
      </section>}
    </div>
    <aside className={panelClass} aria-labelledby="backlink-instructions">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">Free submissions</p><h2 className="mb-5 text-xl font-semibold" id="backlink-instructions">A visible backlink is required</h2>
      <ol className="mb-6 list-decimal space-y-3 pl-5 text-sm leading-6"><li>Add a visible link to Veronica Hub on your product website, such as a footer or resources page.</li><li>Keep the link in place while your tool is listed. A visible text link is accepted, including nofollow links.</li><li>Share that public page URL so an editor can check it.</li></ol>
      <label className="block text-sm font-medium">Backlink HTML<textarea className={`${inputClass} text-xs leading-5`} ref={backlinkField} value={backlinkHtml} readOnly rows={5} spellCheck={false} /></label>
      <button type="button" className={`${secondaryButtonClass} mt-3 w-full`} onClick={() => void copyBacklink()}>Copy backlink HTML</button><p className="mt-2 text-sm" role="status">{copyMessage}</p>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">AI, productivity, developer, design and other useful tools are welcome. Your product may be free or paid; listing submissions are always free.</p>
      <Link className="mt-6 inline-block text-sm text-primary underline underline-offset-4" href="/submit-tool/status">Already submitted? Check private status</Link>
    </aside>
  </div>;
}
