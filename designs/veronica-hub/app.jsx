import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { track } from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/react";
import siteData from "../../content/site-data.json";

const primaryNav = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/media/", "/sources/", "/watchlist/"];
const utilityRoutes = ["/pc-requirements/", "/preorder/", "/demo/", "/editions/", "/characters/", "/screenshots/", "/steam/", "/changelog/", "/faq/"];
const footerUtilityRoutes = ["/pc-requirements/", "/preorder/", "/demo/", "/editions/", "/characters/", "/screenshots/", "/steam/", "/faq/", "/changelog/"];
const footerTrustRoutes = ["/about/", "/contact/", "/privacy/"];
const localizedRoutes = {
  "/": "/ja/",
  "/ja/": "/"
};
const routeMap = new Map(siteData.routes.map((route) => [route.path, route]));
const knownPaths = new Set(siteData.routes.map((route) => route.path));
const mediaGalleryIds = [
  "capcom-portrait",
  "capcom-title",
  "capcom-ogp",
  "capcom-site",
  "steam-capsule",
  "steam-header",
  "steam-page-bg",
  "trailer-poster",
  "screenshot-01",
  "screenshot-02",
  "screenshot-03",
  "screenshot-04",
  "screenshot-05",
  "screenshot-06",
  "screenshot-07"
];
const mediaSpotlightIds = [
  "screenshot-01",
  "screenshot-02",
  "screenshot-03",
  "screenshot-04",
  "screenshot-05",
  "screenshot-06",
  "screenshot-07",
  "trailer-poster"
];
const mediaAssetIds = [
  "capcom-portrait",
  "capcom-title",
  "capcom-site",
  "steam-capsule",
  "steam-header",
  "capcom-ogp",
  "steam-page-bg"
];
const editorialAssetCovers = {
  "capcom-portrait": {
    src: "/assets/editorial/veronica-archive-island.svg",
    alt: "Editorial archive cover showing a dark island shoreline"
  },
  "capcom-title": {
    src: "/assets/editorial/veronica-archive-title.svg",
    alt: "Editorial archive cover showing a red evidence desk"
  },
  "capcom-site": {
    src: "/assets/editorial/veronica-archive-dossier.svg",
    alt: "Editorial archive cover showing a source dossier board"
  },
  "steam-capsule": {
    src: "/assets/editorial/veronica-archive-capsule.svg",
    alt: "Editorial archive cover showing a dark store capsule display"
  },
  "steam-header": {
    src: "/assets/editorial/veronica-archive-header.svg",
    alt: "Editorial archive cover showing a foggy industrial corridor"
  },
  "capcom-ogp": {
    src: "/assets/editorial/veronica-archive-ogp.svg",
    alt: "Editorial archive cover showing a social preview frame"
  },
  "steam-page-bg": {
    src: "/assets/editorial/veronica-archive-background.svg",
    alt: "Editorial archive cover showing an analog tape and monitor glow"
  }
};
const mediaSectionLinks = [
  { href: "#official-gallery", label: "Official Gallery", meta: "Screenshots" },
  { href: "#official-videos", label: "Official Videos", meta: "Trailers" },
  { href: "#franchise-timeline", label: "Series Timeline", meta: "Key changes" }
];
const routeHeroMediaIds = {
  "/release-date/": "capcom-title",
  "/platforms/": "steam-header",
  "/trailer/": "trailer-poster",
  "/story/": "steam-page-bg",
  "/characters/": "screenshot-01",
  "/faq/": "capcom-ogp",
  "/sources/": "capcom-site",
  "/pc-requirements/": "screenshot-06",
  "/preorder/": "steam-capsule",
  "/demo/": "screenshot-03",
  "/editions/": "capcom-ogp",
  "/original-vs-remake/": "screenshot-05",
  "/media/": "capcom-portrait",
  "/screenshots/": "screenshot-01",
  "/steam/": "steam-header",
  "/changelog/": "capcom-site",
  "/watchlist/": "capcom-site",
  "/ja/": "capcom-portrait",
  "/about/": "capcom-site",
  "/contact/": "capcom-site",
  "/privacy/": "capcom-site"
};

function normalizePath(pathname) {
  if (!pathname || pathname === "") return "/";
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function analyticsPath() {
  return normalizePath(window.location.pathname);
}

function cleanAnalyticsLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function trackEvent(name, properties = {}) {
  try {
    track(name, {
      path: analyticsPath(),
      ...properties
    });
  } catch {
  }
}

function analyticsEventForLink(anchor) {
  if (anchor.dataset.analyticsEvent) return anchor.dataset.analyticsEvent;
  const href = anchor.getAttribute("href") || "";
  const absoluteHref = anchor.href || href;
  if (href === "/feed.xml" || absoluteHref.endsWith("/feed.xml")) return "rss_click";
  if (absoluteHref.includes("store.steampowered.com")) return "steam_click";
  if (absoluteHref.includes("youtube.com") || absoluteHref.includes("youtu.be")) return "official_video_click";
  if (anchor.classList.contains("source-link") && /^https?:\/\//.test(absoluteHref)) return "source_click";
  return null;
}

function linkAnalyticsProperties(anchor) {
  return {
    href: anchor.getAttribute("href") || anchor.href,
    label: cleanAnalyticsLabel(anchor.textContent),
    source_id: anchor.dataset.sourceId || undefined,
    locale: anchor.dataset.locale || undefined
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function changelogId(entry) {
  return slugify(`${entry.date}-${entry.title}`);
}

function route(path) {
  return routeMap.get(path) || routeMap.get("/");
}

function isJapaneseRoute(routeInfo) {
  return routeInfo?.locale === "ja";
}

function alternateLocalePath(path) {
  return localizedRoutes[path] || "/ja/";
}

function sourceById(id) {
  return siteData.sources.find((source) => source.id === id);
}

function primarySources() {
  return siteData.sources.filter((source) => !source.type.includes("comparison") && source.type !== "site-policy");
}

function SourceLinks({ sourceIds }) {
  const sources = sourceIds.map((id) => sourceById(id)).filter(Boolean);
  return (
    <>
      {sources.map((source, index) => (
        <React.Fragment key={source.id}>
          {index > 0 && ", "}
          <a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noopener noreferrer" : undefined} data-analytics-event="source_click" data-source-id={source.id}>{source.name}</a>
        </React.Fragment>
      ))}
    </>
  );
}

function claimsForPage(path) {
  const claims = siteData.claims.filter((claim) => claim.pages.includes(path));
  const fallback = claims.length ? claims : siteData.claims;
  const featuredClaimIds = route(path)?.featuredClaimIds || [];
  if (!featuredClaimIds.length) return fallback.slice(0, 6);

  const claimsById = new Map(fallback.map((claim) => [claim.id, claim]));
  return featuredClaimIds.map((id) => claimsById.get(id)).filter(Boolean);
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
  const media = path === "/media/"
    ? mediaForGallery()
    : siteData.media.filter((item) => item.pages.includes(path) && (path !== "/screenshots/" || item.kind.includes("screenshot")));
  return media.slice(0, limit);
}

function mediaById(id) {
  return siteData.media.find((item) => item.id === id);
}

function mediaByIds(ids, path = "/media/") {
  return ids
    .map((id) => mediaById(id))
    .filter((item) => item?.pages.includes(path));
}

function editorialAssetCover(id) {
  return editorialAssetCovers[id] || null;
}

function optimizedImageSrc(src) {
  if (
    !src.startsWith("/assets/official/") &&
    !src.startsWith("/assets/reference-games/") &&
    !src.startsWith("/assets/company/")
  ) return null;
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

function sortTimeline(items = []) {
  return [...items].sort((a, b) => {
    const aYear = Number.parseInt(a.year, 10) || 0;
    const bYear = Number.parseInt(b.year, 10) || 0;
    return aYear - bYear;
  });
}

function Badge({ type, children }) {
  return <span className={`badge ${String(type).toLowerCase()}`}>{children}</span>;
}

function Header({ onSearch, onMenu }) {
  const activePath = normalizePath(window.location.pathname);
  const languageTarget = alternateLocalePath(activePath);
  const languageLabel = activePath === "/ja/" ? "English" : "日本語";
  const chooseLocale = () => {
    try {
      localStorage.setItem("vhLocaleChoice", activePath === "/ja/" ? "en" : "ja");
    } catch {
    }
  };
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Veronica Hub home">
          <span className="mark">VH</span>
          <span className="brand-title">
            <strong>Veronica Hub</strong>
            <span>Independent source tracker</span>
          </span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {primaryNav.map((path) => {
            const item = route(path);
            return (
              <a key={path} className={activePath === path ? "active" : ""} href={path}>
                <span className="nav-label">{item.navLabel}</span>
              </a>
            );
          })}
        </nav>
        <div className="top-actions">
          <button className="utility-button search-action" type="button" onClick={onSearch}>Search pages</button>
          <a className="utility-button language-link" href={languageTarget} onClick={chooseLocale} data-analytics-event="language_switch" data-locale={activePath === "/ja/" ? "en" : "ja"}>{languageLabel}</a>
          <a className="latest-pill" href="/watchlist/">Watchlist</a>
          <button className="utility-button small find-action" type="button" onClick={onSearch}>Find</button>
          <button className="utility-button small menu-action" type="button" onClick={onMenu}>Menu</button>
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
          <span className="hero-kicker">Source-checked remake tracker</span>
          <div className="chip-row">
            <span className="chip cyan">2027 release window</span>
            <span className="chip red">Exact date pending</span>
            <span className="chip">Remake of Code: Veronica</span>
          </div>
          <h1>Resident Evil <span>Veronica</span></h1>
          <p className="hero-subtitle">{route("/").intro}</p>
          <div className="cta-row">
            <a className="btn primary" href="/release-date/">Release Date</a>
            <a className="btn secondary" href="/trailer/">Watch Trailer</a>
            <a className="btn secondary" href="/media/">Official Media</a>
          </div>
          <p className="trust-note">Last verified {siteData.site.lastVerified} · Release window {release?.value || "2027"} · Exact date {exactDate?.value || "not officially confirmed"}</p>
        </div>
        <aside className="hero-dossier" aria-label="Current game status">
          <DossierPanel />
        </aside>
      </div>
    </section>
  );
}

function DossierPanel() {
  const statusRows = [
    ["Announcement", "announcement-status"],
    ["Release window", "release-window"],
    ["Platforms", "confirmed-platforms"],
    ["Exact date", "exact-release-date"],
    ["PC specs", "pc-requirements"]
  ];
  return (
    <div className="dossier-panel">
      <div className="panel-header">
        <h2>Current Status</h2>
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
      {kicker ? <span className="kicker">{kicker}</span> : null}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}

function RouteCards() {
  const cards = ["/release-date/", "/platforms/", "/trailer/", "/pc-requirements/", "/preorder/", "/demo/", "/characters/", "/screenshots/", "/steam/", "/media/", "/changelog/", "/watchlist/"];
  return (
    <section className="section tight" id="answers">
      <div className="container">
        <SectionHeading title="What do you want to know?">Go straight to the release date, platforms, trailer, PC requirements, demo, preorders or official sources.</SectionHeading>
        <div className="route-card-grid">
          {cards.map((path) => {
            const item = route(path);
            return (
              <a className="card route-card" href={path} key={path}>
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
          <SectionHeading title="What’s confirmed" />
          <div className="article-copy">
            {route("/").body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </article>
        <aside className="verification-policy">
          <span className="eyebrow">Still pending</span>
          <h3>Still unannounced</h3>
          <p>Capcom has not announced an exact release date, demo, preorder details, editions, price or final PC requirements.</p>
          <a className="source-link" href="/sources/">View official sources</a>
        </aside>
      </div>
    </section>
  );
}

function WatchlistCallout({ expanded = false }) {
  const watchlist = siteData.watchlist;
  if (!watchlist) return null;
  return (
    <section className="section tight watchlist-section" id="watchlist">
      <div className="container">
        <SectionHeading title={watchlist.headline}>{watchlist.promise}</SectionHeading>
        <div className="source-grid">
          <article className="card source-card watchlist-card">
            <span className="eyebrow">RSS available now</span>
            <h3>Changelog-backed feed</h3>
            <p>The feed follows the changelog, so each update links back to the page or source that changed.</p>
            <div className="watchlist-actions">
              <a className="source-link" href={watchlist.rssUrl}>Open RSS feed</a>
              <a className="source-link" href="/changelog/">View changelog</a>
            </div>
          </article>
          <article className="card source-card watchlist-card">
            <span className="eyebrow">Tracked topics</span>
            <h3>What the feed tracks</h3>
            <ul className="watchlist-topic-list">
              {watchlist.topics.map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function QuickFacts({ path = "/" }) {
  return (
    <section className="section tight" id="facts">
      <div className="container">
        <SectionHeading title="Confirmed details">Each item includes its current status, source and last check date.</SectionHeading>
        <div className="facts-grid">
          {claimsForPage(path).slice(0, 6).map((claim) => (
            <article className="card fact-card" key={claim.id}>
              <div className="slot-top">
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
  const loadTrailer = () => {
    trackEvent("trailer_play", { video: siteData.trailer.id });
    setLoaded(true);
  };
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
          <button className="trailer-poster-button" type="button" onClick={loadTrailer} aria-label={`Load official trailer: ${siteData.trailer.title}`}>
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
        <SectionHeading title="Announcement trailer">Watch the official Resident Evil announcement trailer here.</SectionHeading>
        <OfficialVideoTerminal />
      </div>
    </section>
  );
}

function OfficialVideoLibrary({ compact = false } = {}) {
  const videos = siteData.officialVideos || [];
  if (!videos.length) return null;
  const visibleVideos = compact ? videos.slice(0, 3) : videos;
  return (
    <section className="section tight" id="official-videos">
      <div className="container">
        <SectionHeading title="Official video library">Verified uploads from Capcom, PlayStation, Xbox and Summer Game Fest channels.</SectionHeading>
        <div className="source-grid">
          {visibleVideos.map((video) => {
            const source = sourceById(video.sourceId);
            return (
              <article className="card source-card" key={video.id}>
                <span className="eyebrow">{video.channel} / {video.uploadDate}</span>
                <h3>{video.title}</h3>
                <p>{video.role}</p>
                <p className="meta">{video.language} / {video.region} / {video.duration}</p>
                <p className="meta">{video.note}</p>
                <p className="meta">Source: {source ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a> : "Official video"}</p>
                <a className="source-link" href={video.url} target="_blank" rel="noopener noreferrer">Open video</a>
              </article>
            );
          })}
        </div>
        {compact && videos.length > visibleVideos.length ? <a className="source-link" href="/trailer/#official-videos">View all official videos</a> : null}
      </div>
    </section>
  );
}

function MediaPreview() {
  const previewIds = ["screenshot-01", "screenshot-02", "screenshot-03", "screenshot-04", "screenshot-05", "screenshot-06", "screenshot-07"];
  const media = previewIds.map((id) => mediaById(id)).filter(Boolean);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const activeImage = media[activeIndex];
  const openImage = (item) => setActiveIndex(media.findIndex((candidate) => candidate.id === item.id));
  return (
    <section className="section" id="media-preview">
      <div className="container">
        <SectionHeading title="Official screenshots">A preview of the remake gallery.</SectionHeading>
        <div className="media-reference-grid">
          {media.slice(0, 8).map((item) => <MediaFrame item={item} key={item.id} onOpen={openImage} />)}
        </div>
      </div>
      {activeImage ? (
        <ImageLightbox
          item={activeImage}
          onClose={() => setActiveIndex(-1)}
          onPrevious={() => setActiveIndex((activeIndex - 1 + media.length) % media.length)}
          onNext={() => setActiveIndex((activeIndex + 1) % media.length)}
          positionText={`${activeIndex + 1} of ${media.length}`}
        />
      ) : null}
    </section>
  );
}

function useDialogLifecycle({ dialogRef, initialFocusRef, onClose }) {
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    initialFocusRef?.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [dialogRef, initialFocusRef]);
}

function ImageLightbox({ item, onClose, onPrevious, onNext, positionText }) {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(null);
  useDialogLifecycle({ dialogRef, initialFocusRef: closeRef, onClose });

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft" && onPrevious) onPrevious();
      if (event.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNext, onPrevious]);

  return (
    <div ref={dialogRef} className="image-lightbox" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <button ref={closeRef} className="lightbox-close" type="button" onClick={onClose} aria-label="Close image preview">×</button>
      {onPrevious ? <button className="lightbox-nav lightbox-previous" type="button" onClick={(event) => { event.stopPropagation(); onPrevious(); }} aria-label="Previous image">←</button> : null}
      <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
        <OptimizedImage src={item.src} alt={item.alt} loading="eager" />
        <figcaption>
          <strong>{item.title}</strong>
          <span>{positionText ? `${positionText} · ` : ""}{item.kind}</span>
        </figcaption>
      </figure>
      {onNext ? <button className="lightbox-nav lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); onNext(); }} aria-label="Next image">→</button> : null}
    </div>
  );
}

function MediaFrame({ item, onOpen }) {
  const source = sourceById(item.sourceId);
  const fitContain = item.kind.includes("art") || item.kind.includes("store");
  return (
    <article className={`official-media-frame ${fitContain ? "fit-contain" : ""} ${onOpen ? "has-zoom" : ""}`}>
      {onOpen ? (
        <button className="media-zoom-button" type="button" onClick={() => onOpen(item)} aria-label={`Open larger image: ${item.title}`}>
          View larger
        </button>
      ) : null}
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
      <QuickFacts path="/" />
      <LatestVerification />
      <RouteCards />
      <TrailerPreview />
      <MediaPreview />
      <WatchlistCallout />
      <SourcesPreview />
    </>
  );
}

function SourcesPreview({ expanded = false }) {
  const sources = expanded ? primarySources() : primarySources().slice(0, 3);
  return (
    <section className="section" id="sources">
      <div className="container">
        <SectionHeading title="Check the sources">Open the Capcom, Steam and YouTube pages behind the current information.</SectionHeading>
        <div className="source-grid">
          {sources.map((source) => (
            <article className="card source-card" key={source.id}>
              <span className="eyebrow">{source.type} / {source.reliability}</span>
              <h3>{source.name}</h3>
              <p>{source.usedFor}</p>
              <p className="meta">Last checked: {source.lastChecked}</p>
              <a className="source-link" href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noopener noreferrer" : undefined} data-source-id={source.id}>Open source</a>
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
        <SectionHeading title="Developer and publisher">Resident Evil Veronica lists Capcom in both roles.</SectionHeading>
        <article className="verification-policy">
          <span className="eyebrow">{profile.company}</span>
          <h3>Capcom holds both roles</h3>
          <p>{profile.summary}</p>
          <p className="meta">Reference links: <SourceLinks sourceIds={profile.sourceIds} /></p>
        </article>
        <div className="source-grid" style={{ marginTop: 16 }}>
          {profile.representativeWorks.map((work) => (
            <article className="card source-card" key={work.name}>
              {work.image ? (
                <figure className="company-work-image">
                  <OptimizedImage src={work.image.src} alt={work.image.alt} />
                  <figcaption>{work.image.source}</figcaption>
                </figure>
              ) : null}
              <span className="eyebrow">{work.type}</span>
              <h3>{work.name}</h3>
              <p>{work.whyItMatters}</p>
              {work.url ? (
                <a className="source-link" href={work.url} target="_blank" rel="noopener noreferrer">Open official site</a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PageHero({ routeInfo }) {
  const leadMedia = mediaById(routeHeroMediaIds[routeInfo.path]) || mediaForPage(routeInfo.path, 1)[0] || mediaById("steam-page-bg");
  const style = leadMedia ? { "--page-image": cssImageValue(leadMedia.src) } : undefined;
  const japanese = isJapaneseRoute(routeInfo);
  return (
    <section className="page-hero" style={style}>
      <div className="page-hero-inner">
        <span className="hero-kicker">{japanese ? "Biohazard Veronica official source tracker" : siteData.site.tagline}</span>
        <h1>{routeInfo.h1}</h1>
        <p className="page-lede">{routeInfo.intro}</p>
        <p className="trust-note">{japanese ? `最終確認: ${siteData.site.lastVerified}` : `Last verified: ${siteData.site.lastVerified}`}</p>
      </div>
    </section>
  );
}

function TextPage({ routeInfo, children }) {
  const japanese = isJapaneseRoute(routeInfo);
  return (
    <>
      <PageHero routeInfo={routeInfo} />
      <section className="section">
        <div className="container content-grid">
          <article className="card article-copy">
            {routeInfo.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
          <aside className="verification-policy">
            <h2>{japanese ? "公式ソース確認" : "Source Status"}</h2>
            <p>{japanese ? `このページの情報は ${siteData.site.lastVerified} に確認しました。未発表の内容は未確認として扱います。` : `Information on this page was last checked on ${siteData.site.lastVerified}. Source links are available for the main details.`}</p>
            <a className="source-link" href="/sources/">{japanese ? "英語版ソースを見る" : "View sources"}</a>
          </aside>
        </div>
      </section>
      <QuickFacts path={routeInfo.path} />
      {siteData.watchlist?.placementRoutes?.includes(routeInfo.path) && routeInfo.path !== "/watchlist/" ? <WatchlistCallout /> : null}
      {children}
      <ContextMedia path={routeInfo.path} />
    </>
  );
}

function TrustPage({ routeInfo }) {
  return (
    <>
      <PageHero routeInfo={routeInfo} />
      <section className="section">
        <div className="container content-grid">
          <article className="card article-copy">
            {routeInfo.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
          <aside className="verification-policy">
            <span className="eyebrow">Site policy</span>
            <h3>Independent fan-made tracker</h3>
            <p>{siteData.site.disclaimer}</p>
            <p>{siteData.site.noPiracy}</p>
            <a className="source-link" href="/sources/">View source policy</a>
          </aside>
        </div>
      </section>
    </>
  );
}

function PcEstimateSection() {
  const estimate = siteData.pcRequirementEstimate;
  return (
    <section className="section tight">
      <div className="container">
        <SectionHeading title="PC planning range">These estimates use nearby RE Engine games for comparison. They are not official Veronica requirements.</SectionHeading>
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

function ScreenshotSourceSection() {
  const screenshots = siteData.media.filter((item) => item.pages.includes("/screenshots/") && item.kind.includes("screenshot"));
  return (
    <section className="section tight">
      <div className="container">
        <SectionHeading title="What belongs in this gallery">Only remake media from Steam, Capcom and verified official channels.</SectionHeading>
        <div className="source-grid">
          <article className="card source-card">
            <span className="eyebrow">Official screenshots</span>
            <h3>{screenshots.length} images tracked</h3>
            <p>Fan edits, leaked images and original-game captures are not included in the remake screenshot gallery.</p>
          </article>
          <article className="card source-card">
            <span className="eyebrow">Update policy</span>
            <h3>New images need a source change</h3>
            <p>New screenshots are added only when an official store page, Capcom page or verified official channel publishes new media.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function SteamStatusSection() {
  const source = sourceById("steam-store");
  return (
    <section className="section tight">
      <div className="container">
        <SectionHeading title="Steam status">Wishlisting is live. Preorders, price and PC requirements are not final.</SectionHeading>
        <div className="source-grid">
          <article className="card source-card">
            <span className="eyebrow">Store page</span>
            <h3>Wishlist access is live</h3>
            <p>The official Steam page confirms PC store presence and wishlist access for Resident Evil Veronica.</p>
            {source ? <a className="source-link" href={source.url} target="_blank" rel="noopener noreferrer">Open Steam page</a> : null}
          </article>
          <article className="card source-card">
            <span className="eyebrow">PC requirements</span>
            <h3>Minimum and recommended specs are TBD</h3>
            <p>Steam currently lists Resident Evil Veronica PC system requirements as TBD, so upgrade guidance remains clearly labeled as an estimate.</p>
            <a className="source-link" href="/pc-requirements/">View PC status</a>
          </article>
          <article className="card source-card">
            <span className="eyebrow">Purchase status</span>
            <h3>Wishlist is not preorder</h3>
            <p>Price, preorder timing, editions and bonuses remain unknown until Steam or Capcom publishes those details.</p>
            <a className="source-link" href="/preorder/">View preorder status</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function ContextMedia({ path }) {
  const media = mediaForPage(path, path === "/media/" || path === "/screenshots/" ? 30 : 6);
  if (!media.length || path === "/media/") return null;
  return (
    <section className="section">
      <div className="container">
        <SectionHeading title="Related official images">Images from the sources used on this page.</SectionHeading>
        <div className="media-gallery">
          {media.map((item) => <MediaCard item={item} key={item.id} />)}
        </div>
      </div>
    </section>
  );
}

function MediaCard({ item, variant = "", cover = null, onOpen = null }) {
  const source = sourceById(item.sourceId);
  const variantClass = variant ? ` media-card-${variant}` : "";
  const imageSrc = cover?.src || item.src;
  const imageAlt = cover?.alt || item.alt;
  return (
    <figure className={`card media-card${variantClass}`}>
      {onOpen ? (
        <button className="media-card-open" type="button" onClick={() => onOpen(item)} aria-label={`Open larger image: ${item.title}`}>
          <OptimizedImage src={imageSrc} alt={imageAlt} />
        </button>
      ) : <OptimizedImage src={imageSrc} alt={imageAlt} />}
      <figcaption>
        <strong>{item.title}</strong>
        <span>{cover ? "site editorial cover / " : ""}{item.kind} / {source?.name || "Official source"}</span>
      </figcaption>
    </figure>
  );
}


function MediaSectionNav() {
  return (
    <section className="section section-compact" aria-label="Media page sections">
      <div className="container">
        <div className="section-jump-nav">
          {mediaSectionLinks.map((item) => (
            <a href={item.href} key={item.href}>
              <strong>{item.label}</strong>
              <span>{item.meta}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformsPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
          <SectionHeading title="Where it’s coming out">Confirmed platforms and the features listed by each official store.</SectionHeading>
          <div className="platform-grid">
            {siteData.platforms.map((platform) => (
              <article className="card platform-card" key={platform.id}>
                <div className="platform-chip-row"><span>{platform.short}</span></div>
                <div>
                  <Badge type={platform.status}>{platform.status}</Badge>
                  <h3>{platform.name}</h3>
                  <p>{platform.note}</p>
                  <p className="meta">Sources: {platform.sourceIds.map((id) => sourceById(id)?.name).filter(Boolean).join(", ")}</p>
                  {platform.storeUrl ? (
                    <a
                      className="source-link"
                      href={platform.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-source-id={platform.sourceIds.at(-1)}
                    >
                      {platform.storeLabel || "Open official store"}
                    </a>
                  ) : null}
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
      <OfficialVideoLibrary />
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
          <SectionHeading title="Confirmed and referenced characters">Characters from the original are not automatically confirmed for the remake.</SectionHeading>
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
          <SectionHeading title="Frequently asked questions">Short answers about the release, platforms and purchase status.</SectionHeading>
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
  const spotlightMedia = mediaByIds(mediaSpotlightIds);
  const assetMedia = mediaByIds(mediaAssetIds);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const activeImage = spotlightMedia[activeIndex];
  const openImage = (item) => setActiveIndex(spotlightMedia.findIndex((candidate) => candidate.id === item.id));

  return (
    <>
      <PageHero routeInfo={routeInfo} />
      <MediaSectionNav />
      <section className="section" id="official-gallery">
        <div className="container">
          <SectionHeading title="Official screenshots">In-game frames come first. Store art and page backgrounds are collected below.</SectionHeading>
          <div className="media-showcase">
            {spotlightMedia.map((item, index) => (
              <MediaCard item={item} variant={index === 0 ? "lead" : "compact"} key={item.id} onOpen={openImage} />
            ))}
          </div>
          {assetMedia.length ? (
            <>
              <div className="asset-strip-head">
                <span className="eyebrow">Store and brand assets</span>
                <p>Capsules, headers, key art and page backgrounds are still tracked, but they no longer dominate the first scan.</p>
              </div>
              <div className="media-asset-strip">
                {assetMedia.map((item) => <MediaCard item={item} variant="asset" cover={editorialAssetCover(item.id)} key={item.id} />)}
              </div>
            </>
          ) : null}
        </div>
      </section>
      <OfficialVideoLibrary />
      {timeline.length > 0 ? (
        <section className="section" id="franchise-timeline">
          <div className="container">
            <SectionHeading title="How the series changed">A quick timeline of the games most relevant to Veronica.</SectionHeading>
            <div className="timeline-list">
              {timeline.map((entry) => (
                <article className="card" key={`${entry.year}-${entry.title}`}>
                  <p className="eyebrow">{entry.year}</p>
                  <h3>{entry.title}</h3>
                  <p>{entry.event}</p>
                  <p className="meta">Why it matters: {entry.impact}</p>
                  {entry.note && <p className="meta">{entry.note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <QuickFacts path="/media/" />
      {activeImage ? (
        <ImageLightbox
          item={activeImage}
          onClose={() => setActiveIndex(-1)}
          onPrevious={() => setActiveIndex((activeIndex - 1 + spotlightMedia.length) % spotlightMedia.length)}
          onNext={() => setActiveIndex((activeIndex + 1) % spotlightMedia.length)}
          positionText={`${activeIndex + 1} of ${spotlightMedia.length}`}
        />
      ) : null}
    </>
  );
}

function ChangelogPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <section className="section tight">
        <div className="container">
            <SectionHeading title="What changed">Source and site updates, listed by date.</SectionHeading>
          <div className="timeline-list">
            {siteData.changelog.map((entry) => {
              const source = sourceById(entry.sourceId);
              const showSource = source && source.type !== "site-policy";
              return (
                <article className="card" id={changelogId(entry)} key={`${entry.date}-${entry.title}`}>
                  <p className="eyebrow">{entry.date} / {entry.type}</p>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  {showSource ? (
                    <p className="meta">Reference: <a href={source.url} target={source.url.startsWith("http") ? "_blank" : undefined} rel={source.url.startsWith("http") ? "noopener noreferrer" : undefined}>{source.name}</a></p>
                  ) : null}
                </article>
              );
            })}
          </div>
          <p className="trust-note">RSS feed: <a href="/feed.xml">/feed.xml</a>. It follows the updates listed above.</p>
        </div>
      </section>
    </TextPage>
  );
}

function WatchlistPage({ routeInfo }) {
  return (
    <TextPage routeInfo={routeInfo}>
      <WatchlistCallout expanded />
    </TextPage>
  );
}

function NotFoundPage() {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <span className="hero-kicker">Page not found</span>
        <h1>Lost in the archive.</h1>
        <p className="page-lede">That page is not available. Return to the main Resident Evil Veronica pages.</p>
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
  if (routeInfo.section === "trust") return <TrustPage routeInfo={routeInfo} />;
  if (path === "/platforms/") return <PlatformsPage routeInfo={routeInfo} />;
  if (path === "/pc-requirements/") return <PcRequirementsPage routeInfo={routeInfo} />;
  if (path === "/trailer/") return <TrailerPage routeInfo={routeInfo} />;
  if (path === "/characters/") return <CharactersPage routeInfo={routeInfo} />;
  if (path === "/faq/") return <FaqPage routeInfo={routeInfo} />;
  if (path === "/sources/") return <SourcesPage routeInfo={routeInfo} />;
  if (path === "/media/") return <MediaPage routeInfo={routeInfo} />;
  if (path === "/screenshots/") return <TextPage routeInfo={routeInfo}><ScreenshotSourceSection /></TextPage>;
  if (path === "/steam/") return <TextPage routeInfo={routeInfo}><SteamStatusSection /></TextPage>;
  if (path === "/changelog/") return <ChangelogPage routeInfo={routeInfo} />;
  if (path === "/watchlist/") return <WatchlistPage routeInfo={routeInfo} />;
  return <TextPage routeInfo={routeInfo} />;
}

function SearchOverlay({ onClose }) {
  const dialogRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const [query, setQuery] = React.useState("");
  const paths = [...new Set([...primaryNav, "/ja/", ...utilityRoutes, ...footerTrustRoutes])];
  const links = paths.map((path) => route(path));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = normalizedQuery
    ? links.filter((item) => [item.navLabel, item.h1, item.intro, ...(item.body || [])].join(" ").toLocaleLowerCase().includes(normalizedQuery))
    : links;
  useDialogLifecycle({ dialogRef, initialFocusRef: inputRef, onClose });
  return (
    <div className="search-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title">
        <div className="modal-head">
          <h2 id="search-title">Search pages</h2>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close search">×</button>
        </div>
        <label className="sr-only" htmlFor="site-search">Search by topic</label>
        <input
          ref={inputRef}
          id="site-search"
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try release date, platforms or trailer"
          autoComplete="off"
          aria-describedby="search-result-count"
        />
        <p className="search-result-count" id="search-result-count" role="status" aria-live="polite">
          {matches.length} {matches.length === 1 ? "page" : "pages"} found
        </p>
        {matches.length ? (
          <nav className="suggestions" aria-label="Search results">
            {matches.map((item) => (
              <a href={item.path} key={item.path}>
                <strong>{item.navLabel}</strong>
                <span>{item.intro}</span>
              </a>
            ))}
          </nav>
        ) : <p className="search-empty">No matching pages. Try “release date”, “platforms”, “trailer” or “PC”.</p>}
      </section>
    </div>
  );
}

function MobileDrawer({ onClose }) {
  const dialogRef = React.useRef(null);
  const closeRef = React.useRef(null);
  const paths = [...new Set([...primaryNav, "/ja/", ...utilityRoutes, ...footerTrustRoutes])];
  const links = paths.map((path) => route(path));
  useDialogLifecycle({ dialogRef, initialFocusRef: closeRef, onClose });
  return (
    <div className="mobile-drawer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside ref={dialogRef} className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="menu-title">
        <div className="modal-head">
          <a className="brand" href="/" onClick={onClose}>
            <span className="mark">VH</span>
            <span className="brand-title"><strong id="menu-title">Veronica Hub</strong><span>Site menu</span></span>
          </a>
          <button ref={closeRef} className="close-button" type="button" onClick={onClose} aria-label="Close menu">×</button>
        </div>
        <nav className="drawer-links" aria-label="All pages">
          {links.map((item) => <a key={item.path} href={item.path} onClick={onClose}>{item.navLabel}</a>)}
        </nav>
        <p className="meta">{siteData.site.disclaimer}</p>
      </aside>
    </div>
  );
}

function Footer() {
  const activePath = normalizePath(window.location.pathname);
  const languageTarget = alternateLocalePath(activePath);
  const languageLabel = activePath === "/ja/" ? "English" : "日本語";
  const chooseLocale = () => {
    try {
      localStorage.setItem("vhLocaleChoice", activePath === "/ja/" ? "en" : "ja");
    } catch {
    }
  };
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <a className="brand" href="/">
            <span className="mark">VH</span>
            <span className="brand-title"><strong>Veronica Hub</strong><span>Independent source tracker</span></span>
          </a>
          <p>{siteData.site.disclaimer}</p>
          <p className="meta">{siteData.site.noPiracy}</p>
        </div>
        <nav className="footer-links" aria-label="Main pages">
          {primaryNav.slice(1).map((path) => <a key={path} href={path}>{route(path).navLabel}</a>)}
        </nav>
        <nav className="footer-links" aria-label="Site utilities">
          {footerUtilityRoutes.map((path) => <a key={path} href={path}>{route(path).navLabel}</a>)}
        </nav>
        <nav className="footer-links" aria-label="Site policies">
          {footerTrustRoutes.map((path) => <a key={path} href={path}>{route(path).navLabel}</a>)}
        </nav>
        <nav className="footer-links" aria-label="Language">
          <a href={languageTarget} onClick={chooseLocale} data-analytics-event="language_switch" data-locale={activePath === "/ja/" ? "en" : "ja"}>{languageLabel}</a>
        </nav>
      </div>
    </footer>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const lastTriggerRef = React.useRef(null);
  const currentPath = normalizePath(window.location.pathname);
  const isNotFound = !knownPaths.has(currentPath);

  React.useLayoutEffect(() => {
    const staticContent = document.getElementById("static-content");
    if (staticContent) {
      staticContent.hidden = true;
      staticContent.setAttribute("aria-hidden", "true");
    }

    const fragmentId = window.location.hash.slice(1);
    if (fragmentId) {
      const appTarget = [...document.querySelectorAll("#root [id]")].find((element) => element.id === fragmentId);
      appTarget?.scrollIntoView();
    }

    staticContent?.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
  }, []);

  React.useEffect(() => {
    if (currentPath !== "/") return;
    try {
      const choice = localStorage.getItem("vhLocaleChoice");
      const language = navigator.language || "";
      if (!choice && /^ja\b/i.test(language)) {
        localStorage.setItem("vhLocaleChoice", "ja");
        window.location.replace("/ja/");
      }
    } catch {
    }
  }, [currentPath]);

  React.useEffect(() => {
    const handleClick = (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;
      const eventName = analyticsEventForLink(anchor);
      if (!eventName) return;
      trackEvent(eventName, linkAnalyticsProperties(anchor));
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const restoreTriggerFocus = () => window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
  const openSearch = (event) => {
    lastTriggerRef.current = event.currentTarget;
    trackEvent("search_open");
    setSearchOpen(true);
  };
  const openMenu = (event) => {
    lastTriggerRef.current = event.currentTarget;
    trackEvent("menu_open");
    setMenuOpen(true);
  };
  const closeSearch = () => {
    setSearchOpen(false);
    restoreTriggerFocus();
  };
  const closeMenu = () => {
    setMenuOpen(false);
    restoreTriggerFocus();
  };

  return (
    <div className="app-shell">
      <Header onSearch={openSearch} onMenu={openMenu} />
      <main>{isNotFound ? <NotFoundPage /> : <PageSwitch path={currentPath} />}</main>
      <Footer />
      {searchOpen && <SearchOverlay onClose={closeSearch} />}
      {menuOpen && <MobileDrawer onClose={closeMenu} />}
      <Analytics />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
