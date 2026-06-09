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

const facts = [
  { label: "Official title", value: "Resident Evil Veronica", status: "confirmed", source: "Capcom / Steam", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Common search name", value: "Resident Evil Code Veronica Remake", status: "reported", source: "Steam store", verified: "2026-06-09", sourceLevel: "Search alias" },
  { label: "Status", value: "Officially announced", status: "confirmed", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Release window", value: "2027", status: "confirmed", source: "Capcom / Steam", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Exact release date", value: "Not officially confirmed", status: "unknown", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Platforms", value: "PS5, Xbox Series X|S, Nintendo Switch 2, PC", status: "confirmed", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Steam page", value: "Available / wishlist page present", status: "confirmed", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" },
  { label: "Genre", value: "Survival Horror", status: "confirmed", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Developer", value: "CAPCOM Co., Ltd.", status: "confirmed", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" },
  { label: "Publisher", value: "CAPCOM Co., Ltd.", status: "confirmed", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" },
  { label: "PC system requirements", value: "TBD", status: "unknown", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" }
];

const updates = [
  {
    date: "2026-06-08",
    tag: "Official",
    status: "official",
    title: "Capcom announces Resident Evil Veronica for 2027",
    summary: "The source record says Resident Evil Veronica is a remake of the 2000 title and that the exact release date will be announced later.",
    source: "Capcom press release",
    href: "https://www.capcom.co.jp/ir/english/news/html/e260608.html"
  },
  {
    date: "2026-06-08",
    tag: "Store",
    status: "official",
    title: "Steam page is live with a 2027 release window",
    summary: "The Steam listing confirms CAPCOM as developer and publisher, with the product not yet available and planned for 2027.",
    source: "Steam store",
    href: "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/"
  },
  {
    date: "2026-06-08",
    tag: "Site Update",
    status: "site",
    title: "Veronica Hub labels confirmed and unknown facts separately",
    summary: "The homepage now keeps Capcom, Steam and official YouTube as the only source classes for MVP content.",
    source: "Veronica Hub source policy",
    href: "#sources"
  }
];

const platforms = [
  { icon: "PC", name: "PC", status: "Confirmed", source: "Capcom press release", note: "Official platform listing verified.", verified: "2026-06-09" },
  { icon: "PS", name: "PlayStation 5", status: "Confirmed", source: "Capcom press release", note: "Official platform listing verified.", verified: "2026-06-09" },
  { icon: "XB", name: "Xbox Series X|S", status: "Confirmed", source: "Capcom press release", note: "Official platform listing verified.", verified: "2026-06-09" },
  { icon: "NS", name: "Nintendo Switch 2", status: "Confirmed", source: "Capcom press release", note: "Official platform listing verified.", verified: "2026-06-09" },
  { icon: "ST", name: "Steam storefront", status: "Confirmed", source: "Steam store page", note: "Store page and wishlist listing available.", verified: "2026-06-09" }
];

const characters = [
  ["C.R.", "Claire Redfield", "Travels to France searching for Chris", "Confirmed", "Steam store"],
  ["C.H.", "Chris Redfield", "Claire's brother and search target", "Confirmed", "Steam store"],
  ["U.S.", "Umbrella special forces", "Capture Claire after she reaches France", "Confirmed", "Steam store"],
  ["R.I.", "Rockfort Island", "Remote island thrown into another biological disaster", "Confirmed", "Steam store"]
];

const comparisonRows = [
  ["Remake status", "Resident Evil Code: Veronica released in 2000.", "Capcom identifies Resident Evil Veronica as a remake of the original.", "Confirmed"],
  ["Story", "Claire searches for Chris after Raccoon City.", "Capcom says the story is being reimagined.", "Confirmed"],
  ["Visuals", "Original Dreamcast-era real-time 3D environments.", "Capcom says high-quality RE Engine graphics are planned.", "Confirmed"],
  ["Gameplay", "Original gameplay is not used as a remake promise.", "Steam says modernized gameplay; specific systems are not confirmed.", "Unknown"]
];

const faq = [
  ["Is Resident Evil Code Veronica Remake official?", "Yes. Capcom announced Resident Evil Veronica, a remake of Resident Evil Code: Veronica, with a planned 2027 release."],
  ["What is the release date?", "A 2027 release window is confirmed. An exact date has not been officially confirmed."],
  ["Is it coming to PC or Steam?", "Yes. Capcom confirms PC as a platform, and Steam has an official store page with wishlist access."],
  ["Is it a full remake or a remaster?", "Capcom describes it as a remake with a reimagined story and RE Engine graphics. Specific gameplay systems still need source-backed confirmation."],
  ["Are PC system requirements confirmed?", "No. Steam currently lists the minimum and recommended PC system requirements as TBD."],
  ["Do I need to play the original?", "No. The hub keeps the remake page limited to official story context and avoids original-game spoilers unless clearly labeled later."],
  ["Is Veronica Hub an official site?", "No. Veronica Hub is an independent fan-made information site and is not affiliated with or endorsed by Capcom."]
];

const sources = [
  ["Capcom press release", "Official", "High", "Announcement, 2027 window, platforms, genre and remake direction", "2026-06-09", "https://www.capcom.co.jp/ir/english/news/html/e260608.html"],
  ["Steam store", "Official store", "High", "Store page, PC status, developer, publisher, story context and TBD system requirements", "2026-06-09", "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/"],
  ["Official BIOHAZARD YouTube", "Official", "High", "Announcement trailer embed verified by YouTube oEmbed author and Capcom Japan press release", "2026-06-09", "https://www.youtube.com/watch?v=mhzX_E5O7O0"]
];

const officialAssets = {
  portrait: "/assets/official/capcom-veronica-press-a.png",
  title: "/assets/official/capcom-veronica-press-b.png",
  ogp: "/assets/official/capcom-veronica-ogp.png",
  siteThumb: "/assets/official/capcom-veronica-site.png",
  steamHeader: "/assets/official/steam/steam-header.jpg",
  steamCapsule: "/assets/official/steam/steam-capsule.jpg",
  steamPageBg: "/assets/official/steam/steam-page-bg.jpg",
  trailerPoster: "/assets/official/steam/steam-trailer-poster.jpg",
  steamShots: [
    "/assets/official/steam/steam-screenshot-01.jpg",
    "/assets/official/steam/steam-screenshot-02.jpg",
    "/assets/official/steam/steam-screenshot-03.jpg",
    "/assets/official/steam/steam-screenshot-04.jpg",
    "/assets/official/steam/steam-screenshot-05.jpg",
    "/assets/official/steam/steam-screenshot-06.jpg",
    "/assets/official/steam/steam-screenshot-07.jpg"
  ]
};

const officialTrailer = {
  id: "mhzX_E5O7O0",
  title: "BIOHAZARD RE:Veronica Announcement Trailer",
  channel: "BIOHAZARD",
  watchUrl: "https://www.youtube.com/watch?v=mhzX_E5O7O0",
  embedUrl: "https://www.youtube-nocookie.com/embed/mhzX_E5O7O0?rel=0&modestbranding=1"
};

const officialMedia = [
  {
    title: "Capcom Press Release",
    type: "Official Source",
    source: "Capcom press release",
    href: "https://www.capcom.co.jp/ir/english/news/html/e260608.html",
    image: officialAssets.portrait,
    cta: "View Source",
    note: "Official announcement record for the 2027 release window, platforms, genre and remake status.",
    verified: "2026-06-09",
    featured: true
  },
  {
    title: "Steam Store Page",
    type: "Official Store",
    source: "Steam store",
    href: "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/",
    image: officialAssets.steamCapsule,
    cta: "Open Store",
    note: "Store page available; planned release date is 2027 and wishlist access is present.",
    verified: "2026-06-09"
  },
  {
    title: "Official Announcement Trailer",
    type: "Official YouTube",
    source: "BIOHAZARD official YouTube",
    href: officialTrailer.watchUrl,
    image: officialAssets.trailerPoster,
    cta: "Watch Trailer",
    note: "Official trailer video ID verified via YouTube oEmbed and Capcom Japan press release.",
    verified: "2026-06-09"
  }
];

const routeToSection = {
  "/release-date/": "#release",
  "/platforms/": "#platforms",
  "/trailer/": "#trailer",
  "/story/": "#story",
  "/characters/": "#characters",
  "/faq/": "#faq",
  "/sources/": "#sources"
};

function Badge({ type, children }) {
  return <span className={`badge ${type.toLowerCase()}`}>{children}</span>;
}

function fileCode(index) {
  return `FILE ${String(index + 1).padStart(2, "0")}`;
}

function Header({ onSearch, onMenu }) {
  const activePath = window.location.pathname === "" ? "/" : window.location.pathname;
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="/" aria-label="Veronica Hub home">
          <span className="mark">VH</span>
          <span className="brand-title">
            <strong>Veronica Hub</strong>
            <span>Independent archive</span>
          </span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(([label, href], index) => (
            <a key={label} className={activePath === href ? "active" : ""} href={href}>
              <span className="nav-code">{fileCode(index)}</span>
              <span className="nav-label">{label}</span>
            </a>
          ))}
        </nav>
        <div className="top-actions">
          <button className="utility-button" type="button" onClick={onSearch}>Search files</button>
          <a className="latest-pill" href="/sources/">Source Policy</a>
          <button className="utility-button small" type="button" aria-label="Open search" onClick={onSearch}>Find</button>
          <button className="utility-button small" type="button" aria-label="Open menu" onClick={onMenu}>Menu</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="home" data-screen-label="01 Home Hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <img className="hero-title-treatment" src={officialAssets.title} alt="Official Resident Evil Veronica title treatment from Capcom" />
          <div className="eyebrow-row">
            <span className="chip cyan">Independent fan-made information hub</span>
            <span className="chip red">No ROMs or piracy</span>
            <span className="chip">Capcom / Steam / official YouTube only</span>
          </div>
          <h1>Resident Evil <span>Code Veronica</span> Remake</h1>
          <p className="hero-subtitle">Official title, 2027 release window, confirmed platforms, trailer status and spoiler-light story context in one source-first dossier.</p>
          <div className="cta-row">
            <a className="btn primary" href="/release-date/">Release Date</a>
            <a className="btn secondary" href="/trailer/">Trailer Status</a>
            <a className="btn secondary" href="/story/">Read Story Guide</a>
          </div>
          <p className="trust-note">FILE STATUS: OFFICIALLY ANNOUNCED / LAST VERIFIED: 2026-06-09 / EXACT DATE: NOT OFFICIALLY CONFIRMED</p>
          <div className="hero-status-grid" aria-label="Dossier status panel">
            <div className="hero-status-card wide">
              <span>Source level</span>
              <strong>Official / store cross-check</strong>
            </div>
            <div className="hero-status-card">
              <span>Release window</span>
              <strong>2027</strong>
            </div>
            <div className="hero-status-card">
              <span>Platforms</span>
              <strong>PS5 / Xbox Series X|S / Switch 2 / PC</strong>
            </div>
            <div className="hero-status-card">
              <span>Genre</span>
              <strong>Survival Horror</strong>
            </div>
            <div className="hero-status-card">
              <span>Exact date</span>
              <strong>Not officially confirmed</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OfficialMediaTerminal() {
  return (
    <section className="section media-terminal-section" id="official-media" data-screen-label="02 Official Media Terminal">
      <div className="container">
        <SectionHeading kicker="Official media terminal" title="Source References">MVP sources are limited to Capcom, Steam and Resident Evil / BIOHAZARD official YouTube channels. No media recaps, fan discussions or rumor feeds are used as facts.</SectionHeading>
        <div className="media-reference-grid">
          {officialMedia.map((item) => (
            <article className={`official-media-frame ${item.image ? "has-image" : ""} ${item.featured ? "featured" : ""}`} key={item.title}>
              <div className="media-label">
                <span>{item.type}</span>
                <Badge type={item.verified === "Pending" ? "unknown" : "official"}>{item.verified === "Pending" ? "Pending" : "Verified"}</Badge>
              </div>
              {item.image ? (
                <img src={item.image} alt={`${item.title} reference for Resident Evil Veronica`} />
              ) : (
                <div className="media-placeholder" aria-hidden="true">
                  <span>{item.type === "Store File" ? "STORE" : "VIDEO"}</span>
                </div>
              )}
              <div className="media-copy">
                <h3>{item.title}</h3>
                <p className="meta">Source: {item.source}<br />Last verified: {item.verified}<br />{item.note}</p>
                <a className="source-link" href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}>{item.cta}</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
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

function QuickFacts() {
  return (
    <section className="section tight" id="facts" data-screen-label="02 Quick Facts">
      <div className="container">
        <SectionHeading kicker="Inventory grid" title="Quick Facts">Only official, store-listed and unknown states are separated here. No exact date, price, demo or PC specs are published before confirmation.</SectionHeading>
        <div className="facts-grid">
          {facts.map((fact, index) => (
            <article className="card fact-card" key={fact.label}>
              <div className="slot-top">
                <span className="slot-code">SLOT {String(index + 1).padStart(2, "0")}</span>
                <Badge type={fact.status}>{fact.status}</Badge>
              </div>
              <div>
                <h3>{fact.label}</h3>
                <div className="value">{fact.value}</div>
              </div>
              <p className="meta">SOURCE LEVEL: {fact.sourceLevel}<br />Source: {fact.source}<br />Last verified: {fact.verified}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Updates() {
  return (
    <section className="section" id="updates" data-screen-label="03 Incident Log">
      <div className="container">
        <SectionHeading kicker="Typewriter log" title="Incident Log">Latest updates saved from verified sources, with official records separated from site notes.</SectionHeading>
        <div className="timeline">
          {updates.map((item) => (
            <article className="event" key={item.title}>
              <div className="event-date">{item.date}</div>
              <div className={`card event-card ${item.status}`}>
                <div className="log-meta">
                  <span>ARCHIVE UPDATED</span>
                  <Badge type={item.status === "media" ? "reported" : item.status}>{item.tag}</Badge>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <p className="meta">Source: <a className="source-link" href={item.href} target="_blank" rel="noopener noreferrer">{item.source}</a></p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContextSection() {
  return (
    <section className="section" id="context" data-screen-label="04 Context Briefing">
      <div className="container two-col">
        <article className="card editorial">
          <SectionHeading kicker="Archive briefing" title="What is Resident Evil Code Veronica Remake?" />
          <p className="archive-meta">FILE ACCESS: SAFE / SOURCE LEVEL: TRACKED</p>
          <p>Resident Evil Veronica is the official title of Capcom's remake of 2000's Resident Evil Code: Veronica. Veronica Hub tracks verified information about the 2027 release window, confirmed platforms, official trailer status and Steam-backed story context.</p>
          <p>The current MVP avoids media rumors, player discussion, price speculation, demo assumptions and unconfirmed gameplay details.</p>
          <div className="cta-row">
            <a className="btn secondary" href="/story/">Read Story Guide</a>
            <a className="btn secondary" href="/sources/">View Sources</a>
          </div>
        </article>
        <aside className="card briefing">
          <h3>Archive Briefing</h3>
          <ul className="briefing-list">
            <li><span>Official title</span><strong>Resident Evil Veronica</strong></li>
            <li><span>Search alias</span><strong>Resident Evil Code Veronica Remake</strong></li>
            <li><span>Source classes</span><strong>Capcom / Steam / YouTube</strong></li>
            <li><span>Fact style</span><strong>Source-backed only</strong></li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function ReleaseSection() {
  return (
    <section className="section" id="release" data-screen-label="05 Release Date">
      <div className="container">
        <SectionHeading kicker="Date tracker" title="Release Date">No exact release date has been confirmed yet.</SectionHeading>
        <article className="card release-card">
          <p className="archive-meta">DATE FILE: ACTIVE / UNVERIFIED EXACT DATES REJECTED</p>
          <div className="release-grid">
            <div className="mini-stat"><span>Current window</span><strong>2027</strong></div>
            <div className="mini-stat"><span>Exact date</span><strong>Not confirmed</strong></div>
            <div className="mini-stat"><span>Policy</span><strong>No fake dates</strong></div>
          </div>
          <p className="meta">Update policy: Veronica Hub does not publish exact dates unless they are confirmed by an official or highly reliable source.</p>
          <div className="source-proof-row">
            <span>Sources</span>
            <a href="https://www.capcom.co.jp/ir/english/news/html/e260608.html" target="_blank" rel="noopener noreferrer">Capcom press release</a>
            <a href="https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/" target="_blank" rel="noopener noreferrer">Steam store page</a>
            <span>Last verified: 2026-06-09</span>
          </div>
          <div className="track-next">
            {["Exact release date", "New trailer updates", "Platform store changes", "PC system requirements", "Demo information", "Price / editions"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="cta-row">
            <a className="btn secondary" href="/sources/">View Sources</a>
            <a className="btn secondary" href="/platforms/">Platform Status</a>
          </div>
        </article>
      </div>
    </section>
  );
}

function PlatformsSection() {
  return (
    <section className="section" id="platforms" data-screen-label="06 Platforms">
      <div className="container">
        <SectionHeading kicker="Access cards" title="Platforms">Capcom confirms PlayStation 5, Xbox Series X|S, Nintendo Switch 2 and PC. Steam confirms a store page with wishlist access.</SectionHeading>
        <p className="platform-note">Platform marks are original abstract labels, not official logos.</p>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <article className="card platform-card" key={platform.name}>
              <div className="platform-icon" aria-hidden="true">{platform.icon}</div>
              <div>
                <h3>{platform.name}</h3>
                <p className="meta">Status: {platform.status}<br />Source: {platform.source}<br />Last verified: {platform.verified}<br />{platform.note}</p>
              </div>
            </article>
          ))}
        </div>
        <article className="store-file">
          <span className="archive-meta">STORE FILE / STEAM</span>
          <h3>Resident Evil Veronica Steam Store Page</h3>
          <p>Planned Release Date: 2027<br />Developer: CAPCOM Co., Ltd.<br />Publisher: CAPCOM Co., Ltd.<br />Steam page: available<br />Wishlist: available</p>
          <p className="meta">Store-listed features currently include single-player, Steam Achievements, captions available, HDR available and Family Sharing. Steam language and feature listings may change before release.</p>
          <a className="source-link" href="https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/" target="_blank" rel="noopener noreferrer">Open Steam Page</a>
        </article>
      </div>
    </section>
  );
}

function TrailerSection() {
  return (
    <section className="section" id="trailer" data-screen-label="07 Trailer">
      <div className="container">
        <SectionHeading kicker="Video terminal" title="Trailer">Official announcement trailer embedded from the verified BIOHAZARD official YouTube channel.</SectionHeading>
        <div className="terminal">
          <div className="terminal-screen video-ready">
            <iframe
              src={officialTrailer.embedUrl}
              title={officialTrailer.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            <span className="timecode">OFFICIAL VIDEO / {officialTrailer.channel}</span>
            <div className="terminal-caption">
              <span>Video ID: {officialTrailer.id}</span>
              <a href={officialTrailer.watchUrl} target="_blank" rel="noopener noreferrer">Open on YouTube</a>
            </div>
          </div>
        </div>
        <div className="source-proof-row trailer-source-row">
          <span>Verified trailer source</span>
          <a href={officialTrailer.watchUrl} target="_blank" rel="noopener noreferrer">BIOHAZARD official YouTube</a>
          <a href="https://prtimes.jp/main/html/rd/p/000005819.000013450.html" target="_blank" rel="noopener noreferrer">Capcom Japan press release</a>
          <span>Last verified: 2026-06-09</span>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  const [open, setOpen] = React.useState(false);
  return (
    <section className="section" id="story" data-screen-label="08 Story Primer">
      <div className="container two-col">
        <article className="card spoiler-card">
          <SectionHeading kicker="Found file" title="Story Briefing" />
          <div className="file-paper-head">
            <Badge type="confirmed">Steam story context</Badge>
            <span>ARCHIVE NOTE</span>
          </div>
          <p className="archive-meta">FILE ACCESS: SAFE / SOURCE: STEAM STORE / SPOILER LEVEL: LIGHT</p>
          <p>Three months after the biological disaster in Raccoon City, Claire Redfield travels to France in search of her brother, Chris Redfield. Instead of a reunion, she is captured by Umbrella special forces and transported to Rockfort Island, a remote island that becomes a survival-horror hellscape after another biological disaster.</p>
          <div className="accordion-item">
            <button className="accordion-button" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
              Original-game context policy
              <span>{open ? "-" : "+"}</span>
            </button>
            {open && (
              <div className="accordion-body">
                <p className="warning-copy">Original-game spoilers are not treated as remake-confirmed facts.</p>
                Steve Burnside, Albert Wesker, Alfred Ashford, Alexia Ashford, Antarctica, boss fights and original ending details belong in a future Original Game Context section unless Capcom or Steam confirms them for the remake page.
              </div>
            )}
          </div>
        </article>
        <aside className="card briefing">
          <h3>Story Terms</h3>
          <ul className="briefing-list">
            {["Claire Redfield", "Chris Redfield", "France", "Umbrella special forces", "Rockfort Island"].map((term) => (
              <li key={term}><span>Term</span><strong>{term}</strong></li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function CharactersSection() {
  return (
    <section className="section" id="characters" data-screen-label="09 Characters">
      <div className="container">
        <SectionHeading kicker="Personnel dossier" title="Characters">This page only surfaces people and entities named in current official store story context. Original-game legacy characters are not promoted as remake-confirmed.</SectionHeading>
        <div className="character-grid">
          {characters.map(([initials, name, role, spoiler, source], index) => (
            <article className="card character-card" key={name}>
              <div className="personnel-top">
                <span>PERSONNEL FILE</span>
                <Badge type={spoiler === "Confirmed" ? "confirmed" : "unknown"}>{spoiler}</Badge>
              </div>
              <div className="monogram">{initials}</div>
              <div>
                <h3>{name}</h3>
                <p className="meta">FILE-{initials.replace(".", "").replace(".", "")}-{String(index + 1).padStart(3, "0")}<br />Role: {role}<br />Source: {source}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="section" id="remake" data-screen-label="10 Remake vs Original">
      <div className="container">
        <SectionHeading kicker="Analysis file" title="Remake Direction">Only the remake direction confirmed by Capcom and Steam is listed. Specific camera, combat, puzzle or character-switching systems remain unconfirmed.</SectionHeading>
        <div className="comparison-wrap">
          <table>
            <thead>
              <tr><th>Area</th><th>Original</th><th>What may change in the remake</th><th>Status</th></tr>
            </thead>
            <tbody>
              {comparisonRows.map(([area, original, change, status]) => (
                <tr key={area}>
                  <td><strong>{area}</strong></td>
                  <td>{original}</td>
                  <td>{change}</td>
                  <td><Badge type={status === "Confirmed" ? "confirmed" : status === "Expected" ? "reported" : "unknown"}>{status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="section" id="faq" data-screen-label="11 FAQ">
      <div className="container">
        <SectionHeading kicker="Puzzle panel" title="FAQ">Common questions unlocked with source notes and last-verified context.</SectionHeading>
        <div className="faq-grid">
          {faq.map(([question, answer], index) => (
            <div className="accordion-item" key={question}>
              <button className="accordion-button" type="button" aria-expanded={open === index} onClick={() => setOpen(open === index ? -1 : index)}>
                <span className="lock-label">LOCK {String(index + 1).padStart(2, "0")}</span>
                {question}
                <span>{open === index ? "-" : "+"}</span>
              </button>
              {open === index && <div className="accordion-body">{answer}<p className="meta">Source note: source-backed answer / last verified 2026-06-09</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SourcesSection() {
  return (
    <section className="section" id="sources" data-screen-label="12 Sources">
      <div className="container">
        <SectionHeading kicker="Evidence locker" title="Sources & Verification">Veronica Hub MVP uses three reliable source classes: Capcom official material, Steam official store data and Resident Evil / BIOHAZARD official YouTube video records.</SectionHeading>
        <article className="verification-policy">
          <span className="archive-meta">SOURCE POLICY / EXACT DATES LOCKED UNTIL VERIFIED</span>
          <p>Veronica Hub does not publish exact dates, demo information, prices, editions, PC specifications or specific gameplay systems unless they are confirmed by an official or highly reliable source.</p>
          <span className="redacted" aria-hidden="true"></span>
        </article>
        <div className="source-grid">
          {sources.map(([name, type, reliability, usedFor, checked, href], index) => (
            <article className="card source-card" key={name}>
              <span className="slot-code">SOURCE FILE {String(index + 1).padStart(2, "0")}</span>
              <Badge type={type.includes("Official") ? "official" : type === "Media" ? "media" : "reported"}>{type}</Badge>
              <div>
                <h3>{name}</h3>
                <p className="meta">Reliability: {reliability}<br />Last checked: {checked}<br />Used for: {usedFor}</p>
                <a className="source-link" href={href} target={href.startsWith("#") ? undefined : "_blank"} rel={href.startsWith("#") ? undefined : "noopener noreferrer"}>View source</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
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
          <p>Independent fan-made information hub. Veronica Hub is not affiliated with or endorsed by Capcom.</p>
          <p className="meta">We do not host ROMs, ISOs, cracks or unofficial downloads.</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          {navItems.slice(1).map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <div className="footer-links">
          <a href="/sources/">Sources policy</a>
          <a href="/faq/">Source correction policy</a>
          <p className="meta">Last source review: 2026-06-09</p>
        </div>
      </div>
    </footer>
  );
}

function SearchOverlay({ onClose }) {
  const suggestions = ["release date", "platforms", "trailer", "Steam", "Claire Redfield", "story", "sources"];
  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search files">
      <div className="search-modal">
        <div className="modal-head">
          <strong>Search files</strong>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close search">x</button>
        </div>
        <input className="search-input" autoFocus placeholder="Search release date, platforms, trailer..." />
        <div className="suggestions">
          {suggestions.map((item) => <button className="chip" type="button" key={item}>{item}</button>)}
        </div>
        <p className="meta" style={{ marginTop: 14 }}>Search shortcuts focus on official title, release window, platforms, trailer status, story context and source policy.</p>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }) {
  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <aside className="drawer-panel">
        <div className="modal-head">
          <a className="brand" href="/" onClick={onClose}><span className="mark">VH</span><span className="brand-title"><strong>Veronica Hub</strong><span>Menu</span></span></a>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close menu">x</button>
        </div>
        <nav className="drawer-links">
          {navItems.map(([label, href], index) => <a key={label} href={href} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}
        </nav>
        <p className="meta">Independent fan-made information site. Official media is source-labeled; no ROMs, no piracy.</p>
      </aside>
    </div>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const currentPath = window.location.pathname === "" ? "/" : window.location.pathname;

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    const section = routeToSection[window.location.pathname];
    if (!section) return;
    window.setTimeout(() => {
      document.querySelector(section)?.scrollIntoView({ block: "start" });
    }, 80);
  }, []);

  return (
    <div className="app-shell">
      <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
      <main>
        <Hero />
        <OfficialMediaTerminal />
        <QuickFacts />
        <ReleaseSection />
        <PlatformsSection />
        <StorySection />
        <TrailerSection />
        <SourcesSection />
        {currentPath === "/characters/" && <CharactersSection />}
        {currentPath === "/faq/" && <FAQSection />}
      </main>
      <Footer />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
