# Free submissions

Adapted from the current AskPDF directory's free/backlink/manual-review architecture. This free flow has no payment step. The separately gated paid-review flow is documented in paid-submissions.md; login, account-claiming and automated email delivery are not included. No other project's credentials or records are copied.

## Local development only

Set VERONICA_SUBMISSIONS_MODE=local, VERONICA_SUBMISSIONS_DIR to a private test directory, and VERONICA_SUBMISSIONS_ADMIN_KEY to a fresh local-only value of at least 32 characters. Start the development server. Local mode is rejected when NODE_ENV=production. Never put a real key in source, a URL, screenshots or a PR.

- `/submit-tool`: reciprocal-link instructions and a validated free application
- `/submit-tool/status`: private lookup using the submission ID and management token, with body-based requests
- `/admin/submissions`: manually provide the editor key in the page; review website and backlink before verification, then approve/reject/withdraw with a reason

An unconfigured service reports closed readiness and returns HTTP503 to create attempts. It never simulates a saved production request. Private API responses are no-store and noindex. One listing/submission per normalized domain is supported, including different paths on the same domain.

## Security and publication model

A 32-byte random token is returned on creation; only its SHA-256 hash is stored. Every private read/edit/retry/withdraw requires the matching token. Admin access is separate, constant-time checked and never accepted through URL parameters. There is no email-only recovery or transfer. If ID/token are lost, the interface explains the limitation rather than issuing replacement access to someone who merely knows an address.

Approve requires recorded manual checks of both the official website and a visible reciprocal link. No application URL is fetched by the server. Editing or resubmitting clears stale verification. Optimistic versions prevent lost updates. Approvals produce an allowlisted public record with no email, token, backlink review notes or private data. Directory, detail, comparison API and sitemap read the same fresh public projection; admin/submitter withdrawal removes the listing immediately.

Both storage adapters enforce atomic intake bounds: no more than 50 new applications in a rolling24-hour window and no more than 200 pending reviews. Rejected attempts return429 without a saved record/token. Returning withdrawn/rejected records to pending also checks capacity. These limits bound stored intake; they are not IP-based bot prevention or a substitute for deployment-level request protection.

## Cloudflare production configuration

The dedicated Cloudflare D1 database is `veronica-hub-submissions`. `wrangler.jsonc` binds it as `VERONICA_SUBMISSIONS_DB` and sets `VERONICA_SUBMISSIONS_MODE=d1`. The schema in `database/001_free_submissions.sql` is applied to that database; the runtime only checks the schema sentinel and never creates or migrates tables.

`VERONICA_SUBMISSIONS_ADMIN_KEY` is set as a Cloudflare Worker Secret. Its generated value is also stored in the operator's macOS Keychain under service `Veronica Hub submissions admin key` and account `veronica-hub`, so the editor can retrieve it for `/admin/submissions`. Never store its value in the repository, a URL, screenshots or a PR. Cloudflare does not return Worker Secret values; rotate the value in the Keychain and Worker together if it is lost.

Before treating the live flow as verified, check the readiness endpoint, durable storage across a redeploy, two distinct private submissions, manual review and withdrawal, and all public readers. For production probes, use unique QA subdomains under a domain you control and synthetic `example.com` contact addresses; no email is sent. Do not mark test sites or backlinks as verified or approve them. After verification, withdraw and remove only the exact QA record IDs created for the probe. The local SQLite adapter tests do not replace a live D1 test. Intake is bounded to 50 new submissions per rolling 24 hours and 200 pending reviews; these are global limits, not per-IP bot protection.

## Separate paid service

The optional paid editorial-review service is described in `paid-submissions.md`. Its configuration and schema-readiness gates are independent: missing paid configuration does not disable an otherwise valid free flow. Free submissions still require manual website and backlink checks. Product pricing (Free/Freemium/Paid) does not choose the submission service.
