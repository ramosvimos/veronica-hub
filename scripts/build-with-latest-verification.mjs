import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

function requireItem(list, predicate, label) {
  const item = list.find(predicate);
  if (!item) throw new Error(`Latest verification could not find ${label}`);
  return item;
}

function requireDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "") ||
      Number.isNaN(Date.parse(`${value}T00:00:00Z`)) ||
      new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

// Pure transformation: importing this module never builds or changes source files.
export function applyLatestVerification(siteData, update) {
  requireDate(update.verifiedAt, "verification date");
  if (siteData.site.lastVerified > update.verifiedAt) {
    throw new Error("Latest verification must not move the review date backwards");
  }
  const data = structuredClone(siteData);
  const route = (value) => requireItem(data.routes, (item) => item.path === value, `route ${value}`);
  const claim = (id) => requireItem(data.claims, (item) => item.id === id, `claim ${id}`);
  const source = (id) => requireItem(data.sources, (item) => item.id === id, `source ${id}`);
  data.site.lastVerified = update.verifiedAt;

  for (const routePath of update.touchRoutes || []) route(routePath).lastModified = update.verifiedAt;
  for (const patch of update.routeUpdates || []) Object.assign(route(patch.path), structuredClone(patch));

  for (const replacement of update.bodyReplacements || []) {
    const target = route(replacement.path);
    // A previously applied replacement is a no-op, not a failed build.
    if ((target.body || []).includes(replacement.value)) continue;
    if (!replacement.contains) throw new Error("Body replacement requires a nonempty match");
    const matches = (target.body || []).flatMap((paragraph, index) =>
      paragraph.includes(replacement.contains) ? [index] : []
    );
    if (matches.length !== 1) {
      throw new Error(`Latest verification expected one body match on ${replacement.path}: ${replacement.contains}`);
    }
    target.body[matches[0]] = replacement.value;
  }
  for (const addition of update.bodyAppends || []) {
    const target = route(addition.path);
    if (!addition.value || typeof addition.value !== "string") throw new Error("Body addition requires text");
    target.body ||= [];
    if (!target.body.includes(addition.value)) target.body.push(addition.value);
  }

  for (const patch of update.claimUpdates || []) Object.assign(claim(patch.id), structuredClone(patch));
  for (const patch of update.claimUpserts || []) {
    const existing = data.claims.find((item) => item.id === patch.id);
    if (existing) Object.assign(existing, structuredClone(patch));
    else data.claims.push(structuredClone(patch));
  }
  // Only explicitly reviewed claims and sources receive a new checked date.
  for (const id of update.claimLastCheckedIds || []) claim(id).lastChecked = update.verifiedAt;
  for (const patch of update.sourceUpserts || []) {
    const existing = data.sources.find((item) => item.id === patch.id);
    if (existing) Object.assign(existing, structuredClone(patch));
    else data.sources.push(structuredClone(patch));
  }
  for (const id of update.sourceLastCheckedIds || []) source(id).lastChecked = update.verifiedAt;
  for (const patch of update.faqUpserts || []) {
    if (!patch.question || !patch.answer) throw new Error("FAQ update needs a question and answer");
    data.faq ||= [];
    const existing = data.faq.find((item) => item.question === patch.question);
    if (existing) Object.assign(existing, structuredClone(patch));
    else data.faq.push(structuredClone(patch));
  }

  // Keep the legacy entry as history while accepting multiple newer entries.
  const entries = [...(update.changelogEntries || []), ...(update.changelogEntry ? [update.changelogEntry] : [])];
  for (const entry of entries) {
    requireDate(entry.date, "changelog date");
    if (entry.date > update.verifiedAt) throw new Error("Changelog publication date cannot be after its review");
    source(entry.sourceId);
    const existing = data.changelog.find((item) => item.date === entry.date && item.title === entry.title);
    if (existing) Object.assign(existing, structuredClone(entry));
    else data.changelog.push(structuredClone(entry));
  }
  data.changelog.sort((a, b) => b.date.localeCompare(a.date));

  for (const item of data.claims) {
    if (!item.id || !item.value || !["confirmed", "reported", "unknown"].includes(item.status)) {
      throw new Error(`Invalid claim: ${item.id}`);
    }
    if (!item.sourceIds?.length || !item.pages?.length) throw new Error(`Claim needs sources and pages: ${item.id}`);
    for (const id of item.sourceIds) source(id);
    for (const routePath of item.pages) route(routePath);
    requireDate(item.lastChecked, `claim ${item.id} checked date`);
    requireDate(item.lastChanged, `claim ${item.id} changed date`);
  }
  for (const item of data.routes) {
    for (const id of item.featuredClaimIds || []) {
      if (!claim(id).pages.includes(item.path)) throw new Error(`Featured claim ${id} is not assigned to ${item.path}`);
    }
  }
  for (const [label, items, key] of [["claim", data.claims, "id"], ["source", data.sources, "id"], ["route", data.routes, "path"]]) {
    if (new Set(items.map((item) => item[key])).size !== items.length) throw new Error(`Duplicate ${label} identifiers`);
  }
  return data;
}

export function buildWithLatestVerification(root = process.cwd(), run = execFileSync) {
  const siteDataPath = path.join(root, "content/site-data.json");
  const originalSiteData = fs.readFileSync(siteDataPath, "utf8");
  const update = JSON.parse(fs.readFileSync(path.join(root, "content/latest-verification.json"), "utf8"));
  const data = applyLatestVerification(JSON.parse(originalSiteData), update);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  try {
    fs.writeFileSync(siteDataPath, `${JSON.stringify(data, null, 2)}\n`);
    for (const script of ["build:js", "build:pages", "build:feed", "validate"]) {
      run(npm, ["run", script], { cwd: root, stdio: "inherit" });
    }
  } finally {
    fs.writeFileSync(siteDataPath, originalSiteData);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildWithLatestVerification();
}
