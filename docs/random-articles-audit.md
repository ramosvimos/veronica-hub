# Random Animal Picker article audit

Review date: 9 October 2026 (UTC). Publication: Veronica Hub. Deliverable: five original English practical guides, published data in `src/data/articles/random.json`, with matching Markdown exports under `writer/output/`.

## Editorial scope and distinct search intent

| Article | Reader and primary query | Supporting concepts | Structure and outcome |
| --- | --- | --- | --- |
| random-animal-ai-design-prompts | Designers: how to create useful random animal AI design prompts | Creative brief, visual constraints, reference checks, controlled variations | Define deliverable → reference → prompt → comparison → rights → handoff; produce a reviewable design brief |
| random-animal-team-warm-up | Team facilitators: how to run a random animal team warm-up | Optional participation, timebox, quiet preparation, remote collaboration | Objective → preparation → invitation → facilitation → adaptation → transition; produce a bounded workshop activity |
| animal-names-ui-test-fixtures | Frontend developers: how to use animal names for UI test fixtures | Stable identifiers, edge cases, isolation, regression testing | Scope → freeze data → edge cases → automated tests → exploration → demo review; produce a versioned fixture plan |
| random-animal-game-character-prototype | Indie developers/designers: how to prototype a random animal game character | Silhouette, one mechanic, trade-offs, observation | Prototype question → reference roles → mechanic → silhouette → test → rationale; produce a testable character concept |
| animal-prompts-ux-writing-practice | Content designers: how to use animal prompts for UX writing | Action labels, empty states, error recovery, image alternatives | Brief → labels → empty states → errors → image text → review; produce a connected set of microcopy examples |

All guides use direct-answer introductions and concrete original scenarios. Proposed workflows, schedules, names, and examples are editorial exercises, not product features or reports of conducted user studies. There is no recycled anime content. The publication renderer is responsible for the shared ownership disclosure.

## Official-source reading evidence

All links below were opened and their returned page text inspected on 2026-10-09. This verifies published documentation, not an end-to-end interaction test.

- https://randomanimalpicker.com/ — Read the picker controls and explanatory sections. Verified individual/batch selections, animal-type filters, profile links, and the distinction between real-animal picking and the separate fictional hybrid tool. Exact catalog totals were intentionally omitted because they can change.
- https://randomanimalpicker.com/blog/how-to-use-random-animal-generator — Read the full usage guide. Verified documented batch presets (1, 3, 5, 10), current-round no-repeat behavior, entry-level rather than species-level uniqueness, and the need to preserve selected results separately. Those facts support the workshop preparation and fixture-construction guides. No empirical distribution or fairness claim was made.
- https://randomanimalpicker.com/sources — Read the source policy. Verified that the site describes factual attribution and visible creator/license information for photographs. No blanket reuse, commercial-license clearance, or ownership guarantee is asserted.
- https://randomanimalpicker.com/hybrid-animal-generator — Read the controls and FAQ. Verified documented part selection, locking and rerolling, style/world controls, fictional output, potential feature blending, and the ability to explore combinations when image generation is unavailable. No assertion of game-ready exports, exact anatomy, animation, rigging, image-generation availability, or quality guarantees.
- https://randomanimalpicker.com/categories — Read the category directory. Verified that it offers several browsing groupings. Returned page text carried an older crawl timestamp than the current read date, so no category counts, footer pricing, or volatile availability statements were used.
- https://playwright.dev/docs/best-practices — Read testing philosophy and relevant best-practice sections. Verified official recommendations for testing visible behavior, isolating tests, controlling test data, and avoiding uncontrolled third-party dependencies. The animal-fixture workflow is this article’s application of those recommendations, not an official Playwright integration.
- https://www.w3.org/WAI/tutorials/images/decision-tree/ — Read the complete decision tree. Verified that image alternatives depend on function, information, redundancy, and decorative use. The UX exercise points to contextual assessment and does not claim complete WCAG conformance.
- https://randomanimalpicker.com/pricing — Opened during research; pricing and membership details were not used in these articles.

## Deterministic checks

Body counts include introduction, paragraphs, steps, conclusion, and FAQs; they exclude metadata, headings, and source labels.

| Article slug | Body words | SEO title characters | Excerpt characters | Description characters |
| --- | ---: | ---: | ---: | ---: |
| random-animal-ai-design-prompts | 972 | 65 | 159 | 144 |
| random-animal-team-warm-up | 970 | 70 | 158 | 145 |
| animal-names-ui-test-fixtures | 998 | 67 | 156 | 140 |
| random-animal-game-character-prototype | 1017 | 69 | 159 | 148 |
| animal-prompts-ux-writing-practice | 1065 | 67 | 160 | 138 |

Validated: five unique slugs; correct project slug and date; six sections per article; at least one sequence with four or five steps; one conclusion; exactly three FAQs; HTTPS source links; valid JSON; one H1 per Markdown export. Every description is 55–160 characters, SEO title 65–70, and excerpt 155–160. No shared application code was edited.

## Fact-check and final editorial review

- Removed unsupported implications that a picker supplies a public API, deterministic seed, production testing integration, cryptographic randomness, privacy protection, security assurance, audited fairness, or representative scientific samples.
- Kept imagery rights conditional on the actual photograph and use. No product cost claims or promises of generated-image availability were included.
- Marked example tools, reading apps, interface states, and game mechanics as fictional. No fabricated first-person testing, user testimonials, business metrics, quotes, or productivity benefits.
- Revised two overly defensive sentences into direct practical guidance. Read all introductions, transitions, examples, and endings for repetitive phrasing; preserved source qualifications and useful limits.
- Rechecked metadata lengths, date, source URLs, article schema, and certainty after editing. Markdown exports include links next to the major sourced passages in addition to the source list; JSON uses plain text and source objects for the site renderer.
- These are text guides for this release, so no image assets or unfulfilled image references were added. Technical SEO, crawler access, schema, build/render behavior, and live UI actions are outside this content audit and require the publication-level checks.

No unresolved content-level critical or high-priority issue identified. Future maintenance should recheck product documentation before changing feature descriptions, especially if the picker controls or hybrid workflow change.
