import Link from "next/link";
import { brandAssets } from "@/config/brand";
import Image from "next/image";
import { ArrowUpRight, Search } from "lucide-react";
import { PdfCompareProvider } from "./compare-provider";
import { PdfMobileNav } from "./pdf-mobile-nav";


import type { ReactNode } from "react";

export function PdfShell({ children }: { children: ReactNode }) {
  return <div className="veronica-directory"><PdfCompareProvider>
    <a className="pdf-skip-link" href="#main-content">Skip to content</a>
    <header className="pdf-header"><div className="pdf-container pdf-header-inner">
      <Link href="/" className="pdf-brand" aria-label="Veronica Hub home"><Image className="pdf-brand-symbol" src={brandAssets.icon192} width={38} height={38} alt="" aria-hidden="true" priority />Veronica<span>Hub</span></Link>
      <nav className="pdf-desktop-nav" aria-label="Main navigation"><Link href="/">Find a tool</Link><Link href="/guides">Guides</Link><Link href="/our-projects">Our projects</Link><Link href="/collection">Collections</Link><Link href="/submit-tool" className="pdf-submit-nav-link">Submit a tool</Link></nav>
      <Link href="/search" className="pdf-header-search" aria-label="Search tools"><Search size={17} aria-hidden="true" /><span>Search tools</span></Link>
      
      <PdfMobileNav />
    </div></header>
    <main id="main-content" className="pdf-main">{children}</main>
    <footer className="pdf-footer"><div className="pdf-container">
      <div className="pdf-footer-top"><div><Link href="/" className="pdf-brand" aria-label="Veronica Hub home"><Image className="pdf-brand-symbol" src={brandAssets.icon192} width={38} height={38} alt="" aria-hidden="true" />Veronica<span>Hub</span></Link><p>Good tools. Clear trade-offs.<br />Find practical tools for your next task.</p></div>
        <div><strong>Explore</strong><Link href="/guides">Practical guides</Link><Link href="/our-projects">Our projects</Link><Link href="/category">All tasks</Link><Link href="/collection">Curated collections</Link><Link href="/editorial-policy">Our approach</Link><Link href="/submit-tool">Submit a tool</Link><Link href="/archive/">Historical archive</Link></div>
        <div><strong>Our approach</strong><Link href="/editorial-policy">How we choose tools <ArrowUpRight size={13} aria-hidden="true" /></Link><Link href="/about">About Veronica Hub</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
      <div className="pdf-footer-bottom"><span>© {new Date().getFullYear()} Veronica Hub</span><span>Independent directory · <a href="https://mkdirs.com" rel="noopener noreferrer" target="_blank">Built with Mkdirs</a> · adapted from AskPDF</span></div>
    </div></footer>
  </PdfCompareProvider></div>;
}
