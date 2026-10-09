import { PdfDirectory } from "@/components/pdf/pdf-directory";
import { getPdfCategory, type DirectoryParams } from "@/data/pdf-catalog";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
import { pdfHasFilters } from "@/lib/pdf-pagination";
import { notFound } from "next/navigation";
export const dynamic="force-dynamic";
export async function generateMetadata({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<DirectoryParams>}){const {slug}=await params;const c=getPdfCategory(slug);return {title:c?.name||"Category not found",description:c?.description,alternates:{canonical:"/category/"+slug},...(pdfHasFilters(await searchParams)?{robots:{index:false,follow:true}}:{})};}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>,searchParams:Promise<DirectoryParams>}){const {slug}=await params;const c=getPdfCategory(slug);if(!c)notFound();const all=await getPublicPdfTools();return <PdfDirectory title={c.name} description={c.description} category={slug} tools={all.filter(t=>t.categories.includes(slug))} catalog={all} action={"/category/"+slug} params={await searchParams}/>;}

