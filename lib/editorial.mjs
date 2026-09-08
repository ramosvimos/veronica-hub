/** Shared editorial content model and escaped HTML for static and React views. */
export const editorialPrimaryNav = ['/', '/news/', '/blog/', '/release-date/', '/gameplay/', '/characters/', '/trailer/', '/sources/'];
const kinds = new Set(['guide', 'character', 'news', 'news-index', 'blog', 'blog-index']);
const labels = { confirmed: 'Official remake / announcement', reported: 'Attributed producer report', original: 'Original-game archive', unknown: 'Not established by this source', editorial: 'Reading guide', analysis: 'Editorial analysis' };
const pathPattern = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/;
const requireValue = (ok, message) => { if (!ok) throw new Error(message); };
const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
export const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const unique = (items) => [...new Set(items)];
const blocksText = (p) => [...p.lede, ...p.blocks.flatMap(b => [b.title, ...b.paragraphs])];
const isIndex = (p) => ['news-index','blog-index'].includes(p.kind);
export const readingMinutes = (p) => Math.max(1, Math.ceil(blocksText(p).join(' ').split(/\s+/).filter(Boolean).length / 220));
export function applyEditorialContent(input, manifest) {
  requireValue(manifest.version === 1 && validDate(manifest.publishedAt), 'Invalid editorial manifest');
  const data = structuredClone(input);
  requireValue(Array.isArray(manifest.pages) && manifest.pages.length > 0, 'Editorial pages are required');
  requireValue(new Set(manifest.pages.map(p => p.path)).size === manifest.pages.length, 'Duplicate editorial path');
  requireValue(Array.isArray(manifest.sources) && new Set(manifest.sources.map(s => s.id)).size === manifest.sources.length, 'Duplicate or missing editorial sources');
  requireValue(typeof manifest.author === 'string' && manifest.author.length > 0, 'Editorial author is required');
  for (const s of manifest.sources) {
    const url = new URL(s.url);
    requireValue(url.protocol === 'https:' && !url.username && !url.password, `Invalid source URL: ${s.id}`);
    requireValue(validDate(s.lastChecked), `Invalid source review date: ${s.id}`);
    const existing = data.sources.find(x => x.id === s.id);
    if (existing) {
      requireValue(existing.url === s.url, `Source identity changed: ${s.id}`);
      // Adding an article must not silently refresh an existing source's check date.
    } else data.sources.push(structuredClone(s));
  }
  const paths = new Set([...data.routes.map(r => r.path), ...manifest.pages.map(p => p.path)]);
  for (const p of manifest.pages) {
    requireValue(pathPattern.test(p.path) && p.path !== '/' && kinds.has(p.kind), `Invalid editorial route: ${p.path}`);
    requireValue(p.title && p.h1 && p.description && p.intro && p.navLabel, `Missing metadata: ${p.path}`);
    requireValue(validDate(p.publishedAt) && validDate(p.lastReviewed) && p.publishedAt <= p.lastReviewed, `Invalid page dates: ${p.path}`);
    requireValue(!p.eventDate || (validDate(p.eventDate) && p.eventDate <= p.lastReviewed), `Invalid source event date: ${p.path}`);
    requireValue(p.lede?.length && p.blocks?.length, `Empty editorial page: ${p.path}`);
    requireValue(new Set(p.blocks.map(b => b.id)).size === p.blocks.length, `Duplicate section ID: ${p.path}`);
    if (p.kind === 'blog') requireValue(p.parent === '/blog/' && p.path.startsWith('/blog/') && p.topic, `Blog needs a parent and topic: ${p.path}`);
    if (p.kind === 'blog-index') requireValue(p.path === '/blog/', 'Blog index must use /blog/');
    for (const b of p.blocks) {
      requireValue(/^[a-z][a-z0-9-]*$/.test(b.id) && b.title && b.paragraphs?.length && labels[b.status], `Invalid section: ${p.path}`);
      requireValue(Array.isArray(b.paragraphs) && b.paragraphs.every(t => typeof t === 'string') && Array.isArray(b.sourceIds), `Invalid section text: ${p.path}`);
      requireValue(['editorial','analysis'].includes(b.status) || b.sourceIds?.length, `Missing section evidence: ${p.path}#${b.id}`);
      for (const id of b.sourceIds || []) requireValue(data.sources.some(s => s.id === id), `Unknown source: ${id}`);
      requireValue(!b.spoiler || b.spoilerLabel, `Missing spoiler control label: ${p.path}`);
    }
    for (const href of [...p.related, ...(p.parent ? [p.parent] : [])]) requireValue(paths.has(href), `Broken editorial relation: ${href}`);
    const wordCount = blocksText(p).join(' ').split(/\s+/).filter(Boolean).length;
    requireValue(wordCount >= (p.kind === 'blog' ? 450 : 150), `Thin editorial content: ${p.path}`);
    const route = { path:p.path, title:p.title, h1:p.h1, navLabel:p.navLabel, description:p.description, intro:p.intro,
      section:'editorial', priority:isIndex(p) ? '0.8' : '0.7', changefreq:isIndex(p) ? 'weekly' : 'monthly',
      lastModified:p.lastReviewed, robots:'index,follow,max-image-preview:large', includeInSitemap:true, showAds:false,
      body:blocksText(p), editorial:{...structuredClone(p), author:manifest.author} };
    const existing = data.routes.find(r => r.path === p.path);
    requireValue(!existing || existing.section === 'editorial', `Refusing to overwrite existing route: ${p.path}`);
    if (existing) Object.assign(existing, route); else data.routes.push(route);
  }
  const oldMedia = data.media.find(m => m.id === 'editorial-dossier-cover');
  const cover = {id:'editorial-dossier-cover', title:'Veronica Hub editorial archive cover', kind:'editorial-art',
    src:'/assets/editorial/veronica-archive-dossier.svg', alt:'Editorial dossier illustration; not a game screenshot or character portrait',
    sourceId:'veronica-hub-policy', pages:manifest.pages.map(p => p.path)};
  if (oldMedia) Object.assign(oldMedia,cover); else data.media.push(cover);
  for (const path of ['/', '/characters/', '/sources/', '/changelog/']) {
    const r = data.routes.find(r => r.path === path);
    if (r && r.lastModified < manifest.publishedAt) r.lastModified = manifest.publishedAt;
  }
  const title = 'News, gameplay and original-game dossiers added';
  // Keep the original launch entry anchored to the original editorial release.
  const launchDate = manifest.editorialLaunchedAt || manifest.publishedAt;
  if (!data.changelog.some(e => e.date === launchDate && e.title === title)) data.changelog.unshift({
    date:launchDate, type:'Site Update', title,
    summary:'Added a news center, a source-checked Spotlight explainer, gameplay, enemy and boss guides, and six character dossiers. Original-story spoilers are opt-in. This is site content, not a new Capcom game announcement.',
    sourceId:'veronica-hub-policy', affectedClaims:[]
  });
  for (const entry of manifest.siteUpdates || []) {
    requireValue(validDate(entry.date) && entry.date <= manifest.publishedAt && entry.type === 'Site Update' && entry.sourceId === 'veronica-hub-policy', 'Invalid editorial site update');
    if (!data.changelog.some(e => e.date === entry.date && e.title === entry.title)) data.changelog.push(structuredClone(entry));
  }
  data.changelog.sort((a,b) => b.date.localeCompare(a.date));
  data.editorial = {version:1, pagePaths:manifest.pages.map(p => p.path), author:manifest.author};
  return data;
}
function sourceLinks(ids, data) {
  return unique(ids).map(id => {
    const s = data.sources.find(s => s.id === id);
    if (!s) throw new Error(`Missing source ${id}`);
    return `<a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.name)}</a>`;
  }).join(' · ');
}
const getRoute = (data, path) => data.routes.find(r => r.path === path);
const collection = (data, kind) => data.routes.filter(r => r.editorial?.kind === kind).sort((a,b) => b.editorial.publishedAt.localeCompare(a.editorial.publishedAt) || a.path.localeCompare(b.path));
function cards(routes, {short = false} = {}) {
  return `<div class="editorial-card-grid">${routes.map(r => `<a class="card editorial-card" href="${escapeHtml(r.path)}">
    <span class="eyebrow">${escapeHtml(r.editorial?.kind === 'blog' ? r.editorial.topic : r.editorial?.kind === 'news' ? 'Source-checked report' : r.editorial?.kind === 'character' ? 'Character dossier' : 'Explore')}</span>
    <h3>${escapeHtml(short ? r.navLabel : r.h1)}</h3><p>${escapeHtml(r.intro)}</p>
    ${['news','blog'].includes(r.editorial?.kind) ? `<time datetime="${r.editorial.publishedAt}">Published ${r.editorial.publishedAt}</time>` : ''}
    ${r.editorial?.kind === 'blog' ? `<span class="meta">About ${readingMinutes(r.editorial)} min read</span>` : ''}
    <span class="editorial-read">Read ${r.editorial?.kind === 'blog' ? 'article' : r.editorial?.kind === 'news' ? 'report' : 'guide'} <span aria-hidden="true">→</span></span>
  </a>`).join('')}</div>`;
}
export function editorialBreadcrumb(route, data) {
  const parent = route.editorial?.parent && getRoute(data,route.editorial.parent);
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
    {name:data.site.name,item:data.site.origin+'/'},
    ...(parent ? [{name:parent.navLabel,item:data.site.origin+parent.path}] : []),
    {name:route.navLabel,item:data.site.origin+route.path}
  ].map((i,n) => ({'@type':'ListItem',position:n+1,...i}))};
}
export function editorialSchema(route,data) {
  const p = route.editorial;
  const base = {'@context':'https://schema.org','@type':isIndex(p) ? 'CollectionPage' : p.kind === 'blog' ? 'BlogPosting' : p.kind === 'news' ? 'NewsArticle' : 'Article',
    headline:p.h1, name:p.h1, description:p.description, url:data.site.origin+p.path,
    mainEntityOfPage:data.site.origin+p.path, datePublished:p.publishedAt, dateModified:route.lastModified,
    author:{'@type':'Organization',name:p.author}, publisher:{'@type':'Organization',name:data.site.name},
    inLanguage:'en', isAccessibleForFree:true,
    citation:unique(p.blocks.flatMap(b => b.sourceIds)).map(id => data.sources.find(s => s.id === id).url)};
  if (isIndex(p)) base.mainEntity = {'@type':'ItemList',itemListElement:collection(data,p.kind === 'blog-index' ? 'blog' : 'news').map((r,n) => ({'@type':'ListItem',position:n+1,url:data.site.origin+r.path,name:r.h1}))};
  if (p.kind === 'blog') {
    base.articleSection = p.topic;
    base.wordCount = blocksText(p).join(' ').split(/\s+/).filter(Boolean).length;
    base.isPartOf = {'@type':'Blog',name:'Veronica Hub Blog',url:data.site.origin+'/blog/'};
  }
  return base;
}
export function renderEditorialBody(route, data) {
  const p = route.editorial;
  const parent = p.parent && getRoute(data,p.parent);
  const scope = p.kind === 'character' || p.path === '/enemies/' || p.path === '/bosses/'
    ? 'Original-game material is labeled separately. Archived lore is not a remake appearance announcement.'
    : p.kind === 'blog' ? 'An independently written feature. Source facts, original-game context and editorial analysis are labeled separately.'
    : 'Publisher announcements, attributed interviews and editorial explanations are labeled separately.';
  const sourceIds = unique(p.blocks.flatMap(b => b.sourceIds));
  const sourceList = sourceIds.map(id => {const s=data.sources.find(x => x.id===id);return `<li>${sourceLinks([id],data)} <span class="meta">Checked ${escapeHtml(s.lastChecked)}</span>${s.accessNote ? `<p class="meta">${escapeHtml(s.accessNote)}</p>` : ''}</li>`;}).join('');
  const sourceContent = `<h2>Sources for this page</h2><p>Archive links may contain additional original-story spoilers.</p><ul>${sourceList}</ul>`;
  return `<div class="editorial-content" data-editorial-path="${escapeHtml(p.path)}">
    <div class="editorial-byline"><span>By ${escapeHtml(p.author)}</span><time datetime="${p.publishedAt}">Published ${p.publishedAt}</time><time datetime="${p.lastReviewed}">Last checked ${p.lastReviewed}</time>${p.eventDate ? `<time datetime="${p.eventDate}">Source announcement ${p.eventDate}</time>` : ''}${p.kind === 'blog' ? `<span>About ${readingMinutes(p)} min read</span>` : ''}</div>
    ${parent ? `<p><a class="source-link" href="${parent.path}">← ${escapeHtml(parent.navLabel)}</a></p>` : ''}
    <p class="editorial-scope">${escapeHtml(scope)}</p>
    <div class="editorial-lede">${p.lede.map(t => `<p>${escapeHtml(t)}</p>`).join('')}</div>
    ${isIndex(p) ? cards(collection(data,p.kind === 'blog-index' ? 'blog' : 'news')) : ''}
    <nav class="editorial-toc" aria-label="On this page"><strong>On this page</strong>${p.blocks.filter(b => !b.spoiler).map(b => `<a href="#${b.id}">${escapeHtml(b.title)}</a>`).join('')}</nav>
    <div class="editorial-layout"><article class="editorial-article">${p.blocks.map(b => {
      const body = `<span class="editorial-status editorial-status-${b.status}">${labels[b.status]}</span><h2>${escapeHtml(b.title)}</h2>${b.paragraphs.map(t => `<p>${escapeHtml(t)}</p>`).join('')}${b.sourceIds.length ? `<p class="editorial-evidence">Sources: ${sourceLinks(b.sourceIds,data)}</p>` : ''}`;
      return b.spoiler ? `<details class="editorial-spoiler" id="${b.id}"><summary>${escapeHtml(b.spoilerLabel)}</summary><div>${body}</div></details>` : `<section class="editorial-section" id="${b.id}">${body}</section>`;
    }).join('')}</article>
    <aside class="editorial-sidebar"><h2>Keep reading</h2><nav aria-label="Related pages">${p.related.map(path => getRoute(data,path)).map(r => `<a href="${escapeHtml(r.path)}">${escapeHtml(r.navLabel)} <span aria-hidden="true">→</span></a>`).join('')}</nav><p>Prefer the setup without the ending? Start with <a class="source-link" href="/story/">Story</a>. Individual original-story dossiers open only when selected.</p><a class="source-link" href="/sources/">Editorial sources and review policy</a></aside></div>
    ${sourceIds.length ? (p.blocks.some(b => b.spoiler) ? `<details class="editorial-spoiler editorial-source-list"><summary>Source list — may contain original-story spoilers</summary><div>${sourceContent}</div></details>` : `<section class="editorial-source-list">${sourceContent}</section>`) : ''}
    <section class="editorial-related"><h2>Explore the connected guides</h2>${cards(p.related.slice(0,3).map(path => getRoute(data,path)),{short:true})}</section>
  </div>`;
}
export function renderEditorialPreview(data, mode='home') {
  const paths = mode === 'characters' ? data.routes.filter(r => r.editorial?.kind === 'character').map(r=>r.path) : ['/news/','/gameplay/','/enemies/','/characters/'];
  const routes = paths.map(p=>getRoute(data,p)).filter(Boolean);
  const title = mode === 'characters' ? 'Explore the character dossiers' : 'Beyond the announcement';
  const text = mode === 'characters' ? 'Six individual reading guides. Original-game context is not a confirmed remake cast list.' : 'Source-checked news, gameplay questions and the original world behind Veronica.';
  const blogs = collection(data,'blog');
  const blogPreview = mode === 'home' && blogs.length ? `<section class="section tight editorial-preview" id="latest-blog"><div class="container"><div class="section-heading"><span class="kicker">Veronica Hub Blog</span><h2>Stories behind the remake</h2><p>Camera questions, character design and a spoiler-light way into the series.</p></div>${cards(blogs.slice(0,3))}<p><a class="source-link" href="/blog/">Browse all blog articles →</a></p></div></section>` : '';
  return `<section class="section tight editorial-preview" id="${mode === 'characters' ? 'character-dossiers' : 'explore-veronica'}"><div class="container"><div class="section-heading"><span class="kicker">Veronica reading room</span><h2>${title}</h2><p>${text}</p></div>${cards(routes,{short:true})}${mode === 'home' ? '<p><a class="source-link" href="/bosses/">Original boss dossiers — optional story spoilers →</a></p>' : ''}</div></section>${blogPreview}`;
}
