import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { combineEditorialManifests } from '../lib/blog.mjs';
import { applyEditorialContent, editorialSchema, editorialBreadcrumb, renderEditorialBody, renderEditorialPreview, editorialPrimaryNav, readingMinutes } from '../lib/editorial.mjs';
const blog=JSON.parse(fs.readFileSync(new URL('../content/blog.json',import.meta.url),'utf8'));
const filler='This fixture represents previously published editorial context and is deliberately separate from the public blog copy. '.repeat(12);
const legacyPage=(path,kind)=>({path,kind,navLabel:kind,title:'Existing '+kind,h1:'Existing '+kind,description:'Existing article',intro:'Existing article',publishedAt:'2026-09-08',lastReviewed:'2026-09-08',lede:[filler],blocks:[{id:'intro',title:'Existing context',status:'editorial',sourceIds:[],paragraphs:[filler]}],related:['/']});
const editorial={version:1,publishedAt:'2026-09-08',author:blog.author,sources:[],pages:[legacyPage('/news/','news-index'),legacyPage('/news/existing/','news')]};
function baseData() {
  const related=new Set(['/', '/characters/', '/sources/', '/changelog/', '/news/', '/gameplay/', '/enemies/', '/bosses/', ...blog.pages.flatMap(p=>p.related)]);
  const blogPaths=new Set(blog.pages.map(p=>p.path));
  const newSources=new Set(blog.sources.map(s=>s.id));
  const sourceIds=new Set(['veronica-hub-policy',...blog.pages.flatMap(p=>p.blocks.flatMap(b=>b.sourceIds))]);
  return {site:{name:'Veronica Hub',origin:'https://residentevilveronica.com',lastVerified:'2026-09-08'},routes:[...related].filter(p=>!blogPaths.has(p)&&p!='/news/').map(path=>({path,navLabel:path,h1:path,intro:'Existing reference',lastModified:'2026-08-21'})),
    sources:[...sourceIds].filter(id=>!newSources.has(id)).map(id=>({id,name:id,url:'https://example.com/'+id,lastChecked:'2026-08-21'})),
    media:[],claims:[],changelog:[{date:'2026-08-21',title:'Existing source review',type:'Source Review',sourceId:'veronica-hub-policy'}]};
}
const build=(b=blog,e=editorial)=>applyEditorialContent(baseData(),combineEditorialManifests(e,b));
const get=(d,p)=>d.routes.find(r=>r.path===p);
const posts=blog.pages.filter(p=>p.kind==='blog');
test('six substantive blog posts and one dedicated index are merged without changing inputs',()=>{
 const before=JSON.stringify([editorial,blog]);const m=combineEditorialManifests(editorial,blog);
 assert.equal(posts.length,6);assert.equal(m.pages.length,9);assert.equal(JSON.stringify([editorial,blog]),before);
 for(const p of posts) assert.ok(p.lede.concat(p.blocks.flatMap(b=>b.paragraphs)).join(' ').split(/\s+/).length>=450);
});
test('legacy-only builds do not require a blog manifest',()=>assert.deepEqual(combineEditorialManifests(editorial,null),editorial));
test('blog index schema lists six posts and news index excludes blog posts',()=>{
 const d=build();const b=editorialSchema(get(d,'/blog/'),d);const n=editorialSchema(get(d,'/news/'),d);
 assert.equal(b['@type'],'CollectionPage');assert.equal(b.mainEntity.itemListElement.length,6);assert.equal(n.mainEntity.itemListElement.length,1);
 assert.ok(n.mainEntity.itemListElement.every(i=>i.url.includes('/news/')));
});
test('features use BlogPosting, own dates, parent breadcrumbs and calculated reading time',()=>{
 const d=build();for(const p of posts){const r=get(d,p.path);const s=editorialSchema(r,d);
 assert.equal(s['@type'],'BlogPosting');assert.equal(s.datePublished,p.publishedAt);assert.equal(s.dateModified,p.lastReviewed);
 assert.ok(s.wordCount>=450);assert.equal(s.isPartOf.url,d.site.origin+'/blog/');assert.ok(readingMinutes(p)>=3);
 assert.equal(editorialBreadcrumb(r,d).itemListElement[1].item,d.site.origin+'/blog/');}
});
test('repeated application preserves evidence dates, old history and one blog launch entry',()=>{
 const d=build();const twice=applyEditorialContent(d,combineEditorialManifests(editorial,blog));assert.deepEqual(twice,d);
 assert.equal(get(d,'/story/').lastModified,'2026-08-21');assert.ok(d.changelog.some(e=>e.title==='Existing source review'));
 assert.equal(d.changelog.filter(e=>e.title===blog.siteUpdates[0].title).length,1);
 assert.equal(d.sources.find(s=>s.id==='steam-store').lastChecked,'2026-08-21');
});
test('all six article bodies render their text, section sources, parent link and reading times',()=>{
 const d=build();for(const p of posts){const html=renderEditorialBody(get(d,p.path),d);
 assert.ok(html.includes('href="/blog/"'));assert.ok(html.includes('min read'));
 for(const b of p.blocks) assert.ok(html.includes('id="'+b.id+'"'));
 for(const id of new Set(p.blocks.flatMap(b=>b.sourceIds))) assert.ok(html.includes(d.sources.find(s=>s.id===id).url));}
});
test('plot-revealing identities and consolidated source names are not in the closed summaries or toc',()=>{
 const d=build();const r=get(d,'/blog/code-veronica-monsters-explained/');const html=renderEditorialBody(r,d);
 assert.ok(html.includes('<details class="editorial-spoiler" id="case-one">'));
 assert.ok(html.includes('<details class="editorial-spoiler" id="case-two">'));
 assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(html));
 const summaries=[...html.matchAll(/<summary>(.*?)<\/summary>/g)].map(m=>m[1]).join(' ');
 assert.ok(!/Nosferatu|Alexia|Alexander/.test(summaries));
 const toc=html.match(/<nav class="editorial-toc"[\s\S]*?<\/nav>/)[0];assert.ok(!/Nosferatu|Alexia|Alexander/.test(toc));
});
test('primary navigation and homepage give the blog an actual entry point',()=>{
 const d=build();assert.ok(editorialPrimaryNav.includes('/blog/'));const html=renderEditorialPreview(d);
 assert.ok(html.includes('id="latest-blog"'));assert.ok(html.includes('href="/blog/"'));const preview=html.slice(html.indexOf('id="latest-blog"'));assert.equal(posts.filter(p=>preview.includes('href="'+p.path+'"')).length,3);
});
test('duplicate paths, blog namespace escapes and duplicate source identities are rejected',()=>{
 let b=structuredClone(blog);b.pages.push(b.pages[1]);assert.throws(()=>combineEditorialManifests(editorial,b),/Duplicate/);
 b=structuredClone(blog);b.pages[1].path='/replacement/';assert.throws(()=>combineEditorialManifests(editorial,b),/inside/);
 b=structuredClone(blog);b.sources.push(b.sources[0]);assert.throws(()=>combineEditorialManifests(editorial,b),/Duplicate/);
});
test('unknown evidence, missing parents and thin posts fail before publication',()=>{
 let b=structuredClone(blog);b.pages[1].blocks[0].sourceIds=['does-not-exist'];assert.throws(()=>build(b),/Unknown source/);
 b=structuredClone(blog);b.pages[1].parent='/wrong/';assert.throws(()=>build(b),/parent/);
 b=structuredClone(blog);b.pages[1].lede=['Too short'];b.pages[1].blocks=[{id:'short',title:'Short',status:'editorial',sourceIds:[],paragraphs:['Short']}];assert.throws(()=>build(b),/Thin/);
});
test('text remains escaped and invalid source URLs or dates are rejected',()=>{
 let b=structuredClone(blog);b.pages[1].blocks[0].paragraphs.push('<img src=x onerror=alert(1)>');const d=build(b);const html=renderEditorialBody(get(d,b.pages[1].path),d);
 assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));
 b=structuredClone(blog);b.sources[0].url='javascript:alert(1)';assert.throws(()=>build(b),/Invalid source/);
 b=structuredClone(blog);b.publishedAt='2026-02-30';assert.throws(()=>build(b),/Invalid manifest date/);
});
test('a later blog release never republishes the original editorial launch as a new launch',()=>{
 const b=structuredClone(blog);b.publishedAt='2026-09-09';b.siteUpdates[0].date='2026-09-09';const d=build(b);
 assert.ok(d.changelog.some(e=>e.title==='News, gameplay and original-game dossiers added'&&e.date==='2026-09-08'));
 assert.ok(!d.changelog.some(e=>e.title==='News, gameplay and original-game dossiers added'&&e.date==='2026-09-09'));
});
