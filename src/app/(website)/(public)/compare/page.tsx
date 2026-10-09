import Link from "next/link";
import { PdfComparisonTable } from "@/components/pdf/pdf-comparison-table";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
export const dynamic="force-dynamic";
export const metadata={title:"Compare tools",robots:{index:false,follow:true},alternates:{canonical:"/compare"}};
export default async function Page({searchParams}:{searchParams:Promise<{tools?:string}>}){const p=await searchParams;const slugs=typeof p.tools==="string"?[...new Set(p.tools.split(","))].slice(0,3):[];const all=await getPublicPdfTools();const tools=slugs.flatMap(s=>all.filter(t=>t.slug===s));return <div className="pdf-container pdf-page-intro"><h1>Compare your shortlist</h1><p>Publisher information, official sources and limitations side by side. Unknown details remain marked.</p>{tools.length>=2?<PdfComparisonTable tools={tools}/>:<p style={{marginTop:24}}>Choose at least two available tools in the <Link href="/">directory</Link>. A withdrawn listing is no longer included.</p>}</div>;}

