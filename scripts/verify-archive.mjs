import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://residentevilveronica.com';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);

/** Validate the frozen archive without network access or script execution. */
export function verifyArchive(root = projectRoot) {
  const publicDir = path.join(root, 'public');
  const archiveDir = path.join(publicDir, 'archive');
  const manifest = JSON.parse(fs.readFileSync(path.join(archiveDir, 'archive-manifest.json'), 'utf8'));
  const errors = [];
  const files = walk(archiveDir);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const documents = new Map();
  let checkedReferences = 0;
  let externalLinks = 0;
  const fail = (file, message) => errors.push(`${path.relative(root, file)}: ${message}`);

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    documents.set(file, dom);
    if (!doc.querySelector('meta[name="robots"]')?.content.includes('noindex')) fail(file, 'Missing noindex');
    if (!doc.querySelector('.archive-notice')?.textContent.includes('not maintained')) fail(file, 'Missing historical warning');
    if (!doc.querySelector('.archive-notice')?.textContent.includes(manifest.archivedAt)) fail(file, 'Missing archive capture date');
    if (!doc.querySelector('.archive-notice a[href="/"]')) fail(file, 'Missing active directory link');
    if (!doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content.includes("script-src 'none'")) fail(file, 'Missing script-blocking CSP');
    if (doc.querySelector('script,iframe,object,embed,form,ins,base')) fail(file, 'Executable content, embeds, ads, or forms remain');
    if (doc.querySelector('link[rel="canonical"],link[rel="alternate"],link[rel="preconnect"],link[rel="dns-prefetch"]')) fail(file, 'Active-site canonical/feed/preconnect remains');
    if (/googlesyndication|google-analytics|googletagmanager|vercel-insights|adsbygoogle|ca-pub-\d+/i.test(html)) fail(file, 'Advertising or tracking code remains');
    for (const el of doc.querySelectorAll('*')) {
      for (const attr of [...el.attributes]) {
        if (/^on/i.test(attr.name) || attr.name === 'ping') fail(file, `Active attribute ${attr.name}`);
      }
    }
  }

  function checkReference(raw, file, isPassiveLink = false, checkFragment = true) {
    if (!raw) return;
    checkedReferences++;
    if (/^(mailto:|tel:)/i.test(raw) && isPassiveLink) return;
    if (/^data:image\//i.test(raw) && !isPassiveLink) return;
    const relative = path.relative(publicDir, file).split(path.sep).join('/');
    const pagePath = '/' + relative.replace(/index\.html$/, '');
    let url;
    try { url = new URL(raw, origin + pagePath); } catch { fail(file, `Invalid URL ${raw}`); return; }
    if (!['http:', 'https:'].includes(url.protocol)) { fail(file, `Unexpected URL protocol ${raw}`); return; }
    if (![origin, 'https://www.residentevilveronica.com'].includes(url.origin)) {
      if (isPassiveLink) externalLinks++;
      else fail(file, `External active resource ${raw}`);
      return;
    }
    if (url.pathname === '/' && isPassiveLink) {
      if (!fs.existsSync(path.join(root, 'src/app/(website)/(public)/(home)/page.tsx'))) fail(file, 'Active directory home source missing');
      return;
    }
    if (!url.pathname.startsWith('/archive/')) { fail(file, `Escaped historical namespace ${raw}`); return; }
    let target = path.join(publicDir, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
    else if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!target.startsWith(archiveDir + path.sep) || !fs.existsSync(target)) { fail(file, `Missing local target ${raw}`); return; }
    if (checkFragment && url.hash && documents.has(target)) {
      const targetDoc = documents.get(target).window.document;
      const id = decodeURIComponent(url.hash.slice(1));
      if (!targetDoc.getElementById(id) && ![...targetDoc.querySelectorAll('a[name]')].some((a) => a.name === id)) fail(file, `Missing fragment ${raw}`);
    }
  }

  function checkCss(css, file) {
    if (/@import\b|expression\s*\(|-moz-binding/i.test(css)) fail(file, 'External or active CSS remains');
    for (const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)) checkReference(match[1], file);
  }

  for (const [file, dom] of documents) {
    const doc = dom.window.document;
    for (const el of doc.querySelectorAll('[href],[src],[srcset],[poster]')) {
      for (const attr of ['href', 'src', 'poster']) if (el.hasAttribute(attr)) checkReference(el.getAttribute(attr), file, el.tagName === 'A' && attr === 'href');
      if (el.hasAttribute('srcset')) for (const value of el.getAttribute('srcset').split(',')) checkReference(value.trim().split(/\s+/)[0], file);
    }
    for (const el of doc.querySelectorAll('[style]')) checkCss(el.getAttribute('style'), file);
    for (const el of doc.querySelectorAll('style')) checkCss(el.textContent, file);
    for (const el of doc.querySelectorAll('meta[property="og:image"]')) checkReference(el.content, file);
  }
  for (const file of files.filter((f) => f.endsWith('.css'))) checkCss(fs.readFileSync(file, 'utf8'), file);
  for (const file of files.filter((f) => f.endsWith('.svg'))) {
    const svg = fs.readFileSync(file, 'utf8');
    if (/<script|<foreignObject|\son\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|javascript:)/i.test(svg)) fail(file, 'Active SVG or remote image reference');
  }
  const feedFile = path.join(archiveDir, 'feed.xml');
  const feed = new JSDOM(fs.readFileSync(feedFile, 'utf8'), { contentType: 'text/xml' });
  if (!feed.window.document.querySelector('channel > title')?.textContent.includes('frozen')) fail(feedFile, 'Feed must say it is frozen');
  for (const link of feed.window.document.querySelectorAll('link')) checkReference(link.getAttribute('href') || link.textContent, feedFile, true);
  feed.window.close();

  if (manifest.preservedRoutes !== 44 || manifest.routes.length !== 44 || manifest.missingRoutes.length !== 0) errors.push('Archive manifest does not account for all 44 original routes');
  if (htmlFiles.length !== 45) errors.push(`Expected 44 routes plus utility 404, got ${htmlFiles.length}`);
  if (new Set(manifest.routes.map((r) => r.archivePath)).size !== 44) errors.push('Duplicate archive route');
  for (const route of manifest.routes) {
    const file = path.join(archiveDir, route.file);
    if (!documents.has(file)) fail(file, 'Manifest route missing');
    else if (!documents.get(file).window.document.querySelector('.archive-notice')?.textContent.includes(route.originalLastModified)) fail(file, 'Missing original page date');
  }
  for (const asset of manifest.assetReuse) {
    const file = path.join(root, asset.targetPath);
    if (!fs.existsSync(file)) { fail(file, 'Missing asset'); continue; }
    const bytes = fs.readFileSync(file);
    const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    if (sha !== asset.blobSha || bytes.length !== asset.bytes) fail(file, 'Asset differs from source Git blob');
  }
  for (const dom of documents.values()) dom.window.close();
  return { ok: errors.length === 0, preservedRoutes: manifest.routes.length, htmlFiles: htmlFiles.length, assets: manifest.assetReuse.length, checkedReferences, externalLinks, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = verifyArchive();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
