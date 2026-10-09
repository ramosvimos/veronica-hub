# Free submissions

Adapted from the current AskPDF directory's free/backlink/manual-review architecture. This site has no payment, login, account-claiming or email-delivery flow. No other project's credentials or records are copied.

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

## Future production activation (not performed)

Dedicated Cloudflare D1 binding VERONICA_SUBMISSIONS_DB, dedicated admin key, VERONICA_SUBMISSIONS_MODE=d1, and the exact schema sentinel in database/001_free_submissions.sql are required. Runtime checks never create or migrate the database. The supplied build-only Wrangler file deliberately contains no D1 ID, account ID, route or credential. Creating these resources or setting secrets requires separate authorization.

Before opening the production form: apply the dedicated schema under approval, confirm request protection and intake limits, verify durable storage through a restart/redeploy, test two distinct private submissions, manual approve/withdraw and all public readers, and remove test records safely. No real D1 or public end-to-end submission test is claimed by the local SQLite adapter tests.
