# Paid editorial review (disabled by default)

This is code for an optional Veronica Hub submission service, not a payment-enabled launch. The existing free submission system and the directory's tool-price classifications remain separate. No production migration, Stripe account/product/price/webhook configuration, credential setup or live charge is performed by this change.

## Approved service terms

- USD 9.90 once per paid submission; no recurring subscription and no required backlink.
- Editorial decision within seven business days after provider-confirmed payment. The implementation uses Monday–Friday in UTC, without a separate public-holiday calendar; private status shows the exact recorded deadline. A verified successful signed payment event supplies the provider confirmation time when available; reconciliation without that evidence initially records the server verification time. A later verified earlier success can shorten the deadline, never extend it or revive a terminal submission.
- Payment does not guarantee acceptance, placement, traffic, ranking or an AI recommendation. The publisher's website still requires a manual check.
- A rejected paid submission is owed a full USD 9.90 refund. Rejection records `pending`, not `refunded`. Staff process the actual refund in the authorized payment-provider account, then verify a successful full refund belonging to the same payment before marking it completed.
- Payment state and editorial state are distinct. Returning from checkout is not proof of payment. A refund is not inferred from a rejection, a withdrawal or a redirect.
- Paid listings are disclosed and outbound links use `rel="sponsored"`. A tool whose product pricing is `Paid` can still choose free submission; it must then satisfy the normal backlink conditions.

## Configuration gates

All settings below are dedicated to Veronica. Never copy another site's keys, billing identifiers or account bindings. Values are read at runtime; the repository must contain no real secret values.

| Setting | Required behavior |
| --- | --- |
| `VERONICA_PAID_SUBMISSIONS_ENABLED` | Explicit `true`; absent or other values keep paid checkout off. |
| `VERONICA_PAYMENT_ENVIRONMENT` | Explicit `test` or `live`, matching the secret and provider objects. |
| `VERONICA_STRIPE_SECRET_KEY` | Dedicated matching `sk_test_` or `sk_live_` server secret. |
| `VERONICA_STRIPE_WEBHOOK_SECRET` | Dedicated endpoint signing secret. |
| `VERONICA_PAYMENT_ORIGIN` | Exact Veronica canonical origin for D1; only isolated local tests may use loopback HTTP. Other-site origins must fail closed. |
| `VERONICA_LIVE_PAYMENTS_ENABLED` | Additional explicit `true` for live payments, requiring D1 storage. |
| `VERONICA_LOCAL_TEST_PAYMENTS` | Additional explicit `true` for isolated local test mode outside production. |

The amount and currency are fixed server-side at 990 USD cents, using one-time Checkout mode. The caller cannot override them. Existing `VERONICA_SUBMISSIONS_ADMIN_KEY` and dedicated submission storage are still required. Payment configuration failure must disable paid service without switching off valid free submissions.

The separate `database/002_paid_submissions.sql` migration introduces the paid-schema marker and pending-state support. It is prepared for operator review only, not applied automatically. Until its exact marker is available, D1 paid readiness must fail closed while the original free schema continues to work. No startup migration or production account lookup is performed.

## Manual refund operating procedure

1. Use the private admin view to identify the rejected paid application and its pending refund. Do not approve it merely to clear a queue.
2. An authorized operator checks the original payment in the correct Veronica payment-provider account and processes a **full** refund there. This code does not send a refund-creation request.
3. Enter the actual provider refund ID in the admin verification action. The server fetches the provider record and validates successful status, full amount, currency and payment ownership before recording completion. A fabricated ID, another order's refund or a partial/unfinished refund must not pass.
4. If verification fails or the provider is unavailable, retain `pending` and investigate. Never replace provider evidence with a checkbox or a claim that the refund has been sent.
5. Reconcile remaining pending refunds and paid-review deadlines through the private administration view. Keep operational responsibility with a named human before enabling live checkout. No email delivery or external notification guarantee is included.

Do not put management tokens, administrator keys, raw provider responses or card details in support messages, query strings, analytics, screenshots or logs. A receipt or matching email does not grant access to an existing submission. Save the private ID/token before opening Checkout; credentials remain outside return URLs.

## Release checks requiring separate authorization

Before activation: approve the payment account and persistent secrets; review/apply the migration to the intended Veronica database; register the endpoint and signing secret; verify test-mode delivery and retry behavior; designate review/refund operators; verify the public terms and the controlled origin; and separately authorize live billing/deployment. Mock tests and a successful build are not evidence of a real charge, refund or production database migration.

## Endpoint contract

- `GET /api/submissions/readiness` reports `paidReady` separately from ordinary submission readiness. It never returns secret values.
- `POST /api/submissions` saves the selected `submissionType` and returns the private ID/token once. `pricing` still describes the submitted product.
- `POST /api/submissions/checkout` accepts the saved submission ID in JSON and its private token in the Authorization header. It uses a persisted attempt and idempotency key, rather than taking price or currency from the browser.
- `POST /api/submissions/webhook` receives the provider's raw signed JSON. Success, failed and expired Checkout notifications are reconciled against a freshly retrieved provider session. Unknown/unrelated notifications do not authorize a record change.
- `POST /api/submissions/admin` keeps administrator-only review actions and adds verified refund reconciliation. Tokens, administrator keys and refund identifiers belong in request bodies/headers, not query strings.

Pausing new paid sales must not stop signed notifications and verified refunds for existing payments, provided their dedicated provider configuration and storage remain valid. An editor may withdraw an abandoned unpaid application to free queue capacity; the payment attempt remains recorded, and any late confirmed payment becomes a pending refund without restoring the listing.
