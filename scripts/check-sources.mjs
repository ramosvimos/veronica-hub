import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, "content/site-data.json"), "utf8"));
const snapshotsPath = path.join(root, "content/source-snapshots.json");
const reviewQueuePath = path.join(root, "content/source-review-queue.json");
const timeoutMs = Number(process.env.SOURCE_CHECK_TIMEOUT_MS || 12000);

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromHtml(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]).slice(0, 180) : "";
}

function sourceById(id) {
  return data.sources.find((source) => source.id === id);
}

function trackedSources() {
  const configured = data.sourceMonitoring?.sources || [];
  if (configured.length) {
    return configured
      .map((item) => ({ ...item, source: sourceById(item.sourceId) }))
      .filter((item) => item.source?.url?.startsWith("http"));
  }
  return data.sources
    .filter((source) => source.url.startsWith("http") && source.type.includes("official"))
    .map((source) => ({ sourceId: source.id, source, reason: source.usedFor }));
}

async function fetchSource(item) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(item.source.url, {
      signal: controller.signal,
      headers: {
        "user-agent": "VeronicaHubSourceMonitor/1.0 (+https://residentevilveronica.com/sources/)"
      }
    });
    const text = await response.text();
    const normalizedText = stripHtml(text).slice(0, 12000);
    return {
      sourceId: item.sourceId,
      name: item.source.name,
      url: item.source.url,
      checkedAt: new Date().toISOString(),
      httpStatus: response.status,
      ok: response.ok,
      title: titleFromHtml(text),
      contentHash: hash(normalizedText),
      relevantText: normalizedText.slice(0, 240),
      error: ""
    };
  } catch (error) {
    return {
      sourceId: item.sourceId,
      name: item.source.name,
      url: item.source.url,
      checkedAt: new Date().toISOString(),
      httpStatus: 0,
      ok: false,
      title: "",
      contentHash: "",
      relevantText: "",
      error: error?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : String(error?.message || error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

function queueKey(snapshot) {
  return `${snapshot.sourceId}:${snapshot.contentHash || snapshot.httpStatus}:${snapshot.checkedAt.slice(0, 10)}`;
}

const previous = readJson(snapshotsPath, { checkedAt: "", snapshots: [] });
const previousBySource = new Map(previous.snapshots.map((snapshot) => [snapshot.sourceId, snapshot]));
const queue = readJson(reviewQueuePath, []);
const existingQueueKeys = new Set(queue.map((item) => item.key));
const current = [];
const changes = [];

for (const item of trackedSources()) {
  const snapshot = await fetchSource(item);
  const before = previousBySource.get(snapshot.sourceId);
  current.push(snapshot);

  const statusChanged = before && before.httpStatus !== snapshot.httpStatus;
  const hashChanged = before && snapshot.ok && before.contentHash && before.contentHash !== snapshot.contentHash;
  if (statusChanged || hashChanged) {
    const reviewItem = {
      key: queueKey(snapshot),
      status: "needs-review",
      detectedAt: snapshot.checkedAt,
      sourceId: snapshot.sourceId,
      sourceName: snapshot.name,
      url: snapshot.url,
      changeType: statusChanged ? "http-status" : "content-hash",
      previousStatus: before.httpStatus,
      currentStatus: snapshot.httpStatus,
      previousHash: before.contentHash || "",
      currentHash: snapshot.contentHash || "",
      instruction: "Check the official source before updating site content."
    };
    if (!existingQueueKeys.has(reviewItem.key)) {
      queue.unshift(reviewItem);
      existingQueueKeys.add(reviewItem.key);
    }
    changes.push(reviewItem);
  }
}

writeJson(snapshotsPath, {
  checkedAt: new Date().toISOString(),
  policy: "Snapshots detect changes only. Site text is updated after review.",
  snapshots: current
});
writeJson(reviewQueuePath, queue);

const failed = current.filter((snapshot) => !snapshot.ok);
console.log(`source-monitoring checked ${current.length} sources, ${changes.length} changes queued, ${failed.length} failures`);
if (failed.length) {
  for (const item of failed) {
    console.log(`- ${item.sourceId}: ${item.httpStatus || item.error}`);
  }
}
