# Historical gaming-site archive

## Source and coverage

The former Veronica Hub gaming site is preserved under `/archive/`, separately from the current tools directory.

- Repository: `ramosvimos/veronica-hub`
- Source commit: [`cd38d50f4317b6eaa20fafd57b62c9c40e1b80b2`](https://github.com/ramosvimos/veronica-hub/commit/cd38d50f4317b6eaa20fafd57b62c9c40e1b80b2)
- Archive capture date: **2026-10-09**
- Latest review date claimed by the original content: **2026-09-08**
- Preserved original route count: **44 of 44**
- Tracked page routes: **22**
- Build-generated routes reconstructed from committed manifests: **22**
- Missing route count: **0**
- Auxiliary historical 404 page: **1**, excluded from the route count
- Referenced local image assets retained: **50**, all byte-identical to the original Git blobs
- Archive file count: **100** (45 HTML, 50 assets, 3 CSS, 1 XML feed, 1 manifest)

This is a source-based historical reconstruction, not a captured live-production deployment. The original pure content transformations and adapted static renderer were used with the committed site, latest-verification, editorial, blog, and blog-batch manifests. The client JavaScript bundle was not rebuilt or carried into the archive. Existing tracked routes were rendered using the same committed build transformations, so the archive includes the full content the original build would generate. Original content dates were preserved. They are historical source metadata, not a new factual verification.

## Safeguards and intentional changes

Every HTML page has a prominent, dated historical notice and a working link back to the current directory. The notice says that the archive is not maintained, that facts may be outdated or inaccurate, and that readers must verify current facts with official sources. Japanese content includes an additional Japanese notice. No game-news claims were newly researched, endorsed, or invented.

- All scripts, including hydration, structured-data scripts, locale redirects, analytics and advertising loaders, were removed.
- Advertising account metadata, preconnect hints, old active-site canonical/alternate links and the unrelated promotional footer backlink were removed.
- Historical links and assets were rewritten into `/archive/`; deliberate current-directory links go to `/`.
- All HTML has `noindex, nofollow, noarchive` and a Content Security Policy that blocks scripts, network connections, frames, forms and objects.
- Images and CSS load locally. Passive source/reference links to outside websites remain historical references; their availability was not checked and must not be treated as current verification.
- The RSS feed retains historical entries and dates, is clearly marked **frozen**, and points into the archive. It does not provide monitoring or updates.
- The archive home includes a native, JavaScript-free disclosure listing all 44 pages. Original native spoiler disclosures remain usable.
- No credentials, account state, current submission workflows or billing functionality are included.

## Integration requirements

`public/` HTML files are served as files by Next.js. Add exact rewrites for each `archivePath` in the manifest to `/archive/{file}`. Use both the slash-normalized public URL and the project's trailing-slash policy consistently. Do not use a catch-all that rewrites asset or feed paths to HTML.

The machine-readable source is `public/archive/archive-manifest.json`:

- `routes[]`: originalPath, archivePath, file, title, originalLastModified and reconstruction provenance.
- `assetReuse[]`: targetPath, original sourcePath, blobSha and bytes for all 50 images. Existing blobs can be referenced directly when publishing a new Git tree in the same repository, without re-uploading image bytes.
- `transformedFiles[]`: rewritten original HTML, CSS and feed files; these need new blobs.
- `createdFiles[]`: the new archive stylesheet and manifest.

The current home, about and privacy routes should remain active directory pages. Redirect only displaced, exclusive gaming routes to their exact archive counterparts. The former contact page can be archived intentionally rather than implying its old address describes a new service. Keep archive URLs out of the active sitemap. Prefer an `X-Robots-Tag: noindex, nofollow, noarchive` response header for all `/archive` responses in addition to the HTML meta tag. Do not block crawling solely through robots.txt if you rely on search engines seeing the noindex directive.

Rewrites, redirects, sitemap behavior and response headers belong to the host application configuration; this archive change does not modify those files. The standalone verifier validates files and links, so HTTP routing still requires an integration smoke test after the rewrites are added.

## Validation

Commands:

```sh
node --no-experimental-webstorage scripts/verify-archive.mjs
npm test -- --run tests/archive.test.ts
npx eslint scripts/verify-archive.mjs tests/archive.test.ts --max-warnings=0
```

Result on 2026-10-09: **pass**. The verifier checked 44 route records, 45 HTML pages, 50 Git-blob asset hashes and **2,984 references**, with zero missing local files, missing local fragments, escaped archive paths, active external resources or executable/tracking content. It found 406 passive external link occurrences; these were classified, not fetched. The dedicated regression test and ESLint also passed.

The verifier checks the active directory home exists in the source tree, but it does not certify production HTTP responses, visual screenshots, external link availability, or current accuracy of archived game information.

## Exact route map

The following array gives the original pathname and new static target for every preserved route. The archive pathname is `/archive` plus `originalPath`.

```json
[
  {
    "originalPath": "/",
    "target": "public/archive/index.html"
  },
  {
    "originalPath": "/ja/",
    "target": "public/archive/ja/index.html"
  },
  {
    "originalPath": "/release-date/",
    "target": "public/archive/release-date/index.html"
  },
  {
    "originalPath": "/platforms/",
    "target": "public/archive/platforms/index.html"
  },
  {
    "originalPath": "/trailer/",
    "target": "public/archive/trailer/index.html"
  },
  {
    "originalPath": "/story/",
    "target": "public/archive/story/index.html"
  },
  {
    "originalPath": "/characters/",
    "target": "public/archive/characters/index.html"
  },
  {
    "originalPath": "/faq/",
    "target": "public/archive/faq/index.html"
  },
  {
    "originalPath": "/sources/",
    "target": "public/archive/sources/index.html"
  },
  {
    "originalPath": "/about/",
    "target": "public/archive/about/index.html"
  },
  {
    "originalPath": "/contact/",
    "target": "public/archive/contact/index.html"
  },
  {
    "originalPath": "/privacy/",
    "target": "public/archive/privacy/index.html"
  },
  {
    "originalPath": "/pc-requirements/",
    "target": "public/archive/pc-requirements/index.html"
  },
  {
    "originalPath": "/preorder/",
    "target": "public/archive/preorder/index.html"
  },
  {
    "originalPath": "/demo/",
    "target": "public/archive/demo/index.html"
  },
  {
    "originalPath": "/editions/",
    "target": "public/archive/editions/index.html"
  },
  {
    "originalPath": "/original-vs-remake/",
    "target": "public/archive/original-vs-remake/index.html"
  },
  {
    "originalPath": "/media/",
    "target": "public/archive/media/index.html"
  },
  {
    "originalPath": "/screenshots/",
    "target": "public/archive/screenshots/index.html"
  },
  {
    "originalPath": "/steam/",
    "target": "public/archive/steam/index.html"
  },
  {
    "originalPath": "/changelog/",
    "target": "public/archive/changelog/index.html"
  },
  {
    "originalPath": "/watchlist/",
    "target": "public/archive/watchlist/index.html"
  },
  {
    "originalPath": "/news/",
    "target": "public/archive/news/index.html"
  },
  {
    "originalPath": "/news/capcom-spotlight-september-2026/",
    "target": "public/archive/news/capcom-spotlight-september-2026/index.html"
  },
  {
    "originalPath": "/gameplay/",
    "target": "public/archive/gameplay/index.html"
  },
  {
    "originalPath": "/enemies/",
    "target": "public/archive/enemies/index.html"
  },
  {
    "originalPath": "/bosses/",
    "target": "public/archive/bosses/index.html"
  },
  {
    "originalPath": "/characters/claire-redfield/",
    "target": "public/archive/characters/claire-redfield/index.html"
  },
  {
    "originalPath": "/characters/chris-redfield/",
    "target": "public/archive/characters/chris-redfield/index.html"
  },
  {
    "originalPath": "/characters/albert-wesker/",
    "target": "public/archive/characters/albert-wesker/index.html"
  },
  {
    "originalPath": "/characters/steve-burnside/",
    "target": "public/archive/characters/steve-burnside/index.html"
  },
  {
    "originalPath": "/characters/alexia-ashford/",
    "target": "public/archive/characters/alexia-ashford/index.html"
  },
  {
    "originalPath": "/characters/alfred-ashford/",
    "target": "public/archive/characters/alfred-ashford/index.html"
  },
  {
    "originalPath": "/blog/",
    "target": "public/archive/blog/index.html"
  },
  {
    "originalPath": "/blog/is-resident-evil-veronica-first-or-third-person/",
    "target": "public/archive/blog/is-resident-evil-veronica-first-or-third-person/index.html"
  },
  {
    "originalPath": "/blog/why-resident-evil-veronica-dropped-code/",
    "target": "public/archive/blog/why-resident-evil-veronica-dropped-code/index.html"
  },
  {
    "originalPath": "/blog/what-to-play-before-resident-evil-veronica/",
    "target": "public/archive/blog/what-to-play-before-resident-evil-veronica/index.html"
  },
  {
    "originalPath": "/blog/claire-redfield-vs-leon-survival-horror/",
    "target": "public/archive/blog/claire-redfield-vs-leon-survival-horror/index.html"
  },
  {
    "originalPath": "/blog/code-veronica-resident-evil-timeline/",
    "target": "public/archive/blog/code-veronica-resident-evil-timeline/index.html"
  },
  {
    "originalPath": "/blog/code-veronica-monsters-explained/",
    "target": "public/archive/blog/code-veronica-monsters-explained/index.html"
  },
  {
    "originalPath": "/blog/code-veronica-vs-code-veronica-x/",
    "target": "public/archive/blog/code-veronica-vs-code-veronica-x/index.html"
  },
  {
    "originalPath": "/blog/rockfort-island-explained/",
    "target": "public/archive/blog/rockfort-island-explained/index.html"
  },
  {
    "originalPath": "/blog/ashford-family-explained/",
    "target": "public/archive/blog/ashford-family-explained/index.html"
  },
  {
    "originalPath": "/blog/code-veronica-beginner-tips/",
    "target": "public/archive/blog/code-veronica-beginner-tips/index.html"
  }
]
```
