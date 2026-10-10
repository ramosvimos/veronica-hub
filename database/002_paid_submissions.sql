-- OFFLINE migration. Apply only after explicit authorization, a backup and an
-- operator review, to the SAME dedicated Veronica submission database.
-- No application path runs this migration. The v1 sentinel stays unchanged,
-- so original free records and their token hashes remain valid.
CREATE TABLE veronica_submissions_v2 (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 0),
  url_key TEXT NOT NULL UNIQUE,
  listing_slug TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('awaiting-backlink-review','free-awaiting-review','awaiting-payment','paid-awaiting-review','approved','rejected','withdrawn')),
  record TEXT NOT NULL CHECK (json_valid(record)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO veronica_submissions_v2 SELECT id, version, url_key, listing_slug, status, record, created_at, updated_at FROM veronica_submissions;
DROP TABLE veronica_submissions;
ALTER TABLE veronica_submissions_v2 RENAME TO veronica_submissions;
CREATE INDEX veronica_submissions_status_created ON veronica_submissions (status, created_at DESC);
CREATE INDEX veronica_submissions_created ON veronica_submissions (created_at);
CREATE TABLE veronica_submission_payment_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  app TEXT NOT NULL CHECK (app = 'veronica-hub-paid-submissions-v2')
);
INSERT INTO veronica_submission_payment_meta (id, app) VALUES (1, 'veronica-hub-paid-submissions-v2');
-- Checkout attempts, idempotency keys, provider event receipts, verified payment
-- and refund IDs are durable inside each record and commit with its version CAS.
