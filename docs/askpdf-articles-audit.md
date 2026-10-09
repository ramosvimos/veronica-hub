# AskPDF directory article audit

Review date: 2026-10-09 (UTC). Scope: five original English editorial guides for the current AskPDF directory. These articles do not describe AskPDF as an uploaded-document processor. No product benchmarking, test-upload claims, search-volume estimates, rankings, or invented prices are included.

## Deliverables and validation

- `src/data/articles/askpdf.json`: five complete articles; `projectSlug` is `askpdf-directory` throughout.
- `writer/output/<article-slug>/article.md`: five corresponding complete Markdown exports.
- Each article has a direct answer, six substantive sections, a four-item numbered checklist, a conclusion, three FAQs, dated source labels, and SEO metadata.
- Word counts include title, answer, section headings/body/checklists, conclusion, and FAQs; exclude sources and SEO metadata.
- Text-only scope was explicit. No images, image claims, uploads, or publishing actions were required. No local image-upload configuration exists; no remote configuration was sought.
- Supplemental editorial reference files could not be loaded. The main writing checklist was applied, including a factual review, SEO checks, revision, and final readability/integrity pass.

## Task cards and editorial intent

Shared audience: people choosing document tools; article 5 addresses publishers preparing a submission. Format: practical how-to. Target: 800–1,100 words. Tone: factual, restrained, useful. Outline was prepared before full drafting. Final titles were selected for direct search intent rather than exaggerated benefit claims.

1. Find a PDF tool. Supporting topics: shortlist, processing filters, official sources, representative sample. Outline: define output; filter; compare; verify; test; stop with a decision note. Alternative title considered: “How to Shortlist PDF Tools Before You Test Them.” Selected title directly answers the requested question.
2. Compare PDF tools with unverified pricing. Supporting topics: exact edition, usage limits, billing terms, workflow effort. Outline: workload; label meaning; official pricing; full-job comparison; trial restrictions; uncertainty. Alternative: “A Fair PDF Tool Comparison When Prices Are Missing.” Final title preserves the unverified-pricing search intent.
3. PDF file privacy. Supporting topics: permission, processing location, retention, redaction. Outline: data permission; directory boundary; feature-level processing; terms; minimization; exit path. Alternative: “Before You Upload a PDF: A Practical Privacy Check.” Selected title makes the external-provider boundary explicit.
4. PDF tool stack. Supporting topics: recurring workflow, specialist role, file handoff, duplicate apps. Outline: map jobs; choose core; fill gaps; test handoffs; document defaults; review overlap. Alternative: “Choose Fewer PDF Tools Without Losing Useful Features.” Selected title avoids implying that a smaller stack is always preferable.
5. AskPDF tool-directory listing. Supporting topics: product description, website icon, source evidence, submission route. Outline: representation; required fields; factual copy; free/paid route; preview; private status and maintenance. Alternative: “Prepare an AskPDF Listing Editors Can Verify.” Selected title answers the actual submission task without promising approval.

## Live verification method

Public pages were read with ordinary HTTPS GET requests using curl on 2026-10-09, approximately 16:46–16:47 UTC. The homepage response included HTTP 200 and a server Date header of 2026-10-09 16:46:08 GMT. Each other AskPDF page listed below returned HTTP 200. HTML was parsed to inspect visible page content. Initial web-reader/urllib attempts did not provide usable pages; these failed attempts were not treated as evidence. No authentication, form submission, payment, account creation, or browser interaction was performed.

The actual AskPDF source at `veronica-current-source` was also inspected to understand categories, comparison rows, pagination, and form schema. The destination rebuild contains Veronica Hub code; that separate general-tools directory was deliberately not used as evidence for AskPDF article claims. Source inspection supports the implementation details but is not presented as a live end-to-end test.

## Source and claim ledger

### AskPDF directory

URL: https://askpdf.top/

Read: 2026-10-09. Method: live curl HTTP 200 plus visible HTML inspection.

Verified: 98 tools displayed on that date; first page shows 1–24; task categories include reading, OCR/extraction, conversion, editing/organization, signing/redaction, developer, and other tools; task/search/price/processing controls are visible; compare limit is three; page describes itself as a directory with no document upload required.

Limits: No claim that catalog size will remain constant. No filter interaction, performance test, or external product feature validation was performed. Catalog claims about individual tools were not converted into article endorsements.

HTML SHA-256: `c688842376805e7e2308f81b30296b2cbc33411ed049171cc2fa50413fa5d769`.

### AskPDF comparison

URL: https://askpdf.top/compare

Read: 2026-10-09. Method: live curl HTTP 200; current comparison component inspected separately.

Verified: page asks readers to select at least two and up to three tools. Source defines comparison fields for purpose, pricing, processing, platform, registration, free access, limitations, and official sources.

Limits: Empty comparison page was read; no interactive selection/persistence test was performed. Articles do not claim measured side-by-side performance.

HTML SHA-256: `57ffb352b0d068ed814c4f66d206475d061cbadd57c90bed2bf5a4ea8baad25a`.

### AskPDF editorial policy

URL: https://askpdf.top/editorial-policy

Read: 2026-10-09. Method: live curl HTTP 200.

Verified: source review is distinct from hands-on testing or a security audit; uncertain details are marked; featured order is editorial presentation; processing labels refer to an edition/setup; submissions remain subject to editorial review; catalog initially focuses on PDF tools but other software submissions are eligible.

Limits: Policy is the publisher's statement, not independent confirmation that every listing complies. Reciprocal-link attribute wording conflicts with pricing, as documented below. No article promises an outbound-link attribute for an accepted reciprocal listing.

HTML SHA-256: `2dae20e689b424a1c4c0047c7d159f6b4cdb8d88b2098da9892bc25f7d06013d`.

### AskPDF privacy

URL: https://askpdf.top/privacy

Read: 2026-10-09. Method: live curl HTTP 200.

Verified: public directory has no document-upload or account requirement; searches/filters can appear in URLs; external providers control their own processing; local labels do not guarantee every feature's behavior; submission contact email is not public; guest status links contain access tokens.

Limits: No security audit, retention verification, traffic inspection, or authentication test. Article cautions are practical editorial guidance, not legal or contractual clearance.

HTML SHA-256: `637718e6117c3c8462c2dcff4fac36355ec5b39a1e5b7e1d12e95cd2b483cab5`.

### AskPDF submission form

URL: https://askpdf.top/submit-tool

Read: 2026-10-09. Method: live curl HTTP 200 plus current form/schema inspection.

Verified: required name, product URL, contact email, website icon, description, and representation confirmation; category optional; 10–1,000-character description; PNG/JPG/WebP icon up to 2 MB; optional pricing, processing, reference; free route requires visible reciprocal link on a public page; nofollow incoming link accepted; paid route does not require a reciprocal link; guest/private-status and optional account tracking are described.

Limits: No submission saved, icon uploaded, account created, or email delivered. Client-side form and checkout behavior were not end-to-end tested. Article distinguishes published instructions from verified transaction availability.

HTML SHA-256: `98a67d1c5db2456b55d219b18eef64bfbeb11782a8c8213b1e46345ed55353e4`.

### AskPDF submission pricing

URL: https://askpdf.top/pricing

Read: 2026-10-09. Method: live curl HTTP 200.

Verified public offer: free reciprocal submission; paid US$9.90 one-time USD review without backlink; stated editorial decision within seven business days of confirmed payment; stated full submission-fee refund if rejected; neither route guarantees publication, indexing, rankings, traffic, or sales.

Limits: Checkout, tax treatment, payment availability, completed reviews, and refund fulfillment were not tested. The explicit dollar amount and fixed review window were omitted from article prose to avoid a fast-staling offer; readers are sent to current pricing and payment terms.

HTML SHA-256: `a53ce7f640957f583507edb261cf7abfa5f9a59f8ee60500b8561e12774215f9`.

### Open Source Initiative

URL: https://opensource.org/osd

Read: 2026-10-09. Method: web reader; definition text inspected.

Verified: definition covers redistribution and source-code availability. Article uses this only to distinguish licensing from operating expenses.

Limits: No particular tool's license was analyzed. Equipment, maintenance, and support are possible workflow costs presented as editorial considerations, not OSI price claims.

### Federal Trade Commission

URL: https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business

Read: 2026-10-09. Method: web reader; inventory and service-provider guidance inspected.

Verified: guide recommends understanding sensitive information held by a business and evaluating service-provider security practices. Briefly paraphrased in the file-sharing article.

Limits: General guidance, not a current jurisdiction-specific compliance analysis or a certification of any provider. The article does not imply legal permission to disclose a file.

### Adobe Acrobat Help

URL: https://helpx.adobe.com/acrobat/desktop/protect-documents/redact-pdfs/redact.html

Read: 2026-10-09. Method: web reader; redaction steps inspected, including Apply and sanitize/remove-hidden-information steps.

Verified: Acrobat redaction procedure has an application step and an option to sanitize hidden information before saving. Article distinguishes proper removal from merely obscuring visible content.

Limits: No hands-on Acrobat test or claim that all versions expose identical controls. No particular tool's redaction efficacy or compliance was certified.

## Current policy inconsistency to resolve separately

The pricing page describes a free accepted profile using the phrase: “a nofollow website link”.

The editorial-policy page says: “Their website links are not automatically marked nofollow”.

These conflict for reciprocal submissions. The article makes no assertion about that outbound-link attribute. This is distinct from the consistent statement that a publisher's incoming backlink to AskPDF may use nofollow. Resolving live policy wording is outside this text-only article scope; it was reported for the parent to handle.

## Audit-driven changes and final pass

- Critical: Corrected evidence scope before drafting, using the real PDF-specific AskPDF site instead of Veronica Hub's general catalog.
- High: Omitted merchant dollar amount and fixed review window from prose; retained observed values only in this dated audit.
- High: Removed any promise about reciprocal outbound-link attributes because sources conflict.
- High: Explicitly separated directory browsing, source review, provider uploads, and hands-on verification. No fictional testing experience or results.
- Medium: Adjusted excerpts to 155–160 characters and SEO titles to 65–70 characters. Descriptions remain within 55–160.
- Medium: Each article includes a concrete checklist, limitations, and decision criteria rather than generic benefit copy.
- Readability pass: removed promotional framing; used concrete tasks, varied examples, and direct verbs; retained uncertainty and feature-level qualifications. Hypothetical examples are labeled and contain no invented customer testimony.
- Integrity pass: checked titles, metadata, original slugs, schema fields, dates, source URLs, conclusion, FAQs, numbered steps, export parity, and absence of placeholders.
- Remaining verification limits: no structured-data, canonical, robots, sitemap, crawlability, PageSpeed, live article rendering, or deployment claims are made in this audit.

## Deterministic final results

Final H1/title fields use natural questions matching the assigned reader questions; SEO titles remain within their required character range.

| Article slug | Words | SEO title | Excerpt | Description | Sections | Steps | FAQ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| find-a-pdf-tool-without-testing-every-listing | 997 | 66 | 160 | 136 | 6 | 4 | 3 |
| compare-pdf-tools-when-pricing-is-unverified | 1004 | 67 | 158 | 147 | 6 | 4 | 3 |
| check-before-sharing-files-with-pdf-tools | 1012 | 65 | 160 | 152 | 6 | 4 | 3 |
| build-a-small-pdf-tool-stack-without-overlap | 1020 | 66 | 160 | 149 | 6 | 4 | 3 |
| submit-a-useful-askpdf-tool-directory-listing | 1053 | 65 | 158 | 151 | 6 | 4 | 3 |
