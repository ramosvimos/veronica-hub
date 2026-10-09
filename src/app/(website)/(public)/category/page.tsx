import Link from "next/link";
import { pdfCategories } from "@/data/pdf-catalog";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
export const dynamic="force-dynamic";
export const metadata={title:"Tool categories",alternates:{canonical:"/category"}};
export default async function Page(){const tools=await getPublicPdfTools();return <div className="pdf-container pdf-page-intro"><h1>Start with your task</h1><p>Browse categories with reviewed tools.</p><div className="pdf-tool-grid" style={{marginTop:32}}>{pdfCategories.filter(c=>tools.some(t=>t.categories.includes(c.slug))).map(c=><article className="pdf-tool-card" key={c.slug}><h2><Link href={"/category/"+c.slug}>{c.name}</Link></h2><p>{c.description}</p><p>{tools.filter(t=>t.categories.includes(c.slug)).length} tools</p></article>)}</div></div>;}

