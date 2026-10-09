"use client";

import Link from "next/link";
import { useRef } from "react";


export function PdfMobileNav() {
  const menu = useRef<HTMLDetailsElement>(null);
  function close() { if (menu.current) menu.current.open = false; }
  return <details className="pdf-mobile-nav" ref={menu} onKeyDown={(event) => { if (event.key === "Escape") { close(); menu.current?.querySelector("summary")?.focus(); } }}>
    <summary>Menu</summary>
    <nav aria-label="Mobile navigation">
      <Link href="/" onClick={close}>Find a tool</Link>
      <Link href="/blog" onClick={close}>Guides</Link>
      <Link href="/our-projects" onClick={close}>Our projects</Link>
      <Link href="/collection" onClick={close}>Collections</Link>
      <Link href="/editorial-policy" onClick={close}>Our approach</Link>
      <Link href="/about" onClick={close}>About</Link>
      <Link href="/submit-tool" onClick={close}>Submit a tool</Link>
    </nav>
  </details>;
}
