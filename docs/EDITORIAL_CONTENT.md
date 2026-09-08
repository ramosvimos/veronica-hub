# Editorial content layer

Use `npm run build` for a complete production build. It runs the regression tests, applies `latest-verification.json`, merges `content/editorial.json`, renders the React bundle and static routes, generates the existing RSS feed and sitemap, and runs both validators. No new dependencies, accounts or paid services are required.

## Editing

`content/editorial.json` is the source of truth for news, gameplay, enemy and boss guides and character dossiers. Each page has its own path, publication/review dates, description, reading links and section-level sources. Keep the source event date distinct from the article publication date. Do not refresh old evidence dates just because another article links it.

Use `confirmed` only for the exact remake or announcement fact supported by the cited current source. `reported` is attributed producer reporting. `original` is historical game/archive context, not a remake roster. `editorial` is interpretation or reading guidance, not new factual evidence. Cite community transcripts as transcripts, not official Capcom releases. Search-indexed official archives can be used when their text is visible, but direct availability is not guaranteed and must not be implied.

Plot-revealing blocks need `spoiler: true` and a neutral `spoilerLabel`. The shared renderer uses native closed details in both static HTML and React. Their titles do not appear in the table of contents; the consolidated source list is also gated on pages with spoiler blocks. Do not put spoiler identities in summaries or article descriptions.

## Integration

The existing large React and static templates remain intact. `scripts/editorial-build-adapter.mjs` creates guarded temporary entries alongside them, inserting the new route renderer, navigation, search, article schemas and reading links. Exact-match assertions intentionally fail if a legacy template changes: update the integration contract rather than silently shipping missing routes. Temporary entries and the source JSON are restored in `finally`, including when a build fails. The generated HTML, bundle, sitemap and RSS are the deployment outputs.

`lib/editorial.mjs` owns the merge, validation, escaped article markup, related cards and schema. Both renderers use the same body, preventing evidence and spoiler divergence. The dedicated stylesheet uses the existing site tokens and a clearly editorial archive illustration; it does not impersonate unannounced character art. Original pages, assets, analytics and advertising settings are preserved. New reading pages currently have advertising disabled.

The legacy low-level `build:js`, `build:pages` and `validate` commands operate on the original data; use `npm run build` for the complete site, not those commands in isolation. An eventual template-module refactor can remove the guarded adapter without changing the editorial manifest.

## Scope of the first release

Eleven new routes: one news index, one Spotlight explainer, gameplay, selected enemy and boss dossiers, and Claire, Chris, Wesker, Steve, Alexia and Alfred character guides. This is not a complete original-game bestiary or a remake walkthrough. No subscription backend or automated news publication is enabled. The RSS remains the existing source/site changelog, with a labeled entry for this expansion.
