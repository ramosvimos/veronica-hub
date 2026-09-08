/** Append reviewed blog batches without rewriting the launch manifest or old posts. */
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function appendBlogBatches(blog, batches = []) {
  assert(Array.isArray(batches), 'Blog batches must be an array');
  if (!batches.length) return blog ? structuredClone(blog) : null;
  assert(blog?.version === 1 && Array.isArray(blog.pages) && Array.isArray(blog.sources), 'Blog batches need a base manifest');
  const result = structuredClone(blog);
  const indexes = result.pages.filter(page => page.kind === 'blog-index' && page.path === '/blog/');
  assert(indexes.length === 1, 'Exactly one base blog index is required');
  const index = indexes[0];
  const pages = new Map(result.pages.map(page => [page.path, page]));
  const sources = new Map(result.sources.map(source => [source.id, source]));
  assert(pages.size === result.pages.length && sources.size === result.sources.length, 'Duplicate identifiers in base blog');
  result.siteUpdates ||= [];
  let latestReview = index.lastReviewed;
  for (const batch of batches) {
    assert(batch?.version === 1 && batch.author === result.author, 'Invalid blog batch author or version');
    assert(validDate(batch.publishedAt), 'Invalid blog batch date');
    assert(Array.isArray(batch.pages) && batch.pages.length && Array.isArray(batch.sources), 'Invalid blog batch content');
    assert(new Set(batch.pages.map(page => page.path)).size === batch.pages.length, 'Duplicate batch route');
    assert(new Set(batch.sources.map(source => source.id)).size === batch.sources.length, 'Duplicate batch source');
    for (const source of batch.sources) {
      const url = new URL(source.url);
      assert(source.id && source.name && url.protocol === 'https:' && !url.username && !url.password, 'Invalid batch source URL');
      assert(validDate(source.lastChecked) && source.lastChecked <= batch.publishedAt, 'Invalid batch source date');
      const existing = sources.get(source.id);
      assert(!existing || same(existing, source), `Refusing to replace source: ${source.id}`);
      if (!existing) { const copy = structuredClone(source); result.sources.push(copy); sources.set(source.id, copy); }
    }
    for (const page of batch.pages) {
      assert(page.kind === 'blog' && /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(page.path) && page.parent === '/blog/', 'Invalid batch blog route');
      assert(validDate(page.publishedAt) && validDate(page.lastReviewed) && page.publishedAt <= page.lastReviewed && page.lastReviewed <= batch.publishedAt, 'Invalid batch page date');
      assert(page.topic && page.title && page.h1 && page.description && page.intro && page.navLabel, 'Missing batch page metadata');
      assert(Array.isArray(page.lede) && page.lede.length && Array.isArray(page.blocks) && page.blocks.length && Array.isArray(page.related), 'Missing batch article content');
      const existing = pages.get(page.path);
      assert(!existing || same(existing, page), `Refusing to replace post: ${page.path}`);
      if (!existing) { const copy = structuredClone(page); result.pages.push(copy); pages.set(page.path, copy); }
    }
    for (const entry of batch.siteUpdates || []) {
      assert(entry.type === 'Site Update' && entry.sourceId === 'veronica-hub-policy' && entry.title && validDate(entry.date) && entry.date <= batch.publishedAt, 'Invalid blog batch changelog entry');
      const existing = result.siteUpdates.find(item => item.date === entry.date && item.title === entry.title);
      assert(!existing || same(existing, entry), 'Conflicting blog batch changelog entry');
      if (!existing) result.siteUpdates.push(structuredClone(entry));
    }
    if (batch.publishedAt > result.publishedAt) result.publishedAt = batch.publishedAt;
    if (batch.publishedAt > latestReview) latestReview = batch.publishedAt;
  }
  // Keep the original index publication date; remove launch-specific article counts.
  index.lastReviewed = latestReview;
  index.description = 'Explore Veronica articles about the remake, classic versions, Rockfort Island, the Ashford family, beginner tips and original-game lore.';
  index.lede = [
    'Explore the remake and the classic game through source-backed explainers, practical guides and original analysis. Start with versions and beginner tips, follow the story to Rockfort Island, or untangle the Ashford family before reading the deeper dossiers.',
    'Each article links its evidence and separates original-game information from remake announcements. Publication dates belong to these features; an older interview or manual does not become breaking news when it is cited again.'
  ];
  return result;
}
