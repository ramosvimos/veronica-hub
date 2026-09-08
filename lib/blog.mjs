/** Merge independently maintained blog features into the existing reading room. */
export function combineEditorialManifests(editorial, blog) {
  if (!blog) return structuredClone(editorial);
  if (blog.version !== 1 || !Array.isArray(blog.pages) || !Array.isArray(blog.sources)) throw new Error('Invalid blog manifest');
  if (blog.author !== editorial.author) throw new Error('Blog author must match the editorial desk');
  if (blog.pages.filter(p => p.kind === 'blog-index' && p.path === '/blog/').length !== 1) throw new Error('Exactly one blog index is required');
  if (blog.pages.some(p => !['blog','blog-index'].includes(p.kind) || !p.path.startsWith('/blog/'))) throw new Error('Blog routes must stay inside /blog/');
  const paths = [...editorial.pages, ...blog.pages].map(p => p.path);
  if (new Set(paths).size !== paths.length) throw new Error('Duplicate editorial path');
  const sourceIds = [...editorial.sources, ...blog.sources].map(s => s.id);
  if (new Set(sourceIds).size !== sourceIds.length) throw new Error('Duplicate blog source identifier; reference the existing source instead');
  for (const value of [editorial.publishedAt, blog.publishedAt]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error('Invalid manifest date');
  }
  return structuredClone({...editorial,
    publishedAt: [editorial.publishedAt,blog.publishedAt].sort().at(-1),
    editorialLaunchedAt: editorial.editorialLaunchedAt || editorial.publishedAt,
    pages:[...editorial.pages,...blog.pages], sources:[...editorial.sources,...blog.sources],
    siteUpdates:[...(editorial.siteUpdates || []), ...(blog.siteUpdates || [])]
  });
}
