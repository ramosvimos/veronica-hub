import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));

function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sourceById(id) {
  return data.sources.find((source) => source.id === id);
}

function rfc822(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return new Date().toUTCString();
  return parsed.toUTCString();
}

function itemDescription(entry) {
  const source = sourceById(entry.sourceId);
  const sourceText = source && source.type !== "site-policy" ? ` Reference: ${source.name} (${source.url}).` : "";
  return `${entry.summary}${sourceText}`;
}

const items = [...(data.changelog || [])]
  .sort((a, b) => `${b.date}-${b.title}`.localeCompare(`${a.date}-${a.title}`))
  .map((entry) => {
    const slug = slugify(`${entry.date}-${entry.title}`);
    const link = `${data.site.origin}/changelog/#${slug}`;
    return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(`veronica-hub:${slug}`)}</guid>
      <pubDate>${escapeXml(rfc822(entry.date))}</pubDate>
      <category>${escapeXml(entry.type)}</category>
      <description>${escapeXml(itemDescription(entry))}</description>
    </item>`;
  })
  .join("\n");

const latestChangelogDate = [...(data.changelog || [])]
  .map((entry) => entry.date)
  .sort()
  .pop() || data.site.lastVerified;

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(data.site.name)} Changelog</title>
    <link>${escapeXml(data.site.origin)}/changelog/</link>
    <atom:link href="${escapeXml(data.site.origin)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(data.site.tagline)} official update feed.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(rfc822(latestChangelogDate))}</lastBuildDate>
${items}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(root, "feed.xml"), feed);
console.log(`Rendered feed.xml with ${data.changelog?.length || 0} changelog items`);
