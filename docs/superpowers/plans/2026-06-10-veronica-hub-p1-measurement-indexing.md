# Veronica Hub P1 Measurement And Indexing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After the P0 source-backed dossier rebuild ships, add measurement, indexing checks, production route validation, and baseline reporting so Veronica Hub can make data-backed content decisions.

**Architecture:** Keep Veronica Hub as a static Vercel site. Add lightweight analytics, Search Console setup documentation, production verification scripts, and a repeatable metrics snapshot process without adding ads, invasive tracking, or a custom backend.

**Tech Stack:** Static HTML, React 18, esbuild, Node.js scripts, Vercel static hosting, Vercel Web Analytics, Google Search Console, XML sitemap, Markdown runbooks.

---

## Scope

This plan starts only after P0 is complete:

- `content/site-data.json` exists.
- Static route generation exists.
- `npm run build` renders all target pages.
- `npm run validate` passes.
- Production deploy is live at `https://veronica-hub.vercel.app/`.

P1 does not add more content pages. P1 makes the existing P0 site measurable, crawlable, and auditable.

## External References

Use primary documentation:

- Vercel Web Analytics: `https://vercel.com/docs/analytics`
- Vercel Analytics quickstart: `https://vercel.com/docs/analytics/quickstart`
- Google sitemap guidance: `https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap`
- Google Search Console Sitemaps report: `https://support.google.com/webmasters/answer/7451001`
- Google Search Console URL Inspection: `https://support.google.com/webmasters/answer/9012289`

Important source facts:

- Google treats submitted sitemaps as a discovery hint, not an indexing guarantee.
- Search Console can submit sitemaps and inspect individual URLs.
- Vercel Web Analytics fits lightweight traffic visibility on a Vercel-hosted site.

## Target Files

Create:

- `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/ANALYTICS_DECISION.md`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/SEARCH_CONSOLE_RUNBOOK.md`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/BASELINE_METRICS.md`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/INDEXING_14_DAY_REVIEW.md`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/check-production-routes.mjs`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/check-p1-readiness.mjs`

Modify:

- `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.jsx`
- `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.bundle.js`

Do not modify:

- Factual claims, release date, pricing, demo status, PC requirements, or platform status as part of P1.
- Official image assets.
- Vercel project binding under `.vercel/`.

## P1 Success Criteria

Local:

- `npm run build` exits 0.
- `npm run check:production` returns 200 for every core production route.
- `npm run check:p1` confirms analytics docs, Search Console runbook, baseline metrics template, sitemap URL, and production route script exist.

Production:

- `https://veronica-hub.vercel.app/sitemap.xml` returns XML with all P0 routes.
- Homepage, FAQ, media, release date, platforms and sources return HTTP 200.
- Production pages include H1, canonical URL and JSON-LD.

Operational:

- Search Console property is created or ready to create.
- Sitemap submission workflow is documented.
- Day 0, Day 7, Day 14 and Day 30 metric snapshots have a defined format.
- The site remains free of ad scripts and rumor-driven content.

## Task 1: Add Analytics Decision Record

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/ANALYTICS_DECISION.md`

- [ ] **Step 1: Create the analytics decision file**

Create `docs/ANALYTICS_DECISION.md`:

```markdown
# Analytics Decision

## Decision

Use Vercel Web Analytics as the first analytics layer for Veronica Hub.

## Why

Veronica Hub is already deployed on Vercel, and P1 only needs lightweight traffic visibility:

- top pages
- referrers
- geography
- device and browser mix
- production traffic baseline

## Non-Goals

P1 does not add:

- display ads
- ad pixels
- invasive behavioral tracking
- user accounts
- cross-site retargeting

## Events For Later Review

These interactions are useful later, but basic page and referrer measurement is enough for P1:

- source link click
- trailer play
- Steam store click
- subscribe intent
- platform store click

## Privacy Position

Keep measurement lightweight and product-focused. The site's trust promise is more important than early monetization.

## Official Reference

https://vercel.com/docs/analytics
```

Expected:

```text
docs/ANALYTICS_DECISION.md explains why Vercel Web Analytics is selected and why ad tracking is excluded from P1.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/ANALYTICS_DECISION.md
git commit -m "docs: choose lightweight analytics approach"
```

Expected:

```text
Commit succeeds with the analytics decision record.
```

## Task 2: Add Vercel Web Analytics

**Files:**

- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package-lock.json`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.jsx`
- Modify generated output: `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.bundle.js`

- [ ] **Step 1: Install analytics package**

Run:

```bash
npm install @vercel/analytics
```

Expected:

```text
package.json and package-lock.json include @vercel/analytics.
```

- [ ] **Step 2: Import analytics component**

Modify `designs/veronica-hub/app.jsx` near the imports:

```jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
```

Expected:

```text
The app imports the Vercel Analytics React component without changing existing React behavior.
```

- [ ] **Step 3: Render analytics component once**

Modify the `App` return so `<Analytics />` is rendered once at the app shell level:

```jsx
return (
  <div className="app-shell">
    <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
    <main>
      {isNotFound ? (
        <NotFoundSection />
      ) : (
        <>
          <Hero />
          <ScreenshotWall />
          <OfficialMediaTerminal />
          <QuickFacts />
          <ReleaseSection />
          <PlatformsSection />
          <StorySection />
          <TrailerSection />
          <SourcesSection />
        </>
      )}
    </main>
    <Footer />
    {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}
    <Analytics />
  </div>
);
```

If P0 has already changed the `App` body to route-specific pages, keep the P0 route rendering and add only `<Analytics />` as the last child of `.app-shell`.

Expected:

```text
Analytics is mounted once. Page content and routing behavior remain unchanged.
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected:

```text
Build exits 0 and app.bundle.js is regenerated.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add package.json package-lock.json designs/veronica-hub/app.jsx designs/veronica-hub/app.bundle.js
git commit -m "feat: add Vercel analytics"
```

Expected:

```text
Commit succeeds with analytics package and app integration.
```

## Task 3: Add Search Console Runbook

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/SEARCH_CONSOLE_RUNBOOK.md`

- [ ] **Step 1: Create Search Console setup runbook**

Create `docs/SEARCH_CONSOLE_RUNBOOK.md`:

```markdown
# Search Console Runbook

## Property

Use this URL-prefix property:

https://veronica-hub.vercel.app/

## Verification Order

1. HTML file verification if Search Console provides a verification file.
2. Meta tag verification if file upload is inconvenient.
3. DNS verification only after the site moves to a custom domain.

## Sitemap

Submit this sitemap:

https://veronica-hub.vercel.app/sitemap.xml

## URL Inspection Set

Inspect these URLs after deployment:

- https://veronica-hub.vercel.app/
- https://veronica-hub.vercel.app/release-date/
- https://veronica-hub.vercel.app/platforms/
- https://veronica-hub.vercel.app/trailer/
- https://veronica-hub.vercel.app/faq/
- https://veronica-hub.vercel.app/sources/

Add these if P0 created them:

- https://veronica-hub.vercel.app/pc-requirements/
- https://veronica-hub.vercel.app/preorder/
- https://veronica-hub.vercel.app/demo/
- https://veronica-hub.vercel.app/editions/
- https://veronica-hub.vercel.app/media/
- https://veronica-hub.vercel.app/changelog/

## First Submission Checklist

- Production deployment is current.
- `https://veronica-hub.vercel.app/sitemap.xml` returns XML.
- Sitemap contains canonical absolute URLs.
- Robots file includes the sitemap location.
- Core pages return HTTP 200.
- Core pages are not `noindex`.

## 14-Day Review

Record:

- indexed pages
- discovered but not indexed pages
- crawl errors
- top queries
- top pages
- average CTR
- pages with impressions but poor CTR

## Official References

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://support.google.com/webmasters/answer/7451001
- https://support.google.com/webmasters/answer/9012289
```

Expected:

```text
Search Console setup can be repeated without relying on chat history.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/SEARCH_CONSOLE_RUNBOOK.md
git commit -m "docs: add search console runbook"
```

Expected:

```text
Commit succeeds with Search Console runbook.
```

## Task 4: Add Baseline Metrics Template

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/BASELINE_METRICS.md`

- [ ] **Step 1: Create metrics template**

Create `docs/BASELINE_METRICS.md`:

```markdown
# Baseline Metrics

## Site

- Production URL: https://veronica-hub.vercel.app/
- Baseline start date: 2026-06-10
- Measurement owner: site maintainer
- Analytics source: Vercel Web Analytics
- Search source: Google Search Console

## Day 0

| Metric | Value | Notes |
| --- | ---: | --- |
| Production routes checked | 0 | Fill after first P1 production check |
| Sitemap submitted | 0 | 1 after Search Console submission |
| Indexed pages | 0 | Search Console may not show data immediately |
| Search impressions | 0 | Initial value before data is available |
| Search clicks | 0 | Initial value before data is available |
| Average CTR | 0% | Initial value before data is available |

## Day 7

| Metric | Value | Notes |
| --- | ---: | --- |
| Indexed pages | 0 | Update from Search Console |
| Search impressions | 0 | Update from Search Console |
| Search clicks | 0 | Update from Search Console |
| Average CTR | 0% | Update from Search Console |
| Top query 1 | 0 | Record query text in Notes |
| Top landing page 1 | 0 | Record page path in Notes |

## Day 14

| Metric | Value | Notes |
| --- | ---: | --- |
| Indexed pages | 0 | Target: 12 or more if P0 has 15 routes |
| Search impressions | 0 | Directional baseline |
| Search clicks | 0 | Directional baseline |
| Average CTR | 0% | Target: 3% or higher on high-intent pages |
| Pages needing title rewrite | 0 | Pages with impressions and weak CTR |
| Pages needing content improvement | 0 | Pages discovered but not indexed |

## Day 30

| Metric | Value | Notes |
| --- | ---: | --- |
| Indexed pages | 0 | Target: most canonical pages indexed |
| Search impressions | 0 | Compare against Day 14 |
| Search clicks | 0 | Compare against Day 14 |
| Average CTR | 0% | Review title and description fit |
| Returning visitors | 0 | From analytics if available |
| Source clicks | 0 | Only if event tracking is added later |

## Interpretation Rules

- If pages are not discovered, inspect sitemap and internal links.
- If pages are discovered but not indexed, improve static content quality and internal links.
- If impressions exist but CTR is weak, test title and description changes.
- If homepage gets all traffic, add stronger internal links to high-intent pages.
```

Expected:

```text
The site has a concrete Day 0, Day 7, Day 14 and Day 30 reporting format.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/BASELINE_METRICS.md
git commit -m "docs: add baseline metrics template"
```

Expected:

```text
Commit succeeds with baseline metrics template.
```

## Task 5: Add Production Route Checker

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/check-production-routes.mjs`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`

- [ ] **Step 1: Create production route checker**

Create `scripts/check-production-routes.mjs`:

```js
import fs from "node:fs";

const origin = process.env.VERONICA_ORIGIN || "https://veronica-hub.vercel.app";
const dataPath = "content/site-data.json";

const fallbackRoutes = [
  "/",
  "/release-date/",
  "/platforms/",
  "/trailer/",
  "/story/",
  "/characters/",
  "/faq/",
  "/sources/"
];

const routes = fs.existsSync(dataPath)
  ? JSON.parse(fs.readFileSync(dataPath, "utf8")).routes.map((route) => route.path)
  : fallbackRoutes;

const failures = [];

function recordFailure(message) {
  failures.push(message);
}

for (const route of routes) {
  const url = `${origin}${route}`;
  const response = await fetch(url, { redirect: "follow" });
  const html = await response.text();

  console.log(`${route} ${response.status}`);

  if (response.status !== 200) recordFailure(`${route} returned ${response.status}`);
  if (!html.includes("<h1")) recordFailure(`${route} missing h1`);
  if (!html.includes('rel="canonical"')) recordFailure(`${route} missing canonical`);
  if (!html.includes("application/ld+json")) recordFailure(`${route} missing JSON-LD`);
  if (html.includes("noindex")) recordFailure(`${route} contains noindex`);
}

const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
const sitemapText = await sitemapResponse.text();
console.log(`/sitemap.xml ${sitemapResponse.status}`);

if (sitemapResponse.status !== 200) recordFailure("sitemap.xml did not return 200");
if (!sitemapText.includes("<urlset")) recordFailure("sitemap.xml missing urlset");

for (const route of routes) {
  if (!sitemapText.includes(`${origin}${route}`)) {
    recordFailure(`sitemap.xml missing ${route}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`production check ok: ${routes.length} routes`);
```

Expected:

```text
The checker verifies route status, H1, canonical tags, JSON-LD, noindex absence and sitemap coverage.
```

- [ ] **Step 2: Add package script**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "check:production": "node scripts/check-production-routes.mjs"
  }
}
```

Keep existing scripts. Add only `check:production`.

Expected:

```text
npm run check:production is available.
```

- [ ] **Step 3: Run production checker**

Run:

```bash
npm run check:production
```

Expected:

```text
Each route prints with HTTP 200.
/sitemap.xml 200
production check ok: 15 routes
```

If P0 has not been deployed yet, expected:

```text
The checker prints the exact routes or sitemap entries that are not ready.
```

- [ ] **Step 4: Commit**

Run:

```bash
git add scripts/check-production-routes.mjs package.json
git commit -m "test: add production route checker"
```

Expected:

```text
Commit succeeds with production checker and package script.
```

## Task 6: Add P1 Readiness Checker

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/check-p1-readiness.mjs`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`

- [ ] **Step 1: Create readiness checker**

Create `scripts/check-p1-readiness.mjs`:

```js
import fs from "node:fs";

const requiredFiles = [
  "docs/ANALYTICS_DECISION.md",
  "docs/SEARCH_CONSOLE_RUNBOOK.md",
  "docs/BASELINE_METRICS.md",
  "scripts/check-production-routes.mjs",
  "sitemap.xml",
  "robots.txt"
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing ${file}`);
}

if (fs.existsSync("robots.txt")) {
  const robots = fs.readFileSync("robots.txt", "utf8");
  if (!robots.includes("Sitemap: https://veronica-hub.vercel.app/sitemap.xml")) {
    failures.push("robots.txt missing production sitemap line");
  }
}

if (fs.existsSync("sitemap.xml")) {
  const sitemap = fs.readFileSync("sitemap.xml", "utf8");
  if (!sitemap.includes("https://veronica-hub.vercel.app/")) {
    failures.push("sitemap.xml missing production origin");
  }
}

if (fs.existsSync("docs/ANALYTICS_DECISION.md")) {
  const analytics = fs.readFileSync("docs/ANALYTICS_DECISION.md", "utf8");
  if (!analytics.includes("Vercel Web Analytics")) {
    failures.push("analytics decision does not name Vercel Web Analytics");
  }
}

if (fs.existsSync("docs/SEARCH_CONSOLE_RUNBOOK.md")) {
  const runbook = fs.readFileSync("docs/SEARCH_CONSOLE_RUNBOOK.md", "utf8");
  if (!runbook.includes("https://veronica-hub.vercel.app/sitemap.xml")) {
    failures.push("Search Console runbook missing sitemap URL");
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("p1 readiness ok");
```

Expected:

```text
The checker fails with exact missing file or config messages.
```

- [ ] **Step 2: Add package script**

Modify `package.json` scripts:

```json
{
  "scripts": {
    "check:p1": "node scripts/check-p1-readiness.mjs"
  }
}
```

Keep existing scripts. Add only `check:p1`.

Expected:

```text
npm run check:p1 is available.
```

- [ ] **Step 3: Run readiness checker**

Run:

```bash
npm run check:p1
```

Expected:

```text
p1 readiness ok
```

- [ ] **Step 4: Commit**

Run:

```bash
git add scripts/check-p1-readiness.mjs package.json
git commit -m "test: add p1 readiness checker"
```

Expected:

```text
Commit succeeds with readiness checker and package script.
```

## Task 7: Add 14-Day Indexing Review Template

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/INDEXING_14_DAY_REVIEW.md`

- [ ] **Step 1: Create review template**

Create `docs/INDEXING_14_DAY_REVIEW.md`:

```markdown
# 14-Day Indexing Review

## Review Date

2026-06-24

## Search Console Property

https://veronica-hub.vercel.app/

## Indexing Summary

| Metric | Value | Action |
| --- | ---: | --- |
| Submitted sitemap URLs | 0 | Record from sitemap |
| Indexed URLs | 0 | Record from Search Console |
| Discovered, not indexed | 0 | Improve internal links and static content |
| Crawled, not indexed | 0 | Improve page uniqueness and content depth |
| Pages with errors | 0 | Fix immediately |

## Query Summary

| Query | Impressions | Clicks | CTR | Page | Action |
| --- | ---: | ---: | ---: | --- | --- |
| resident evil code veronica remake release date | 0 | 0 | 0% | `/release-date/` | Keep if CTR is healthy |
| resident evil veronica platforms | 0 | 0 | 0% | `/platforms/` | Keep if CTR is healthy |
| resident evil veronica pc requirements | 0 | 0 | 0% | `/pc-requirements/` | Improve if impressions appear |
| resident evil veronica demo | 0 | 0 | 0% | `/demo/` | Improve if impressions appear |
| resident evil veronica preorder | 0 | 0 | 0% | `/preorder/` | Improve if impressions appear |

## Page Actions

| Page | Problem | Action |
| --- | --- | --- |
| `/` | No issue recorded | Keep stable |
| `/release-date/` | No issue recorded | Keep stable |
| `/platforms/` | No issue recorded | Keep stable |
| `/faq/` | No issue recorded | Confirm FAQ schema status |
| `/media/` | No issue recorded | Confirm image indexing potential |

## Decision Rules

- If a page has impressions and CTR below 3%, rewrite title and meta description.
- If a page is discovered but not indexed, improve static body content and internal links.
- If a page is indexed but gets no impressions, keep it if it supports trust or navigation.
- If a page has errors, fix before creating new pages.
```

Expected:

```text
The 14-day review can be completed without inventing a reporting format later.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/INDEXING_14_DAY_REVIEW.md
git commit -m "docs: add indexing review template"
```

Expected:

```text
Commit succeeds with indexing review template.
```

## Task 8: Deploy And Capture Day 0 Baseline

**Files:**

- Modify only if a verification failure requires a fix.

- [ ] **Step 1: Run local checks**

Run:

```bash
npm run build
npm run check:p1
```

Expected:

```text
Build exits 0.
p1 readiness ok
```

- [ ] **Step 2: Push to GitHub**

Run:

```bash
git push origin main
```

Expected:

```text
GitHub main contains P1 commits.
```

- [ ] **Step 3: Deploy production**

Run:

```bash
vercel --prod
```

Expected:

```text
Vercel returns a production deployment URL for the latest commit.
```

- [ ] **Step 4: Run production check**

Run:

```bash
npm run check:production
```

Expected:

```text
Every route returns 200.
/sitemap.xml returns 200.
production check ok: 15 routes
```

- [ ] **Step 5: Update Day 0 metrics**

Modify `docs/BASELINE_METRICS.md` Day 0 table:

```markdown
| Production routes checked | 15 | `npm run check:production` passed |
| Sitemap submitted | 1 | Submitted in Search Console |
| Indexed pages | 0 | Search Console may not show data immediately |
| Search impressions | 0 | Initial value before data is available |
| Search clicks | 0 | Initial value before data is available |
| Average CTR | 0% | Initial value before data is available |
```

If P0 route count differs from 15, use the actual route count printed by `npm run check:production`.

Expected:

```text
Day 0 baseline reflects production check status and sitemap submission status.
```

- [ ] **Step 6: Commit baseline update**

Run:

```bash
git add docs/BASELINE_METRICS.md
git commit -m "docs: record day 0 indexing baseline"
git push origin main
```

Expected:

```text
Baseline metrics are committed and pushed.
```

## Validation Matrix

Local readiness:

```bash
npm run check:p1
```

Expected:

```text
p1 readiness ok
```

Production route validation:

```bash
npm run check:production
```

Expected:

```text
Each route prints HTTP 200.
/sitemap.xml 200
production check ok: 15 routes
```

Sitemap direct check:

```bash
curl -s https://veronica-hub.vercel.app/sitemap.xml | head -20
```

Expected:

```text
Output begins with XML and includes urlset.
```

Robots direct check:

```bash
curl -s https://veronica-hub.vercel.app/robots.txt
```

Expected:

```text
User-agent: *
Allow: /
Sitemap: https://veronica-hub.vercel.app/sitemap.xml
```

Core route smoke check:

```bash
node -e "const routes=['/','/release-date/','/platforms/','/trailer/','/faq/','/sources/']; const origin='https://veronica-hub.vercel.app'; Promise.all(routes.map(async r=>{ const res=await fetch(origin+r); console.log(r,res.status); if(res.status!==200) process.exitCode=1; }))"
```

Expected:

```text
/ 200
/release-date/ 200
/platforms/ 200
/trailer/ 200
/faq/ 200
/sources/ 200
```

## Day 7 Review

Run:

```bash
npm run check:production
```

Expected:

```text
Production still returns 200 for every route.
```

Manual Search Console review:

```text
Open Search Console performance and indexing reports.
Record indexed pages, discovered pages, impressions, clicks, average CTR and top queries in docs/BASELINE_METRICS.md.
```

Expected:

```text
Day 7 table is updated with first observed Search Console values.
```

## Day 14 Review

Open `docs/INDEXING_14_DAY_REVIEW.md` and fill the review tables.

Expected:

```text
The review identifies whether to proceed to P2 content cluster expansion or pause for indexing fixes.
```

Proceed to P2 only if:

- Production check passes.
- Sitemap is processed or at least submitted without errors.
- Core pages are discovered by Google.
- No major technical indexing defect exists.

If P2 is blocked:

- Fix sitemap, canonical, noindex, page content, internal linking or schema issues before adding new pages.

## Self-Review

Spec coverage:

- The plan defines the concrete next step after P0.
- It covers analytics, Search Console, sitemap submission, production verification and baseline reporting.
- It includes local, production, Day 7 and Day 14 validation expectations.

Open-gap scan:

- Every task has exact files, commands and expected outputs.
- Manual external steps are documented in runbooks with URLs and inspection lists.

Type consistency:

- `check:production` maps to `scripts/check-production-routes.mjs`.
- `check:p1` maps to `scripts/check-p1-readiness.mjs`.
- Metrics snapshots live in `docs/BASELINE_METRICS.md`.
- The 14-day review lives in `docs/INDEXING_14_DAY_REVIEW.md`.
