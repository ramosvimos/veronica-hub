# Veronica Hub Blog

The Blog at `/blog/` contains six independently written English features, published September 8, 2026. News remains a separate dated-report collection. Character, gameplay and release pages remain reference pages; none were overwritten.

## First release

- Is Resident Evil Veronica first-person or third-person? The producer's explanation and the limits of a camera label.
- Why Capcom dropped Code from the name. Naming, continuity and the project's place in the series.
- What to play before Veronica. A spoiler-light orientation, not a shopping or completionist checklist.
- Claire versus RE4's Leon. Attributed developer comments separated from editorial design analysis.
- Where Code: Veronica fits in the timeline. Story dates are kept separate from release dates.
- Why Code: Veronica's monsters matter. Original-creature design with two opt-in story-spoiler sections.

## Research and originality

Topics were selected from recurring questions in GameSpot, Nintendo Wire, Famitsu, VGC and TechRadar coverage, plus official store pages and Capcom archives. These are qualitative editorial signals, not verified search volumes, traffic rankings or a claim that these are the six most popular articles. No paid keyword dataset was used.

The text is original analysis and independently organized explanation. Media articles are used for attributed producer statements, not copied or translated as complete articles. June interview dates remain June dates; publication on September 8 is not a new Capcom announcement. We have not played an unreleased build, and none of these posts is a hands-on review. No unconfirmed combat mechanic, playable role or remake enemy roster is presented as fact.

Capcom archive text was readable in indexed search results; some direct archive requests returned access errors. The creature feature explains that limitation. An old archive describes the original game, not a current remake announcement. Major plot-revealing blocks and their consolidated source list use closed native details controls in both static HTML and React.

## Editing and builds

Edit `content/blog.json`. Each `blog` page must be under `/blog/`, have parent `/blog/`, an original title, a topic, publication/review dates and substantive text. Factual blocks use source identifiers; `analysis` labels reasoning, and `editorial` labels reading guidance. Neither should be used to smuggle in unsourced factual claims.

`lib/blog.mjs` merges the new manifest with the existing editorial manifest once, before the normal build. The merge rejects duplicate paths and source identifiers, preserves the original editorial launch date and does not refresh existing evidence dates. The main build restores the original source JSON and removes temporary entries even if a build fails.

The shared editorial renderer supplies the Blog index, six article cards, an actual homepage preview, top navigation, related links, a table of contents and estimated reading time (220 words/minute). Articles have BlogPosting JSON-LD; the Blog index has CollectionPage and ItemList data. Blog posts are not added to the News index. The sitemap includes all new routes. The existing RSS remains the site/source changelog with one clearly labeled Blog launch entry, not six breaking-news events.

Run `npm run build` for the complete site and its existing validators. It also runs `npm test`, including the new `scripts/blog.test.mjs` regression cases. Do not run the legacy low-level render commands alone for a full deployment. No dependencies, API keys, accounts, services or automation schedules were added.
