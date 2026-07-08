# Baseline Metrics

## Site

- Production URL: https://residentevilveronica.com/
- Baseline start date: 2026-06-10
- Measurement owner: site maintainer
- Analytics source: Vercel Web Analytics page views and custom events
- Search source: Google Search Console

## Day 0

| Metric | Value | Notes |
| --- | ---: | --- |
| Production routes checked | 15 | `npm run check:production` passed on 2026-06-10 |
| Sitemap submitted | 0 | Manual Search Console submission still required |
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
| Indexed pages | 0 | Target: 14 or more if all 18 routes are submitted |
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
| Source clicks | 0 | From `source_click` custom events |
| Trailer plays | 0 | From `trailer_play` custom events |
| Steam clicks | 0 | From `steam_click` custom events |
| Language switches | 0 | From `language_switch` custom events |

## Custom Event Review

| Event | What It Explains | Improvement Action |
| --- | --- | --- |
| `source_click` | Whether visitors verify claims through official links | Move high-trust sources closer to weak pages |
| `trailer_play` | Whether trailer sections create engagement | Improve poster placement or video copy |
| `steam_click` | Whether store-intent pages route users to Steam | Strengthen Steam/status calls to action |
| `official_video_click` | Whether visitors prefer YouTube over embedded playback | Improve video library ordering |
| `rss_click` | Whether update monitoring has demand | Promote watchlist and changelog links |
| `language_switch` | Whether Japanese localization is being used | Expand localized pages if usage is meaningful |
| `search_open` | Whether visitors need navigation help | Add internal links to searched topics |
| `menu_open` | Whether mobile navigation is discoverable | Review mobile nav layout if usage is high but depth is low |

## Interpretation Rules

- If pages are not discovered, inspect sitemap and internal links.
- If pages are discovered but not indexed, improve static content quality and internal links.
- If impressions exist but CTR is weak, test title and description changes.
- If homepage gets all traffic, add stronger internal links to high-intent pages.
