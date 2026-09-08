import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyLatestVerification, buildWithLatestVerification } from "./build-with-latest-verification.mjs";

function fixture() {
  return {
    site: { lastVerified: "2026-08-03" },
    routes: [
      { path: "/", body: ["One million wishlists.", "Original context."], lastModified: "2026-08-03", featuredClaimIds: ["release-window"] },
      { path: "/sources/", body: ["Source policy."], lastModified: "2026-08-03" }
    ],
    claims: [{ id: "release-window", label: "Release window", value: "2027", status: "confirmed", sourceIds: ["steam-store"], pages: ["/"], lastChecked: "2026-08-03", lastChanged: "2026-06-08" }],
    sources: [{ id: "steam-store", lastChecked: "2026-08-03" }, { id: "old-video", lastChecked: "2026-06-13" }],
    faq: [{ question: "Release year?", answer: "2027" }],
    changelog: [{ date: "2026-08-03", title: "Earlier review", sourceId: "steam-store" }]
  };
}
function legacyUpdate() {
  return {
    verifiedAt: "2026-08-21", touchRoutes: ["/"],
    bodyReplacements: [{ path: "/", contains: "One million", value: "Two million wishlists." }],
    claimLastCheckedIds: ["release-window"], sourceLastCheckedIds: ["steam-store"],
    changelogEntry: { date: "2026-08-21", title: "August review", sourceId: "steam-store" }
  };
}
function nextUpdate() {
  return {
    ...legacyUpdate(), verifiedAt: "2026-09-08",
    bodyAppends: [{ path: "/", value: "Veronica participation is unconfirmed." }],
    sourceUpserts: [{ id: "capcom-event", lastChecked: "2026-09-08" }],
    claimUpserts: [{ id: "participation", label: "Participation", value: "Unconfirmed", status: "unknown", sourceIds: ["capcom-event"], pages: ["/"], lastChecked: "2026-09-08", lastChanged: "2026-09-01" }],
    routeUpdates: [{ path: "/", featuredClaimIds: ["release-window", "participation"] }],
    faqUpserts: [{ question: "Is participation confirmed?", answer: "No." }],
    changelogEntries: [{ date: "2026-09-08", title: "September review", sourceId: "capcom-event" }]
  };
}

test("legacy verification format still applies without mutating the source object", () => {
  const original = fixture();
  const snapshot = structuredClone(original);
  const result = applyLatestVerification(original, legacyUpdate());
  assert.deepEqual(original, snapshot);
  assert.equal(result.routes[0].body[0], "Two million wishlists.");
  assert.equal(result.site.lastVerified, "2026-08-21");
  assert.equal(result.changelog[0].title, "August review");
});

test("new event claims, FAQ and source are added while August and older history survive", () => {
  const result = applyLatestVerification(fixture(), nextUpdate());
  assert.deepEqual(result.changelog.map((entry) => entry.date), ["2026-09-08", "2026-08-21", "2026-08-03"]);
  assert.equal(result.claims.find((item) => item.id === "participation").status, "unknown");
  assert.equal(result.faq.length, 2);
  assert.equal(result.sources.find((item) => item.id === "old-video").lastChecked, "2026-06-13");
  assert.equal(result.claims[0].lastChanged, "2026-06-08");
});

test("applying an overlay twice is idempotent and does not duplicate history or body text", () => {
  const once = applyLatestVerification(fixture(), nextUpdate());
  assert.deepEqual(applyLatestVerification(once, nextUpdate()), once);
});

test("missing and ambiguous body matches fail rather than silently publishing stale copy", () => {
  const missing = legacyUpdate();
  missing.bodyReplacements[0].contains = "Nonexistent paragraph";
  assert.throws(() => applyLatestVerification(fixture(), missing), /expected one body match/);
  const ambiguous = fixture();
  ambiguous.routes[0].body.push("One million on another page.");
  assert.throws(() => applyLatestVerification(ambiguous, legacyUpdate()), /expected one body match/);
});

test("bad claim IDs, sources, featured assignments and duplicate identifiers are rejected", () => {
  assert.throws(() => applyLatestVerification(fixture(), { ...legacyUpdate(), claimLastCheckedIds: ["missing"] }), /could not find claim/);
  const badSource = nextUpdate();
  badSource.claimUpserts[0].sourceIds = ["missing"];
  assert.throws(() => applyLatestVerification(fixture(), badSource), /could not find source/);
  const badPage = nextUpdate();
  badPage.claimUpserts[0].pages = ["/sources/"];
  assert.throws(() => applyLatestVerification(fixture(), badPage), /not assigned/);
  const duplicate = fixture();
  duplicate.sources.push({ id: "steam-store" });
  assert.throws(() => applyLatestVerification(duplicate, legacyUpdate()), /Duplicate source/);
});

test("invalid dates, date regressions and future publication entries are rejected", () => {
  for (const verifiedAt of ["today", "2026-02-30", "2026-13-01", "2026-08-01"]) {
    assert.throws(() => applyLatestVerification(fixture(), { ...legacyUpdate(), verifiedAt }));
  }
  const future = nextUpdate();
  future.changelogEntries[0].date = "2026-09-16";
  assert.throws(() => applyLatestVerification(fixture(), future), /publication date/);
});

for (const shouldFail of [false, true]) {
  test(`build wrapper restores exact source bytes on ${shouldFail ? "failure" : "success"}`, () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "vh-verification-"));
    fs.mkdirSync(path.join(root, "content"));
    const file = path.join(root, "content/site-data.json");
    const original = `${JSON.stringify(fixture(), null, 3)}\n`;
    fs.writeFileSync(file, original);
    fs.writeFileSync(path.join(root, "content/latest-verification.json"), JSON.stringify(nextUpdate()));
    const scripts = [];
    try {
      const run = (_command, args) => {
        scripts.push(args[1]);
        assert.equal(JSON.parse(fs.readFileSync(file, "utf8")).site.lastVerified, "2026-09-08");
        if (shouldFail) throw new Error("Deliberate child failure");
      };
      if (shouldFail) assert.throws(() => buildWithLatestVerification(root, run), /Deliberate child failure/);
      else {
        buildWithLatestVerification(root, run);
        assert.deepEqual(scripts, ["build:js", "build:pages", "build:feed", "validate"]);
      }
      assert.equal(fs.readFileSync(file, "utf8"), original);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
}

test("September manifest preserves historical evidence dates and separates review from event date", () => {
  const update = JSON.parse(fs.readFileSync(new URL("../content/latest-verification.json", import.meta.url), "utf8"));
  assert.equal(update.verifiedAt, "2026-09-08");
  assert.equal(update.changelogEntry.date, "2026-08-21");
  assert.equal(update.changelogEntries[0].date, "2026-09-08");
  assert.equal(update.claimUpserts.find((item) => item.id === "veronica-tgs-2026-status").status, "unknown");
  assert.equal(update.claimUpdates.find((item) => item.id === "wishlist-milestone").lastChecked, "2026-08-21");
  assert.ok(!update.claimLastCheckedIds.includes("wishlist-milestone"));
  assert.ok(!update.sourceLastCheckedIds.includes("official-youtube-trailer"));
  const event = update.claimUpserts.find((item) => item.id === "capcom-spotlight-2026-09-16");
  assert.equal(event.lastChanged, "2026-09-01");
  assert.match(event.value, /September 16, 2026/);
});
