# Second Veronica blog batch — September 8, 2026

Four additional English features extend the first six posts to ten. The full site now has 44 routes. Existing posts, publication dates, news reports, assets, advertising choices and source-review history are preserved.

## Published articles

- `/blog/code-veronica-vs-code-veronica-x/` — Code Veronica vs Code Veronica X: What Actually Changed?
- `/blog/rockfort-island-explained/` — Rockfort Island Explained: Why Veronica Starts in a Prison
- `/blog/ashford-family-explained/` — The Ashford Family Explained: Names, Umbrella and Code Veronica
- `/blog/code-veronica-beginner-tips/` — Code Veronica Beginner Tips: Saves, Supplies and Common Mistakes

The four articles contain 2,602 English words including section headings and introductions, excluding navigation and source lists. They are original explanations and advice, not copied articles, hands-on reports on the remake, exhaustive genealogies or speedrun routes. Topic choice is editorial, not a measured popularity or keyword-volume ranking.

## Evidence boundaries

The current Capcom announcement and Steam synopsis support remake identification and the Rockfort premise. Classic version differences are attributed to cvxfreak's historical GameFAQs comparison (North America and Japan). Capcom's 2011 post establishes the earlier HD remaster. The save, box, item-check and map facts use Capcom's Xbox 360 manual, read in an archived HTML transcription; the PDF download could not be retrieved, and no button diagram has been transcribed. A linked Muchitsujo walkthrough is attributed community play advice, not official developer guidance.

The official Umbrella, Nosferatu and Alexia archive text was available in indexed official-page results; some direct requests failed. The new Umbrella source records this access limitation. Existing archive dates are not overwritten. Major original-story reveals use closed spoiler blocks and neutral summaries. No geographic coordinates, new combat system, future playable area or unannounced remake scene is inferred from old material.

## Adding the next batch

Keep the launch manifest `content/blog.json` intact. Add reviewed JSON batch manifests under `content/blog-posts/`. Each has version, author, publishedAt, pages, sources and optional siteUpdates. Only new `blog` articles under `/blog/<slug>/` are accepted; the existing index is retained. The normal build discovers regular JSON files in filename order and combines them with the launch manifest before using the existing editorial renderer and validators.

`appendBlogBatches` clones inputs, preserves old posts and sources, rejects conflicting paths or source replacements, validates dates and namespace boundaries, and deduplicates exact repeated batches. The index's launch-specific introduction is replaced with collection-wide wording without changing its publication date. Full article/source/related-route validation remains in the existing editorial pipeline.

Run `npm run build` for the full site. This includes the existing 37 tests plus 12 batch regression tests, both output validators, the React bundle, static pages, sitemap and the original changelog RSS. One clearly labeled Site Update records this batch; it is not published as four breaking-news events. No new dependencies, paid services or automated publication schedules are added.
