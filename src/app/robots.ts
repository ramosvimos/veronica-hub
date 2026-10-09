import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
export default function robots():MetadataRoute.Robots{return {rules:[{userAgent:"*",allow:"/",disallow:["/search","/compare","/api/","/admin/","/submit-tool/status","/archive/"]}],sitemap:siteConfig.url+"/sitemap.xml"};}

