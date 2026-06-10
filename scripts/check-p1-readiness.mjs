import fs from "node:fs";

const requiredFiles = [
  "docs/ANALYTICS_DECISION.md",
  "docs/SEARCH_CONSOLE_RUNBOOK.md",
  "docs/SEARCH_CONSOLE_CHECKLIST.md",
  "docs/BASELINE_METRICS.md",
  "docs/INDEXING_14_DAY_REVIEW.md",
  "docs/CONTENT_BACKLOG.md",
  "docs/PAGE_QUALITY_BAR.md",
  "docs/WATCHLIST_SPEC.md",
  "docs/RSS_PLAN.md",
  "docs/SOURCE_MONITORING_DESIGN.md",
  "docs/MONETIZATION_POLICY.md",
  "scripts/check-production-routes.mjs",
  "sitemap.xml",
  "robots.txt"
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing ${file}`);
}

if (fs.existsSync("robots.txt")) {
  const robots = fs.readFileSync("robots.txt", "utf8");
  if (!robots.includes("Sitemap: https://veronica-hub.vercel.app/sitemap.xml")) {
    failures.push("robots.txt missing production sitemap line");
  }
}

if (fs.existsSync("sitemap.xml")) {
  const sitemap = fs.readFileSync("sitemap.xml", "utf8");
  if (!sitemap.includes("https://veronica-hub.vercel.app/")) {
    failures.push("sitemap.xml missing production origin");
  }
}

if (fs.existsSync("docs/ANALYTICS_DECISION.md")) {
  const analytics = fs.readFileSync("docs/ANALYTICS_DECISION.md", "utf8");
  if (!analytics.includes("Vercel Web Analytics")) {
    failures.push("analytics decision does not name Vercel Web Analytics");
  }
}

if (fs.existsSync("docs/SEARCH_CONSOLE_RUNBOOK.md")) {
  const runbook = fs.readFileSync("docs/SEARCH_CONSOLE_RUNBOOK.md", "utf8");
  if (!runbook.includes("https://veronica-hub.vercel.app/sitemap.xml")) {
    failures.push("Search Console runbook missing sitemap URL");
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("p1 readiness ok");
