# Veronica Hub

A general AI, productivity and developer-tool directory at `residentevilveronica.com`, adapted from the **current** `ramosvimos/askpdf-directory` revision `87ec3457e0732c6f76d953af1446d005ec168c05`. This is the source for the public AskPDF directory, not its older PDF chat/financial-document application or an unrelated anime directory.

## Included

- 24 third-party editorial tools plus 5 explicitly disclosed owner projects; official URLs, concrete purposes and review dates. Unverified pricing, limits and processing fields stay marked.
- Current directory search, category/price/processing filters, pagination, detail pages and up-to-three comparison UI.
- Free reciprocal-link submissions, private access-token lookup, rejected/withdrawn revision and resubmission, manual website/backlink verification, approval and administrative withdrawal.
- One fresh approved-publication projection for directory, details, comparison API and sitemap. Emails, tokens and internal review history are excluded.
- All 44 prior historical routes under `/archive/`, with original assets, dated notices, noindex and no executable scripts/ads. Old non-conflicting paths redirect into the archive.

## Run and verify

Node.js 22.13+ (Node SQLite is used by tests).

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run check:legacy
npm run check:archive
npm run build
node scripts/smoke-http.mjs
npm run build:cloudflare
```

No secrets or services are required to browse or build. Production submission storage is **closed by default**; unconfigured requests return 503 and never pretend to save. The free workflow can be exercised in isolated non-production local mode; see `docs/free-submissions.md`.

Production D1 and a dedicated administrator key require separate configuration and authorization. No existing site's credentials, database, account records, payment terms, price IDs, authentication or email setup are copied. No deployment script/workflow or production route is included. `wrangler.jsonc` is build/preview-only.

## Content and provenance

Edit `src/data/pdf-catalog.ts` for editorial listings and collections. The research record is `docs/tool-research.json`. `docs/source-provenance.json` identifies the current source components. Mkdirs attribution is retained; see `NOTICE.md`. Historical content and assets remain subject to their original rights.

A Git commit, passing tests and a draft PR do not constitute a deployment or live submission verification.

## Owned-project guides

Five shared-owner projects have five original practical guides each (25 total), linked from `/blog`, `/our-projects` and their tool listings. Articles are rendered server-side, carry source dates and ownership disclosures, and have canonical URLs, Article structured data and sitemap entries. They describe editorial workflows without invented testing, rankings or guaranteed AI recommendations. See `docs/owned-project-articles.md` for the complete map.
