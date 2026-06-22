import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));
const bundlePath = "/designs/veronica-hub/app.bundle.js";
const stylesheetPath = "/styles/site.css";
const adsenseClient = "ca-pub-2875158540739129";
const primaryNav = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/media/", "/sources/", "/watchlist/"];
const footerUtilityRoutes = ["/pc-requirements/", "/preorder/", "/demo/", "/editions/", "/characters/", "/screenshots/", "/steam/", "/faq/", "/changelog/"];

const articleRoutes = new Set([
  "/release-date/",
  "/platforms/",
  "/pc-requirements/",
  "/preorder/",
  "/demo/",
  "/editions/",
  "/original-vs-remake/",
  "/screenshots/",
  "/steam/",
  "/story/",
  "/characters/",
  "/sources/",
  "/changelog/",
  "/watchlist/"
]);
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
  { href: "#franchise-timeline", label: "History Timeline", meta: "Series order" },
  { href: "#classic-origins", label: "Classic Origins", meta: "Predecessors" },
  { href: "#reference-games", label: "Reference Games", meta: "Playable context" },
  { href: "#creator-videos", label: "Creator Videos", meta: "Watch clips" }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routeOutputPath(routePath) {
  if (routePath === "/") return path.join(root, "index.html");
  return path.join(root, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

function absoluteUrl(routePath) {
  return `${data.site.origin}${routePath}`;
}

function routeClaims(routePath) {
  return data.claims.filter((claim) => claim.pages.includes(routePath));
}

function sortedByRelease(items = []) {
  return [...items].sort((a, b) => {
    const aYear = Number.parseInt(a.release, 10) || 0;
    const bYear = Number.parseInt(b.release, 10) || 0;
    return aYear - bYear;
  });
}

function sortedTimeline(items = []) {
  return [...items].sort((a, b) => {
    const aYear = Number.parseInt(a.year, 10) || 0;
    const bYear = Number.parseInt(b.year, 10) || 0;
    return aYear - bYear;
  });
}

function routeMedia(routePath) {
  const media = data.media.filter((item) => item.pages.includes(routePath));
  if (routePath === "/screenshots/") return media.filter((item) => item.kind.includes("screenshot"));
  if (routePath !== "/media/") return media;
  const mediaById = new Map(media.filter((item) => item?.id).map((item) => [item.id, item]));
  return mediaGalleryIds
    .map((id) => mediaById.get(id))
    .filter(Boolean);
}

function mediaByIds(ids, routePath = "/media/") {
  const mediaById = new Map(data.media.map((item) => [item.id, item]));
  return ids
    .map((id) => mediaById.get(id))
    .filter((item) => item?.pages.includes(routePath));
}

function editorialAssetCover(id) {
  return editorialAssetCovers[id] || null;
}

function sourceById(id) {
  return data.sources.find((source) => source.id === id);
}

function routeByPath(routePath) {
  return data.routes.find((route) => route.path === routePath);
}

function footerLinks(paths) {
  return paths
    .map((routePath) => routeByPath(routePath))
    .filter(Boolean)
    .map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.navLabel)}</a>`)
    .join("");
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

function timelineResourceHref(title) {
  const game = (data.referenceGames || []).find((item) => item.title === title);
  return game ? `#${referenceGameId(game)}` : "";
}

function sourceLinks(sourceIds) {
  return sourceIds
    .map((id) => sourceById(id))
    .filter(Boolean)
    .map((source) => `<a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>`)
    .join(", ");
}

function changelogId(entry) {
  return slugify(`${entry.date}-${entry.title}`);
}

function mediaResourceLinks(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return items
    .map((item, index) => {
      const url = escapeHtml(item.url || "");
      const label = escapeHtml(item.label || item.url || "Open");
      const separator = index < items.length - 1 ? " / " : "";
      return `<a href="${url}">${label}</a>${separator}`;
    })
    .join("");
}

function gameMediaSection(game) {
  const media = game.media || [];
  if (!media.length) {
    return `<p class="meta">Image resources: No official image references provided.</p>`;
  }
  return `
    <div class="reference-media-strip">
      ${media.map((item) => {
        const src = escapeHtml(item.src || "");
        const label = escapeHtml(item.label || "Image");
        const source = escapeHtml(item.source || "Official image");
        const alt = escapeHtml(item.alt || item.label || "Game media");
        return `<figure class="reference-media-item">
          ${imageMarkup({ src: item.src || "", alt: item.alt || item.label || "Game media" })}
          <figcaption><strong>${label}</strong><span>${source}</span></figcaption>
        </figure>`;
      }).join("")}
    </div>`;
}

function optimizedImageSrc(src) {
  if (
    !src.startsWith("/assets/official/") &&
    !src.startsWith("/assets/reference-games/") &&
    !src.startsWith("/assets/company/")
  ) return null;
  const extension = path.extname(src).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(extension)) return null;
  return `/assets/optimized/${path.basename(src, extension)}.webp`;
}

function imageMarkup(item) {
  const img = `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async" fetchpriority="low" />`;
  const optimizedSrc = optimizedImageSrc(item.src);
  if (!optimizedSrc) return img;
  return `<picture><source srcset="${escapeHtml(optimizedSrc)}" type="image/webp" />${img}</picture>`;
}

function preloadLinks(route) {
  if (route.path !== "/") return "";
  return [
    "/assets/optimized/capcom-veronica-press-a.webp",
    "/assets/optimized/steam-page-bg.webp"
  ].map((href) => `<link rel="preload" as="image" href="${href}" type="image/webp" fetchpriority="high" />`).join("\n  ");
}

function primarySources() {
  return data.sources.filter((source) => !source.type.includes("comparison") && source.type !== "site-policy");
}

function claimCards(routePath) {
  const claims = routeClaims(routePath);
  const visibleClaims = claims.length ? claims : data.claims.slice(0, 5);
  return visibleClaims.map((claim) => `
    <article class="static-card static-claim">
      <p class="eyebrow">${escapeHtml(claim.status)}</p>
      <h2>${escapeHtml(claim.label)}</h2>
      <p><strong>${escapeHtml(claim.value)}</strong></p>
      <p>Last checked: ${escapeHtml(claim.lastChecked)}. Last changed: ${escapeHtml(claim.lastChanged)}. Sources: ${sourceLinks(claim.sourceIds)}.</p>
    </article>`).join("");
}

function mediaGrid(routePath) {
  if (routePath === "/media/") {
    const spotlightMedia = mediaByIds(mediaSpotlightIds);
    const assetMedia = mediaByIds(mediaAssetIds);
    return `
    <section class="static-section" id="official-gallery">
      <h2>Official Screenshots First</h2>
      <p>The main wall leads with distinct in-game frames. Repeated logo and store assets stay available in the archive strip below.</p>
      <div class="media-showcase">
        ${spotlightMedia.map((item, index) => {
          const source = sourceById(item.sourceId);
          const variant = index === 0 ? "media-card-lead" : "media-card-compact";
          return `<figure class="static-media-card ${variant}">
            ${imageMarkup(item)}
            <figcaption><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.kind)}${source ? ` / ${escapeHtml(source.name)}` : ""}</span></figcaption>
          </figure>`;
        }).join("")}
      </div>
      <div class="asset-strip-head">
        <span class="eyebrow">Store and brand assets</span>
        <p>Capsules, headers, key art and page backgrounds are still tracked, but they no longer dominate the first scan.</p>
      </div>
      <div class="media-asset-strip">
        ${assetMedia.map((item) => {
          const source = sourceById(item.sourceId);
          const cover = editorialAssetCover(item.id);
          const image = cover ? { src: cover.src, alt: cover.alt } : item;
          const prefix = cover ? "site editorial cover / " : "";
          return `<figure class="static-media-card media-card-asset">
            ${imageMarkup(image)}
            <figcaption><strong>${escapeHtml(item.title)}</strong><span>${prefix}${escapeHtml(item.kind)}${source ? ` / ${escapeHtml(source.name)}` : ""}</span></figcaption>
          </figure>`;
        }).join("")}
      </div>
    </section>`;
  }

  const media = routeMedia(routePath);
  const visibleMedia = routePath === "/media/" || routePath === "/screenshots/" ? media : media.slice(0, 6);
  if (!visibleMedia.length) return "";
  return `
    <section class="static-section" id="${routePath === "/media/" ? "official-gallery" : "official-media"}">
      <h2>Official Media References</h2>
      <div class="static-media-grid">
        ${visibleMedia.map((item) => {
          const source = sourceById(item.sourceId);
          return `<figure class="static-media-card">
            ${imageMarkup(item)}
            <figcaption><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.kind)}${source ? ` / ${escapeHtml(source.name)}` : ""}</span></figcaption>
          </figure>`;
        }).join("")}
      </div>
    </section>`;
}

function mediaSectionNav() {
  return `
    <section class="static-section static-section-compact" aria-label="Media page sections">
      <div class="section-jump-nav">
        ${mediaSectionLinks.map((item, index) => `
          <a href="${escapeHtml(item.href)}">
            <span class="nav-code">SEC ${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.meta)}</span>
          </a>`).join("")}
      </div>
    </section>`;
}

function referenceGamesSection() {
  const games = sortedByRelease(data.referenceGames || []);
  if (!games.length) return "";
  return `
    <section class="static-section" id="reference-games">
      <h2>Reference Game Encyclopedia</h2>
      <div class="static-grid">
        ${games.map((game) => `
          <article class="static-card" id="${escapeHtml(referenceGameId(game))}">
            <p class="eyebrow">${escapeHtml(game.release || "")} / ${escapeHtml(game.position || "")}</p>
            <h3>${escapeHtml(game.title)}</h3>
            <p class="meta">来源: ${escapeHtml(game.origin || "")}</p>
            <p class="meta">故事关系: ${escapeHtml(game.storyContext || "")}</p>
            <p class="meta">可玩性: ${escapeHtml(game.playability || "")}</p>
            <p class="meta">为什么对比: ${escapeHtml(game.whyReference || "")}</p>
            <p class="meta">图片资料:</p>
            ${gameMediaSection(game)}
            ${game.links && game.links.length ? `<p class="meta">来源链接: ${mediaResourceLinks(game.links)}</p>` : ""}
            ${game.clips && game.clips.length ? `<p class="meta">片段链接: ${mediaResourceLinks(game.clips)}</p>` : ""}
          </article>`).join("")}
      </div>
    </section>`;
}

function timelineSection() {
  const timeline = sortedTimeline(data.gameHistoryTimeline || []);
  const games = sortedByRelease(data.referenceGames || []);
  if (!timeline.length) return "";
  return `
    <section class="static-section" id="franchise-timeline">
      <h2>Franchise Timeline</h2>
      <div class="timeline-tools">
        <label for="reference-game-jump-static">Jump to resource card</label>
        <select id="reference-game-jump-static" class="jump-select" onchange="if (this.value) location.hash = this.value">
          <option value="" selected disabled>Choose a game</option>
          ${games.map((game) => `<option value="${escapeHtml(referenceGameId(game))}">${escapeHtml(game.release || "")} / ${escapeHtml(game.title || "")}</option>`).join("")}
        </select>
      </div>
      <div class="timeline-list">
        ${timeline.map((event) => {
          const resourceHref = timelineResourceHref(event.title);
          return `
          <article class="static-card">
            <p class="eyebrow">${escapeHtml(event.year || "")}</p>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.event)}</p>
            <p class="meta">Impact: ${escapeHtml(event.impact || "")}</p>
            ${event.note ? `<p class="meta">Note: ${escapeHtml(event.note)}</p>` : ""}
            ${resourceHref ? `<a class="source-link" href="${escapeHtml(resourceHref)}">Open resource card</a>` : ""}
          </article>`;
        }).join("")}
      </div>
    </section>`;
}

function classicsSection() {
  const positionSet = new Set(["RE1", "RE0", "RE2", "RE3", "RE CV", "RE4", "RE5", "RE6", "RE7", "RE2 Remake", "RE3 Remake", "RE8", "RE4 Remake"]);
  const games = sortedByRelease(data.referenceGames || []).filter((game) => positionSet.has(game.position));
  if (!games.length) return "";
  return `
    <section class="static-section" id="classic-origins">
      <h2>Classic Origins</h2>
      <div class="static-grid">
        ${games.map((game) => `
          <article class="static-card">
            <p class="eyebrow">${escapeHtml(game.position || "")}</p>
            <h3>${escapeHtml(game.title)} (${escapeHtml(game.release || "")})</h3>
            <p>Story context: ${escapeHtml(game.storyContext || "")}</p>
            <p>Why include: ${escapeHtml(game.whyReference || "")}</p>
            <p>Origin: ${escapeHtml(game.origin || "")}</p>
            ${game.links && game.links.length ? `<p class="meta">Official references: ${mediaResourceLinks(game.links)}</p>` : ""}
            ${game.clips && game.clips.length ? `<p class="meta">Clips: ${mediaResourceLinks(game.clips)}</p>` : ""}
            <p class="meta">Playable traits: ${escapeHtml(game.playability || "")}</p>
          </article>`).join("")}
      </div>
    </section>`;
}

function creatorVideosSection() {
  const videos = data.creatorVideos || [];
  if (!videos.length) return "";
  return `
    <section class="static-section" id="creator-videos">
      <h2>Creator Videos</h2>
      <div class="static-grid">
        ${videos.map((video) => {
          const links = [
            { label: video.linkLabel || "Watch channel videos", url: video.url },
            ...(video.query ? [{ label: "Search related clips", url: video.query }] : [])
          ];
          return `<article class="static-card">
            <p class="eyebrow">${escapeHtml(video.creator || "Creator")}</p>
            <h3>${escapeHtml(video.title)}</h3>
            <p>${escapeHtml(video.context || "")}</p>
            <p>Reason: ${escapeHtml(video.reason || "")}</p>
            <p class="meta">${mediaResourceLinks(links)}</p>
          </article>`;
        }).join("")}
      </div>
    </section>`;
}

function officialVideosSection({ compact = false } = {}) {
  const videos = data.officialVideos || [];
  if (!videos.length) return "";
  const visibleVideos = compact ? videos.slice(0, 3) : videos;
  return `
    <section class="static-section" id="official-videos">
      <h2>Official Video Library</h2>
      <p>Verified uploads from Capcom, platform-holder and Summer Game Fest channels.</p>
      <div class="static-grid">
        ${visibleVideos.map((video) => {
          const source = sourceById(video.sourceId);
          return `<article class="static-card">
            <p class="eyebrow">${escapeHtml(video.channel || "")} / ${escapeHtml(video.uploadDate || "")}</p>
            <h3>${escapeHtml(video.title || "")}</h3>
            <p>${escapeHtml(video.role || "")}</p>
            <p class="meta">${escapeHtml(video.language || "")} / ${escapeHtml(video.region || "")} / ${escapeHtml(video.duration || "")}</p>
            <p class="meta">${escapeHtml(video.note || "")}</p>
            <p class="meta">Source: ${source ? `<a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>` : "Official video"}</p>
            <p class="meta"><a href="${escapeHtml(video.url || "")}">Open video</a></p>
          </article>`;
        }).join("")}
      </div>
      ${compact && videos.length > visibleVideos.length ? `<p class="meta"><a href="/trailer/#official-videos">View all official videos</a></p>` : ""}
    </section>`;
}

function watchlistSection({ expanded = false } = {}) {
  const watchlist = data.watchlist;
  if (!watchlist) return "";
  return `
    <section class="static-section watchlist-section" id="watchlist">
      <h2>${escapeHtml(watchlist.headline)}</h2>
      <div class="static-grid">
        <article class="static-card watchlist-card">
          <p>${escapeHtml(watchlist.promise)}</p>
          <div class="watchlist-actions">
            <a class="source-link" href="${escapeHtml(watchlist.rssUrl)}">Open RSS feed</a>
            <a class="source-link" href="/changelog/">View changelog</a>
          </div>
        </article>
        <article class="static-card watchlist-card">
          <p class="eyebrow">Notify only when these official facts change</p>
          <ul class="watchlist-topic-list">
            ${watchlist.topics.map((topic) => `<li>${escapeHtml(topic)}</li>`).join("")}
          </ul>
        </article>
      </div>
    </section>`;
}

function screenshotSourceSection() {
  const screenshots = data.media.filter((item) => item.pages.includes("/screenshots/") && item.kind.includes("screenshot"));
  return `
    <section class="static-section">
      <h2>Screenshot Source Rules</h2>
      <div class="static-grid">
        <article class="static-card">
          <p class="eyebrow">Official gallery</p>
          <h3>${screenshots.length} official screenshots tracked</h3>
          <p>Images on this page come from Steam or Capcom-linked official material. Fan edits, leaked images and original-game captures are not included in the remake screenshot gallery.</p>
        </article>
        <article class="static-card">
          <p class="eyebrow">Update policy</p>
          <h3>New images need a source change</h3>
          <p>New screenshots are added only when an official store page, Capcom page or verified official channel publishes new media.</p>
        </article>
      </div>
    </section>`;
}

function steamStatusSection() {
  const source = sourceById("steam-store");
  return `
    <section class="static-section">
      <h2>Steam Status</h2>
      <div class="static-grid">
        <article class="static-card">
          <p class="eyebrow">Store page</p>
          <h3>Wishlist access is live</h3>
          <p>The official Steam page is live for Resident Evil Veronica, which confirms PC store presence and wishlist access.</p>
          ${source ? `<a class="source-link" href="${escapeHtml(source.url)}">Open Steam page</a>` : ""}
        </article>
        <article class="static-card">
          <p class="eyebrow">PC requirements</p>
          <h3>Minimum and recommended specs are TBD</h3>
          <p>Steam currently lists Resident Evil Veronica PC system requirements as TBD, so upgrade guidance should remain clearly labeled as an estimate.</p>
          <a class="source-link" href="/pc-requirements/">View PC status</a>
        </article>
        <article class="static-card">
          <p class="eyebrow">Purchase status</p>
          <h3>Wishlist is not preorder</h3>
          <p>Price, preorder timing, editions and bonuses remain unknown until Steam or Capcom publishes those details.</p>
          <a class="source-link" href="/preorder/">View preorder status</a>
        </article>
      </div>
    </section>`;
}

function routeSpecific(route) {
  if (route.path === "/media/") {
    return `${mediaSectionNav()}${mediaGrid(route.path)}${officialVideosSection()}${timelineSection()}${classicsSection()}${referenceGamesSection()}${creatorVideosSection()}`;
  }

  if (route.path === "/screenshots/") {
    return screenshotSourceSection();
  }

  if (route.path === "/steam/") {
    return steamStatusSection();
  }

  if (route.path === "/trailer/") {
    return officialVideosSection();
  }

  if (route.path === "/faq/") {
    return `
      <section class="static-section">
        <h2>Frequently Asked Questions</h2>
        <div class="static-faq-list">
          ${data.faq.map((item) => `<article class="static-card"><h3>${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></article>`).join("")}
        </div>
      </section>`;
  }

  if (route.path === "/sources/") {
    return `
      <section class="static-section">
        <h2>Developer & Publisher</h2>
        <article class="static-card">
          <p class="eyebrow">CAPCOM Co., Ltd.</p>
          <h3>Developer and publisher are the same company</h3>
          <p>${escapeHtml(data.developerPublisherProfile.summary)}</p>
          <p>Reference links: ${sourceLinks(data.developerPublisherProfile.sourceIds)}.</p>
        </article>
        <div class="static-grid">
          ${data.developerPublisherProfile.representativeWorks.map((work) => `<article class="static-card">
            ${work.image ? `<figure class="company-work-image">
              ${imageMarkup({ src: work.image.src, alt: work.image.alt })}
              <figcaption>${escapeHtml(work.image.source)}</figcaption>
            </figure>` : ""}
            <p class="eyebrow">${escapeHtml(work.type)}</p>
            <h3>${escapeHtml(work.name)}</h3>
            <p>${escapeHtml(work.whyItMatters)}</p>
            ${work.url ? `<a class="source-link" href="${escapeHtml(work.url)}">Open official site</a>` : ""}
          </article>`).join("")}
        </div>
      </section>
      <section class="static-section">
        <h2>Source Records</h2>
        <div class="static-grid">
          ${primarySources().map((source) => `<article class="static-card">
            <p class="eyebrow">${escapeHtml(source.type)} / ${escapeHtml(source.reliability)}</p>
            <h3>${escapeHtml(source.name)}</h3>
            <p>${escapeHtml(source.usedFor)}</p>
            <p>Last checked: ${escapeHtml(source.lastChecked)}.</p>
            <a href="${escapeHtml(source.url)}">Open source</a>
          </article>`).join("")}
        </div>
      </section>`;
  }

  if (route.path === "/pc-requirements/") {
    return `
      <section class="static-section">
        <h2>Speculative PC Estimate</h2>
        <p><strong>${escapeHtml(data.pcRequirementEstimate.warning)}</strong></p>
        <p>${escapeHtml(data.pcRequirementEstimate.basis)}</p>
        <div class="static-grid">
          ${data.pcRequirementEstimate.tiers.map((tier) => `<article class="static-card">
            <p class="eyebrow">${escapeHtml(tier.confidence)}</p>
            <h3>${escapeHtml(tier.name)}</h3>
            <p><strong>OS:</strong> ${escapeHtml(tier.os)}</p>
            <p><strong>CPU:</strong> ${escapeHtml(tier.cpu)}</p>
            <p><strong>Memory:</strong> ${escapeHtml(tier.memory)}</p>
            <p><strong>GPU:</strong> ${escapeHtml(tier.gpu)}</p>
            <p>${escapeHtml(tier.notes)}</p>
          </article>`).join("")}
        </div>
        <p class="static-trust">Estimate basis links: ${sourceLinks(data.pcRequirementEstimate.sourceIds)}.</p>
      </section>`;
  }

  if (route.path === "/characters/") {
    return `
      <section class="static-section">
        <h2>Character Status</h2>
        <div class="static-grid">
          ${data.characters.map((character) => `<article class="static-card">
            <p class="eyebrow">${escapeHtml(character.status)}</p>
            <h3>${escapeHtml(character.name)}</h3>
            <p><strong>${escapeHtml(character.role)}</strong></p>
            <p>${escapeHtml(character.note)}</p>
          </article>`).join("")}
        </div>
      </section>`;
  }

  if (route.path === "/changelog/") {
    return `
      <section class="static-section">
        <h2>Dated Updates</h2>
        <div class="static-faq-list">
          ${data.changelog.map((entry) => {
            const source = sourceById(entry.sourceId);
            const reference = source && source.type !== "site-policy"
              ? `<p class="meta">Reference: <a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a></p>`
              : "";
            return `<article class="static-card" id="${escapeHtml(changelogId(entry))}">
              <p class="eyebrow">${escapeHtml(entry.date)} / ${escapeHtml(entry.type)}</p>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(entry.summary)}</p>
              ${reference}
            </article>`;
          }).join("")}
        </div>
        <p class="static-trust">RSS feed: <a href="/feed.xml">/feed.xml</a>. It follows the updates listed above.</p>
      </section>`;
  }

  if (route.path === "/watchlist/") {
    return watchlistSection({ expanded: true });
  }

  return "";
}

function staticBody(route) {
  return `
    <div class="static-shell" data-route="${escapeHtml(route.path)}">
      <header class="static-header">
        <a class="static-brand" href="/">VH</a>
        <nav>
          ${primaryNav.map((path) => routeByPath(path)).filter(Boolean).map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.navLabel)}</a>`).join("")}
        </nav>
      </header>
      <main>
        <section class="static-hero">
          <p class="eyebrow">${escapeHtml(data.site.tagline)}</p>
          <h1>${escapeHtml(route.h1)}</h1>
          <p class="static-lede">${escapeHtml(route.intro)}</p>
          <p class="static-trust">Last checked: ${escapeHtml(data.site.lastVerified)}. Exact release date has not been announced.</p>
        </section>
        <section class="static-section">
          ${route.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>
        <section class="static-section">
          <h2>Current Status</h2>
          <div class="static-grid">${claimCards(route.path)}</div>
        </section>
        ${data.watchlist?.placementRoutes?.includes(route.path) && route.path !== "/watchlist/" ? watchlistSection() : ""}
        ${routeSpecific(route)}
        ${route.path === "/media/" ? "" : mediaGrid(route.path)}
        <section class="static-section static-policy">
          <h2>How Updates Are Handled</h2>
          <p>${escapeHtml(data.site.disclaimer)}</p>
          <p>${escapeHtml(data.site.noPiracy)}</p>
          <p>Details that have not been announced yet are labeled clearly and updated only when an official source changes.</p>
        </section>
      </main>
      <footer class="footer">
        <div class="container footer-grid">
          <div>
            <a class="brand" href="/">
              <span class="mark">VH</span>
              <span class="brand-title"><strong>Veronica Hub</strong><span>Official update tracker</span></span>
            </a>
            <p>${escapeHtml(data.site.disclaimer)}</p>
            <p class="meta">${escapeHtml(data.site.noPiracy)}</p>
          </div>
          <nav class="footer-links">${footerLinks(primaryNav.slice(1))}</nav>
          <nav class="footer-links">${footerLinks(footerUtilityRoutes)}</nav>
        </div>
      </footer>
    </div>`;
}

function breadcrumbSchema(route) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Veronica Hub",
        "item": data.site.origin + "/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": route.h1,
        "item": absoluteUrl(route.path)
      }
    ]
  };
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": data.site.name,
    "url": data.site.origin + "/",
    "description": "Source-backed Resident Evil Veronica information hub."
  };
}

function faqSchema(route) {
  if (route.path !== "/faq/") return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": data.faq.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };
}

function mediaSchema(route) {
  if (route.path !== "/media/" && route.path !== "/screenshots/") return null;
  const media = routeMedia(route.path);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": media.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${data.site.origin}${item.src}`,
      "item": {
        "@type": "ImageObject",
        "name": item.title,
        "contentUrl": `${data.site.origin}${item.src}`,
        "description": item.alt
      }
    }))
  };
}

function articleSchema(route) {
  if (!articleRoutes.has(route.path)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": route.h1,
    "description": route.description,
    "dateModified": data.site.lastVerified,
    "publisher": {
      "@type": "Organization",
      "name": data.site.name
    },
    "mainEntityOfPage": absoluteUrl(route.path)
  };
}

function schemas(route) {
  return [breadcrumbSchema(route), route.path === "/" ? websiteSchema() : null, faqSchema(route), mediaSchema(route), articleSchema(route)].filter(Boolean);
}

function pageHtml(route) {
  const schemaTags = schemas(route)
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("\n  ");
  const preloadTags = preloadLinks(route);
  const body = staticBody(route);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(route.title)}</title>
  <meta name="description" content="${escapeHtml(route.description)}" />
  <link rel="canonical" href="${escapeHtml(absoluteUrl(route.path))}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(route.title)}" />
  <meta property="og:description" content="${escapeHtml(route.description)}" />
  <meta property="og:image" content="${escapeHtml(data.site.origin)}/assets/official/capcom-veronica-ogp.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="google-adsense-account" content="${adsenseClient}" />
  <link rel="alternate" type="application/rss+xml" title="Veronica Hub Changelog Feed" href="/feed.xml" />
  ${preloadTags ? `${preloadTags}\n  ` : ""}<link rel="stylesheet" href="${stylesheetPath}" />
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
  ${schemaTags}
</head>
<body>
  <noscript>${body}</noscript>
  <div id="root"></div>
  <script src="${bundlePath}" defer></script>
</body>
</html>
`;
}

function sitemapXml() {
  const urls = data.routes.map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${data.site.lastVerified}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${data.site.origin}/sitemap.xml
`;
}

for (const route of data.routes) {
  const output = routeOutputPath(route.path);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, pageHtml(route).replace(/[ \t]+$/gm, ""));
}

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemapXml().replace(/[ \t]+$/gm, ""));
fs.writeFileSync(path.join(root, "robots.txt"), robotsTxt().replace(/[ \t]+$/gm, ""));
console.log(`Rendered ${data.routes.length} routes and sitemap.xml`);
