import { pdfTools, type PdfTool } from "@/data/pdf-catalog";
import { getPublishedSubmissionTools } from "@/lib/submissions/public";
/** One fresh publication projection serves every public route. No stale approval cache. */
export async function getPublicPdfTools():Promise<PdfTool[]>{
 const approved=await getPublishedSubmissionTools();
 const seeded=new Set(pdfTools.map(t=>t.slug));
 const domains=new Set(pdfTools.map(t=>new URL(t.url).hostname.replace(/^www\./,"")));
 return [...pdfTools,...approved.filter(t=>!seeded.has(t.slug)&&!domains.has(new URL(t.url).hostname.replace(/^www\./,"")))];
}
export async function getPublicPdfTool(slug:string){return (await getPublicPdfTools()).find(t=>t.slug===slug);}

