import { PdfDirectory } from "@/components/pdf/pdf-directory";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
import type { DirectoryParams } from "@/data/pdf-catalog";
export const dynamic="force-dynamic";
export const metadata={title:"Search tools",robots:{index:false,follow:true},alternates:{canonical:"/search"}};
export default async function Page({searchParams}:{searchParams:Promise<DirectoryParams>}){return <PdfDirectory title="Find your next tool" description="Search by name, task or feature, then narrow your shortlist." action="/search" tools={await getPublicPdfTools()} params={await searchParams}/>;}

