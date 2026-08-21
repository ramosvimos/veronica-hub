import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const siteDataPath = path.join(root, "content/site-data.json");
const updatePath = path.join(root, "content/latest-verification.json");
const originalSiteData = fs.readFileSync(siteDataPath, "utf8");
const data = JSON.parse(originalSiteData);
const update = JSON.parse(fs.readFileSync(updatePath, "utf8"));

function requireItem(list, predicate, label) {
  const item = list.find(predicate);
  if (!item) throw new Error(`Latest verification could not find ${label}`);
  return item;
}

function route(routePath) {
  return requireItem(data.routes, (item) => item.path === routePath, `route ${routePath}`);
}

function claim(id) {
  return requireItem(data.claims, (item) => item.id === id, `claim ${id}`);
}

function source(id) {
  return data.sources.find((item) => item.id === id);
}

function applyLatestVerification() {
  data.site.lastVerified = update.verifiedAt;

  for (const routePath of update.touchRoutes || []) {
    route(routePath).lastModified = update.verifiedAt;
  }

  for (const replacement of update.bodyReplacements || []) {
    const target = route(replacement.path);
    const index = (target.body || []).findIndex((paragraph) => paragraph.includes(replacement.contains));
    if (index === -1) {
      throw new Error(`Latest verification body match not found on ${replacement.path}: ${replacement.contains}`);
    }
    target.body[index] = replacement.value;
  }

  for (const patch of update.claimUpdates || []) {
    Object.assign(claim(patch.id), patch);
  }

  for (const id of update.claimLastCheckedIds || []) {
    claim(id).lastChecked = update.verifiedAt;
  }

  for (const patch of update.sourceUpserts || []) {
    const existing = source(patch.id);
    if (existing) Object.assign(existing, patch);
    else data.sources.push(patch);
  }

  for (const id of update.sourceLastCheckedIds || []) {
    const target = source(id);
    if (!target) throw new Error(`Latest verification could not find source ${id}`);
    target.lastChecked = update.verifiedAt;
  }

  if (update.changelogEntry) {
    const duplicate = data.changelog.some((entry) =>
      entry.date === update.changelogEntry.date && entry.title === update.changelogEntry.title
    );
    if (!duplicate) data.changelog.unshift(update.changelogEntry);
  }
}

applyLatestVerification();
fs.writeFileSync(siteDataPath, `${JSON.stringify(data, null, 2)}\n`);

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
try {
  for (const script of ["build:js", "build:pages", "build:feed", "validate"]) {
    execFileSync(npm, ["run", script], { cwd: root, stdio: "inherit" });
  }
} finally {
  fs.writeFileSync(siteDataPath, originalSiteData);
}
