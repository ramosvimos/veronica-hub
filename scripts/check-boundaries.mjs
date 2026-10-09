import { readdirSync,readFileSync,existsSync } from 'node:fs';
import path from 'node:path';
const root=process.cwd();
function walk(p){if(!existsSync(p))return [];return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);}
const findings=[];
for(const f of walk(path.join(root,'src'))){const s=readFileSync(f,'utf8');for(const [label,re] of [
 ['borrowed deployment or service variable',/\b(?:ASKPDF_[A-Z_]+|STRIPE_[A-Z_]+|SUPABASE_[A-Z_]+|RESEND_[A-Z_]+|NEXTAUTH_SECRET)\b/],
 ['prior site origin',/https:\/\/(?:www\.)?(?:askpdf\.top|rule34higherorlower\.com)/],
 ['remote favicon tracking',/google\.com\/s2\/favicons/],
 ['payment/auth/mail runtime import',/from ["'](?:stripe|next-auth|resend|@supabase\/[^"']+)/],
 ['legacy document pipeline',/\b(?:getServerGameStore|opendataloader|tusd|ASKPDF_DIRECTORY_ONLY)\b/]
 ])if(re.test(s))findings.push(path.relative(root,f)+': '+label);}
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
if(config.routes||config.account_id||config.d1_databases) findings.push('Production routing/account/database configuration must remain absent.');
const pkg=JSON.parse(readFileSync('package.json','utf8'));if(Object.keys(pkg.scripts).some(s=>s==='deploy'||s.startsWith('deploy:')))findings.push('Deployment entry point should not be included.');
if(existsSync('.github/workflows/deploy-cloudflare.yml'))findings.push('Borrowed deployment workflow remains.');
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}else console.log('Service boundaries verified: no copied service config, credentials or deployment routes.');
