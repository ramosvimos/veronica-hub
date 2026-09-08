import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { applyLatestVerification } from './build-with-latest-verification.mjs';
import { applyEditorialContent } from '../lib/editorial.mjs';
import { combineEditorialManifests } from '../lib/blog.mjs';
import { adaptApp, adaptRenderer, adaptValidator } from './editorial-build-adapter.mjs';
import { validateEditorialOutput } from './validate-editorial.mjs';

export function buildContentSite(root=process.cwd(), run=execFileSync) {
  const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
  const dataPath=path.join(root,'content/site-data.json');
  const original=read('content/site-data.json');
  const blogPath=path.join(root,'content/blog.json');
  const manifest=combineEditorialManifests(JSON.parse(read('content/editorial.json')),fs.existsSync(blogPath) ? JSON.parse(read('content/blog.json')) : null);
  const data=applyEditorialContent(applyLatestVerification(JSON.parse(original),JSON.parse(read('content/latest-verification.json'))),manifest);
  const appPath=path.join(root,'designs/veronica-hub/.editorial-entry.generated.jsx');
  const rendererPath=path.join(root,'scripts/.editorial-renderer.generated.mjs');
  const validatorPath=path.join(root,'scripts/.editorial-validator.generated.mjs');
  const temp=[appPath,rendererPath,validatorPath];
  // Resolve and check all integration contracts before writing anything.
  const generated=[adaptApp(read('designs/veronica-hub/app.jsx')),adaptRenderer(read('scripts/render-static-pages.mjs')),adaptValidator(read('scripts/validate-site.mjs'),data.routes.length)];
  if (temp.some(p=>fs.existsSync(p))) throw new Error('Generated editorial entries already exist; another build may be running');
  try {
    temp.forEach((p,i)=>fs.writeFileSync(p,generated[i]));
    fs.writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n');
    const node=process.execPath;
    const options={cwd:root,stdio:'inherit'};
    const esbuildOptions={entryPoints:[appPath],bundle:true,format:'iife',minify:true,outfile:'designs/veronica-hub/app.bundle.js'};
    run(node,['-e',`require('esbuild').buildSync(${JSON.stringify(esbuildOptions)})`],options);
    run(node,[rendererPath],options);
    run(node,['scripts/render-feed.mjs'],options);
    run(node,[validatorPath],options);
    validateEditorialOutput(root,data);
  } finally {
    fs.writeFileSync(dataPath,original);
    for (const p of temp) fs.rmSync(p,{force:true});
  }
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) buildContentSite();
