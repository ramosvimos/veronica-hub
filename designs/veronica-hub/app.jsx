import * as React from "react";
import * as ReactDOM from "react-dom/client";

const navItems = [
  ["Home", "#home"],
  ["Release Date", "#release"],
  ["Platforms", "#platforms"],
  ["Trailer", "#trailer"],
  ["Story", "#story"],
  ["Characters", "#characters"],
  ["FAQ", "#faq"],
  ["Sources", "#sources"]
];

const facts = [
  { label: "Project status", value: "Announced", status: "confirmed", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Release window", value: "2027", status: "confirmed", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "Exact date", value: "Not confirmed", status: "unknown", source: "Capcom press release", verified: "2026-06-09", sourceLevel: "Official" },
  { label: "PC / Steam", value: "Tracked", status: "confirmed", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" },
  { label: "Genre", value: "Survival horror", status: "reported", source: "Steam store", verified: "2026-06-09", sourceLevel: "Store" }
];

const updates = [
  {
    date: "2026-06-08",
    tag: "Official",
    status: "official",
    title: "Capcom announces Resident Evil Veronica for 2027",
    summary: "The source record says Resident Evil Veronica is a remake of the 2000 title and that the exact release date will be announced later.",
    source: "Capcom via Business Wire",
    href: "https://www.businesswire.com/news/home/20260608994346/en/Resident-Evil-Veronica-to-Launch-in-2027"
  },
  {
    date: "2026-06-08",
    tag: "Store",
    status: "media",
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
    summary: "The homepage treats the release window as confirmed, while the exact date and gameplay specifics remain not officially confirmed.",
    source: "Veronica Hub source policy",
    href: "#sources"
  }
];

const platforms = [
  { icon: "PC", name: "PC", status: "Confirmed", source: "Steam store", note: "Store page tracked" },
  { icon: "PS", name: "PlayStation 5", status: "Reported", source: "Announcement coverage", note: "Use source badge in production" },
  { icon: "XB", name: "Xbox Series X|S", status: "Reported", source: "Announcement coverage", note: "Tracked as current-gen console" },
  { icon: "NS", name: "Nintendo Switch 2", status: "Reported", source: "Announcement coverage", note: "Added from current source review" },
  { icon: "ST", name: "Steam", status: "Confirmed", source: "Steam store", note: "Wishlist page present" }
];

const characters = [
  ["C.R.", "Claire Redfield", "Protagonist / survivor", "Light", "Original game / official source"],
  ["C.H.", "Chris Redfield", "Search target / sibling link", "Light", "Original game / official source"],
  ["S.B.", "Steve Burnside", "Rockfort Island survivor", "Light", "Original game / official source"],
  ["A.W.", "Albert Wesker", "Series antagonist context", "Heavy", "Original game / series source"],
  ["A.A.", "Alfred Ashford", "Ashford family dossier", "Heavy", "Original game / archive context"],
  ["A.X.", "Alexia Ashford", "Spoiler-sensitive archive", "Heavy", "Original game / archive context"]
];

const comparisonRows = [
  ["Camera", "Fixed-camera survival horror era.", "Modern presentation may change camera behavior.", "Unknown"],
  ["Controls", "Tank-control foundation in the original release.", "May be modernized, but no system should be stated as confirmed yet.", "Unknown"],
  ["Story", "Claire searches for Chris after Raccoon City.", "Capcom says the story is being reimagined.", "Confirmed"],
  ["Visuals", "Original Dreamcast-era real-time 3D environments.", "Capcom says high-quality RE Engine graphics are planned.", "Confirmed"],
  ["Puzzles", "Classic resource and puzzle pacing.", "Expected to be reworked, but details are not confirmed.", "Expected"]
];

const faq = [
  ["Is Resident Evil Code Veronica Remake official?", "Yes. Capcom announced Resident Evil Veronica, a remake of Resident Evil Code: Veronica, with a planned 2027 release."],
  ["What is the release date?", "A 2027 release window is confirmed. An exact date has not been officially confirmed."],
  ["Is it coming to PC or Steam?", "A Steam product page exists and lists a 2027 release window. Veronica Hub tracks the Steam page as a primary source for PC status."],
  ["Is it a full remake or a remaster?", "Capcom describes it as a remake with a reimagined story and RE Engine graphics. Specific gameplay systems still need source-backed confirmation."],
  ["Do I need to play the original?", "No. The hub is designed for newcomers with spoiler-light story context first and deeper archive sections hidden by default."],
  ["Is Veronica Hub an official site?", "No. Veronica Hub is an independent fan-made information site and is not affiliated with or endorsed by Capcom."]
];

const sources = [
  ["Capcom press release", "Official", "High", "Release window, remake status", "2026-06-09", "https://www.businesswire.com/news/home/20260608994346/en/Resident-Evil-Veronica-to-Launch-in-2027"],
  ["Steam store", "Official store", "High", "PC status, release window", "2026-06-09", "https://store.steampowered.com/app/4824610/Resident_Evil_Veronica/"],
  ["Official YouTube", "Official", "High", "Verified trailer embed when URL is added", "Pending", "#trailer"],
  ["Games media", "Media", "Medium", "Platform reporting and timeline notes", "2026-06-09", "#updates"]
];

function Badge({ type, children }) {
  return <span className={`badge ${type.toLowerCase()}`}>{children}</span>;
}

function fileCode(index) {
  return `FILE ${String(index + 1).padStart(2, "0")}`;
}

function Header({ onSearch, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#home" aria-label="Veronica Hub home">
          <span className="mark">VH</span>
          <span className="brand-title">
            <strong>Veronica Hub</strong>
            <span>Independent archive</span>
          </span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {navItems.map(([label, href], index) => (
            <a key={label} className={index === 0 ? "active" : ""} href={href}>
              <span className="nav-code">{fileCode(index)}</span>
              <span className="nav-label">{label}</span>
            </a>
          ))}
        </nav>
        <div className="top-actions">
          <button className="utility-button" type="button" onClick={onSearch}>Search files</button>
          <a className="latest-pill" href="#updates">Latest Update</a>
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
        <div>
          <div className="eyebrow-row">
            <span className="chip cyan">Independent fan-made information hub</span>
            <span className="chip red">No ROMs or piracy</span>
            <span className="chip">Source-first updates</span>
          </div>
          <h1>Resident Evil <span>Code Veronica</span> Remake</h1>
          <p className="hero-subtitle">Release date, platforms, trailer, story and latest news in one beginner-friendly survival-horror dossier.</p>
          <div className="cta-row">
            <a className="btn primary" href="#release">Release Date</a>
            <a className="btn secondary" href="#trailer">Trailer Status</a>
            <a className="btn secondary" href="#story">Read Story Guide</a>
          </div>
          <p className="trust-note">FILE STATUS: TRACKING / LAST VERIFIED: 2026-06-09 / EXACT DATE: NOT OFFICIALLY CONFIRMED</p>
        </div>
        <aside className="dossier-panel" aria-label="Dossier status panel">
          <div className="panel-header">
            <h2>Dossier Status</h2>
            <span className="panel-code">VH-REV-2027</span>
          </div>
          <div className="tracking-pulse" aria-hidden="true"><span></span></div>
          <dl className="status-list">
            <div className="status-row"><dt>File status</dt><dd><Badge type="confirmed">Tracking</Badge> Official update monitor active</dd></div>
            <div className="status-row"><dt>Release window</dt><dd><Badge type="confirmed">Confirmed</Badge> 2027</dd></div>
            <div className="status-row"><dt>Platforms</dt><dd><Badge type="reported">Tracked</Badge> PC, Steam, PS5, Xbox Series X|S, Switch 2</dd></div>
            <div className="status-row"><dt>Exact date</dt><dd><Badge type="unknown">Unknown</Badge> Not officially confirmed</dd></div>
            <div className="status-row"><dt>Source level</dt><dd>Official / Store / Media cross-check</dd></div>
            <div className="status-row"><dt>Last verified</dt><dd>2026-06-09</dd></div>
          </dl>
        </aside>
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
        <SectionHeading kicker="Inventory grid" title="Quick Facts">Source-backed details arranged as archive inventory slots, with confirmed, reported and unknown states separated.</SectionHeading>
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
          <p>Resident Evil Veronica is a modern remake of Resident Evil Code: Veronica. Veronica Hub tracks verified information about its release window, platforms, trailer, story context, characters and changes from the original.</p>
          <p>The beginner path focuses on Claire Redfield, Chris Redfield, Umbrella, Rockfort Island and the classic survival horror timeline without treating speculation as fact.</p>
          <div className="cta-row">
            <a className="btn secondary" href="#story">Read Story Guide</a>
            <a className="btn secondary" href="#characters">View Characters</a>
          </div>
        </article>
        <aside className="card briefing">
          <h3>Archive Briefing</h3>
          <ul className="briefing-list">
            <li><span>Story context</span><strong>Claire / Chris / Umbrella</strong></li>
            <li><span>Spoiler level</span><strong>Light by default</strong></li>
            <li><span>Best next page</span><strong>Story Guide</strong></li>
            <li><span>Fact style</span><strong>Source-backed</strong></li>
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
            <div className="mini-stat"><span>Exact date</span><strong>Unknown</strong></div>
            <div className="mini-stat"><span>Policy</span><strong>No fake dates</strong></div>
          </div>
          <p className="meta">Update policy: Veronica Hub does not publish exact dates unless they are confirmed by an official or highly reliable source.</p>
          <div className="cta-row">
            <a className="btn secondary" href="#sources">View Sources</a>
            <a className="btn secondary" href="#updates">Latest Date Updates</a>
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
        <SectionHeading kicker="Access cards" title="Platforms">Platform cards use original abstract marks, not official platform logos.</SectionHeading>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <article className="card platform-card" key={platform.name}>
              <div className="platform-icon" aria-hidden="true">{platform.icon}</div>
              <div>
                <h3>{platform.name}</h3>
                <p className="meta">Status: {platform.status}<br />Source: {platform.source}<br />{platform.note}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrailerSection() {
  return (
    <section className="section" id="trailer" data-screen-label="07 Trailer">
      <div className="container">
        <SectionHeading kicker="Video terminal" title="Trailer">Official trailer embed will appear here once a verified video URL is added.</SectionHeading>
        <div className="terminal">
          <div className="terminal-screen" role="img" aria-label="Corrupted video terminal placeholder for verified trailer">
            <span className="recording-dot" aria-hidden="true"></span>
            <span className="play-core" aria-hidden="true">▶</span>
            <span className="timecode">00:00:00 / VERIFIED SOURCE REQUIRED</span>
            <div className="terminal-caption">
              <span>Awaiting verified official trailer URL</span>
              <span>Embed locked / source required</span>
            </div>
          </div>
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
          <SectionHeading kicker="Found file" title="Story Primer" />
          <div className="file-paper-head">
            <Badge type="reported">Spoiler-light</Badge>
            <span>ARCHIVE NOTE</span>
          </div>
          <p className="archive-meta">FILE ACCESS: SAFE / SPOILER LEVEL: LIGHT</p>
          <p>The original Code: Veronica connects Claire Redfield, Chris Redfield, Umbrella, Rockfort Island and the classic survival horror timeline. This section gives new players the basic context without late-game reveals.</p>
          <div className="accordion-item">
            <button className="accordion-button" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
              Unlock spoiler-full archive
              <span>{open ? "-" : "+"}</span>
            </button>
            {open && (
              <div className="accordion-body">
                <p className="warning-copy">WARNING: Heavy spoilers from the original game may appear below.</p>
                Heavy spoilers from the original game may appear in the production page. This expanded state demonstrates the warning flow without publishing late-game reveals.
              </div>
            )}
          </div>
        </article>
        <aside className="card briefing">
          <h3>Story Terms</h3>
          <ul className="briefing-list">
            {["Claire Redfield", "Chris Redfield", "Umbrella", "Rockfort Island", "Ashford"].map((term) => (
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
        <SectionHeading kicker="Personnel dossier" title="Characters">No official character art is used. Cards rely on monograms, archive numbers and spoiler badges.</SectionHeading>
        <div className="character-grid">
          {characters.map(([initials, name, role, spoiler, source], index) => (
            <article className="card character-card" key={name}>
              <div className="personnel-top">
                <span>PERSONNEL FILE</span>
                <Badge type={spoiler === "Light" ? "reported" : "unknown"}>{spoiler}</Badge>
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
        <SectionHeading kicker="Analysis file" title="Remake vs Original">Lab analysis of confirmed, expected and unknown changes, without overpromising unverified gameplay details.</SectionHeading>
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
        <SectionHeading kicker="Evidence locker" title="Sources & Verification">Every fact on Veronica Hub is tied to a source, and rumor labels are treated as part of the interface, not afterthought copy.</SectionHeading>
        <article className="verification-policy">
          <span className="archive-meta">SOURCE POLICY / EXACT DATES LOCKED UNTIL VERIFIED</span>
          <p>Veronica Hub does not publish exact dates, demo information, prices or system requirements unless they are confirmed by a reliable source.</p>
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

function Newsletter() {
  return (
    <section className="section" data-screen-label="13 Newsletter CTA">
      <div className="container">
        <div className="newsletter">
          <div>
            <h2>Get Update Alerts</h2>
            <p>Want a reminder when verified release date, platform or trailer information changes? Newsletter integration is planned for a future version.</p>
            <p className="meta">Signup is disabled for now while the source policy and correction flow are finalized.</p>
          </div>
          <div className="cta-row">
            <input className="disabled-input" disabled value="Newsletter disabled for launch review" aria-label="Newsletter disabled placeholder" />
            <button className="btn secondary" type="button" disabled>Notify Me Later</button>
          </div>
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
          <a className="brand" href="#home">
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
          <a href="#sources">Sources policy</a>
          <a href="#faq">Correction request placeholder</a>
          <p className="meta">Last source review: 2026-06-09</p>
        </div>
      </div>
    </footer>
  );
}

function SearchOverlay({ onClose }) {
  const suggestions = ["release date", "platforms", "trailer", "Steam", "Claire Redfield", "remake vs original", "story", "FAQ"];
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
        <p className="meta" style={{ marginTop: 14 }}>Search suggestions are staged for launch. Full indexing can connect to page data later.</p>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }) {
  return (
    <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile menu">
      <aside className="drawer-panel">
        <div className="modal-head">
          <a className="brand" href="#home" onClick={onClose}><span className="mark">VH</span><span className="brand-title"><strong>Veronica Hub</strong><span>Menu</span></span></a>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close menu">x</button>
        </div>
        <nav className="drawer-links">
          {navItems.map(([label, href], index) => <a key={label} href={href} onClick={onClose}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}
        </nav>
        <p className="meta">Independent fan-made information site. No official assets, no ROMs, no piracy.</p>
      </aside>
    </div>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  return (
    <div className="app-shell">
      <Header onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} />
      <main>
        <Hero />
        <QuickFacts />
        <Updates />
        <ContextSection />
        <ReleaseSection />
        <PlatformsSection />
        <TrailerSection />
        <StorySection />
        <CharactersSection />
        <ComparisonSection />
        <FAQSection />
        <SourcesSection />
        <Newsletter />
      </main>
      <Footer />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      {menuOpen && <MobileDrawer onClose={() => setMenuOpen(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
