import * as React from "react";
import * as ReactDOM from "react-dom/client";

const navItems = [
  ["Home", "/"],
  ["Release Date", "/release-date/"],
  ["Platforms", "/platforms/"],
  ["Trailer", "/trailer/"],
  ["Story", "/story/"],
  ["Sources", "/sources/"]
];

const officialAssets = {
  portrait: "/assets/official/capcom-veronica-press-a.png",
  title: "/assets/official/capcom-veronica-press-b.png",
  steamCapsule: "/assets/official/steam/steam-capsule.jpg",
  steamPageBg: "/assets/official/steam/steam-page-bg.jpg",
  trailerPoster: "/assets/official/steam/steam-trailer-poster.jpg",
  monsterCrowd: "/assets/official/steam/steam-screenshot-03.jpg",
  claireCombat: "/assets/official/steam/steam-screenshot-01.jpg",
  prisonExterior: "/assets/official/steam/steam-screenshot-02.jpg",
  corridorBody: "/assets/official/steam/steam-screenshot-04.jpg",
  helicopterApproach: "/assets/official/steam/steam-screenshot-07.jpg"
};

const officialTrailer = {
  id: "mhzX_E5O7O0",
  title: "BIOHAZARD RE:Veronica Announcement Trailer",
  channel: "BIOHAZARD official YouTube",
  watchUrl: "https://www.youtube.com/watch?v=mhzX_E5O7O0",
  embedUrl: "https://www.youtube-nocookie.com/embed/mhzX_E5O7O0?rel=0&modestbranding=1"
};

const facts = [
  ["Official title", "Resident Evil Veronica", "confirmed", "Capcom / Steam", "Official"],
  ["Common search name", "Resident Evil Code Veronica Remake", "reported", "Steam store", "Search alias"],
  ["Status", "Officially announced", "confirmed", "Capcom press release", "Official"],
  ["Release window", "2027", "confirmed", "Capcom / Steam", "Official"],
  ["Exact release date", "Not officially confirmed", "unknown", "Capcom press release", "Official"],
  ["Platforms", "PS5, Xbox Series X|S, Nintendo Switch 2, PC", "confirmed", "Capcom press release", "Official"],
  ["Steam page", "Available / wishlist page present", "confirmed", "Steam store", "Store"],
  ["Genre", "Survival Horror", "confirmed", "Capcom press release", "Official"],
  ["Developer", "CAPCOM Co., Ltd.", "confirmed", "Steam store", "Store"],
  ["Publisher", "CAPCOM Co., Ltd.", "confirmed", "Steam store", "Store"],
  ["PC system requirements", "TBD", "unknown", "Steam store", "Store"]
];

const platforms = [
  ["PC", "PC", "Capcom press release", "Official platform listing verified."],
  ["PS", "PlayStation 5", "Capcom press release", "Official platform listing verified."],
  ["XB", "Xbox Series X|S", "Capcom press release", "Official platform listing verified."],
  ["NS", "Nintendo Switch 2", "Capcom press release", "Official platform listing verified."],
  ["ST", "Steam storefront", "Steam store page", "Store page and wishlist listing available."]
];

const officialMedia = [
  {
    title: "Capcom Press Release",
    type: "Official Source",
    source: "Capcom press release",
    href: "https://www.capcom.co.jp/ir/english/news/html/e260608.html",
    image: officialAssets.portrait,
    cta: "View Source",
    note: "Official announcement record for the 2027 release window, platforms, genre and remake status.",
    fit: "cover"
  },
  {
    title: "Steam Store Page",
    type: "Official Store",
    source: "Steam store",
    href: "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/",
    image: officialAssets.steamCapsule,
    cta: "Open Store",
    note: "Store page available; planned release date is 2027 and wishlist access is present.",
    fit: "contain"
  },
  {
    title: "Announcement Trailer",
    type: "Official YouTube",
    source: "BIOHAZARD official YouTube",
    href: "/trailer/",
    image: officialAssets.trailerPoster,
    cta: "Watch Trailer",
    note: "Primary official trailer embed, loaded only after user click.",
    fit: "contain"
  }
];

const officialScreens = [
  ["Claire Redfield", officialAssets.claireCombat],
  ["Rockfort Exterior", officialAssets.prisonExterior],
  ["Creature Encounter", officialAssets.monsterCrowd],
  ["Corridor Incident", officialAssets.corridorBody],
  ["Island Approach", officialAssets.helicopterApproach]
];

const updates = [
  ["2026-06-08", "Official", "Capcom announces Resident Evil Veronica for 2027", "Resident Evil Veronica is announced as a remake of the 2000 title. Exact date details will be announced later.", "Capcom press release", "https://www.capcom.co.jp/ir/english/news/html/e260608.html"],
  ["2026-06-08", "Store", "Steam page is live with a 2027 release window", "Steam confirms CAPCOM as developer and publisher, with planned release date listed as 2027.", "Steam store", "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/"],
  ["2026-06-09", "Site Update", "Veronica Hub separates confirmed and unknown facts", "The MVP keeps Capcom, Steam and official YouTube as the only source classes for factual content.", "Veronica Hub source policy", "/sources/"]
];

const faq = [
  ["Is Resident Evil Code Veronica Remake official?", "Yes. Capcom announced Resident Evil Veronica, a remake of Resident Evil Code: Veronica, with a planned 2027 release."],
  ["What is the release date?", "A 2027 release window is confirmed. An exact date has not been officially confirmed."],
  ["Is it coming to PC or Steam?", "Yes. Capcom confirms PC as a platform, and Steam has an official store page with wishlist access."],
  ["Are PC system requirements confirmed?", "No. Steam currently lists the minimum and recommended PC system requirements as TBD."],
  ["Is Veronica Hub an official site?", "No. Veronica Hub is an independent fan-made information site and is not affiliated with or endorsed by Capcom."]
];

const sources = [
  ["Capcom press release", "Official", "High", "Announcement, 2027 window, platforms, genre and remake direction", "2026-06-09", "https://www.capcom.co.jp/ir/english/news/html/e260608.html"],
  ["Steam store", "Official store", "High", "Store page, PC status, developer, publisher, story context and TBD system requirements", "2026-06-09", "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/"],
  ["Official BIOHAZARD YouTube", "Official", "High", "Announcement trailer embed", "2026-06-09", officialTrailer.watchUrl]
];

const routeToSection = { "/release-date/": "#release", "/platforms/": "#platforms", "/trailer/": "#trailer", "/story/": "#story", "/sources/": "#sources" };
const knownPaths = new Set(["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/characters/", "/faq/", "/sources/"]);

function Badge({ type, children }) {
  return <span className={`badge ${String(type).toLowerCase()}`}>{children}</span>;
}

function fileCode(index) {
  return `FILE ${String(index + 1).padStart(2, "0")}`;
}

function Header({ onSearch, onMenu }) {
  const activePath = window.location.pathname || "/";
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Veronica Hub home"><span className="mark">VH</span><span className="brand-title"><strong>Veronica Hub</strong><span>Independent archive</span></span></a>
        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(([label, href], index) => <a key={label} className={activePath === href ? "active" : ""} href={href}><span className="nav-code">{fileCode(index)}</span><span className="nav-label">{label}</span></a>)}
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
  return (
    <section className="hero" id="home">
      <div className="hero-grid container">
        <div className="hero-copy">
          <span className="hero-kicker">Source-backed remake dossier</span>
          <div className="eyebrow-row"><span className="chip cyan">Independent fan-made information hub</span><span className="chip red">No ROMs or piracy</span><span className="chip">Official sources only</span></div>
          <h1>Resident Evil <span>Code Veronica</span> Remake</h1>
          <p className="hero-subtitle">Official title, 2027 release window, confirmed platforms, trailer status and spoiler-light story context in one source-first dossier.</p>
          <div className="cta-row"><a className="btn primary" href="/release-date/">Release Date</a><a className="btn secondary" href="/trailer/">Watch Trailer</a><a className="btn secondary" href="/story/">Read Story Guide</a></div>
          <p className="trust-note">FILE STATUS: OFFICIALLY ANNOUNCED / LAST VERIFIED: 2026-06-09 / EXACT DATE: NOT OFFICIALLY CONFIRMED</p>
        </div>
        <aside className="hero-dossier" aria-label="Current dossier status and official media">
          <DossierPanel />
        </aside>
      </div>
    </section>
  );
}

function DossierPanel() {
  return (
    <div className="dossier-panel compact-dossier">
      <div className="panel-header"><h2>Dossier Status</h2><span className="panel-code">VH-2027</span></div>
      <div className="tracking-pulse" aria-hidden="true"><span></span></div>
      <dl className="status-list">
        <div className="status-row"><dt>File status</dt><dd><Badge type="confirmed">Confirmed</Badge><span>Officially announced</span></dd></div>
        <div className="status-row"><dt>Release window</dt><dd><Badge type="confirmed">Confirmed</Badge><span>2027</span></dd></div>
        <div className="status-row"><dt>Platforms</dt><dd><Badge type="confirmed">Confirmed</Badge><div className="platform-chip-row"><span>PS5</span><span>Xbox Series X|S</span><span>Switch 2</span><span>PC</span><span>Steam</span></div></dd></div>
        <div className="status-row"><dt>Exact date</dt><dd><Badge type="unknown">Unknown</Badge><span>Not officially confirmed</span></dd></div>
        <div className="status-row"><dt>Source level</dt><dd><span>Capcom / Steam / official YouTube</span></dd></div>
      </dl>
    </div>
  );
}

function SectionHeading({ kicker, title, children }) {
  return <div className="section-heading"><span className="kicker">{kicker}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}

function OfficialMediaTerminal() {
  return (
    <section className="section media-terminal-section" id="official-media">
      <div className="container">
        <SectionHeading kicker="Official media terminal" title="Source References">Official media is shown as source reference material, not as Veronica Hub branding.</SectionHeading>
        <div className="media-reference-grid">
          {officialMedia.map((item) => <article className={`official-media-frame ${item.fit === "contain" ? "fit-contain" : ""}`} key={item.title}><div className="media-label"><span>{item.type}</span><Badge type="official">Verified</Badge></div><img src={item.image} alt={`${item.title} reference for Resident Evil Veronica`} /><div className="media-copy"><h3>{item.title}</h3><p className="meta">Source: {item.source}<br />Last verified: 2026-06-09<br />{item.note}</p><a className="source-link" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}>{item.cta}</a></div></article>)}
        </div>
      </div>
    </section>
  );
}

function ScreenshotWall() {
  return (
    <section className="section screenshot-wall" id="screens">
      <div className="container">
        <SectionHeading kicker="Official screens" title="Visual Archive">More official Steam media, arranged as atmosphere instead of database filler.</SectionHeading>
        <div className="screenshot-grid">
          {officialScreens.map(([label, image]) => (
            <figure className="screenshot-card" key={label}>
              <img src={image} alt={`${label} official Resident Evil Veronica screenshot`} />
              <span>{label}</span>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickFacts() {
  return <section className="section tight" id="facts"><div className="container"><SectionHeading kicker="Inventory grid" title="Quick Facts">Confirmed facts are separated from unknown details. No exact date, price, demo or PC specs are published before confirmation.</SectionHeading><div className="facts-grid">{facts.slice(0, 6).map(([label, value, status, source, level], index) => <article className="card fact-card" key={label}><div className="slot-top"><span className="slot-code">SLOT {String(index + 1).padStart(2, "0")}</span><Badge type={status}>{status}</Badge></div><div><h3>{label}</h3><div className="value">{value}</div></div><p className="meta">SOURCE LEVEL: {level}<br />Source: {source}<br />Last verified: 2026-06-09</p></article>)}</div></div></section>;
}

function ReleaseSection() {
  return <section className="section" id="release"><div className="container release-grid"><article className="card release-card"><span className="archive-meta">DATE FILE: ACTIVE / UNVERIFIED EXACT DATES REJECTED</span><h2>Release Date</h2><p className="release-window">2027</p><p>No exact release date has been confirmed yet.</p><div className="policy-box"><strong>No fake dates.</strong><span>Veronica Hub only lists exact dates after official or highly reliable confirmation.</span></div></article><aside className="card watch-card"><h3>What We Track Next</h3><ul>{["exact release date", "new trailer updates", "platform store changes", "PC system requirements", "demo information", "price / editions"].map((item) => <li key={item}>{item}</li>)}</ul><div className="source-proof-row"><a href="https://www.capcom.co.jp/ir/english/news/html/e260608.html" target="_blank" rel="noopener noreferrer">Capcom source</a><a href="https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/" target="_blank" rel="noopener noreferrer">Steam source</a></div></aside></div></section>;
}

function PlatformsSection() {
  return <section className="section" id="platforms"><div className="container"><SectionHeading kicker="Access cards" title="Platforms">Resident Evil Veronica is tracked across Steam, PlayStation, Xbox, Nintendo Switch 2 and PC listings using source-backed platform notes.</SectionHeading><div className="platform-grid">{platforms.map(([icon, name, source, note]) => <article className="card platform-card" key={name}><div className="platform-icon">{icon}</div><div><Badge type="confirmed">Confirmed</Badge><h3>{name}</h3><p className="meta">Source: {source}<br />Last verified: 2026-06-09<br />{note}</p></div></article>)}</div><article className="store-file"><span className="archive-meta">STORE FILE / STEAM</span><h3>Resident Evil Veronica Steam Store Page</h3><p>Planned Release Date: 2027<br />Developer: CAPCOM Co., Ltd.<br />Publisher: CAPCOM Co., Ltd.<br />Steam page: available<br />Wishlist: available</p><p className="meta">Store-listed features and languages may change before release.</p><a className="source-link" href="https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/" target="_blank" rel="noopener noreferrer">Open Steam Page</a></article></div></section>;
}

function OfficialVideoTerminal() {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div className="terminal official-video-terminal clean-video-terminal">
      <div className="terminal-chrome"><span className="rec-dot" aria-hidden="true"></span><span>Official Trailer</span><span>{officialTrailer.channel}</span></div>
      <div className="terminal-screen video-ready">
        {loaded ? <iframe src={`${officialTrailer.embedUrl}&autoplay=1`} title={officialTrailer.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe> : <button className="trailer-poster-button clean-trailer-poster" type="button" onClick={() => setLoaded(true)} aria-label={`Load official trailer: ${officialTrailer.title}`}><img src={officialAssets.trailerPoster} alt="" /><span className="play-core" aria-hidden="true">▶</span><span className="trailer-cta-text">Watch official trailer</span></button>}
      </div>
      <div className="trailer-source-line"><span>Source: BIOHAZARD official YouTube</span><span>Last verified: 2026-06-09</span><a href={officialTrailer.watchUrl} target="_blank" rel="noopener noreferrer">Open on YouTube</a></div>
    </div>
  );
}

function TrailerSection() {
  return <section className="section monster-stage trailer-stage" id="trailer"><OfficialMonsterBackdrop /><div className="container"><SectionHeading kicker="Video terminal" title="Trailer">Watch the verified official announcement trailer. The video loads only after click, so the homepage stays fast.</SectionHeading><OfficialVideoTerminal /></div></section>;
}

function OfficialMonsterBackdrop() {
  return <div className="official-monster-backdrop trailer-monster-backdrop" aria-hidden="true"><img src={officialAssets.monsterCrowd} alt="" /></div>;
}

function StorySection() {
  const [open, setOpen] = React.useState(false);
  return <section className="section monster-stage story-stage" id="story"><OfficialMonsterBackdrop /><div className="container two-col"><article className="card spoiler-card"><SectionHeading kicker="Found file" title="Story Briefing" /><p className="archive-meta">FILE ACCESS: SAFE / SOURCE: STEAM STORE / SPOILER LEVEL: LIGHT</p><p>Three months after the biological disaster in Raccoon City, Claire Redfield travels to France in search of her brother, Chris Redfield. Instead of a reunion, she is captured by Umbrella special forces and transported to Rockfort Island, a remote island that becomes a survival-horror hellscape after another biological disaster.</p><div className="accordion-item"><button className="accordion-button" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>Original-game context policy<span>{open ? "-" : "+"}</span></button>{open && <div className="accordion-body">Original-game spoilers are not treated as remake-confirmed facts unless confirmed by official sources.</div>}</div></article><aside className="card briefing"><h3>Story Terms</h3><ul className="briefing-list">{["Claire Redfield", "Chris Redfield", "France", "Umbrella special forces", "Rockfort Island"].map((term) => <li key={term}><span>Term</span><strong>{term}</strong></li>)}</ul></aside></div></section>;
}

function SourcesSection() {
  return <section className="section" id="sources"><div className="container"><SectionHeading kicker="Evidence locker" title="Sources & Verification">Veronica Hub MVP uses Capcom official material, Steam official store data and BIOHAZARD official YouTube video records.</SectionHeading><article className="verification-policy"><span className="archive-meta">SOURCE POLICY / EXACT DATES LOCKED UNTIL VERIFIED</span><p>Veronica Hub does not publish exact dates, demo information, prices, editions, PC specifications or specific gameplay systems unless confirmed by an official or highly reliable source.</p></article><div className="source-grid">{sources.map(([name, type, reliability, usedFor, checked, href], index) => <article className="card source-card" key={name}><span className="slot-code">SOURCE FILE {String(index + 1).padStart(2, "0")}</span><Badge type={type.includes("Official") ? "official" : "reported"}>{type}</Badge><h3>{name}</h3><p className="meta">Reliability: {reliability}<br />Last checked: {checked}<br />Used for: {usedFor}</p><a className="source-link" href={href} target="_blank" rel="noopener noreferrer">View source</a></article>)}</div></div></section>;
}

function Footer() {
  return <footer className="footer"><div className="container footer-grid"><div><a className="brand" href="/"><span className="mark">VH</span><span className="brand-title"><strong>Veronica Hub</strong><span>Source policy active</span></span></a><p>Independent fan-made information hub. Veronica Hub is not affiliated with or endorsed by Capcom.</p><p className="meta">We do not host ROMs, ISOs, cracks, emulators or unofficial downloads.</p></div><nav className="footer-links">{navItems.slice(1).map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav><div className="footer-links"><a href="/sources/">Sources policy</a><a href="/faq/">FAQ</a><p className="meta">Last source review: 2026-06-09</p></div></div></footer>;
}

function SearchOverlay({ onClose }) {
  return <div className="search-overlay" role="dialog" aria-modal="true"><div className="search-modal"><div className="modal-head"><strong>Search files</strong><button className="close-button" type="button" onClick={onClose}>x</button></div><input className="search-input" autoFocus placeholder="Search release date, platforms, trailer..." /><div className="suggestions">{["release date", "platforms", "trailer", "Steam", "Claire Redfield", "story", "sources"].map((item) => <button className="chip" type="button" key={item}>{item}</button>)}</div></div></div>;
}

function MobileDrawer({ onClose }) {
  return <div className="mobile-drawer" role="dialog" aria-modal="true"><aside className="drawer-panel"><div className="modal-head"><a className="brand" href="/" onClick={onClose}><span className="mark">VH</span><span className="brand-title"><strong>Veronica Hub</strong><span>Menu</span></span></a><button className="close-button" type="button" onClick={onClose}>x</button></div><nav className="drawer-links">{navItems.map(([label, href], index) => <a key={label} href={href} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</nav><p className="meta">Independent fan-made information site. Official media is source-labeled; no ROMs, no piracy.</p></aside></div>;
}

function NotFoundSection() {
  return <section className="not-found-archive monster-stage"><OfficialMonsterBackdrop /><div className="container not-found-grid"><div className="not-found-copy"><span className="kicker">Access denied</span><h1>Lost in the archive.</h1><p>Something is watching from the dark. Return to the verified dossier before this file collapses.</p><div className="cta-row"><a className="btn primary" href="/">Return Home</a><a className="btn secondary" href="/sources/">View Sources</a></div></div></div></section>;
}

function App() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const currentPath = window.location.pathname || "/";
  const isNotFound = !knownPaths.has(currentPath);
  React.useEffect(() => {
    const section = routeToSection[window.location.pathname];
    if (section) window.setTimeout(() => document.querySelector(section)?.scrollIntoView({ block: "start" }), 80);
  }, []);
  return <div className="app-shell"><Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} /><main>{isNotFound ? <NotFoundSection /> : <><Hero /><ScreenshotWall /><OfficialMediaTerminal /><QuickFacts /><ReleaseSection /><PlatformsSection /><StorySection /><TrailerSection /><SourcesSection /></>}</main><Footer />{searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}{menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}</div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
