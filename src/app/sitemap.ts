import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { pdfCategories,pdfCollections } from "@/data/pdf-catalog";
import { getPublicPdfTools } from "@/lib/pdf-public-catalog";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const tools=await getPublicPdfTools();const paths=["/","/category","/collection","/about","/privacy","/terms","/editorial-policy",...tools.map(t=>"/item/"+t.slug),...pdfCategories.filter(c=>tools.some(t=>t.categories.includes(c.slug))).map(c=>"/category/"+c.slug),...pdfCollections.map(c=>"/collection/"+c.slug)];return [...new Set(paths)].map(p=>({url:siteConfig.url+p}));}

