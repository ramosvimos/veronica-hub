import fs from "node:fs";

const origin = process.env.VERONICA_ORIGIN || "https://residentevilveronica.com";
const dataPath = "content/site-data.json";
const fallbackRoutes = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/characters/", "/faq/", "/sources/"];
const routes = fs.existsSync(dataPath)
  ? JSON.parse(fs.readFileSync(dataPath, "utf8")).routes.map((route) => route.path)
  : fallbackRoutes;
const failures = [];

function recordFailure(message) {
  failures.push(message);
}

for (const route of routes) {
  const url = `${origin}${route}`;
  const response = await fetch(url, { redirect: "follow" });
  const html = await response.text();

  console.log(`${route} ${response.status}`);

  if (response.status !== 200) recordFailure(`${route} returned ${response.status}`);
  if (!html.includes("<h1")) recordFailure(`${route} missing h1`);
  if (!html.includes('rel="canonical"')) recordFailure(`${route} missing canonical`);
  if (!html.includes("application/ld+json")) recordFailure(`${route} missing JSON-LD`);
  if (html.includes("noindex")) recordFailure(`${route} contains noindex`);
}

const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
const sitemapText = await sitemapResponse.text();
console.log(`/sitemap.xml ${sitemapResponse.status}`);

if (sitemapResponse.status !== 200) recordFailure("sitemap.xml did not return 200");
if (!sitemapText.includes("<urlset")) recordFailure("sitemap.xml missing urlset");

for (const route of routes) {
  if (!sitemapText.includes(`${origin}${route}`)) {
    recordFailure(`sitemap.xml missing ${route}`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`production check ok: ${routes.length} routes`);
