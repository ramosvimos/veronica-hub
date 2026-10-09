-- Offline schema only. No database or secrets are provisioned by this application.
-- Apply only to a dedicated, explicitly authorized Veronica Hub D1 database.
PRAGMA foreign_keys = ON;
CREATE TABLE veronica_submission_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  app TEXT NOT NULL CHECK (app = 'veronica-hub-free-submissions-v1')
);
INSERT INTO veronica_submission_meta (id, app) VALUES (1, 'veronica-hub-free-submissions-v1');
CREATE TABLE veronica_submissions (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 0),
  url_key TEXT NOT NULL UNIQUE,
  listing_slug TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('awaiting-backlink-review','free-awaiting-review','approved','rejected','withdrawn')),
  record TEXT NOT NULL CHECK (json_valid(record)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX veronica_submissions_status_created ON veronica_submissions (status, created_at DESC);
CREATE INDEX veronica_submissions_created ON veronica_submissions (created_at);
