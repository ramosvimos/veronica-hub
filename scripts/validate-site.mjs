import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));
const failures = [];
const adsenseClient = "ca-pub-2875158540739129";
const adsTxtLine = "google.com, pub-2875158540739129, DIRECT, f08c47fec0942fa0";

function fail(message) {
  failures.push(message);
}

function routeOutputPath(routePath) {
  if (routePath === "/") return path.join(root, "index.html");
  return path.join(root, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(html) {
  return stripTags(html).split(/\s+/).filter(Boolean).length;
}

function substantialRouteText(route) {
  const claims = data.claims.filter((claim) => claim.pages.includes(route.path));
  const sourceIds = new Set(claims.flatMap((claim) => claim.sourceIds));
  const parts = [
    ...(route.body || []),
    ...claims.flatMap((claim) => [claim.label, claim.value]),
    ...data.sources
      .filter((source) => sourceIds.has(source.id))
      .flatMap((source) => [source.name, source.usedFor || ""])
  ];

  if (route.path === "/faq/") {
    parts.push(...data.faq.flatMap((item) => [item.question, item.answer]));
  }
  if (route.path === "/characters/") {
    parts.push(...data.characters.flatMap((character) => [character.name, character.role, character.note]));
  }
  if (route.path === "/pc-requirements/") {
    parts.push(
      data.pcRequirementEstimate.basis,
      data.pcRequirementEstimate.warning,
      ...data.pcRequirementEstimate.tiers.flatMap((tier) => [
        tier.name,
        tier.notes,
        tier.os,
        tier.cpu,
        tier.memory,
        tier.gpu
      ])
    );
  }

  return parts.join(" ").trim();
}

function hasSubstantialBody(route) {
  const content = substantialRouteText(route);
  if (route.locale === "ja") return content.length >= 450;
  return content.split(/\s+/).filter(Boolean).length >= 150;
}

function substantialWordCount(route) {
  return substantialRouteText(route).split(/\s+/).filter(Boolean).length;
}

function renderedMainText(html) {
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] || "";
  return stripTags(main);
}

function renderedMainWordCount(html) {
  return renderedMainText(html).split(/\s+/).filter(Boolean).length;
}

function hasSubstantialRenderedMain(html, route) {
  const text = renderedMainText(html);
  if (route.locale === "ja") return text.length >= 1200;
  return renderedMainWordCount(html) >= 250;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function routeRobots(route) {
  return route.robots || "index,follow,max-image-preview:large";
}

function shouldShowAds(route) {
  return route.showAds !== false;
}

function shouldIncludeInSitemap(route) {
  return route.includeInSitemap !== false && !routeRobots(route).includes("noindex");
}

const routePaths = new Set();
for (const route of data.routes) {
  if (routePaths.has(route.path)) fail(`Duplicate route path: ${route.path}`);
  routePaths.add(route.path);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(route.lastModified || "")) fail(`Missing or invalid lastModified for ${route.path}`);

  for (const claimId of route.featuredClaimIds || []) {
    const claim = data.claims.find((item) => item.id === claimId);
    if (!claim) fail(`Route ${route.path} features missing claim ${claimId}`);
    else if (!claim.pages.includes(route.path)) fail(`Featured claim ${claimId} is not assigned to ${route.path}`);
  }
}

for (const route of data.routes) {
  const file = routeOutputPath(route.path);
  if (!fs.existsSync(file)) {
    fail(`Missing route output: ${route.path}`);
    continue;
  }

  const html = read(file);
  const canonical = `${data.site.origin}${route.path}`;
  if (!html.includes(`<title>${escapeHtml(route.title)}</title>`)) fail(`Missing exact title for ${route.path}`);
  if (!html.includes(`name="description" content="${escapeHtml(route.description)}"`)) fail(`Missing exact description for ${route.path}`);
  if (!html.includes(`<h1>${route.h1}</h1>`)) fail(`Missing h1 for ${route.path}`);
  if (!html.includes(`rel="canonical" href="${canonical}"`)) fail(`Missing canonical for ${route.path}`);
  if (!html.includes(`name="robots" content="${escapeHtml(routeRobots(route))}"`)) fail(`Robots meta mismatch for ${route.path}`);
  if (!html.includes("application/ld+json")) fail(`Missing JSON-LD for ${route.path}`);
  if (html.includes('"@type":"Article"') && !html.includes(`"dateModified":"${route.lastModified}"`)) {
    fail(`Article dateModified mismatch for ${route.path}`);
  }
  if (!html.includes(`name="google-adsense-account" content="${adsenseClient}"`)) fail(`Missing AdSense account meta for ${route.path}`);
  if (!html.includes('rel="icon" href="/assets/editorial/veronica-hub-favicon.svg"')) fail(`Missing declared favicon for ${route.path}`);
  if (!html.includes('id="static-content"')) fail(`Missing static HTML content container for ${route.path}`);
  if (html.includes("<noscript>")) fail(`Static HTML must not be limited to noscript on ${route.path}`);
  for (const image of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\bwidth="\d+"/.test(image[0]) || !/\bheight="\d+"/.test(image[0])) {
      fail(`Static image is missing dimensions for ${route.path}`);
      break;
    }
  }
  const adsenseLoaderCount = (html.match(/adsbygoogle\.js/g) || []).length;
  if (shouldShowAds(route) && !html.includes(`pagead/js/adsbygoogle.js?client=${adsenseClient}`)) fail(`Missing AdSense loader for ${route.path}`);
  if (!shouldShowAds(route) && adsenseLoaderCount !== 0) fail(`AdSense loader should be disabled for ${route.path}`);
  if (shouldShowAds(route) && adsenseLoaderCount !== 1) fail(`AdSense loader count mismatch for ${route.path}`);
  if (!html.includes("Last verified") && !html.includes("Last checked")) fail(`Missing verification copy for ${route.path}`);
  if (!html.includes('class="footer-links"')) fail(`Missing static footer links for ${route.path}`);
  if (html.includes('<a href="/feed.xml">RSS Feed</a>')) fail(`Footer should not link directly to RSS XML on ${route.path}`);

  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] || "";
  for (const [, href] of footer.matchAll(/href="([^"]+)"/g)) {
    if (href !== "/" && !routePaths.has(href)) fail(`Footer link points to missing route on ${route.path}: ${href}`);
  }

  const count = wordCount(html);
  const minimum = route.path === "/media/" ? 180 : 250;
  if (count < minimum) fail(`${route.path} has weak static content: ${count} words`);
  if (shouldIncludeInSitemap(route) && route.section !== "trust") {
    if (!hasSubstantialBody(route)) {
      fail(`${route.path} has thin substantive content: ${substantialWordCount(route)} words`);
    }
    if (!hasSubstantialRenderedMain(html, route)) {
      fail(`${route.path} has thin rendered main content: ${renderedMainWordCount(html)} words`);
    }
  }
  for (const claimId of route.featuredClaimIds || []) {
    const claim = data.claims.find((item) => item.id === claimId);
    if (claim && !html.includes(escapeHtml(claim.value))) fail(`Featured claim ${claimId} missing from ${route.path}`);
  }
}

const faqHtml = read(routeOutputPath("/faq/"));
if (!faqHtml.includes('"@type":"FAQPage"')) fail("FAQ page is missing FAQPage schema");

for (const route of data.routes.filter((route) => route.path !== "/faq/")) {
  const html = read(routeOutputPath(route.path));
  if (html.includes('"@type":"FAQPage"')) fail(`Non-FAQ page includes FAQPage schema: ${route.path}`);
}

const mediaHtml = read(routeOutputPath("/media/"));
if (!mediaHtml.includes('"@type":"ItemList"')) fail("Media page is missing ItemList schema");

const watchlistHtml = read(routeOutputPath("/watchlist/"));
if (!watchlistHtml.includes("Follow official Veronica updates")) fail("Watchlist page missing main watchlist copy");
if (!watchlistHtml.includes("/feed.xml")) fail("Watchlist page missing RSS link");

const screenshotsHtml = read(routeOutputPath("/screenshots/"));
if (!screenshotsHtml.includes("What belongs in this gallery")) fail("Screenshots page missing source rules section");
if (!screenshotsHtml.includes("official-screenshot")) fail("Screenshots page missing official screenshot media");

const steamHtml = read(routeOutputPath("/steam/"));
if (!steamHtml.includes("Steam status")) fail("Steam page missing status section");
if (!steamHtml.includes("Wishlist access is live")) fail("Steam page missing wishlist status");

const platformsHtml = read(routeOutputPath("/platforms/"));
for (const platform of data.platforms) {
  if (!platform.storeUrl) fail(`Platform is missing store URL: ${platform.id}`);
  else if (!platformsHtml.includes(platform.storeUrl)) fail(`Platforms page missing store URL: ${platform.id}`);
}
for (const sourceId of ["steam-store", "playstation-store", "xbox-store", "nintendo-store"]) {
  const source = data.sources.find((item) => item.id === sourceId);
  if (!source) fail(`Missing official platform source: ${sourceId}`);
  else if (!platformsHtml.includes(source.url)) fail(`Platforms page missing official source link: ${sourceId}`);
}

const sitemap = read(path.join(root, "sitemap.xml"));
for (const route of data.routes) {
  const inSitemap = sitemap.includes(`${data.site.origin}${route.path}`);
  if (shouldIncludeInSitemap(route) && !inSitemap) fail(`Sitemap missing ${route.path}`);
  if (!shouldIncludeInSitemap(route) && inSitemap) fail(`Sitemap should exclude ${route.path}`);
  const expectedSitemapEntry = `<loc>${data.site.origin}${route.path}</loc>\n    <lastmod>${route.lastModified}</lastmod>`;
  if (shouldIncludeInSitemap(route) && !sitemap.includes(expectedSitemapEntry)) fail(`Sitemap lastmod mismatch for ${route.path}`);
}

const feedPath = path.join(root, "feed.xml");
if (!fs.existsSync(feedPath)) fail("Missing feed.xml");
else {
  const feed = read(feedPath);
  if (!feed.includes("<rss version=\"2.0\"")) fail("feed.xml is not RSS 2.0");
  if (!feed.includes(`${data.site.origin}/changelog/`)) fail("feed.xml missing changelog link");
  for (const entry of data.changelog) {
    if (!feed.includes(escapeHtml(entry.title))) fail(`feed.xml missing changelog item: ${entry.title}`);
  }
}

const robots = read(path.join(root, "robots.txt"));
if (!robots.includes(`Sitemap: ${data.site.origin}/sitemap.xml`)) fail("robots.txt missing production sitemap line");

const adsTxtPath = path.join(root, "ads.txt");
if (!fs.existsSync(adsTxtPath)) fail("Missing ads.txt");
else if (!read(adsTxtPath).includes(adsTxtLine)) fail("ads.txt missing Google AdSense publisher line");

const appBundlePath = path.join(root, "designs/veronica-hub/app.bundle.js");
if (!fs.existsSync(appBundlePath)) fail("Missing app bundle");
else {
  const appBundle = read(appBundlePath);
  for (const eventName of ["source_click", "steam_click", "official_video_click", "trailer_play", "rss_click", "language_switch", "search_open", "menu_open"]) {
    if (!appBundle.includes(eventName)) fail(`App bundle missing analytics event: ${eventName}`);
  }
}

for (const media of data.media) {
  const assetPath = path.join(root, media.src.replace(/^\//, ""));
  if (!fs.existsSync(assetPath)) fail(`Missing media asset: ${media.src}`);
  if (!media.alt && !media.kind.includes("background")) fail(`Missing alt text for media: ${media.id}`);
}

for (const claim of data.claims) {
  for (const sourceId of claim.sourceIds) {
    if (!data.sources.some((source) => source.id === sourceId)) {
      fail(`Claim ${claim.id} references missing source ${sourceId}`);
    }
  }
  for (const page of claim.pages) {
    if (!routePaths.has(page)) fail(`Claim ${claim.id} references missing page ${page}`);
  }
}

for (const item of data.media) {
  if (!data.sources.some((source) => source.id === item.sourceId)) {
    fail(`Media ${item.id} references missing source ${item.sourceId}`);
  }
  for (const page of item.pages) {
    if (!routePaths.has(page)) fail(`Media ${item.id} references missing page ${page}`);
  }
}

for (const video of data.officialVideos || []) {
  if (!video.id) fail("Official video missing id");
  if (!video.title) fail(`Official video ${video.id || "unknown"} missing title`);
  if (!video.url?.startsWith("https://www.youtube.com/watch?v=")) fail(`Official video ${video.id || video.title} has invalid YouTube URL`);
  if (!data.sources.some((source) => source.id === video.sourceId)) {
    fail(`Official video ${video.id || video.title} references missing source ${video.sourceId}`);
  }
}

for (const route of data.routes.filter((route) => route.path !== "/media/" && route.section !== "trust")) {
  const routeMedia = data.media.filter((item) => item.pages.includes(route.path));
  if (!routeMedia.length) fail(`Route ${route.path} has no direct media assignment`);
}

for (const sourceId of data.pcRequirementEstimate.sourceIds) {
  if (!data.sources.some((source) => source.id === sourceId)) {
    fail(`PC estimate references missing source ${sourceId}`);
  }
}

for (const sourceId of data.developerPublisherProfile.sourceIds) {
  if (!data.sources.some((source) => source.id === sourceId)) {
    fail(`Developer publisher profile references missing source ${sourceId}`);
  }
}

if (!data.watchlist?.rssUrl) fail("Watchlist missing rssUrl");
if (!Array.isArray(data.watchlist?.topics) || data.watchlist.topics.length < 4) fail("Watchlist needs tracked topics");
for (const page of data.watchlist?.placementRoutes || []) {
  if (!routePaths.has(page)) fail(`Watchlist references missing page ${page}`);
}

for (const item of data.sourceMonitoring?.sources || []) {
  if (!data.sources.some((source) => source.id === item.sourceId)) {
    fail(`Source monitoring references missing source ${item.sourceId}`);
  }
}

if (data.routes.length !== 22) fail(`Expected 22 routes, found ${data.routes.length}`);
if (data.claims.length < 12) fail(`Expected at least 12 claims, found ${data.claims.length}`);
if (data.media.length < 11) fail(`Expected at least 11 media records, found ${data.media.length}`);

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`validate-site ok: ${data.routes.length} routes, ${data.claims.length} claims, ${data.media.length} media records`);
