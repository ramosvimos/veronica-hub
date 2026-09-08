import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, editorialSchema } from '../lib/editorial.mjs';
export function validateEditorialOutput(root,data) {
  const fail=(condition,message)=>{if(!condition)throw new Error(message);};
  const routes=data.routes.filter(r=>r.editorial);
  const allPaths=new Set(data.routes.map(r=>r.path));
  const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  for (const r of routes) {
    const html=fs.readFileSync(path.join(root,r.path.slice(1),'index.html'),'utf8');
    const tag=`data-editorial-path="${r.path}"`;
    fail(html.includes(tag),`Missing static editorial body: ${r.path}`);
    fail((html.match(/<h1\b/g)||[]).length===1,`Multiple h1s: ${r.path}`);
    fail(html.includes(`rel="canonical" href="${data.site.origin+r.path}"`),`Bad canonical: ${r.path}`);
    fail(sitemap.includes(`<loc>${data.site.origin+r.path}</loc>`),`Missing sitemap page: ${r.path}`);
    const structured=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
    fail(structured.some(s=>s['@type']===editorialSchema(r,data)['@type'] && s.datePublished===r.editorial.publishedAt),`Missing dated article schema: ${r.path}`);
    fail(html.includes('href="/styles/editorial.css"'),`Missing reading stylesheet: ${r.path}`);
    for(const b of r.editorial.blocks) {
      fail(html.includes(escapeHtml(b.title)),`Missing article section: ${r.path}#${b.id}`);
      if(b.spoiler) fail(html.includes(`<details class="editorial-spoiler" id="${b.id}">`),`Spoiler must default closed: ${r.path}`);
      for(const id of b.sourceIds) fail(html.includes(escapeHtml(data.sources.find(s=>s.id===id).url)),`Missing evidence link: ${r.path}`);
    }
    for(const [,href] of html.matchAll(/href="([^"#]+)"/g)) if(href.startsWith('/') && !href.includes('.')) fail(allPaths.has(href),`Broken internal link: ${r.path} -> ${href}`);
    fail(!html.includes('Lost in the archive.'),`Fallback rendered for ${r.path}`);
  }
  const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const characters=fs.readFileSync(path.join(root,'characters/index.html'),'utf8');
  for(const p of ['/news/','/gameplay/','/enemies/','/bosses/']) fail(home.includes(`href="${p}"`),`Homepage misses ${p}`);
  for(const r of routes.filter(r=>r.editorial.kind==='character')) fail(characters.includes(`href="${r.path}"`),`Character directory misses ${r.path}`);
  console.log(`editorial-output ok: ${routes.length} articles/directories, static sources, closed spoilers, internal links and schema`);
}
