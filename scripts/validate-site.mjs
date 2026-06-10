import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));
const failures = [];

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const routePaths = new Set();
for (const route of data.routes) {
  if (routePaths.has(route.path)) fail(`Duplicate route path: ${route.path}`);
  routePaths.add(route.path);
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
  if (!html.includes("application/ld+json")) fail(`Missing JSON-LD for ${route.path}`);
  if (!html.includes("Last verified") && !html.includes("Last checked")) fail(`Missing verification copy for ${route.path}`);
  if (html.includes("noindex")) fail(`Route contains noindex: ${route.path}`);

  const count = wordCount(html);
  const minimum = route.path === "/media/" ? 180 : 250;
  if (count < minimum) fail(`${route.path} has weak static content: ${count} words`);
}

const faqHtml = read(routeOutputPath("/faq/"));
if (!faqHtml.includes('"@type":"FAQPage"')) fail("FAQ page is missing FAQPage schema");

for (const route of data.routes.filter((route) => route.path !== "/faq/")) {
  const html = read(routeOutputPath(route.path));
  if (html.includes('"@type":"FAQPage"')) fail(`Non-FAQ page includes FAQPage schema: ${route.path}`);
}

const mediaHtml = read(routeOutputPath("/media/"));
if (!mediaHtml.includes('"@type":"ItemList"')) fail("Media page is missing ItemList schema");

const sitemap = read(path.join(root, "sitemap.xml"));
for (const route of data.routes) {
  if (!sitemap.includes(`${data.site.origin}${route.path}`)) fail(`Sitemap missing ${route.path}`);
  if (!sitemap.includes(`<lastmod>${data.site.lastVerified}</lastmod>`)) fail(`Sitemap lastmod mismatch for ${route.path}`);
}

const robots = read(path.join(root, "robots.txt"));
if (!robots.includes(`Sitemap: ${data.site.origin}/sitemap.xml`)) fail("robots.txt missing production sitemap line");

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

for (const sourceId of data.pcRequirementEstimate.sourceIds) {
  if (!data.sources.some((source) => source.id === sourceId)) {
    fail(`PC estimate references missing source ${sourceId}`);
  }
}

if (data.routes.length !== 15) fail(`Expected 15 routes, found ${data.routes.length}`);
if (data.claims.length < 12) fail(`Expected at least 12 claims, found ${data.claims.length}`);
if (data.media.length < 11) fail(`Expected at least 11 media records, found ${data.media.length}`);

if (failures.length) {
  console.error(failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`validate-site ok: ${data.routes.length} routes, ${data.claims.length} claims, ${data.media.length} media records`);
