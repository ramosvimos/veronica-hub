import { readdirSync,readFileSync,existsSync } from 'node:fs';
import path from 'node:path';
const root=process.cwd();
function walk(p){if(!existsSync(p))return [];return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const findings=[];
for(const f of walk(path.join(root,'src'))){const s=readFileSync(f,'utf8');for(const [label,re] of [
 ['borrowed deployment or service variable',/\b(?:ASKPDF_[A-Z_]+|STRIPE_[A-Z_]+|SUPABASE_[A-Z_]+|RESEND_[A-Z_]+|NEXTAUTH_SECRET)\b/],
 ['prior site origin',/https:\/\/(?:www\.)?rule34higherorlower\.com/],
 ['remote favicon tracking',/google\.com\/s2\/favicons/],
 ['payment/auth/mail runtime import',/from ["'](?:stripe|next-auth|resend|@supabase\/[^"']+)/],
 ['legacy document pipeline',/\b(?:getServerGameStore|opendataloader|tusd|ASKPDF_DIRECTORY_ONLY)\b/]
 ])if(re.test(s))findings.push(path.relative(root,f)+': '+label);}
// AskPDF URLs are allowed only as disclosed editorial project content, never as this site's service origin.
for(const directory of ['src/config','src/lib'])for(const f of walk(path.join(root,directory))){if(/https:\/\/(?:www\.)?askpdf\.top/.test(readFileSync(f,'utf8')))findings.push(path.relative(root,f)+': borrowed AskPDF service origin');}
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
if(config.routes||config.account_id) findings.push('Production route and account configuration must remain absent.');
const [submissionsDb]=config.d1_databases??[];
if((config.d1_databases??[]).length!==1||submissionsDb?.binding!=='VERONICA_SUBMISSIONS_DB'||submissionsDb?.database_name!=='veronica-hub-submissions'||submissionsDb?.database_id!=='dabfbc42-b9df-42a8-a8c5-3476ba42506d') findings.push('Only the dedicated Veronica Hub submissions D1 database may be bound.');
if(Object.keys(config.vars??{}).length!==1||config.vars?.VERONICA_SUBMISSIONS_MODE!=='d1') findings.push('Only the non-secret D1 submission mode may be configured as a Worker variable.');
const pkg=JSON.parse(readFileSync('package.json','utf8'));if(Object.keys(pkg.scripts).some(s=>s==='deploy'||s.startsWith('deploy:')))findings.push('Deployment entry point should not be included.');
if(existsSync('.github/workflows/deploy-cloudflare.yml'))findings.push('Borrowed deployment workflow remains.');
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}else console.log('Service boundaries verified: only the dedicated submissions D1 and non-secret mode are configured; no copied credentials, account ID or routes are present.');
