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
- key interaction events for content improvement

## Non-Goals

P1 does not add:

- display ads
- ad pixels
- invasive behavioral tracking
- user accounts
- cross-site retargeting

## Tracked Events

The site now tracks a small set of first-party interaction events through Vercel Web Analytics custom events:

- `source_click`: official source links opened from source cards or claim references
- `steam_click`: Steam store links opened
- `official_video_click`: YouTube video links opened
- `trailer_play`: embedded official trailer loaded
- `rss_click`: RSS feed opened
- `language_switch`: English/Japanese switch used
- `search_open`: site search opened
- `menu_open`: mobile menu opened

These events avoid accounts, personal forms, cross-site retargeting and raw behavioral replay. Use them only to answer whether users trust the source trail, watch the official trailer, switch language or reach high-intent store/update pages.

## Privacy Position

Keep measurement lightweight and product-focused. The site's trust promise is more important than early monetization.

## Official Reference

https://vercel.com/docs/analytics
