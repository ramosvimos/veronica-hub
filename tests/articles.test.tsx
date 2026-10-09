import { describe,it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { articles,getProjectArticles } from '@/data/articles';
import { pdfTools } from '@/data/pdf-catalog';
import ArticlePage,{generateMetadata,generateStaticParams} from '@/app/(website)/(public)/blog/[slug]/page';
import Blog from '@/app/(website)/(public)/blog/page';
import Projects from '@/app/(website)/(public)/our-projects/page';
import sitemap from '@/app/sitemap';
describe('owned project guides',()=>{
 it('has five disclosed projects and five unique articles each',()=>{const projects=pdfTools.filter(p=>p.ownedProject);expect(projects).toHaveLength(5);expect(articles).toHaveLength(25);expect(new Set(articles.map(a=>a.slug)).size).toBe(25);expect(new Set(articles.map(a=>a.title)).size).toBe(25);for(const p of projects)expect(getProjectArticles(p.slug)).toHaveLength(5);expect(generateStaticParams()).toHaveLength(25);});
 it('has substantive answers, sources, practical sections, limitations and FAQs',()=>{for(const a of articles){expect(a.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);expect(a.answer.length).toBeGreaterThan(80);expect(a.sections.length).toBeGreaterThanOrEqual(3);expect(a.faq.length).toBeGreaterThanOrEqual(3);expect(a.description.length).toBeGreaterThanOrEqual(55);expect(a.description.length).toBeLessThanOrEqual(160);expect(a.sources.length).toBeGreaterThan(0);expect(a.date).toBe('2026-10-09');expect(JSON.stringify(a).split(/\s+/).length).toBeGreaterThan(600);for(const s of a.sources)expect(new URL(s.url).protocol).toBe('https:');expect(a.sections.some(s=>s.steps&&s.steps.length>=3)).toBe(true);}});
 it('renders every article server-side with matching canonical, Article schema and disclosure',async()=>{for(const a of articles){const props={params:Promise.resolve({slug:a.slug})};const html=renderToStaticMarkup(await ArticlePage(props));expect(html).toContain(a.title.replace(/&/g,'&amp;'));expect(html).toContain('Ownership disclosure');expect(html).toContain('"@type":"Article"');expect(html).toContain('Sources and further reading');expect(html).toContain(`/item/${a.projectSlug}`);expect(html).toContain(a.sources[0].url.replace(/&/g,'&amp;'));const m=await generateMetadata(props);expect(m.alternates?.canonical).toBe(`/blog/${a.slug}`);}});
 it('links all articles from indexes and includes them in the public sitemap',async()=>{const index=renderToStaticMarkup(<Blog/>);const projects=renderToStaticMarkup(<Projects/>);const map=await sitemap();for(const a of articles){expect(index).toContain(`/blog/${a.slug}`);expect(projects).toContain(`/blog/${a.slug}`);expect(map.some(p=>p.url===`https://residentevilveronica.com/blog/${a.slug}`)).toBe(true);}});
});
