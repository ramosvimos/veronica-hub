import Link from "next/link";
import { getProjectArticles } from "@/data/articles";
import { ArrowUpRight, ArrowRight, Check, Info, BookOpen, Globe, ShieldCheck, Wrench, FileCode2, Layers } from "lucide-react";
import { catalogReviewedOn, pdfCategories, pdfTools, type PdfTool } from "@/data/pdf-catalog";
import { CompareToggle } from "./compare-provider";
import { PdfBreadcrumb, PdfToolCard } from "./pdf-directory";
import { PdfToolIcon, getToolDomain } from "./pdf-tool-icon";
import { pdfToolExternalRel } from "@/lib/pdf-outbound-links";

export function PdfToolDetail({ tool, catalog = pdfTools }: { tool: PdfTool; catalog?: PdfTool[] }) {
  const reviewedOn = tool.reviewedOn || catalogReviewedOn;
  const externalRel = pdfToolExternalRel(tool);
  const needsReview = tool.evidenceStatus === "needs-review";
  const domain = tool.websiteDomain || getToolDomain(tool.url);
  const related = catalog
    .filter((candidate) => candidate.slug !== tool.slug && candidate.categories.some((category) => tool.categories.includes(category)))
    .slice(0, 3);

  return (
    <div className="pdf-container pdf-detail-page">
      <PdfBreadcrumb items={[{ label: "Tools", href: "/search" }, { label: tool.name }]} />

      <div className="pdf-detail-header">
        <div>
          <div className="pdf-detail-title">
            <PdfToolIcon tool={tool} size={56} className="pdf-detail-logo" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0 }}>{tool.name}</h1>
                <span className={`pdf-price ${tool.pricing === "Free" || tool.pricing === "Open source" ? "pdf-price-free" : ""}`}>
                  {tool.pricing}
                </span>
              </div>
              <div className="pdf-detail-badge-row">
                {tool.ownedProject && <Link href="/our-projects" className="pdf-review-status">Our project · shared ownership</Link>}
                {domain && (
                  <a href={tool.url} target="_blank" rel={externalRel} className="pdf-domain-badge">
                    <Globe size={13} aria-hidden="true" />
                    <span>{domain}</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                )}
                <span className="pdf-tool-type" style={{ fontSize: "13px" }}>
                  {pdfCategories.find((category) => category.slug === tool.categories[0])?.name}
                </span>
                {tool.developerOrCompany && (
                  <span style={{ fontSize: "13px", color: "var(--pdf-muted)" }}>
                    · {tool.developerOrCompany}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p>{tool.description}</p>
          <div className="pdf-feature-list">
            {tool.features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </div>
        </div>

        {tool.sourceLinkUnavailable ? (
          <span className="pdf-review-status">Source link unavailable</span>
        ) : (
          <a className="pdf-button" href={tool.url} target="_blank" rel={externalRel}>
            {needsReview ? "Visit website (unverified)" : "Visit official website"}{" "}
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        )}
      </div>

      {tool.reciprocalSubmission && <p className="pdf-evidence-notice">Community submission. The publisher linked to Veronica Hub as part of the free submission option. This is not a performance rating.</p>}{tool.paidSubmission && <p className="pdf-evidence-notice">Paid submission. The publisher paid for submission review. This is not a performance rating or a guarantee of suitability.</p>}
      {needsReview && (
        <p className="pdf-review-status pdf-review-notice">
          This website is included from the research list. Its current product details could not be fully verified. Check availability and terms before using it.
        </p>
      )}

      <div className="pdf-detail-layout">
        <div className="pdf-detail-content">
          {/* Core Tools & Capabilities */}
          {tool.coreTools && tool.coreTools.length > 0 && (
            <section>
              <h2>
                <Wrench size={20} aria-hidden="true" />
                Included tools & capabilities
              </h2>
              <p>Capabilities described by the publisher:</p>
              <div className="pdf-subtools-grid">
                {tool.coreTools.map((subtool) => (
                  <span key={subtool} className="pdf-subtool-pill">
                    {subtool}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Pros & Cons */}
          {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
            <section>
              <h2>
                <Layers size={20} aria-hidden="true" />
                Key advantages & considerations
              </h2>
              <div className="pdf-pros-cons-grid">
                {tool.pros && tool.pros.length > 0 && (
                  <div className="pdf-pro-card">
                    <h3>
                      <Check size={18} aria-hidden="true" />
                      Strengths & highlights
                    </h3>
                    <ul>
                      {tool.pros.map((pro, index) => (
                        <li key={index}>
                          <Check size={16} aria-hidden="true" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {tool.cons && tool.cons.length > 0 && (
                  <div className="pdf-con-card">
                    <h3>
                      <Info size={18} aria-hidden="true" />
                      Things to keep in mind
                    </h3>
                    <ul>
                      {tool.cons.map((con, index) => (
                        <li key={index}>
                          <Info size={16} aria-hidden="true" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Supported File Formats */}
          {tool.supportedFormats && tool.supportedFormats.length > 0 && (
            <section>
              <h2>
                <FileCode2 size={20} aria-hidden="true" />
                Supported file formats
              </h2>
              <p>Supported input and export document formats:</p>
              <div className="pdf-format-badges">
                {tool.supportedFormats.map((format) => (
                  <span key={format} className="pdf-format-badge">
                    {format}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Data Privacy & Security */}
          <section>
            <h2>
              <ShieldCheck size={20} aria-hidden="true" />
              Data handling & privacy
            </h2>
            <div className="pdf-privacy-box">
              <p style={{ margin: 0, fontWeight: 600 }}>
                Processing mode: {tool.processing}
              </p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "var(--pdf-muted)", fontSize: "14px" }}>
                {tool.privacyNotes || (tool.processing === "Local"
                  ? "Review the specific feature and edition before processing private data."
                  : "Retention, training use and deletion rules have not been independently verified here. Read the provider’s privacy documentation.")}
              </p>
            </div>
          </section>

          {/* When it makes sense */}
          <section>
            <h2>
              <Check size={20} aria-hidden="true" />
              When it makes sense
            </h2>
            <p>{tool.bestFor}</p>
          </section>

          {/* Know before you choose */}
          <section>
            <h2>
              <Info size={20} aria-hidden="true" />
              Know before you choose
            </h2>
            <p>{tool.limitation}</p>
          </section>

          {/* Free access & limits */}
          <section>
            <h2>Free access & limits</h2>
            <p>{tool.freeLimits}</p>
            <p className="pdf-small-note">
              Pricing and allowances can change. Confirm them on the publisher’s website before committing.
            </p>
          </section>

          {/* Sources, not guesswork */}
          <section>
            <h2>
              <BookOpen size={20} aria-hidden="true" />
              Sources, not guesswork
            </h2>
            <p>
              {needsReview ? "Review attempted" : "Publisher overview reviewed"}{" "}
              {reviewedOn}. Unconfirmed pricing, limits, and processing information remain marked. This listing has not received a hands-on performance test.
            </p>
            <ul className="pdf-source-list">
              {tool.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel={externalRel}>
                    {source.label}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <Link className="pdf-inline-link" href="/editorial-policy">
              Read our editorial policy <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </section>
        </div>

        {/* Aside Facts Panel */}
        <aside className="pdf-facts-panel">
          <h2>At a glance</h2>
          <dl>
            <div><dt>Pricing model</dt><dd>{tool.pricing}</dd></div>
            <div><dt>Processing</dt><dd>{tool.processing}</dd></div>
            <div><dt>Platform</dt><dd>{tool.platform}</dd></div>
            <div><dt>Registration</dt><dd>{tool.registration}</dd></div>
            {domain && (
              <div>
                <dt>Official website</dt>
                <dd>
                  <a href={tool.url} target="_blank" rel={externalRel} style={{ color: "var(--pdf-teal)", textDecoration: "underline" }}>
                    {domain} ↗
                  </a>
                </dd>
              </div>
            )}
            {tool.developerOrCompany && <div><dt>Developer / Company</dt><dd>{tool.developerOrCompany}</dd></div>}
            <div><dt>Evidence</dt><dd>{needsReview ? "Details need verification" : "Publisher overview"}</dd></div>
            <div><dt>Last reviewed</dt><dd><time dateTime={reviewedOn}>{reviewedOn}</time></dd></div>
          </dl>
          <CompareToggle slug={tool.slug} name={tool.name} />
          <div className="pdf-detail-category-links">
            {tool.categories.map((slug) => (
              <Link href={`/category/${slug}`} key={slug}>
                {pdfCategories.find((category) => category.slug === slug)?.shortName}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {tool.ownedProject && <section className="pdf-related"><h2>Guides for this project</h2><p>Ownership disclosure: this project and Veronica Hub share an owner. These guides are editorial explanations, not independent product reviews.</p><ul>{getProjectArticles(tool.slug).map(article=><li key={article.slug}><Link href={`/blog/${article.slug}`}>{article.title}</Link></li>)}</ul><Link href="/our-projects">See all our projects</Link></section>}
      {/* Related tools */}
      {related.length > 0 && (
        <section className="pdf-related">
          <h2>Other tools for the same task</h2>
          <div className="pdf-tool-grid">
            {related.map((candidate) => (
              <PdfToolCard tool={candidate} key={candidate.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
