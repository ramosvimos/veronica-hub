import { describe,it,expect } from 'vitest';
import { pdfTools,pdfCategories,pdfCollections,filterPdfTools,paramValue } from '@/data/pdf-catalog';
import { pdfPagination,pdfPageRedirect,pdfHasFilters } from '@/lib/pdf-pagination';
describe('current AskPDF catalogue adaptation',()=>{
 it('contains 32 source-traceable general tools and unique domains',()=>{
  expect(pdfTools).toHaveLength(32);expect(new Set(pdfTools.map(t=>t.slug)).size).toBe(32);expect(new Set(pdfTools.map(t=>new URL(t.url).hostname.replace(/^www\./,''))).size).toBe(32);
  for(const t of pdfTools){expect(t.name.length).toBeGreaterThan(1);expect(t.description.length).toBeGreaterThan(20);expect(t.sources.length).toBeGreaterThan(0);expect(t.reviewedOn).toMatch(/^2026-10-(09|10)$/);expect(new URL(t.url).protocol).toBe('https:');expect(['Free','Freemium','Paid','Not verified']).toContain(t.pricing);expect(t.processing).toBe('Not verified');expect(t.categories.every(c=>pdfCategories.some(p=>p.slug===c))).toBe(true);expect(t.paidSubmission).toBeUndefined();}
 });
 it('keeps the current real directory text/category/price/processing filters',()=>{
  expect(filterPdfTools(pdfTools,{q:'OBSIDIAN'}).map(t=>t.slug)).toEqual(['obsidian']);
  expect(filterPdfTools(pdfTools,{category:'ai'})).toHaveLength(12);
  expect(filterPdfTools(pdfTools,{q:'Obsidian',category:'ai'})).toEqual([]);
  expect(filterPdfTools(pdfTools,{price:'free'}).map(t=>t.slug)).toEqual(['vscode']);
  expect(filterPdfTools(pdfTools,{processing:'Not verified'})).toHaveLength(32);
 });
 it('sorts copied results without mutating editorial order',()=>{const before=pdfTools.map(t=>t.slug);const sorted=filterPdfTools(pdfTools,{sort:'name'});expect(sorted[0].name).toBe('Airtable');expect(pdfTools.map(t=>t.slug)).toEqual(before);});
 it('rejects array-valued params and detects filters',()=>{expect(paramValue({q:['x','y']},'q')).toBe('');expect(pdfHasFilters({q:'x'})).toBe(true);expect(pdfHasFilters({page:'2'})).toBe(false);});
 it('preserves pagination and canonical redirect rules',()=>{expect(pdfPagination(25,{page:'2'})).toEqual({page:2,totalPages:2,pageSize:24});expect(pdfPagination(25,{page:'999'}).page).toBe(2);expect(pdfPagination(0,{page:'-1'}).page).toBe(1);expect(pdfPageRedirect('/search',25,{q:'notes',page:'999'})).toBe('/search?q=notes&page=2');expect(pdfPageRedirect('/',48,{page:'2'})).toBeNull();});
 it('references only existing tools in collections',()=>{for(const c of pdfCollections){expect(c.slugs.length).toBeGreaterThan(1);expect(c.slugs.every(s=>pdfTools.some(t=>t.slug===s))).toBe(true);}});
});
