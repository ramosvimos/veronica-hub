import { getPdfCollection } from "@/data/pdf-catalog";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
import { PdfToolCard } from "@/components/pdf/pdf-directory";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=getPdfCollection(slug);return {title:c?.name,description:c?.description,alternates:{canonical:"/collection/"+slug}};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=getPdfCollection(slug);if(!c)notFound();const tools=(await getPublicPdfTools()).filter(t=>c.slugs.includes(t.slug));return <div className="pdf-container pdf-page-intro"><h1>{c.name}</h1><p>{c.description}</p><p style={{marginTop:24}}>{c.takeaway}</p><div className="pdf-tool-grid" style={{marginTop:32}}>{tools.map(t=><PdfToolCard key={t.slug} tool={t}/>)}</div></div>;}

