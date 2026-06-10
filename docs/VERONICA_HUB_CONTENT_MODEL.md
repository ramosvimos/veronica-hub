# Veronica Hub Content Model

Veronica Hub treats factual game information as claims, not decorative copy.

## Source Of Truth

`content/site-data.json` owns routes, claims, sources, platforms, FAQ entries, characters, media records and changelog entries. React rendering and static HTML generation should both read from that file.

## Claim Statuses

- `confirmed`: An official source directly confirms the claim.
- `reported`: A reliable store or platform listing reports the claim, but wording should stay source-scoped.
- `unknown`: Official sources do not confirm the claim yet.

## Source Policy

Primary factual sources are Capcom official material, Steam official store data, platform store pages and official YouTube channels. Rumors, leaks, forum posts and fan speculation can be discussed only when clearly labeled as unconfirmed context.

## Update Workflow

1. Check source pages.
2. Update `content/site-data.json`.
3. Add a changelog entry when a claim, source or page changes.
4. Run `npm run build`.
5. Run `npm run validate`.
6. Check local desktop and mobile views.
7. Deploy to Vercel and run `npm run check:production`.

## Editorial Rules

Do not invent exact release dates, price, editions, demo availability, preorder timing or PC requirements. Unknown details stay unknown until a cited source changes them.
