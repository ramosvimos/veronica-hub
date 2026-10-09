import type { Metadata } from "next";
import "./globals.css";
import "../styles/directory.css";
import { siteConfig } from "@/config/site";
export const metadata: Metadata={metadataBase:new URL(siteConfig.url),title:{default:siteConfig.name,template:"%s | Veronica Hub"},description:siteConfig.description,icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
