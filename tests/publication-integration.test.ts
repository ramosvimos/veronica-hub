// @vitest-environment node
import { afterEach,beforeEach,describe,it,expect,vi } from 'vitest';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createSubmission,reviewSubmission } from '@/lib/submissions/service';
import { getPublicPdfTools,getPublicPdfTool } from '@/lib/pdf-public-catalog';
import sitemap from '@/app/sitemap';
import { GET as toolsRoute } from '@/app/api/tools/route';
const key='integration-test-only-editor-key-not-production';
let directory:string;
beforeEach(async()=>{directory=await mkdtemp(path.join(tmpdir(),'vh-publication-'));vi.stubEnv('NODE_ENV','test');vi.stubEnv('VERONICA_SUBMISSIONS_MODE','local');vi.stubEnv('VERONICA_SUBMISSIONS_DIR',directory);vi.stubEnv('VERONICA_SUBMISSIONS_ADMIN_KEY',key);});
afterEach(async()=>{vi.unstubAllEnvs();await rm(directory,{recursive:true,force:true});});
describe('approval publication across all public readers',()=>{
 it('publishes and withdraws consistently in directory, detail, comparison API and sitemap',async()=>{
  const created=await createSubmission({name:'Cedar Research',url:'https://cedar-research.dev/',email:'private@cedar-research.dev',category:'productivity',description:'A notebook that organizes research projects.',sourceUrl:'https://cedar-research.dev/docs',backlinkUrl:'https://cedar-research.dev/links',confirmed:true});
  const slug='submission-'+created.submission.id;
  expect(await getPublicPdfTool(slug)).toBeUndefined();
  const verified=await reviewSubmission(key,created.submission.id,0,{decision:'verify',websiteChecked:true,backlinkChecked:true,note:'Official website and visible backlink inspected.'});
  const approved=await reviewSubmission(key,verified.id,verified.version,{decision:'approve',note:'Purpose, sources and category are accurate.'});
  expect((await getPublicPdfTools()).some(t=>t.slug===slug)).toBe(true);
  expect(await getPublicPdfTool(slug)).toMatchObject({slug,reciprocalSubmission:true});
  expect((await sitemap()).some(e=>e.url.endsWith('/item/'+slug))).toBe(true);
  const response=await toolsRoute(new Request('https://residentevilveronica.com/api/tools?slugs='+slug));
  expect(response.headers.get('cache-control')).toBe('no-store');expect((await response.json()).tools).toHaveLength(1);
  await reviewSubmission(key,approved.id,approved.version,{decision:'withdraw',note:'Tool no longer satisfies editorial conditions.'});
  expect((await getPublicPdfTools()).some(t=>t.slug===slug)).toBe(false);
  expect(await getPublicPdfTool(slug)).toBeUndefined();
  expect((await sitemap()).some(e=>e.url.endsWith('/item/'+slug))).toBe(false);
  expect((await (await toolsRoute(new Request('https://residentevilveronica.com/api/tools?slugs='+slug))).json()).tools).toEqual([]);
 });
 it('rejects a seeded domain at a different path before any hidden approval can happen',async()=>{
  await expect(createSubmission({name:'GitHub New Tool',url:'https://github.com/new-product',email:'publisher@new-tool.dev',category:'development',description:'A new software project at a shared domain.',backlinkUrl:'https://new-tool.dev/links',confirmed:true})).rejects.toMatchObject({code:'duplicate'});
 });
});
