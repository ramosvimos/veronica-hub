import fs from "node:fs";

const origin = process.env.VERONICA_ORIGIN || "https://residentevilveronica.com";
const dataPath = "content/site-data.json";
const fallbackRoutes = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/characters/", "/faq/", "/sources/"];
const siteData = fs.existsSync(dataPath)
  ? JSON.parse(fs.readFileSync(dataPath, "utf8"))
  : null;
const routes = fs.existsSync(dataPath)
  ? siteData.routes
  : fallbackRoutes.map((path) => ({ path }));
const sitemapOrigin = siteData?.site?.origin || origin;
const failures = [];

function routeRobots(route) {
  return route.robots || "index,follow,max-image-preview:large";
}

function shouldIncludeInSitemap(route) {
  return route.includeInSitemap !== false && !routeRobots(route).includes("noindex");
}

function recordFailure(message) {
  failures.push(message);
}

for (const route of routes) {
  const url = `${origin}${route.path}`;
  const response = await fetch(url, { redirect: "follow" });
  const html = await response.text();

  console.log(`${route.path} ${response.status}`);

  if (response.status !== 200) recordFailure(`${route.path} returned ${response.status}`);
  if (!html.includes("<h1")) recordFailure(`${route.path} missing h1`);
  if (!html.includes('rel="canonical"')) recordFailure(`${route.path} missing canonical`);
  if (!html.includes("application/ld+json")) recordFailure(`${route.path} missing JSON-LD`);
  if (!html.includes(`name="robots" content="${routeRobots(route)}"`)) {
    recordFailure(`${route.path} robots meta mismatch`);
  }
}

const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
const sitemapText = await sitemapResponse.text();
console.log(`/sitemap.xml ${sitemapResponse.status}`);

if (sitemapResponse.status !== 200) recordFailure("sitemap.xml did not return 200");
if (!sitemapText.includes("<urlset")) recordFailure("sitemap.xml missing urlset");

for (const route of routes) {
  const expectedUrl = `${sitemapOrigin}${route.path}`;
  const inSitemap = sitemapText.includes(expectedUrl);
  if (shouldIncludeInSitemap(route) && !inSitemap) {
    recordFailure(`sitemap.xml missing ${route.path}`);
  }
  if (!shouldIncludeInSitemap(route) && inSitemap) {
    recordFailure(`sitemap.xml should exclude ${route.path}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`production check ok: ${routes.length} routes`);
