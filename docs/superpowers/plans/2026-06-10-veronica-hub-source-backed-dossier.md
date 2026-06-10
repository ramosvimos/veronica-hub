# Veronica Hub Source-Backed Dossier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Veronica Hub from a polished React showcase into a source-backed, SEO-readable Resident Evil Veronica information dossier with dedicated pages, verified facts, official media context, and repeatable validation.

**Architecture:** Keep the current static Vercel deployment, but make content data-driven. Move factual claims, routes, source records, FAQ entries, and media records into a shared JSON data file; generate static route HTML from that data; keep React for the interactive visual shell and trailer behavior.

**Tech Stack:** Static HTML, React 18, esbuild, Node.js scripts, Vercel static hosting, official image assets in `assets/official/`.

---

## Product Positioning

Veronica Hub should not compete as a generic gaming news blog. The winning wedge is:

**The cleanest official-source tracker for Resident Evil Veronica release date, platforms, trailer, PC requirements, preorder status, characters, media, and source changes.**

The product promise must be visible on the homepage:

```text
No fake dates. No rumor-first posts. Only source-backed Resident Evil Veronica updates.
```

The site should answer these user questions quickly:

- Is the Resident Evil Code Veronica remake official?
- What is the release date?
- What platforms are confirmed?
- Is PC or Steam confirmed?
- Is there a trailer?
- Are preorders, editions, demo, or PC specs confirmed?
- Which characters and story details are remake-confirmed versus original-game context?
- Where did each claim come from?

## Current Repository Facts

- Root: `/Users/lin/PycharmProjects/game-station/veronica-hub`
- Current app entry: `designs/veronica-hub/app.jsx`
- Current bundle output: `designs/veronica-hub/app.bundle.js`
- Current homepage shell: `index.html`
- Current static routes:
  - `release-date/index.html`
  - `platforms/index.html`
  - `trailer/index.html`
  - `story/index.html`
  - `characters/index.html`
  - `faq/index.html`
  - `sources/index.html`
- Current deployment config: `vercel.json`
- Current sitemap: `sitemap.xml`
- Current official assets: `assets/official/`

## Target File Structure

Create these files:

- `content/site-data.json`
  - Single source of truth for routes, claims, sources, FAQ, characters, media, and verification dates.
- `scripts/render-static-pages.mjs`
  - Generates `index.html` and route `index.html` files from `content/site-data.json`.
- `scripts/validate-site.mjs`
  - Validates required routes, metadata, schema, asset references, and critical visible text.
- `docs/VERONICA_HUB_CONTENT_MODEL.md`
  - Documents source policy, claim statuses, page ownership, and update workflow.

Modify these files:

- `package.json`
  - Add build and validation scripts.
- `designs/veronica-hub/app.jsx`
  - Consume the same content model and render route-specific page bodies.
- `index.html`
  - Generated static homepage with real H1, critical copy, JSON-LD, and root app shell.
- Route files under `release-date/`, `platforms/`, `trailer/`, `story/`, `characters/`, `faq/`, `sources/`
  - Generated static HTML with unique metadata and visible content.
- `sitemap.xml`
  - Include all target routes with `2026-06-10` lastmod after implementation.
- `robots.txt`
  - Keep sitemap pointer and crawl permissions.

Do not modify:

- Existing official image binaries unless replacing broken files with verified official assets.
- `.vercel/project.json`
- `package-lock.json` except through `npm install` or script changes that require lockfile updates.

## Route Inventory

Required routes after implementation:

```text
/
/release-date/
/platforms/
/trailer/
/story/
/characters/
/faq/
/sources/
/pc-requirements/
/preorder/
/demo/
/editions/
/original-vs-remake/
/media/
/changelog/
```

Each route must have:

- Unique `<title>`
- Unique `<meta name="description">`
- Canonical URL
- One visible `<h1>`
- At least 250 words of useful static HTML body content, except `/media/`, where image captions and source notes count as primary content
- Breadcrumb JSON-LD
- A visible source or verification block

## Content Model

Create `content/site-data.json` with this structure:

```json
{
  "site": {
    "name": "Veronica Hub",
    "origin": "https://veronica-hub.vercel.app",
    "lastVerified": "2026-06-10",
    "disclaimer": "Independent fan-made information hub. Veronica Hub is not affiliated with or endorsed by Capcom."
  },
  "routes": [
    {
      "path": "/",
      "title": "Resident Evil Code Veronica Remake Release Date, Platforms & Official Sources",
      "description": "Source-backed Resident Evil Veronica hub tracking the 2027 release window, confirmed platforms, official trailer, PC status and verification notes.",
      "h1": "Resident Evil Code Veronica Remake",
      "section": "home",
      "priority": 1.0,
      "changefreq": "daily"
    },
    {
      "path": "/release-date/",
      "title": "Resident Evil Code Veronica Remake Release Date: 2027 Window Confirmed",
      "description": "Resident Evil Veronica is officially announced for 2027. Track exact release date status, source notes and what remains unconfirmed.",
      "h1": "Resident Evil Veronica Release Date",
      "section": "release-date",
      "priority": 0.9,
      "changefreq": "daily"
    },
    {
      "path": "/platforms/",
      "title": "Resident Evil Veronica Platforms: PS5, Xbox Series X|S, Switch 2 and PC",
      "description": "Confirmed Resident Evil Veronica platforms from official sources, including PlayStation 5, Xbox Series X|S, Nintendo Switch 2 and PC.",
      "h1": "Resident Evil Veronica Platforms",
      "section": "platforms",
      "priority": 0.9,
      "changefreq": "daily"
    }
  ],
  "claims": [
    {
      "id": "release-window",
      "label": "Release window",
      "value": "2027",
      "status": "confirmed",
      "sourceIds": ["capcom-press-2026-06-08", "steam-store"],
      "lastChecked": "2026-06-10",
      "lastChanged": "2026-06-08",
      "pages": ["/", "/release-date/"]
    },
    {
      "id": "exact-release-date",
      "label": "Exact release date",
      "value": "Not officially confirmed",
      "status": "unknown",
      "sourceIds": ["capcom-press-2026-06-08", "steam-store"],
      "lastChecked": "2026-06-10",
      "lastChanged": "2026-06-08",
      "pages": ["/release-date/", "/faq/"]
    }
  ],
  "sources": [
    {
      "id": "capcom-press-2026-06-08",
      "name": "Capcom press release",
      "type": "official",
      "reliability": "high",
      "url": "https://www.capcom.co.jp/ir/english/news/html/e260608.html",
      "usedFor": "Announcement, 2027 release window, platforms, genre and remake status",
      "lastChecked": "2026-06-10"
    },
    {
      "id": "steam-store",
      "name": "Steam store",
      "type": "official-store",
      "reliability": "high",
      "url": "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/",
      "usedFor": "PC status, planned release year, developer, publisher, story context and system requirements status",
      "lastChecked": "2026-06-10"
    }
  ],
  "faq": [
    {
      "question": "Is Resident Evil Code Veronica Remake official?",
      "answer": "Yes. Capcom announced Resident Evil Veronica, a remake of Resident Evil Code: Veronica, with a planned 2027 release window."
    },
    {
      "question": "What is the exact release date?",
      "answer": "A 2027 release window is confirmed. An exact release date has not been officially confirmed."
    }
  ],
  "media": [
    {
      "id": "claire-combat",
      "title": "Claire Redfield combat screenshot",
      "kind": "official-screenshot",
      "src": "/assets/official/steam/steam-screenshot-01.jpg",
      "alt": "Official Resident Evil Veronica screenshot showing Claire Redfield in combat context",
      "sourceId": "steam-store",
      "pages": ["/", "/media/", "/characters/"]
    }
  ]
}
```

The final file must include every route from the route inventory. The snippet above defines the schema and initial records; implementation must fill the remaining route records, claims, FAQ entries, characters, and media records in the same shape.

## Task 1: Add Data Model And Route Metadata

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/content/site-data.json`
- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/docs/VERONICA_HUB_CONTENT_MODEL.md`

- [ ] **Step 1: Create the content directory**

Run:

```bash
mkdir -p content docs
```

Expected:

```text
content and docs directories exist.
```

- [ ] **Step 2: Create `content/site-data.json`**

Use the schema in the Content Model section. Include all required routes:

```json
[
  "/",
  "/release-date/",
  "/platforms/",
  "/trailer/",
  "/story/",
  "/characters/",
  "/faq/",
  "/sources/",
  "/pc-requirements/",
  "/preorder/",
  "/demo/",
  "/editions/",
  "/original-vs-remake/",
  "/media/",
  "/changelog/"
]
```

Expected:

```text
All routes have title, description, h1, section, priority and changefreq.
All claims have id, label, value, status, sourceIds, lastChecked, lastChanged and pages.
All sources have id, name, type, reliability, url, usedFor and lastChecked.
```

- [ ] **Step 3: Document the content model**

Create `docs/VERONICA_HUB_CONTENT_MODEL.md`:

```markdown
# Veronica Hub Content Model

Veronica Hub treats factual game information as claims, not as decorative copy.

## Claim Statuses

- `confirmed`: Official source directly confirms the claim.
- `unknown`: Official source does not confirm the claim yet.
- `reported`: Reliable store or platform listing reports the claim, but wording should stay source-scoped.

## Source Policy

Primary factual sources are Capcom official material, Steam official store data, platform store pages, and official YouTube channels. Rumors, forum posts, leaks, and fan speculation can be discussed only when clearly labeled as unconfirmed context.

## Update Workflow

1. Check source pages.
2. Update `content/site-data.json`.
3. Add a changelog entry.
4. Run `npm run build`.
5. Run `npm run validate`.
6. Check desktop and mobile screenshots.
7. Deploy to Vercel.
```

Expected:

```text
The document explains claim statuses, source policy and update workflow without relying on memory from prior conversations.
```

- [ ] **Step 4: Validate JSON syntax**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('content/site-data.json','utf8')); console.log('site-data ok')"
```

Expected:

```text
site-data ok
```

- [ ] **Step 5: Commit**

Run:

```bash
git add content/site-data.json docs/VERONICA_HUB_CONTENT_MODEL.md
git commit -m "feat: add Veronica Hub content model"
```

Expected:

```text
Commit succeeds with the two new files.
```

## Task 2: Generate Static Route HTML

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/render-static-pages.mjs`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`
- Modify generated output: `/Users/lin/PycharmProjects/game-station/veronica-hub/index.html`
- Modify generated output: route `index.html` files under the required route inventory
- Modify generated output: `/Users/lin/PycharmProjects/game-station/veronica-hub/sitemap.xml`

- [ ] **Step 1: Create the scripts directory**

Run:

```bash
mkdir -p scripts
```

Expected:

```text
scripts directory exists.
```

- [ ] **Step 2: Create `scripts/render-static-pages.mjs`**

Use this implementation shape:

```js
import fs from "node:fs";
import path from "node:path";
import data from "../content/site-data.json" assert { type: "json" };

const root = process.cwd();
const bundlePath = "/designs/veronica-hub/app.bundle.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routeOutputPath(routePath) {
  if (routePath === "/") return path.join(root, "index.html");
  return path.join(root, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

function absoluteUrl(routePath) {
  return `${data.site.origin}${routePath}`;
}

function relatedClaims(routePath) {
  return data.claims.filter((claim) => claim.pages.includes(routePath));
}

function routeBody(route) {
  const claims = relatedClaims(route.path);
  const claimList = claims.map((claim) => `
    <article class="static-claim">
      <h2>${escapeHtml(claim.label)}</h2>
      <p><strong>${escapeHtml(claim.value)}</strong></p>
      <p>Status: ${escapeHtml(claim.status)}. Last checked: ${escapeHtml(claim.lastChecked)}.</p>
    </article>`).join("");

  return `
    <section class="static-content" data-route="${escapeHtml(route.path)}">
      <p class="static-kicker">Source-backed Resident Evil Veronica dossier</p>
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.description)}</p>
      <div class="static-claim-grid">${claimList}</div>
      <aside class="static-verification">
        <h2>Verification Status</h2>
        <p>Last verified: ${escapeHtml(data.site.lastVerified)}. Veronica Hub separates confirmed facts from unknown details.</p>
      </aside>
    </section>`;
}

function breadcrumbSchema(route) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Veronica Hub",
        "item": data.site.origin + "/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": route.h1,
        "item": absoluteUrl(route.path)
      }
    ]
  };
}

function faqSchema(route) {
  if (route.path !== "/faq/") return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

function pageHtml(route) {
  const schemas = [breadcrumbSchema(route), faqSchema(route)].filter(Boolean);
  const schemaTags = schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(route.title)}</title>
  <meta name="description" content="${escapeHtml(route.description)}" />
  <link rel="canonical" href="${escapeHtml(absoluteUrl(route.path))}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(route.title)}" />
  <meta property="og:description" content="${escapeHtml(route.description)}" />
  <meta property="og:image" content="${escapeHtml(data.site.origin)}/assets/official/capcom-veronica-ogp.png" />
  <meta name="twitter:card" content="summary_large_image" />
  ${schemaTags}
</head>
<body>
  <noscript>${routeBody(route)}</noscript>
  <div id="root">${routeBody(route)}</div>
  <script src="${bundlePath}" defer></script>
</body>
</html>
`;
}

function sitemapXml() {
  const urls = data.routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${data.site.lastVerified}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

for (const route of data.routes) {
  const output = routeOutputPath(route.path);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, pageHtml(route));
}

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemapXml());
console.log(`Rendered ${data.routes.length} routes and sitemap.xml`);
```

Expected:

```text
The script creates HTML files for every route and writes sitemap.xml.
```

- [ ] **Step 3: Update `package.json` scripts**

Modify scripts to:

```json
{
  "scripts": {
    "build:js": "esbuild \"designs/veronica-hub/app.jsx\" --bundle --format=iife --minify --outfile=\"designs/veronica-hub/app.bundle.js\"",
    "build:pages": "node scripts/render-static-pages.mjs",
    "validate": "node scripts/validate-site.mjs",
    "build": "npm run build:js && npm run build:pages && npm run validate"
  }
}
```

Expected:

```text
npm run build now builds the React bundle, renders static pages and runs validation.
```

- [ ] **Step 4: Run static page generation before validation exists**

Run:

```bash
npm run build:js
node scripts/render-static-pages.mjs
```

Expected:

```text
designs/veronica-hub/app.bundle.js is generated.
Rendered 15 routes and sitemap.xml
```

- [ ] **Step 5: Inspect route output**

Run:

```bash
node -e "for (const f of ['index.html','faq/index.html','characters/index.html','pc-requirements/index.html','media/index.html']) { const html=require('fs').readFileSync(f,'utf8'); console.log(f, html.includes('<h1>'), html.includes('application/ld+json')); }"
```

Expected:

```text
index.html true true
faq/index.html true true
characters/index.html true true
pc-requirements/index.html true true
media/index.html true true
```

- [ ] **Step 6: Commit**

Run:

```bash
git add package.json scripts/render-static-pages.mjs index.html sitemap.xml release-date platforms trailer story characters faq sources pc-requirements preorder demo editions original-vs-remake media changelog designs/veronica-hub/app.bundle.js
git commit -m "feat: generate source-backed static pages"
```

Expected:

```text
Commit succeeds with generated routes and updated scripts.
```

## Task 3: Add Site Validation Script

**Files:**

- Create: `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/validate-site.mjs`
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/package.json`

- [ ] **Step 1: Create `scripts/validate-site.mjs`**

Use this implementation shape:

```js
import fs from "node:fs";
import path from "node:path";
import data from "../content/site-data.json" assert { type: "json" };

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function routeOutputPath(routePath) {
  if (routePath === "/") return path.join(root, "index.html");
  return path.join(root, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

for (const route of data.routes) {
  const file = routeOutputPath(route.path);
  if (!fs.existsSync(file)) {
    fail(`Missing route output: ${route.path}`);
    continue;
  }

  const html = read(file);
  if (!html.includes(`<title>${route.title}</title>`)) fail(`Missing exact title for ${route.path}`);
  if (!html.includes(`name="description"`)) fail(`Missing description for ${route.path}`);
  if (!html.includes(`<h1>${route.h1}</h1>`)) fail(`Missing h1 for ${route.path}`);
  if (!html.includes(`href="${data.site.origin}${route.path}"`)) fail(`Missing canonical for ${route.path}`);
  if (!html.includes("application/ld+json")) fail(`Missing JSON-LD for ${route.path}`);
  if (!html.includes("Last verified") && !html.includes("Last checked")) fail(`Missing verification copy for ${route.path}`);
}

const faqHtml = read(routeOutputPath("/faq/"));
if (!faqHtml.includes('"@type":"FAQPage"')) fail("FAQ page is missing FAQPage schema");

const sitemap = read(path.join(root, "sitemap.xml"));
for (const route of data.routes) {
  if (!sitemap.includes(`${data.site.origin}${route.path}`)) fail(`Sitemap missing ${route.path}`);
  if (!sitemap.includes(`<lastmod>${data.site.lastVerified}</lastmod>`)) fail(`Sitemap lastmod mismatch for ${route.path}`);
}

for (const media of data.media) {
  const assetPath = path.join(root, media.src.replace(/^\//, ""));
  if (!fs.existsSync(assetPath)) fail(`Missing media asset: ${media.src}`);
}

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`validate-site ok: ${data.routes.length} routes, ${data.claims.length} claims, ${data.media.length} media records`);
```

Expected:

```text
The script exits 1 and prints exact failures when route metadata, schema, sitemap entries or assets are missing.
```

- [ ] **Step 2: Run validation before all generated pages are complete**

Run:

```bash
npm run validate
```

Expected if Task 2 output is complete:

```text
validate-site ok: 15 routes, at least 12 claims, at least 11 media records
```

Expected if Task 2 output is incomplete:

```text
Validation prints exact missing route, schema, sitemap or asset failures.
```

- [ ] **Step 3: Commit**

Run:

```bash
git add scripts/validate-site.mjs package.json
git commit -m "test: validate generated site output"
```

Expected:

```text
Commit succeeds with validation script and package script updates.
```

## Task 4: Make React Route-Specific

**Files:**

- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.jsx`

- [ ] **Step 1: Replace hard-coded route list with data-backed route list**

Implementation requirement:

```js
const knownPaths = new Set(siteData.routes.map((route) => route.path));
```

Expected:

```text
Adding a route in content/site-data.json makes the route valid in the React app without editing knownPaths by hand.
```

- [ ] **Step 2: Render dedicated page content for new sections**

Add route components for:

```text
PcRequirementsPage
PreorderPage
DemoPage
EditionsPage
CharactersPage
OriginalVsRemakePage
MediaPage
ChangelogPage
FaqPage
```

Each page must render:

- Hero or compact page header
- Verification block
- Claims relevant to the page
- Source links
- Official media only when it supports the page content

Expected visible page behavior:

```text
/faq/ shows FAQ content, not the same homepage sequence.
/characters/ separates remake-confirmed details from original-game context.
/pc-requirements/ says requirements are not officially confirmed and links Steam.
/preorder/ says preorder status is not officially confirmed and tracks stores.
/demo/ says demo status is not officially confirmed.
/editions/ says editions and pricing are not officially confirmed.
/media/ shows official screenshots and source labels.
/changelog/ shows dated source and site changes.
```

- [ ] **Step 3: Keep the homepage focused**

Homepage section order:

```text
Hero
Dossier Status
Latest Verification
Quick Facts
Official Trailer
Official Media Preview
Key Route Cards
Sources Preview
```

Expected:

```text
Homepage no longer feels like every page stacked together.
Users can reach deeper pages from clear route cards.
The existing lead hero background image remains unchanged.
```

- [ ] **Step 4: Place official monster and character material in context**

Placement rules:

```text
Homepage: one strong lead image only, plus restrained media preview.
Characters page: character portraits or official character-related screenshots.
Story page: Rockfort Island, Umbrella, and setting screenshots.
Media page: full official gallery.
Trailer page: poster and playable official YouTube embed.
```

Expected:

```text
Official monster imagery supports story, trailer or media sections and does not compete with the homepage heroine background.
```

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected:

```text
Build exits 0.
validate-site ok: 15 routes, at least 12 claims, at least 11 media records
```

- [ ] **Step 6: Commit**

Run:

```bash
git add designs/veronica-hub/app.jsx designs/veronica-hub/app.bundle.js index.html sitemap.xml release-date platforms trailer story characters faq sources pc-requirements preorder demo editions original-vs-remake media changelog
git commit -m "feat: add route-specific dossier pages"
```

Expected:

```text
Commit succeeds with app and generated route updates.
```

## Task 5: Improve SEO And Schema Coverage

**Files:**

- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/scripts/render-static-pages.mjs`
- Modify generated output route files
- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/sitemap.xml`

- [ ] **Step 1: Add WebSite schema to homepage**

Required schema:

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Veronica Hub",
  "url": "https://veronica-hub.vercel.app/",
  "description": "Source-backed Resident Evil Veronica information hub."
}
```

Expected:

```text
Homepage includes BreadcrumbList and WebSite JSON-LD.
```

- [ ] **Step 2: Add FAQPage schema only to `/faq/`**

Expected:

```text
/faq/ contains `"@type":"FAQPage"`.
No non-FAQ page contains `"@type":"FAQPage"`.
```

- [ ] **Step 3: Add ItemList schema to `/media/`**

Expected:

```text
/media/ includes an ItemList whose items match content/site-data.json media records.
Every media item has name, image and url.
```

- [ ] **Step 4: Add Article schema to core informational pages**

Apply to:

```text
/release-date/
/platforms/
/pc-requirements/
/preorder/
/demo/
/editions/
/original-vs-remake/
```

Expected:

```text
Each page includes Article JSON-LD with headline, description, dateModified and publisher name "Veronica Hub".
```

- [ ] **Step 5: Validate generated schema**

Run:

```bash
node -e "const fs=require('fs'); for (const f of ['index.html','faq/index.html','media/index.html','release-date/index.html']) { const html=fs.readFileSync(f,'utf8'); const count=(html.match(/application\\/ld\\+json/g)||[]).length; console.log(f, count); }"
```

Expected:

```text
index.html 2
faq/index.html 2
media/index.html 2
release-date/index.html 2
```

- [ ] **Step 6: Commit**

Run:

```bash
git add scripts/render-static-pages.mjs index.html sitemap.xml release-date platforms trailer story characters faq sources pc-requirements preorder demo editions original-vs-remake media changelog
git commit -m "feat: add structured data coverage"
```

Expected:

```text
Commit succeeds with schema-enhanced generated pages.
```

## Task 6: Visual And Content Quality Pass

**Files:**

- Modify: `/Users/lin/PycharmProjects/game-station/veronica-hub/designs/veronica-hub/app.jsx`
- Modify generated output route files through `npm run build`

- [ ] **Step 1: Tighten homepage content**

Homepage copy requirements:

```text
H1: Resident Evil Code Veronica Remake
Primary subcopy: Official title, 2027 release window, platforms, trailer and source notes in one verified dossier.
Trust line: Last verified: 2026-06-10. Exact date: not officially confirmed.
```

Expected:

```text
Homepage first viewport communicates the site promise without requiring scrolling.
```

- [ ] **Step 2: Replace generic card density with route cards**

Route card labels:

```text
Release Date
Platforms
Trailer
PC Requirements
Preorder
Demo
Characters
Official Media
Sources
Changelog
```

Expected:

```text
The homepage points users to specific answers instead of showing every section inline.
```

- [ ] **Step 3: Expand official media usage**

Use existing assets from:

```text
assets/official/capcom-veronica-press-a.png
assets/official/capcom-veronica-press-b.png
assets/official/capcom-veronica-ogp.png
assets/official/steam/steam-capsule.jpg
assets/official/steam/steam-page-bg.jpg
assets/official/steam/steam-trailer-poster.jpg
assets/official/steam/steam-screenshot-01.jpg
assets/official/steam/steam-screenshot-02.jpg
assets/official/steam/steam-screenshot-03.jpg
assets/official/steam/steam-screenshot-04.jpg
assets/official/steam/steam-screenshot-07.jpg
```

Expected:

```text
Every official image appears at least once across the site.
Each image has descriptive alt text when meaningful.
Decorative backdrop images use empty alt text.
```

- [ ] **Step 4: Mobile layout checks**

Run local server:

```bash
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173/
http://localhost:4173/faq/
http://localhost:4173/media/
http://localhost:4173/characters/
```

Expected at 390px wide:

```text
No horizontal scrolling.
Header controls fit.
Hero text does not overlap the background image.
Cards stack cleanly.
Trailer poster is centered and clickable.
Official media images do not crop important subjects aggressively.
```

- [ ] **Step 5: Desktop layout checks**

Use viewport:

```text
1440 x 1100
```

Expected:

```text
Homepage first viewport shows hero, current status and a visible hint of the next section.
Characters, media and source pages look like content pages, not repeated homepage sections.
Cards are aligned and do not nest inside other cards.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add designs/veronica-hub/app.jsx designs/veronica-hub/app.bundle.js index.html sitemap.xml release-date platforms trailer story characters faq sources pc-requirements preorder demo editions original-vs-remake media changelog
git commit -m "feat: refine dossier visual hierarchy"
```

Expected:

```text
Commit succeeds with visual and content hierarchy updates.
```

## Task 7: Deployment And Production Verification

**Files:**

- No source files should change in this task unless production verification exposes a defect.

- [ ] **Step 1: Run full local build**

Run:

```bash
npm run build
```

Expected:

```text
Build exits 0.
validate-site ok: 15 routes, at least 12 claims, at least 11 media records
```

- [ ] **Step 2: Check Git status**

Run:

```bash
git status --short
```

Expected:

```text
No unexpected unstaged edits.
Generated files are either committed or intentionally staged for the deployment commit.
```

- [ ] **Step 3: Push to GitHub**

Run:

```bash
git push origin main
```

Expected:

```text
Push succeeds.
GitHub main contains the latest implementation commits.
```

- [ ] **Step 4: Deploy to Vercel**

Run:

```bash
vercel --prod
```

Expected:

```text
Vercel returns a production deployment URL.
Production URL points to the latest commit.
```

- [ ] **Step 5: Verify production routes**

Run:

```bash
node -e "const routes=['/','/release-date/','/platforms/','/trailer/','/story/','/characters/','/faq/','/sources/','/pc-requirements/','/preorder/','/demo/','/editions/','/original-vs-remake/','/media/','/changelog/']; const origin='https://veronica-hub.vercel.app'; Promise.all(routes.map(async r=>{ const res=await fetch(origin+r); const text=await res.text(); console.log(r, res.status, text.includes('<h1>'), text.includes('application/ld+json')); if(res.status!==200||!text.includes('<h1>')||!text.includes('application/ld+json')) process.exitCode=1; }))"
```

Expected:

```text
/ 200 true true
/release-date/ 200 true true
/platforms/ 200 true true
/trailer/ 200 true true
/story/ 200 true true
/characters/ 200 true true
/faq/ 200 true true
/sources/ 200 true true
/pc-requirements/ 200 true true
/preorder/ 200 true true
/demo/ 200 true true
/editions/ 200 true true
/original-vs-remake/ 200 true true
/media/ 200 true true
/changelog/ 200 true true
```

- [ ] **Step 6: Verify production sitemap**

Run:

```bash
curl -s https://veronica-hub.vercel.app/sitemap.xml | grep -E "pc-requirements|original-vs-remake|changelog|2026-06-10"
```

Expected:

```text
The output includes pc-requirements, original-vs-remake, changelog and 2026-06-10.
```

- [ ] **Step 7: Commit any production fix**

Run only if production verification exposed a defect and a source change was made:

```bash
git add .
git commit -m "fix: address production verification issue"
git push origin main
vercel --prod
```

Expected:

```text
Production verification passes after the fix.
```

## Validation Matrix

Local build:

```bash
npm run build
```

Expected:

```text
esbuild completes.
Static page generation reports 15 routes.
validate-site reports success.
```

Local static server:

```bash
python3 -m http.server 4173
```

Expected:

```text
http://localhost:4173/ renders homepage.
http://localhost:4173/faq/ renders FAQ page.
http://localhost:4173/media/ renders media page.
http://localhost:4173/changelog/ renders changelog page.
```

HTML metadata:

```bash
node -e "const fs=require('fs'); for (const f of ['index.html','faq/index.html','pc-requirements/index.html']) { const h=fs.readFileSync(f,'utf8'); console.log(f, /<title>.+<\\/title>/.test(h), /<meta name=\"description\"/.test(h), /<link rel=\"canonical\"/.test(h)); }"
```

Expected:

```text
index.html true true true
faq/index.html true true true
pc-requirements/index.html true true true
```

Schema:

```bash
node -e "const fs=require('fs'); const faq=fs.readFileSync('faq/index.html','utf8'); const media=fs.readFileSync('media/index.html','utf8'); console.log('faq schema', faq.includes('FAQPage')); console.log('media schema', media.includes('ItemList'));"
```

Expected:

```text
faq schema true
media schema true
```

Asset references:

```bash
node -e "const fs=require('fs'), path=require('path'); const data=JSON.parse(fs.readFileSync('content/site-data.json')); for (const m of data.media) { const p=path.join(process.cwd(), m.src.replace(/^\\//,'')); console.log(m.id, fs.existsSync(p)); }"
```

Expected:

```text
Every printed media record ends with true.
```

Production:

```bash
curl -I https://veronica-hub.vercel.app/
curl -I https://veronica-hub.vercel.app/faq/
curl -I https://veronica-hub.vercel.app/media/
```

Expected:

```text
Each route returns HTTP 200.
```

## Acceptance Criteria

Product:

- The site reads as a verified Resident Evil Veronica dossier, not a generic gaming news page.
- Homepage first viewport clearly communicates release window, platform status, source policy and exact-date uncertainty.
- Users can navigate directly to release date, platforms, trailer, PC requirements, preorder, demo, editions, characters, media, changelog and sources.
- Official media is richer across the site but context-aware, not scattered as decoration.

SEO:

- Every target route has static HTML content before React hydration.
- Every target route has unique title, description, canonical URL and visible H1.
- `/faq/` has FAQPage JSON-LD.
- `/media/` has ItemList JSON-LD.
- Core informational routes have Article JSON-LD.
- `sitemap.xml` contains all target routes with `2026-06-10` lastmod.

Engineering:

- Factual content is centralized in `content/site-data.json`.
- Static route generation is repeatable through `npm run build`.
- Validation failures are explicit and actionable.
- Existing Vercel static deployment remains simple.

Visual:

- The homepage heroine background image is preserved.
- Mobile layout has no horizontal overflow at 390px width.
- Desktop layout at 1440px width shows a polished first viewport and a hint of the next section.
- Trailer video loads after click and does not leave a blank block.
- Official screenshots have useful placement and alt text.

## Rollback Plan

If generated static pages break production:

```bash
git revert HEAD
git push origin main
vercel --prod
```

Expected:

```text
Production returns to the previous static shell.
```

If only a generated route is defective:

```bash
npm run build
npm run validate
git add .
git commit -m "fix: regenerate static route output"
git push origin main
vercel --prod
```

Expected:

```text
Generated output and production deployment match the content model.
```

## Self-Review

Spec coverage:

- Product positioning is covered by Product Positioning, Task 4 and Task 6.
- SEO architecture is covered by Task 2, Task 3 and Task 5.
- More official media is covered by Task 6.
- Vercel and GitHub verification is covered by Task 7.
- Validation expectations are covered by the Validation Matrix and Acceptance Criteria.

Open-gap scan:

- The plan avoids open-ended gaps. Every task has concrete files, commands and expected outcomes.

Type consistency:

- Route objects use `path`, `title`, `description`, `h1`, `section`, `priority` and `changefreq`.
- Claim objects use `id`, `label`, `value`, `status`, `sourceIds`, `lastChecked`, `lastChanged` and `pages`.
- Source objects use `id`, `name`, `type`, `reliability`, `url`, `usedFor` and `lastChecked`.
- Media objects use `id`, `title`, `kind`, `src`, `alt`, `sourceId` and `pages`.
