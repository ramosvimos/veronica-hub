import { PdfToolDetail } from "@/components/pdf/pdf-detail";
import { getPublicPdfTools,getPublicPdfTool } from "@/lib/pdf-public-catalog";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const tool=await getPublicPdfTool(slug);return {title:tool?.name||"Tool not found",description:tool?.description,alternates:{canonical:"/item/"+slug}};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const tools=await getPublicPdfTools();const tool=tools.find(t=>t.slug===slug);if(!tool)notFound();return <PdfToolDetail tool={tool} catalog={tools}/>;}

