import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const port=Number(process.env.VERONICA_TEST_PORT||3187);
const origin=`http://127.0.0.1:${port}`;
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',VERONICA_SUBMISSIONS_MODE:'disabled'},stdio:['ignore','pipe','pipe']});
let logs='';app.stdout.on('data',d=>logs+=d);app.stderr.on('data',d=>logs+=d);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(origin)).ok){ready=true;break;}}catch{}await sleep(100);}assert(ready,'Preview server did not become ready. '+logs);
 const pages=['/','/blog','/our-projects','/search?q=obsidian','/category/ai','/item/obsidian','/compare?tools=chatgpt,obsidian','/collection','/submit-tool','/submit-tool/status','/admin/submissions','/about','/editorial-policy','/privacy','/terms'];
 for(const p of pages){const res=await fetch(origin+p);assert.equal(res.status,200,p);const html=await res.text();assert(html.includes('Veronica'),p+' brand');}
 assert.equal((await fetch(origin+'/item/not-a-real-tool')).status,404);
 const api=await fetch(origin+'/api/tools?slugs=obsidian,chatgpt');assert.equal(api.headers.get('cache-control'),'no-store');assert.equal((await api.json()).tools.length,2);
 const closed=await fetch(origin+'/api/submissions',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:'{}'});assert.equal(closed.status,503);assert.match(closed.headers.get('cache-control')||'',/no-store/);
 const sitemap=await (await fetch(origin+'/sitemap.xml')).text();assert(sitemap.includes('https://residentevilveronica.com/item/obsidian'));assert(!sitemap.includes('/archive/'));assert(!sitemap.includes('/submit-tool/status'));
 const articleFiles=['deepseek','voice','transcript','askpdf','random'];
 const articles=articleFiles.flatMap(name=>JSON.parse(readFileSync(`src/data/articles/${name}.json`,'utf8')));assert.equal(articles.length,25);
 for(const a of articles){const response=await fetch(origin+'/blog/'+a.slug);assert.equal(response.status,200,a.slug);const html=await response.text();assert(html.includes('Ownership disclosure'));assert(html.includes('application/ld+json'));assert(html.includes('https://residentevilveronica.com/blog/'+a.slug));assert(sitemap.includes('https://residentevilveronica.com/blog/'+a.slug));}
 assert.equal((await fetch(origin+'/blog/not-a-real-guide')).status,404);
 const manifest=JSON.parse(readFileSync('public/archive/archive-manifest.json','utf8'));
 for(const r of manifest.routes){const res=await fetch(origin+r.archivePath);assert.equal(res.status,200,r.archivePath);assert.match(res.headers.get('x-robots-tag')||'',/noindex/);const html=await res.text();assert.match(html,/Historical archive|historical archive/);assert(!/<script\b/i.test(html),r.archivePath+' script');}
 const legacy=await fetch(origin+'/release-date',{redirect:'manual'});assert.equal(legacy.status,308);assert.equal(legacy.headers.get('location'),'/archive/release-date');
 console.log(`HTTP smoke passed: ${pages.length} active pages, 25 SSR articles, 44 archive routes, missing detail, public API, closed submissions, sitemap and legacy redirect.`);
} catch(error){console.error(error);console.error(logs.slice(-2500));process.exitCode=1;} finally {app.kill('SIGTERM');}
