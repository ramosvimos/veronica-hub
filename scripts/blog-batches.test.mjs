import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { appendBlogBatches } from '../lib/blog-batches.mjs';
const batch = JSON.parse(fs.readFileSync(new URL('../content/blog-posts/2026-09-08-classic-guides.json', import.meta.url), 'utf8'));
const base = () => ({version:1, author:batch.author, publishedAt:'2026-09-08', sources:[], siteUpdates:[], pages:[
  {path:'/blog/', kind:'blog-index', publishedAt:'2026-09-08', lastReviewed:'2026-09-08', lede:['Six starting reads.']},
  ...Array.from({length:6},(_,i)=>({path:`/blog/original-${i}/`,kind:'blog',publishedAt:'2026-09-08',lastReviewed:'2026-09-08'}))
]});
const changed = edit => { const copy=structuredClone(batch); edit(copy); return copy; };

test('four new features extend six posts without mutating either input',()=>{
  const original=base(); const before=JSON.stringify(original); const evidence=JSON.stringify(batch);
  const output=appendBlogBatches(original,[batch]);
  assert.equal(output.pages.filter(p=>p.kind==='blog').length,10);
  assert.equal(output.pages.length,11);
  assert.equal(JSON.stringify(original),before); assert.equal(JSON.stringify(batch),evidence);
  assert.deepEqual(output.pages.slice(1,7),original.pages.slice(1));
});
test('repeated batch application is idempotent, including the changelog',()=>{
  const output=appendBlogBatches(base(),[batch]);
  assert.deepEqual(appendBlogBatches(output,[batch]),output);
  assert.equal(output.siteUpdates.length,1);
});
test('an empty batch list preserves legacy and blogless builds',()=>{
  assert.equal(appendBlogBatches(null),null);
  const original=base(); const output=appendBlogBatches(original,[]);
  assert.deepEqual(output,original); assert.notEqual(output,original);
  assert.throws(()=>appendBlogBatches(null,[batch]),/base manifest/);
});
test('blog index keeps its publication date and has no stale six-post introduction',()=>{
  const output=appendBlogBatches(base(),[batch]);
  assert.equal(output.pages[0].publishedAt,'2026-09-08');
  assert.doesNotMatch(output.pages[0].lede.join(' '),/six starting reads/i);
});
test('colliding or changed articles cannot overwrite existing posts',()=>{
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.pages.push(b.pages[0]))]),/Duplicate batch route/);
  const output=appendBlogBatches(base(),[batch]);
  assert.throws(()=>appendBlogBatches(output,[changed(b=>b.pages[0].title='Replacement')]),/replace post/);
});
test('additional manifests cannot introduce another index or escape the blog',()=>{
  for (const value of ['/blog/','/news/test/','/blog/../evil/']) {
    assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.pages[0].path=value)]),/blog route/);
  }
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.pages[0].parent='/news/')]),/blog route/);
});
test('source collisions and unsafe source URLs are rejected',()=>{
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.sources.push(b.sources[0]))]),/Duplicate batch source/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.sources[0].url='javascript:alert(1)')]),/source URL/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.sources[0].url='https://user:pass@example.com/')]),/source URL/);
  const output=appendBlogBatches(base(),[batch]);
  assert.throws(()=>appendBlogBatches(output,[changed(b=>b.sources[0].url='https://example.com/')]),/replace source/);
});
test('dates, authors and historical evidence cannot silently change',()=>{
  for(const date of ['2026-02-30','yesterday']) assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.publishedAt=date)]),/date/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.author='Other desk')]),/author/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.pages[0].lastReviewed='2026-09-09')]),/page date/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.sources[0].lastChecked='2026-09-09')]),/source date/);
});
test('all four real articles have substantive unique text and safe spoiler labels',()=>{
  assert.equal(batch.pages.length,4);
  for(const page of batch.pages) {
    const words=[...page.lede,...page.blocks.flatMap(b=>[b.title,...b.paragraphs])].join(' ').split(/\s+/).length;
    assert.ok(words>=450,`${page.path}: ${words}`);
    assert.equal(new Set(page.blocks.map(b=>b.id)).size,page.blocks.length);
    for(const block of page.blocks) {
      assert.ok(['original','confirmed','reported','analysis','editorial','unknown'].includes(block.status));
      if(!['analysis','editorial'].includes(block.status)) assert.ok(block.sourceIds.length);
      if(block.spoiler) {assert.ok(block.spoilerLabel); assert.doesNotMatch(block.spoilerLabel,/Nosferatu|Antarctica|fifteen years/i);}
    }
  }
});
test('batch source references and related routes resolve against repository manifests',()=>{
  // Available in the complete checkout; isolated local tests still check new evidence.
  const root=new URL('../',import.meta.url);
  const paths=['content/site-data.json','content/editorial.json','content/blog.json','content/latest-verification.json'];
  if(!paths.every(p=>fs.existsSync(new URL(p,root)))) {
    const newIds=new Set(batch.sources.map(s=>s.id));
    for(const p of batch.pages) for(const b of p.blocks) for(const id of b.sourceIds.filter(id=>id.startsWith('b2-'))) assert.ok(newIds.has(id));
    return;
  }
  const [site,editorial,blog,verification]=paths.map(p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8')));
  const sourceIds=new Set([...site.sources,...editorial.sources,...blog.sources,...(verification.sourceUpserts||[]),...batch.sources].map(s=>s.id));
  const pagePaths=new Set([...site.routes,...editorial.pages,...blog.pages,...batch.pages].map(p=>p.path));
  for(const p of batch.pages) {
    for(const href of p.related) assert.ok(pagePaths.has(href),href);
    for(const b of p.blocks) for(const id of b.sourceIds) assert.ok(sourceIds.has(id),id);
  }
});
test('site updates are not mislabeled as game news',()=>{
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.siteUpdates[0].type='Official')]),/changelog/);
  assert.throws(()=>appendBlogBatches(base(),[changed(b=>b.siteUpdates[0].date='2026-09-09')]),/changelog/);
});
test('future batches refresh the index review but never republish old posts',()=>{
  const next=changed(b=>{b.publishedAt='2026-09-09';b.pages[0].publishedAt='2026-09-09';b.pages[0].lastReviewed='2026-09-09';});
  const output=appendBlogBatches(base(),[next]);
  assert.equal(output.publishedAt,'2026-09-09'); assert.equal(output.pages[0].lastReviewed,'2026-09-09');
  assert.equal(output.pages[0].publishedAt,'2026-09-08'); assert.equal(output.pages[1].publishedAt,'2026-09-08');
});
