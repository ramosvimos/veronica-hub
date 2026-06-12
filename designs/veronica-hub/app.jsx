import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import siteData from "../../content/site-data.json";

const primaryNav = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/media/", "/sources/"];
const utilityRoutes = ["/pc-requirements/", "/preorder/", "/demo/", "/editions/", "/characters/", "/changelog/", "/faq/"];
const routeMap = new Map(siteData.routes.map((route) => [route.path, route]));
const knownPaths = new Set(siteData.routes.map((route) => route.path));
const mediaGalleryIds = [
  "capcom-portrait",
  "capcom-title",
  "capcom-site",
  "steam-capsule",
  "steam-header",
  "trailer-poster",
  "screenshot-01",
  "screenshot-03",
  "screenshot-04",
  "screenshot-05",
  "screenshot-06"
];
const mediaSectionLinks = [
  { href: "#official-gallery", label: "Official Gallery", meta: "Screenshots" },
  { href: "#franchise-timeline", label: "History Timeline", meta: "Series order" },
  { href: "#classic-origins", label: "Classic Origins", meta: "Predecessors" },
  { href: "#reference-games", label: "Reference Games", meta: "Playable context" },
  { href: "#creator-videos", label: "Creator Videos", meta: "Watch clips" }
];

function normalizePath(pathname) {
  if (!pathname || pathname === "") return "/";
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function referenceGameId(game) {
  return `reference-${slugify(game.title || game)}`;
}

function route(path) {
  return routeMap.get(path) || routeMap.get("/");
}

function sourceById(id) {
  return siteData.sources.find((source) => source.id === id);
}

function primarySources() {
  return siteData.sources.filter((source) => !source.type.includes("comparison"));
}

function SourceLinks({ sourceIds }) {
  const sources = sourceIds.map((id) => sourceById(id)).filter(Boolean);
  return (
    <>
      {sources.map((source, index) => (
        <React.Fragment key={source.id}>
          {index > 0 && ", "}
          <a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noopener noreferrer" : undefined}>{source.name}</a>
        </React.Fragment>
      ))}
    </>
  );
}

function claimsForPage(path) {
  const claims = siteData.claims.filter((claim) => claim.pages.includes(path));
  return claims.length ? claims : siteData.claims.slice(0, 6);
}

function mediaForGallery() {
  const mediaById = new Map(siteData.media.map((item) => [item.id, item]));
  const selected = mediaGalleryIds
    .map((id) => mediaById.get(id))
    .filter((item) => item?.pages.includes("/media/"));
  if (selected.length > 0) return selected;
  return siteData.media.filter((item) => item.pages.includes("/media/"));
}

function mediaForPage(path, limit = 6) {
  const media = path === "/media/" ? mediaForGallery() : siteData.media.filter((item) => item.pages.includes(path));
  return media.slice(0, limit);
}

function optimizedImageSrc(src) {
  if (!src.startsWith("/assets/official/") && !src.startsWith("/assets/reference-games/")) return null;
  const filename = src.split("/").pop();
  if (!/\.(jpe?g|png)$/i.test(filename)) return null;
  return `/assets/optimized/${filename.replace(/\.(jpe?g|png)$/i, ".webp")}`;
}

function cssImageValue(src) {
  const optimizedSrc = optimizedImageSrc(src);
  if (!optimizedSrc) return `url("${src}")`;
  const type = /\.png$/i.test(src) ? "image/png" : "image/jpeg";
  return `image-set(url("${optimizedSrc}") type("image/webp"), url("${src}") type("${type}"))`;
}

function OptimizedImage({ src, alt, loading = "lazy" }) {
  const optimizedSrc = optimizedImageSrc(src);
  const image = <img src={src} alt={alt} loading={loading} decoding="async" fetchPriority={loading === "eager" ? "high" : "low"} />;
  if (!optimizedSrc) return image;
  return (
    <picture>
      <source srcSet={optimizedSrc} type="image/webp" />
      {image}
    </picture>
  );
}

function LinkList({ links }) {
  if (!links?.length) return null;
  return (
    <p className="meta">
      {links.map((link, index) => (
        <React.Fragment key={link.url}>
          <a href={link.url} target={link.url.startsWith("http") ? "_blank" : undefined} rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}>{link.label || link.url}</a>
          {index < links.length - 1 && " / "}
        </React.Fragment>
      ))}
    </p>
  );
}

function sortByRelease(items = []) {
  return [...items].sort((a, b) => {
    const aYear = Number.parseInt(a.release, 10) || 0;
    const bYear = Number.parseInt(b.release, 10) || 0;
    return aYear - bYear;
  });
}

function sortTimeline(items = []) {
  return [...items].sort((a, b) => {
    const aYear = Number.parseInt(a.year, 10) || 0;
    const bYear = Number.parseInt(b.year, 10) || 0;
    return aYear - bYear;
  });
}

function originPositionFilter() {
  return new Set([
    "RE1",
    "RE2",
    "RE3",
    "RE0",
    "RE CV",
    "RE4",
    "RE5",
    "RE6",
    "RE7",
    "RE2 Remake",
    "RE3 Remake",
    "RE8",
    "RE4 Remake"
  ]);
}

function Badge({ type, children }) {
  return <span className={`badge ${String(type).toLowerCase()}`}>{children}</span>;
}

function Header({ onSearch, onMenu }) {
  const activePath = normalizePath(window.location.pathname);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Veronica Hub home">
          <span className="mark">VH</span>
          <span className="brand-title">
            <strong>Veronica Hub</strong>
            <span>Source policy active</span>
          </span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {primaryNav.map((path, index) => {
            const item = route(path);
            return (
              <a key={path} className={activePath === path ? "active" : ""} href={path}>
                <span className="nav-code">FILE {String(index + 1).padStart(2, "0")}</span>
                <span className="nav-label">{item.navLabel}</span>
              </a>
            );
          })}
        </nav>
        <div className="top-actions">
          <button className="utility-button" type="button" onClick={onSearch}>Search files</button>
          <a className="latest-pill" href="/sources/">Source Policy</a>
          <button className="utility-button small" type="button" onClick={onSearch}>Find</button>
          <button className="utility-button small" type="button" onClick={onMenu}>Menu</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const release = siteData.claims.find((claim) => claim.id === "release-window");
  const exactDate = siteData.claims.find((claim) => claim.id === "exact-release-date");
  return (
    <section className="hero" id="home">
      <div className="hero-grid container">
        <div className="hero-copy">
          <span className="hero-kicker">Source-backed remake dossier</span>
          <div className="chip-row">
            <span className="chip cyan">Official sources only</span>
            <span className="chip red">No fake dates</span>
            <span className="chip">Independent fan-made hub</span>
          </div>
          <h1>Resident Evil <span>Code Veronica</span> Remake</h1>
          <p className="hero-subtitle">{route("/").intro}</p>
          <div className="cta-row">
            <a className="btn primary" href="/release-date/">Release Date</a>
            <a className="btn secondary" href="/trailer/">Watch Trailer</a>
            <a className="btn secondary" href="/media/">Official Media</a>
          </div>
          <p className="trust-note">LAST VERIFIED: {siteData.site.lastVerified} / RELEASE WINDOW: {release?.value || "2027"} / EXACT DATE: {exactDate?.value || "Not officially confirmed"}</p>
        </div>
        <aside className="hero-dossier" aria-label="Current dossier status">
          <DossierPanel />
        </aside>
      </div>
    </section>
  );
}

function DossierPanel() {
  const statusRows = [
    ["File status", "announcement-status"],
    ["Release window", "release-window"],
    ["Platforms", "confirmed-platforms"],
    ["Exact date", "exact-release-date"],
    ["PC specs", "pc-requirements"]
  ];
  return (
    <div className="dossier-panel">
      <div className="panel-header">
        <h2>Dossier Status</h2>
        <span className="panel-code">VH-2027</span>
      </div>
      <dl className="status-list">
        {statusRows.map(([label, claimId]) => {
          const claim = siteData.claims.find((item) => item.id === claimId);
          return (
            <div className="status-row" key={claimId}>
              <dt>{label}</dt>
              <dd>
                <Badge type={claim?.status || "unknown"}>{claim?.status || "unknown"}</Badge>
                <span>{claim?.value || "Not officially confirmed"}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function SectionHeading({ kicker, title, children }) {
  return (
    <div className="section-heading">
      <span className="kicker">{kicker}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function RouteCards() {
  const cards = ["/release-date/", "/platforms/", "/trailer/", "/pc-requirements/", "/preorder/", "/demo/", "/characters/", "/media/", "/changelog/"];
  return (
    <section className="section tight" id="answers">
      <div className="container">
        <SectionHeading kicker="Answer routes" title="Open The Right File">Each route owns one question and keeps confirmed, reported and unknown details separate.</SectionHeading>
        <div className="route-card-grid">
          {cards.map((path, index) => {
            const item = route(path);
            return (
              <a className="card route-card" href={path} key={path}>
                <div className="route-card-top">
                  <span className="eyebrow">FILE {String(index + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true">Open</span>
                </div>
                <div>
                  <h3>{item.navLabel}</h3>
                  <p>{item.intro}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LatestVerification() {
  return (
    <section className="section tight" id="latest">
      <div className="container content-grid">
        <article className="card">
          <SectionHeading kicker="Latest verification" title="No Rumor-First Updates" />
          <div className="article-copy">
            {route("/").body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
        <aside className="verification-policy">
          <span className="eyebrow">Verification policy</span>
          <h3>Unknown Means Unknown</h3>
          <p>Exact release date, demo, preorder, editions, price and PC requirements stay unknown until official sources change them.</p>
          <a className="source-link" href="/sources/">Read source policy</a>
        </aside>
      </div>
    </section>
  );
}

function QuickFacts({ path = "/" }) {
  return (
    <section className="section tight" id="facts">
      <div className="container">
        <SectionHeading kicker="Claim grid" title="Current Facts">Claims are centralized in the content model and tied to source records.</SectionHeading>
        <div className="facts-grid">
          {claimsForPage(path).slice(0, 6).map((claim, index) => (
            <article className="card fact-card" key={claim.id}>
              <div className="slot-top">
                <span className="eyebrow">SLOT {String(index + 1).padStart(2, "0")}</span>
                <Badge type={claim.status}>{claim.status}</Badge>
              </div>
              <div>
                <h3>{claim.label}</h3>
                <div className="value">{claim.value}</div>
              </div>
              <p className="meta">Last checked: {claim.lastChecked}<br />Sources: <SourceLinks sourceIds={claim.sourceIds} /></p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfficialVideoTerminal() {
  const [loaded, setLoaded] = React.useState(false);
  const poster = siteData.media.find((item) => item.id === "trailer-poster");
  return (
    <div className="terminal official-video-terminal">
      <div className="terminal-chrome">
        <span className="rec-dot" aria-hidden="true"></span>
        <span>Official Trailer</span>
        <span>{siteData.trailer.channel}</span>
      </div>
      <div className="terminal-screen">
        {loaded ? (
          <iframe src={`${siteData.trailer.embedUrl}&autoplay=1`} title={siteData.trailer.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        ) : (
          <button className="trailer-poster-button" type="button" onClick={() => setLoaded(true)} aria-label={`Load official trailer: ${siteData.trailer.title}`}>
            <OptimizedImage src={poster.src} alt="" />
            <span className="play-core" aria-hidden="true">▶</span>
            <span className="trailer-cta-text">Watch official trailer</span>
          </button>
        )}
      </div>
      <div className="trailer-source-line">
        <span>Source: {siteData.trailer.channel}</span>
        <span>Last verified: {siteData.site.lastVerified}</span>
        <a href={siteData.trailer.watchUrl} target="_blank" rel="noopener noreferrer">Open on YouTube</a>
      </div>
    </div>
  );
}

function TrailerPreview() {
  return (
    <section className="section" id="trailer">
      <div className="container">
        <SectionHeading kicker="Video terminal" title="Official Trailer">The embed loads only after click. Visual interpretation does not become a factual claim without source support.</SectionHeading>
        <OfficialVideoTerminal />
      </div>
    </section>
  );
}

function MediaPreview() {
  const media = siteData.media.filter((item) => ["steam-capsule", "screenshot-01", "screenshot-02", "screenshot-03", "screenshot-07", "capcom-title"].includes(item.id));
  return (
    <section className="section" id="media-preview">
      <div className="container">
        <SectionHeading kicker="Official media" title="Visual Archive Preview">Official screenshots are placed as source material and expanded on the media page.</SectionHeading>
        <div className="media-reference-grid">
          {media.slice(0, 6).map((item) => <MediaFrame item={item} key={item.id} />)}
        </div>
      </div>
    </section>
  );
}

function MediaFrame({ item }) {
  const source = sourceById(item.sourceId);
  const fitContain = item.kind.includes("art") || item.kind.includes("store");
  return (
    <article className={`official-media-frame ${fitContain ? "fit-contain" : ""}`}>
      <div className="media-label">
        <span>{item.kind}</span>
        <Badge type="official">Verified</Badge>
      </div>
      <OptimizedImage src={item.src} alt={item.alt} />
      <div className="media-copy">
        <h3>{item.title}</h3>
        <p className="meta">Source: {source?.name || "Official source"}<br />Last verified: {source?.lastChecked || siteData.site.lastVerified}</p>
      </div>
    </article>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <LatestVerification />
      <QuickFacts path="/" />
      <RouteCards />
      <TrailerPreview />
      <MediaPreview />
      <SourcesPreview />
    </>
  );
}

function SourcesPreview({ expanded = false }) {
  const sources = expanded ? primarySources() : primarySources().slice(0, 3);
  return (
    <section className="section" id="sources">
      <div className="container">
        <SectionHeading kicker="Evidence locker" title="Sources & Verification">Official sources, store listings and site policy records support each claim.</SectionHeading>
        <div className="source-grid">
          {sources.map((source) => (
            <article className="card source-card" key={source.id}>
              <span className="eyebrow">{source.type} / {source.reliability}</span>
              <h3>{source.name}</h3>
              <p>{source.usedFor}</p>
              <p className="meta">Last checked: {source.lastChecked}</p>
              <a className="source-link" href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noopener noreferrer" : undefined}>Open source</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DeveloperPublisherSection() {
  const profile = siteData.developerPublisherProfile;
  return (
    <section className="section tight">
      <div className="container">
        <SectionHeading kicker="Company file" title="Developer & Publisher">Resident Evil Veronica lists Capcom as both the developer and publisher.</SectionHeading>
        <article className="verification-policy">
          <span className="eyebrow">{profile.company}</span>
          <h3>Why the two roles matter</h3>
          <p>{profile.summary}</p>
          <p className="meta">Reference links: <SourceLinks sourceIds={profile.sourceIds} /></p>
        </article>
        <div className="source-grid" style={{ marginTop: 16 }}>
          {profile.representativeWorks.map((work) => (
            <article className="card source-card" key={work.name}>
              <span className="eyebrow">{work.type}</span>
              <h3>{work.name}</h3>
              <p>{work.whyItMatters}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageHero({ routeInfo }) {
  const leadMedia = mediaForPage(routeInfo.path, 1)[0] || siteData.media.find((item) => item.id === "steam-page-bg");
  const style = leadMedia ? { "--page-image": cssImageValue(leadMedia.src) } : undefined;
  return (
    <section className="page-hero" style={style}>
      <div className="page-hero-inner">
        <span className="hero-kicker">{siteData.site.tagline}</span>
        <h1>{routeInfo.h1}</h1>
        <p className="page-lede">{routeInfo.intro}</p>
        <p className="trust-note">Last verified: {siteData.site.lastVerified}</p>
      </div>
    </section>
  );
}

function TextPage({ routeInfo, children }) {
  return (
    <>
      <PageHero routeInfo={routeInfo} />
      <section className="section">
        <div className="container content-grid">
          <article className="card article-copy">
            {routeInfo.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
          <aside className="verification-policy">
            <span className="eyebrow">Verification</span>
            <h3>Source Status</h3>
            <p>Claims on this page are generated from the content model and last verified on {siteData.site.lastVerified}.</p>
            <a className="source-link" href="/sources/">View sources</a>
          </aside>
        </div>
      </section>
      <QuickFacts path={routeInfo.path} />
      {children}
      <ContextMedia path={routeInfo.path} />
    </>
  );
}

function PcEstimateSection() {
  const estimate = siteData.pcRequirementEstimate;
  return (
    <section className="section tight">
      <div className="container">
        <SectionHeading kicker="Speculative estimate" title="PC Prep Range">This is not official. It is a cautious preparation range based on nearby official Steam requirement listings.</SectionHeading>
        <article className="verification-policy">
          <span className="eyebrow">{estimate.status} / last reviewed {estimate.lastReviewed}</span>
          <h3>Official Veronica specs are still TBD</h3>
          <p>{estimate.warning}</p>
          <p>{estimate.basis}</p>
          <p className="meta">Basis links: <SourceLinks sourceIds={estimate.sourceIds} /></p>
        </article>
        <div className="facts-grid" style={{ marginTop: 16 }}>
          {estimate.tiers.map((tier) => (
            <article className="card fact-card" key={tier.name}>
              <div className="slot-top">
                <span className="eyebrow">{tier.confidence}</span>
                <Badge type={tier.confidence.includes("unknown") ? "unknown" : "reported"}>Estimate</Badge>
              </div>
              <div>
                <h3>{tier.name}</h3>
                <p><strong>OS:</strong> {tier.os}</p>
                <p><strong>CPU:</strong> {tier.cpu}</p>
                <p><strong>Memory:</strong> {tier.memory}</p>
                <p><strong>GPU:</strong> {tier.gpu}</p>
              </div>
              <p className="meta">{tier.notes}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContextMedia({ path }) {
  const media = mediaForPage(path, path === "/media/" ? 30 : 6);
  if (!media.length || path === "/media/") return null;
  return (
    <section className="section">
      <div className="container">
        <SectionHeading kicker="Context media" title="Official Visual References">Images are shown only when they support this page's topic.</SectionHeading>
        <div className="media-gallery">
          {media.map((item) => <MediaCard item={item} key={item.id} />)}
        </div>
      </div>
    </section>
  );
}

function MediaCard({ item }) {
  const source = sourceById(item.sourceId);
  return (
    <figure className="card media-card">
      <OptimizedImage src={item.src} alt={item.alt} />
      <figcaption>
        <strong>{item.title}</strong>
        <span>{item.kind} / {source?.name || "Official source"}</span>
      </figcaption>
    </figure>
  );
}


function ReferenceMediaGallery({ game }) {
  if (!game.media?.length) return null;
  return (
    <div className="reference-media-strip">
      {game.media.map((item) => (
        <figure className="reference-media-item" key={`${item.src}-${item.label}`}>
          <OptimizedImage src={item.src} alt={item.alt || item.label} loading="lazy" />
          <figcaption>
            <strong>{item.label}</strong>
            <span>{item.source || "Official image"}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function MediaSectionNav() {
  return (
    <section className="section section-compact" aria-label="Media page sections">
      <div className="container">
        <div className="section-jump-nav">
          {mediaSectionLinks.map((item, index) => (
            <a href={item.href} key={item.href}>
              <span className="nav-code">SEC {String(index + 1).padStart(2, "0")}</span>
              <strong>{item.label}</strong>
              <span>{item.meta}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReferenceGameSelect({ games }) {
  if (!games.length) return null;
  return (
    <div className="timeline-tools">
      <label htmlFor="reference-game-jump">Jump to resource card</label>
      <select id="reference-game-jump" className="jump-select" defaultValue="" onChange={(event) => {
        if (event.target.value) window.location.hash = event.target.value;
      }}>
        <option value="" disabled>Choose a game</option>
        {games.map((game) => (
          <option value={referenceGameId(game)} key={`${game.title}-${game.release}`}>{game.release} / {game.title}</option>
        ))}
      </select>
    </div>
  );
}

function PlatformsPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <SectionHeading kicker="Confirmed access" title="Platform Files">Platform support is confirmed separately from store-specific features.</SectionHeading>
          <div className="platform-grid">
            {siteData.platforms.map((platform) => (
              <article className="card platform-card" key={platform.id}>
                <div className="platform-chip-row"><span>{platform.short}</span></div>
                <div>
                  <Badge type={platform.status}>{platform.status}</Badge>
                  <h3>{platform.name}</h3>
                  <p>{platform.note}</p>
                  <p className="meta">Sources: {platform.sourceIds.map((id) => sourceById(id)?.name).filter(Boolean).join(", ")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TextPage>
  );
}

function TrailerPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <OfficialVideoTerminal />
        </div>
      </section>
    </TextPage>
  );
}

function PcRequirementsPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <PcEstimateSection />
    </TextPage>
  );
}

function CharactersPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <SectionHeading kicker="Personnel files" title="Character Status">Original-game context is useful, but it is not automatically remake-confirmed.</SectionHeading>
          <div className="character-grid">
            {siteData.characters.map((character) => (
              <article className="card character-card" key={character.name}>
                <div>
                  <Badge type={character.status}>{character.status}</Badge>
                  <h3>{character.name}</h3>
                  <p><strong>{character.role}</strong></p>
                </div>
                <p>{character.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TextPage>
  );
}

function FaqPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <SectionHeading kicker="Fast answers" title="FAQ">The visible FAQ matches the generated FAQPage schema.</SectionHeading>
          <div className="faq-list">
            {siteData.faq.map((item) => (
              <article className="card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </TextPage>
  );
}

function SourcesPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <DeveloperPublisherSection />
      <SourcesPreview expanded />
    </TextPage>
  );
}

function MediaPage({ routeInfo }) {
  const timeline = sortTimeline(siteData.gameHistoryTimeline || []);
  const sortedGames = sortByRelease(siteData.referenceGames || []);
  const referenceHrefByTitle = new Map(sortedGames.map((game) => [game.title, `#${referenceGameId(game)}`]));
  const origins = sortedGames.filter((game) => originPositionFilter().has(game.position));

  return (
    <>
      <PageHero routeInfo={routeInfo} />
      <MediaSectionNav />
      <section className="section" id="official-gallery">
        <div className="container">
          <SectionHeading kicker="Official gallery" title="Source-Labeled Media">Every image below is an official asset already present in the repository.</SectionHeading>
          <div className="media-gallery">
            {mediaForPage(routeInfo.path, 30).map((item) => <MediaCard item={item} key={item.id} />)}
          </div>
        </div>
      </section>
      {timeline.length > 0 ? (
        <section className="section" id="franchise-timeline">
          <div className="container">
            <SectionHeading kicker="Franchise timeline" title="How RE Gameplay Evolved">Use this timeline to see which design shift connects to Veronica expectations.</SectionHeading>
            <ReferenceGameSelect games={sortedGames} />
            <div className="timeline-list">
              {timeline.map((entry) => {
                const resourceHref = referenceHrefByTitle.get(entry.title);
                return (
                  <article className="card" key={`${entry.year}-${entry.title}`}>
                    <p className="eyebrow">{entry.year}</p>
                    <h3>{entry.title}</h3>
                    <p>{entry.event}</p>
                    <p className="meta">Impact: {entry.impact}</p>
                    {entry.note && <p className="meta">Note: {entry.note}</p>}
                    {resourceHref && <a className="source-link" href={resourceHref}>Open resource card</a>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      {origins.length > 0 ? (
        <section className="section" id="classic-origins">
          <div className="container">
            <SectionHeading kicker="Classic origins" title="Key Predecessor Line for Veronica">These are the nodes most directly used for playable pacing and origin context comparisons.</SectionHeading>
            <div className="source-grid">
              {origins.map((game) => (
                <article className="card source-card" key={`${game.title}-${game.position}`}>
                  <span className="eyebrow">{game.position} / {game.release}</span>
                  <h3>{game.title}</h3>
                  <p><strong>Story context:</strong> {game.storyContext}</p>
                  <p className="meta">Why it matters: {game.whyReference}</p>
                  <p className="meta">Origin: {game.origin}</p>
                  <p className="meta">Playable traits: {game.playability}</p>
                  <LinkList links={game.links} />
                  <LinkList links={game.clips} />
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {siteData.referenceGames?.length > 0 ? (
        <section className="section" id="reference-games">
          <div className="container">
            <SectionHeading kicker="Reference Game Encyclopedia" title="Reference Game Encyclopedia">Sorted by release year to provide a clear historical line for gameplay comparison.</SectionHeading>
            <div className="source-grid">
              {sortedGames.map((game) => (
                <article className="card source-card" id={referenceGameId(game)} key={`${game.title}-${game.release}`}>
                  <p className="eyebrow">{game.release} / {game.position}</p>
                  <h3>{game.title}</h3>
                  <p className="meta"><strong>Origin:</strong> {game.origin}</p>
                  <p className="meta"><strong>Story context:</strong> {game.storyContext}</p>
                  <p className="meta"><strong>Playability:</strong> {game.playability}</p>
                  <p className="meta"><strong>Why compare:</strong> {game.whyReference}</p>
                  <div className="meta"><strong>Image resources:</strong>
                    <ReferenceMediaGallery game={game} />
                  </div>
                  <div className="meta"><strong>Source links:</strong> {game.links?.length ? <LinkList links={game.links} /> : "None"}</div>
                  <div className="meta"><strong>Clip links:</strong> {game.clips?.length ? <LinkList links={game.clips} /> : "None"}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {siteData.creatorVideos?.length > 0 ? (
        <section className="section" id="creator-videos">
          <div className="container">
            <SectionHeading kicker="Creator picks" title="Big creator videos for first-play vibe">These are for first-impression comparison before the final Veronica decision.</SectionHeading>
            <div className="source-grid">
              {siteData.creatorVideos.map((video) => {
                const links = [
                  { label: video.linkLabel || "Watch channel videos", url: video.url },
                  ...(video.query ? [{ label: "Search related clips", url: video.query }] : [])
                ];
                return (
                  <article className="card source-card" key={`${video.title}-${video.creator}`}>
                    <span className="eyebrow">{video.creator}</span>
                    <h3>{video.title}</h3>
                    <p>{video.context}</p>
                    <p className="meta">Reason: {video.reason}</p>
                    <LinkList links={links} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
      <QuickFacts path="/media/" />
    </>
  );
}

function ChangelogPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <SectionHeading kicker="Dated records" title="What Changed">Changelog entries are quiet unless source or site status changes.</SectionHeading>
          <div className="timeline-list">
            {siteData.changelog.map((entry) => {
              const source = sourceById(entry.sourceId);
              return (
                <article className="card" key={`${entry.date}-${entry.title}`}>
                  <p className="eyebrow">{entry.date} / {entry.type}</p>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  <p className="meta">Source: {source?.name || "Veronica Hub"}<br />Affected claims: {entry.affectedClaims.join(", ")}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </TextPage>
  );
}

function NotFoundPage() {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <span className="hero-kicker">Access denied</span>
        <h1>Lost in the archive.</h1>
        <p className="page-lede">That route is not part of the verified dossier. Return to the source-backed files.</p>
        <div className="cta-row">
          <a className="btn primary" href="/">Return Home</a>
          <a className="btn secondary" href="/sources/">View Sources</a>
        </div>
      </div>
    </section>
  );
}

function PageSwitch({ path }) {
  const routeInfo = route(path);
  if (path === "/") return <HomePage />;
  if (path === "/platforms/") return <PlatformsPage routeInfo={routeInfo} />;
  if (path === "/pc-requirements/") return <PcRequirementsPage routeInfo={routeInfo} />;
  if (path === "/trailer/") return <TrailerPage routeInfo={routeInfo} />;
  if (path === "/characters/") return <CharactersPage routeInfo={routeInfo} />;
  if (path === "/faq/") return <FaqPage routeInfo={routeInfo} />;
  if (path === "/sources/") return <SourcesPage routeInfo={routeInfo} />;
  if (path === "/media/") return <MediaPage routeInfo={routeInfo} />;
  if (path === "/changelog/") return <ChangelogPage routeInfo={routeInfo} />;
  return <TextPage routeInfo={routeInfo} />;
}

function SearchOverlay({ onClose }) {
  const links = [...primaryNav, ...utilityRoutes].map((path) => route(path));
  return (
    <div className="search-overlay" role="dialog" aria-modal="true">
      <div className="search-modal">
        <div className="modal-head">
          <strong>Search files</strong>
          <button className="close-button" type="button" onClick={onClose}>x</button>
        </div>
        <input className="search-input" autoFocus placeholder="Search release date, platforms, trailer..." />
        <div className="suggestions">
          {links.map((item) => <a className="chip" href={item.path} key={item.path}>{item.navLabel}</a>)}
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }) {
  const links = [...primaryNav, ...utilityRoutes].map((path) => route(path));
  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true">
      <aside className="drawer-panel">
        <div className="modal-head">
          <a className="brand" href="/" onClick={onClose}>
            <span className="mark">VH</span>
            <span className="brand-title"><strong>Veronica Hub</strong><span>Menu</span></span>
          </a>
          <button className="close-button" type="button" onClick={onClose}>x</button>
        </div>
        <nav className="drawer-links">
          {links.map((item, index) => <a key={item.path} href={item.path} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{item.navLabel}</a>)}
        </nav>
        <p className="meta">{siteData.site.disclaimer}</p>
      </aside>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand" href="/">
            <span className="mark">VH</span>
            <span className="brand-title"><strong>Veronica Hub</strong><span>Source policy active</span></span>
          </a>
          <p>{siteData.site.disclaimer}</p>
          <p className="meta">{siteData.site.noPiracy}</p>
        </div>
        <nav className="footer-links">
          {primaryNav.slice(1).map((path) => <a key={path} href={path}>{route(path).navLabel}</a>)}
        </nav>
        <nav className="footer-links">
          {utilityRoutes.slice(0, 6).map((path) => <a key={path} href={path}>{route(path).navLabel}</a>)}
        </nav>
      </div>
    </footer>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const currentPath = normalizePath(window.location.pathname);
  const isNotFound = !knownPaths.has(currentPath);

  return (
    <div className="app-shell">
      <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
      <main>{isNotFound ? <NotFoundPage /> : <PageSwitch path={currentPath} />}</main>
      <Footer />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}
      <Analytics />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
