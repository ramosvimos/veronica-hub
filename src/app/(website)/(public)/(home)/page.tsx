import { PdfDirectory } from "@/components/pdf/pdf-directory";
import { PdfSiteIdentity } from "@/components/pdf/pdf-structured-data";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
import { filterPdfTools, type DirectoryParams } from "@/data/pdf-catalog";
import { pdfPageRedirect, pdfHasFilters, pdfPagination, pdfPagePath } from "@/lib/pdf-pagination";
import { permanentRedirect } from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({searchParams}:{searchParams:Promise<DirectoryParams>}){const p=await searchParams;const tools=await getPublicPdfTools();const {page}=pdfPagination(filterPdfTools(tools,p).length,p);return {title:"AI, Productivity & Developer Tools",alternates:{canonical:pdfPagePath("/",pdfHasFilters(p)?1:page)},...(pdfHasFilters(p)?{robots:{index:false,follow:true}}:{})};}
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){const p=await searchParams;const tools=await getPublicPdfTools();const redirect=pdfPageRedirect("/",filterPdfTools(tools,p).length,p);if(redirect)permanentRedirect(redirect);return <><PdfSiteIdentity/><PdfDirectory home title="All tools" description="Useful tools, verified official sources." tools={tools} params={p}/></>;}

