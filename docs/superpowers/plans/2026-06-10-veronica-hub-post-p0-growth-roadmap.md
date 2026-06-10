# Veronica Hub Post-P0 Growth Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the next roadmap after the source-backed dossier rebuild is complete, so Veronica Hub can grow from a trusted static information site into a measurable search, retention, and update-tracking product.

**Architecture:** Keep P0's data-backed static site as the foundation. Add measurement first, then expand source-backed content clusters, then add user retention, then automate official-source monitoring, then test monetization only after traffic and trust exist.

**Tech Stack:** Static HTML, React 18, esbuild, Node.js scripts, Vercel static hosting, Google Search Console, lightweight analytics, RSS, optional email capture provider, optional scheduled source-check script.

---

## Executive Summary

After the P0 plan is complete, the next move is not "make the homepage prettier." The next move is to make the site measurable, findable, and worth revisiting.

Recommended sequence:

```text
P0: Source-backed static dossier
P1: Measurement and indexing foundation
P2: Search content clusters
P3: Retention and update subscriptions
P4: Official-source monitoring
P5: Monetization and portfolio expansion
```

The core product should remain:

```text
The fastest clean source-backed status page for Resident Evil Veronica.
```

Do not dilute the site into generic gaming news. The trust asset is more valuable than a feed of low-quality posts.

## Success Metrics

Use these metrics after P0 is deployed:

- Google indexed pages: target 12+ indexed pages within 14 days.
- Search impressions: target visible impressions for brand and long-tail queries within 30 days.
- Click-through rate: target 3%+ average CTR on pages where title matches query intent.
- Returning users: target growth after changelog and subscription features launch.
- Source update latency: target official-source updates reflected on site within 24 hours.
- Build integrity: every deployment passes local validation and production route checks.

## Phase P1: Measurement And Indexing Foundation

**Goal:** Make the site measurable before adding more content.

**Why this comes next:** Without analytics and Search Console, page expansion is guesswork. P1 tells us which queries Google understands and which pages users actually open.

### Task 1: Add Analytics Decision Record

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/ANALYTICS_DECISION.md`

- [ ] **Step 1: Create the analytics decision document**

Create:

```markdown
# Analytics Decision

## Goal

Measure search traffic, route visits, outbound source clicks, trailer clicks and subscription intent without making the site feel ad-heavy or invasive.

## Recommended Option

Use Vercel Analytics first because the site is already deployed on Vercel and the setup is low-friction.

## Events To Track

- `route_view`: route path and page type
- `source_click`: source id and destination URL
- `trailer_play`: trailer id and page path
- `subscribe_intent`: source page and form location
- `store_click`: Steam, PlayStation, Xbox or Nintendo destination

## Privacy Position

Use aggregated analytics. Do not add invasive ad trackers during P1.
```

Expected:

```text
The team can explain what is tracked, why it is tracked and why ad tracking is not part of P1.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/ANALYTICS_DECISION.md
git commit -m "docs: define analytics approach"
```

Expected:

```text
Commit succeeds with the analytics decision document.
```

### Task 2: Set Up Search Console Workflow

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/SEARCH_CONSOLE_CHECKLIST.md`

- [ ] **Step 1: Create Search Console checklist**

Create:

```markdown
# Search Console Checklist

## Property

Use URL-prefix property:

https://veronica-hub.vercel.app/

## Verification

Preferred verification method:

1. HTML file upload if Vercel static output can serve it.
2. Meta tag if file upload is inconvenient.
3. DNS only if the site moves to a custom domain.

## Submit Sitemap

Submit:

https://veronica-hub.vercel.app/sitemap.xml

## First 14-Day Checks

- Coverage: confirm core pages are discovered.
- Indexing: inspect homepage, release date, platforms, FAQ and media pages.
- Performance: check queries that mention release date, platforms, trailer, PC requirements, demo and preorder.
- Enhancements: confirm FAQ rich result eligibility if available.
```

Expected:

```text
Search Console setup is repeatable and does not live only in chat history.
```

- [ ] **Step 2: Verify sitemap locally before submission**

Run:

```bash
curl -s https://veronica-hub.vercel.app/sitemap.xml | head -20
```

Expected:

```text
Sitemap XML is returned and includes https://veronica-hub.vercel.app/.
```

- [ ] **Step 3: Commit**

Run:

```bash
git add docs/SEARCH_CONSOLE_CHECKLIST.md
git commit -m "docs: add search console workflow"
```

Expected:

```text
Commit succeeds with the Search Console checklist.
```

### P1 Acceptance Criteria

- Analytics approach is documented.
- Search Console setup is documented.
- Sitemap is submitted after production deploy.
- Baseline numbers are captured after 7 days and 14 days.
- No ad scripts are added during P1.

## Phase P2: Search Content Clusters

**Goal:** Build high-intent pages around questions users search before launch.

**Why this comes next:** The site needs more useful entry points, not more random visual blocks. Every new page should own one search intent and be backed by the shared content model.

### Recommended Content Clusters

Release and availability:

- `/release-date/`
- `/pc-requirements/`
- `/preorder/`
- `/demo/`
- `/editions/`
- `/platforms/`

Media and discovery:

- `/trailer/`
- `/media/`
- `/screenshots/`
- `/official-sources/`

Game context:

- `/characters/`
- `/enemies/`
- `/story/`
- `/original-vs-remake/`
- `/rockfort-island/`

Trust and updates:

- `/sources/`
- `/changelog/`
- `/faq/`

### Task 3: Add Content Backlog

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/CONTENT_BACKLOG.md`

- [ ] **Step 1: Create backlog with page priorities**

Create:

```markdown
# Veronica Hub Content Backlog

## P1 Pages

| Page | Intent | Status |
| --- | --- | --- |
| `/pc-requirements/` | PC specs searchers | Required after P0 |
| `/preorder/` | Purchase intent | Required after P0 |
| `/demo/` | Demo availability | Required after P0 |
| `/editions/` | Price and edition intent | Required after P0 |
| `/media/` | Visual asset discovery | Required after P0 |
| `/changelog/` | Trust and returning visits | Required after P0 |

## P2 Pages

| Page | Intent | Notes |
| --- | --- | --- |
| `/screenshots/` | Image search and gallery browsing | Use official screenshots only |
| `/enemies/` | Monster searches | Separate remake-confirmed from original context |
| `/rockfort-island/` | Story and setting search | Spoiler-light |
| `/official-sources/` | Source credibility | Can redirect or canonicalize to `/sources/` |

## Rule

Do not create a page unless it has a clear search intent, a source policy and a verification block.
```

Expected:

```text
The backlog creates a controlled expansion path instead of ad hoc page creation.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/CONTENT_BACKLOG.md
git commit -m "docs: add content expansion backlog"
```

Expected:

```text
Commit succeeds with the content backlog.
```

### Task 4: Define Page Quality Bar

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/PAGE_QUALITY_BAR.md`

- [ ] **Step 1: Create page quality standard**

Create:

```markdown
# Page Quality Bar

Every indexed page must satisfy:

- One clear search intent.
- One visible H1.
- Unique title and description.
- Static HTML content before React hydration.
- At least one source or verification block.
- Clear confirmed versus unknown status.
- Internal links to related pages.
- No fake dates, fake prices, fake PC specs or fake demo claims.
- Official media only when it supports the page topic.

## Reject A Page If

- It only exists to add more URLs.
- It repeats homepage copy without new intent.
- It depends on rumors as the main content.
- It has no source or verification state.
```

Expected:

```text
Future pages can be reviewed against a concrete standard.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/PAGE_QUALITY_BAR.md
git commit -m "docs: define page quality bar"
```

Expected:

```text
Commit succeeds with the page quality document.
```

### P2 Acceptance Criteria

- Every new page maps to one clear search intent.
- Every new page is in the sitemap.
- Every new page passes `npm run validate`.
- No page invents release date, price, demo, preorder or PC spec details.
- Official image usage increases without damaging homepage hierarchy.

## Phase P3: Retention And Update Subscriptions

**Goal:** Give users a reason to come back or subscribe before exact release details are announced.

**Why this comes next:** Search brings users once. Release watchers need reminders when official status changes.

### Task 5: Add Watchlist Product Spec

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/WATCHLIST_SPEC.md`

- [ ] **Step 1: Create watchlist spec**

Create:

```markdown
# Veronica Hub Watchlist Spec

## User Promise

Get notified only when official Resident Evil Veronica information changes.

## Trigger Categories

- Exact release date confirmed
- Demo confirmed
- Preorder confirmed
- Editions or pricing confirmed
- PC requirements confirmed
- New official trailer
- New official screenshots or store page media

## First Version

Use a simple email capture form or external newsletter provider. Do not build a custom account system.

## Form Copy

Notify me when official details change.

## Trust Copy

No rumor blasts. Only official-source status changes.
```

Expected:

```text
Watchlist scope is clear and avoids building accounts, passwords or a custom backend.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/WATCHLIST_SPEC.md
git commit -m "docs: specify official update watchlist"
```

Expected:

```text
Commit succeeds with watchlist spec.
```

### Task 6: Add RSS Plan

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/RSS_PLAN.md`

- [ ] **Step 1: Create RSS plan**

Create:

```markdown
# RSS Plan

## Goal

Provide a zero-account way to follow official-source changes.

## Feed URL

`/feed.xml`

## Feed Items

Each item should come from a changelog entry and include:

- title
- date
- summary
- source URL
- affected claim ids

## Validation

Run:

```bash
curl -s https://veronica-hub.vercel.app/feed.xml | head -20
```

Expected:

```text
Feed XML is returned and includes the latest changelog item.
```
```

Expected:

```text
RSS is planned as a simple retention channel without custom user accounts.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/RSS_PLAN.md
git commit -m "docs: plan changelog rss feed"
```

Expected:

```text
Commit succeeds with RSS plan.
```

### P3 Acceptance Criteria

- Watchlist promise is source-only and clear.
- No custom account system is introduced.
- Subscription or RSS CTA appears on release, demo, preorder, PC requirements and changelog pages.
- Users can distinguish official alerts from rumor/news alerts.

## Phase P4: Official-Source Monitoring

**Goal:** Reduce manual checking by tracking official sources and surfacing changes.

**Why this comes later:** Automation is only useful after the content model and changelog exist.

### Task 7: Add Source Monitoring Design

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/SOURCE_MONITORING_DESIGN.md`

- [ ] **Step 1: Create monitoring design**

Create:

```markdown
# Source Monitoring Design

## Sources To Monitor

- Capcom press release page
- Steam store page
- Official BIOHAZARD YouTube video or channel page
- Platform store pages after they exist

## Snapshot Model

Each snapshot stores:

- source id
- checked at
- URL
- HTTP status
- extracted title
- extracted relevant text
- content hash

## Change Model

A change is created when:

- HTTP status changes
- extracted relevant text hash changes
- source URL redirects to a new canonical URL

## Human Review Rule

Automated changes create a review item. They do not automatically rewrite factual claims without human review.
```

Expected:

```text
Monitoring scope is defined without creating a risky automatic publishing pipeline.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/SOURCE_MONITORING_DESIGN.md
git commit -m "docs: design official source monitoring"
```

Expected:

```text
Commit succeeds with monitoring design.
```

### P4 Acceptance Criteria

- Monitoring checks official sources only.
- Source changes become review items, not automatic published claims.
- The changelog can cite source changes.
- Site update latency target is 24 hours after official source change.

## Phase P5: Monetization And Portfolio Expansion

**Goal:** Add revenue only after the site has trust and search traffic.

**Why this comes last:** Early ads or affiliate clutter would weaken the site's credibility before it earns traffic.

### Recommended Monetization Order

1. Store outbound links with clean tracking labels.
2. Newsletter or watchlist sponsorship only after users subscribe.
3. Affiliate links only where allowed and clearly disclosed.
4. Display ads only if traffic is large enough and layout impact is controlled.

### Task 8: Add Monetization Policy

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/MONETIZATION_POLICY.md`

- [ ] **Step 1: Create monetization policy**

Create:

```markdown
# Monetization Policy

## Principle

Trust comes before revenue.

## Allowed Later

- Clearly disclosed affiliate store links where platform terms allow it.
- Newsletter sponsorship after the watchlist has real subscribers.
- Lightweight display ads only if they do not damage source credibility or mobile usability.

## Not Allowed

- Fake download buttons.
- ROM, ISO, crack or emulator links.
- Rumor bait monetized as confirmed news.
- Ad layouts that push verification status below the fold on mobile.
```

Expected:

```text
Revenue rules are explicit before any monetization experiment begins.
```

- [ ] **Step 2: Commit**

Run:

```bash
git add docs/MONETIZATION_POLICY.md
git commit -m "docs: define monetization policy"
```

Expected:

```text
Commit succeeds with monetization policy.
```

### P5 Acceptance Criteria

- No monetization appears before baseline search traffic is measured.
- Any affiliate or sponsorship placement is disclosed.
- No monetization block hides verification status on mobile.
- Trust-focused pages remain clean.

## 90-Day Roadmap

### Days 1-7 After P0

- Deploy P0.
- Submit sitemap to Search Console.
- Add analytics decision and event plan.
- Record baseline production checks.
- Fix indexing or metadata defects immediately.

Expected output:

```text
Site is deployed, crawlable, measurable and baseline metrics are recorded.
```

### Days 8-30

- Expand content clusters with pages that match search intent.
- Add `/media/`, `/changelog/`, `/pc-requirements/`, `/preorder/`, `/demo/`, `/editions/`.
- Add internal linking between related pages.
- Review Search Console query impressions weekly.

Expected output:

```text
Google can discover specific long-tail pages and users no longer land only on the homepage.
```

### Days 31-60

- Add watchlist or RSS.
- Add source change changelog discipline.
- Add screenshot/media pages that use official assets in context.
- Start lightweight source monitoring design.

Expected output:

```text
The site has a returning-user reason and can notify or syndicate official changes.
```

### Days 61-90

- Implement source monitoring if manual source updates become repetitive.
- Review monetization only if traffic justifies it.
- Decide whether Veronica Hub is a single-site asset or the first site in a repeatable game-launch dossier network.

Expected output:

```text
The site either becomes a focused high-trust Resident Evil Veronica property or a reusable template for future game launch trackers.
```

## Decision Gates

### Gate 1: After P0 Deploy

Proceed to P1 only if:

- `npm run build` passes.
- Production route check passes.
- Sitemap includes all P0 routes.
- Homepage and mobile visual checks pass.

### Gate 2: Before More Pages

Proceed to P2 only if:

- Search Console is configured.
- Analytics approach is documented.
- Existing pages are indexed or at least discovered.

### Gate 3: Before Watchlist

Proceed to P3 only if:

- Changelog exists.
- The site can clearly describe what triggers an alert.
- No custom account system is required.

### Gate 4: Before Automation

Proceed to P4 only if:

- Source model is stable.
- Changelog model is stable.
- Manual updates are becoming repetitive.

### Gate 5: Before Monetization

Proceed to P5 only if:

- The site has measurable traffic.
- Trust positioning is not compromised.
- Disclosure copy is ready.

## Validation Expectations

Weekly local validation:

```bash
npm run build
```

Expected:

```text
Build exits 0 and validation reports all routes, claims, media records and schema as valid.
```

Weekly production validation:

```bash
node -e "const routes=['/','/release-date/','/platforms/','/trailer/','/faq/','/media/','/changelog/']; const origin='https://veronica-hub.vercel.app'; Promise.all(routes.map(async r=>{ const res=await fetch(origin+r); console.log(r, res.status); if(res.status!==200) process.exitCode=1; }))"
```

Expected:

```text
Every checked route returns 200.
```

Monthly SEO validation:

```text
Search Console shows discovered or indexed status for all major pages.
Top queries include release date, platforms, trailer, PC requirements, demo or preorder terms.
Pages with high impressions and low CTR are queued for title and description tests.
```

Monthly product validation:

```text
The changelog has entries only when source or site status changes.
No page publishes fake exact dates, fake preorder details, fake PC specs or fake demo information.
Official assets remain source-labeled.
```

## Recommended Immediate Next Action

After P0 is complete and deployed, do this first:

```text
Set up Search Console, submit sitemap, add analytics decision docs, and record a 7-day baseline.
```

Do not start monetization, broad news publishing or heavy automation before that baseline exists.

## Self-Review

Spec coverage:

- The plan answers what comes after P0.
- It defines product, SEO, retention, automation and monetization phases.
- It includes validation expectations for local build, production routes, SEO and product quality.
- It keeps the site focused on source-backed Resident Evil Veronica tracking.

Open-gap scan:

- Every phase has concrete outputs and acceptance criteria.
- The plan avoids vague improvement-only steps.

Type consistency:

- P0 means the source-backed static dossier plan.
- P1 means measurement and indexing.
- P2 means search content clusters.
- P3 means retention.
- P4 means official-source monitoring.
- P5 means monetization and expansion.
