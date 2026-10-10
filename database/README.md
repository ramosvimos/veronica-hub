# Submission storage

This is an adaptation of the current AskPDF directory's schema, atomic file store, private-token access and two-stage backlink/editorial review. The original free flow remains compatible with v1 storage. A separately gated paid-review flow adds provider-verified payment and refund state without account sign-in, email delivery, icon upload, automatic website fetching, database provisioning or secret-creation integration.

## Closed by default

Without all required dedicated configuration, the UI displays closed and POST returns 503. No success receipt is fabricated. Both modes require `VERONICA_SUBMISSIONS_ADMIN_KEY` of at least 32 characters. Use a dedicated high-entropy key selected by the operator, never a key from another site, never a `NEXT_PUBLIC_` variable, and never put it in a URL.

- Local development requires exactly `VERONICA_SUBMISSIONS_MODE=local` and `NODE_ENV` other than `production`.
- Local private records are saved in `.veronica-submissions/` (or `VERONICA_SUBMISSIONS_DIR`), with restrictive file modes and atomic replacement. A filesystem lock serializes mutations across processes; stale locks fail closed and require operator inspection rather than automatic unsafe unlocking.
- Local mode is a development aid, not production storage. Back up/retain/delete local development data deliberately; it includes private contact email and review notes.
- Production requires `VERONICA_SUBMISSIONS_MODE=d1`, a dedicated `VERONICA_SUBMISSIONS_DB` D1 binding, the correct schema sentinel, the expected table schema, and a dedicated admin key. There is no fallback to a file, memory store or another application's database.
- `001_free_submissions.sql` is offline schema code only. An authorized operator must provision a separate database and apply it before connecting that database. The application never creates databases, runs migrations or configures secrets.

## Bounded intake

Both adapters atomically enforce a maximum of 200 pending submissions and 50 new submissions in any rolling 24-hour window. Pending includes awaiting manual checks, an editorial decision, or a paid Checkout payment. Unpaid applications reserve capacity before money can be collected; an editor can explicitly withdraw abandoned unpaid records without deleting their payment history. Rejected/withdrawn resubmissions also respect pending capacity. D1 uses count predicates in the same write statement; the local adapter checks inside the filesystem lock. A full queue/intake window returns HTTP 429, does not create a record or return a private token, and leaves rejected resubmissions unchanged. These global limits bound storage/reviewer exposure; they are not per-person fairness or comprehensive bot protection. No IP address is collected. An operator should still assess abuse controls for the actual deployment.

## Review and ownership

`/submit-tool` collects product information plus a visible backlink page. Product pricing is independent of the chosen submission service. Free submission requires the backlink; optional paid review has its separate fixed fee and no backlink requirement. The reviewer opens the website and backlink in their own browser, records both checks and a note, then makes a separate approve/reject decision at `/admin/submissions`. Server-side code never fetches arbitrary publisher URLs.

Creation returns a submission ID and 256-bit private token once. Only the SHA-256 hash is stored. The private status page accepts ID and token through a form, sends them in a JSON POST, and retains them only in memory. All private reads and mutations re-check authorization; admin operations use a separate Bearer key. API responses are `no-store`, `noindex`, and `no-referrer`. The status/review pages are noindex. There is no account/email claim or token recovery flow. Possessing an email address is not proof of ownership. A lost creation response may mean a record was saved with a token the publisher did not receive; do not promise retry recovery. An operator must handle disputes outside this application using independently verified ownership.

Updates use expected versions to reject stale writes. Website keys are unique by lowercase domain with the www prefix removed, including across rejected and withdrawn records. There is one listing or submission per domain, regardless of URL path. Publishers manage the original record; multiple products under a shared host are outside this scoped workflow. Editing a pending listing invalidates manual checks. Rejected and withdrawn free submissions can be revised and resubmitted. Approved free submissions must be withdrawn before editing/resubmission. Paid submissions lock editing once Checkout starts and cannot be silently resubmitted after a decision, avoiding reuse of a rejected or refunded payment. The reviewer may also withdraw an approved listing with a private review note, without obtaining the submitter token. Withdrawal removes public eligibility immediately; public projection has no stale cache. Public routes consuming it must also remain dynamic/no-store.

Only approved free records with both saved checks, or approved paid records with a saved website check and a confirmed unrefunded payment, become `PdfTool` objects through `getPublishedSubmissionTools()` and `getPublishedSubmissionTool(slug)`. Public slugs use `submission-<UUID>`. Projection uses an explicit field allowlist and does not expose contact emails, token hashes, tokens, review notes or backlink URLs.

## Verification

`npm test -- --run tests/submissions.test.ts tests/submissions-ui.test.tsx` exercises lifecycle, authorization, disabled configuration, validation, duplicate and concurrent mutation behavior, publication withdrawal, API privacy headers and UI interruptions. The D1 adapter is exercised against local in-memory SQLite with a mocked binding; this is not a live Cloudflare/D1 deployment test.

Before opening public submissions, an operator should independently verify deployed binding/secret handling, HTTPS/origin behavior, backups, retention policy, abuse controls and traffic limits. This code does not provision a WAF, send mail, recover lost tokens or verify live payment/refund operations. The separately gated paid service has its own approved review deadline described in the submission terms.

## Paid schema migration

`002_paid_submissions.sql` is a prepared offline migration for the existing dedicated Veronica database, not an application startup action. It preserves the v1 marker and existing record/token data, expands allowed pending statuses, and adds the paid-schema marker. Paid readiness requires the new marker; a missing marker must not disable valid v1 free submissions. Migration review, backup and production application require separate authorization. See `../docs/paid-submissions.md` for configuration gates and the manual refund-verification procedure.
