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
