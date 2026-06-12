import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));
const bundlePath = "/designs/veronica-hub/app.bundle.js";
const stylesheetPath = "/styles/site.css";

const articleRoutes = new Set([
  "/release-date/",
  "/platforms/",
  "/pc-requirements/",
  "/preorder/",
  "/demo/",
  "/editions/",
  "/original-vs-remake/",
  "/story/",
  "/characters/",
  "/sources/",
  "/changelog/"
]);
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
  if (routePath !== "/media/") return media;
  const mediaById = new Map(media.filter((item) => item?.id).map((item) => [item.id, item]));
  return mediaGalleryIds
    .map((id) => mediaById.get(id))
    .filter(Boolean);
}

function sourceById(id) {
  return data.sources.find((source) => source.id === id);
}

function sourceLinks(sourceIds) {
  return sourceIds
    .map((id) => sourceById(id))
    .filter(Boolean)
    .map((source) => `<a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>`)
    .join(", ");
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
    <div class="static-grid">
      ${media.map((item) => {
        const src = escapeHtml(item.src || "");
        const label = escapeHtml(item.label || "Image");
        const source = escapeHtml(item.source || "Official image");
        const alt = escapeHtml(item.alt || item.label || "Game media");
        return `<figure class="static-media-card">
          <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />
          <figcaption><strong>${label}</strong><span>${source}</span></figcaption>
        </figure>`;
      }).join("")}
    </div>`;
}

function optimizedImageSrc(src) {
  if (!src.startsWith("/assets/official/")) return null;
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
  return data.sources.filter((source) => !source.type.includes("comparison"));
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
  const media = routeMedia(routePath);
  const visibleMedia = routePath === "/media/" ? media : media.slice(0, 6);
  if (!visibleMedia.length) return "";
  return `
    <section class="static-section">
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

function referenceGamesSection() {
  const games = sortedByRelease(data.referenceGames || []);
  if (!games.length) return "";
  return `
    <section class="static-section">
      <h2>Reference Game Encyclopedia</h2>
      <div class="static-grid">
        ${games.map((game) => `
          <article class="static-card">
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
  if (!timeline.length) return "";
  return `
    <section class="static-section">
      <h2>Franchise Timeline</h2>
      <div class="timeline-list">
        ${timeline.map((event) => `
          <article class="static-card">
            <p class="eyebrow">${escapeHtml(event.year || "")}</p>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.event)}</p>
            <p class="meta">Impact: ${escapeHtml(event.impact || "")}</p>
            ${event.note ? `<p class="meta">Note: ${escapeHtml(event.note)}</p>` : ""}
          </article>`).join("")}
      </div>
    </section>`;
}

function classicsSection() {
  const positionSet = new Set(["RE1", "RE0", "RE2", "RE3", "RE CV", "RE4", "RE5", "RE6", "RE7", "RE2 Remake", "RE3 Remake", "RE8", "RE4 Remake"]);
  const games = sortedByRelease(data.referenceGames || []).filter((game) => positionSet.has(game.position));
  if (!games.length) return "";
  return `
    <section class="static-section">
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
    <section class="static-section">
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

function routeSpecific(route) {
  if (route.path === "/media/") {
    return `${mediaGrid(route.path)}${timelineSection()}${classicsSection()}${referenceGamesSection()}${creatorVideosSection()}`;
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
            <p class="eyebrow">${escapeHtml(work.type)}</p>
            <h3>${escapeHtml(work.name)}</h3>
            <p>${escapeHtml(work.whyItMatters)}</p>
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
            return `<article class="static-card">
              <p class="eyebrow">${escapeHtml(entry.date)} / ${escapeHtml(entry.type)}</p>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(entry.summary)}</p>
              <p>Source: ${source ? `<a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a>` : "Veronica Hub"}. Affected claims: ${entry.affectedClaims.map(escapeHtml).join(", ")}.</p>
            </article>`;
          }).join("")}
        </div>
      </section>`;
  }

  return "";
}

function staticBody(route) {
  return `
    <div class="static-shell" data-route="${escapeHtml(route.path)}">
      <header class="static-header">
        <a class="static-brand" href="/">VH</a>
        <nav>
          ${data.routes.slice(0, 8).map((item) => `<a href="${escapeHtml(item.path)}">${escapeHtml(item.navLabel)}</a>`).join("")}
        </nav>
      </header>
      <main>
        <section class="static-hero">
          <p class="eyebrow">${escapeHtml(data.site.tagline)}</p>
          <h1>${escapeHtml(route.h1)}</h1>
          <p class="static-lede">${escapeHtml(route.intro)}</p>
          <p class="static-trust">Last verified: ${escapeHtml(data.site.lastVerified)}. Exact release date: not officially confirmed unless a source record says otherwise.</p>
        </section>
        <section class="static-section">
          ${route.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
        </section>
        <section class="static-section">
          <h2>Verification Status</h2>
          <div class="static-grid">${claimCards(route.path)}</div>
        </section>
        ${routeSpecific(route)}
        ${route.path === "/media/" ? "" : mediaGrid(route.path)}
        <section class="static-section static-policy">
          <h2>Source Policy</h2>
          <p>${escapeHtml(data.site.disclaimer)}</p>
          <p>${escapeHtml(data.site.noPiracy)}</p>
          <p>Veronica Hub marks claims as confirmed, reported or unknown. Unknown details stay unknown until a cited official source changes them.</p>
        </section>
      </main>
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
  if (route.path !== "/media/") return null;
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
  ${preloadTags ? `${preloadTags}\n  ` : ""}<link rel="stylesheet" href="${stylesheetPath}" />
  ${schemaTags}
</head>
<body>
  <noscript>${body}</noscript>
  <div id="root">${body}</div>
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
