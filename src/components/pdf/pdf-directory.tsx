import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, ScanText, ArrowLeftRight, PanelsTopLeft, PenLine, Code2, Search, SlidersHorizontal, Monitor, Cloud, Server, Layers, FileText, CircleHelp } from "lucide-react";

import { filterPdfTools, paramValue, pdfCategories, pdfCollections, pdfTools, type DirectoryParams, type PdfTool } from "@/data/pdf-catalog";
import { CompareToggle } from "./compare-provider";

import { PdfToolIcon } from "./pdf-tool-icon";
import { PdfStructuredData } from "./pdf-structured-data";
import { siteConfig } from "@/config/site";
import { pdfPagination } from "@/lib/pdf-pagination";

const taskIcons = { reading: BookOpen, scan: ScanText, convert: ArrowLeftRight, edit: PanelsTopLeft, sign: PenLine, code: Code2, other:Layers };
const processingIcons = { Local: Monitor, Cloud, "Self-hosted": Server, Mixed: Layers, "Not applicable":CircleHelp, "Not verified": CircleHelp };

export function PdfBreadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  return <><PdfStructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: trail.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.label, ...(item.href ? { item: new URL(item.href, siteConfig.url).href } : {}) })) }} /><nav className="pdf-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link>{items.map((item, index) => <span key={`${item.label}-${index}`}><span aria-hidden="true">/</span>{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>)}</nav></>;
}

export function PdfToolCard({ tool }: { tool: PdfTool }) {
  const ProcessingIcon = processingIcons[tool.processing];
  return <article className="pdf-tool-card">
    <div className="pdf-tool-heading"><PdfToolIcon tool={tool} size={42} /><div><h3><Link href={`/item/${tool.slug}`}>{tool.name}</Link></h3><span className="pdf-tool-type">{pdfCategories.find((category) => category.slug === tool.categories[0])?.shortName}</span></div><span className={`pdf-price ${tool.pricing === "Free" || tool.pricing === "Open source" ? "pdf-price-free" : ""}`}>{tool.pricing}</span></div>
    {tool.ownedProject && <p className="pdf-review-status">Our project · ownership disclosed</p>}{tool.paidSubmission && <p className="pdf-review-status">Paid submission</p>}{tool.reciprocalSubmission && <p className="pdf-review-status">Community submission · reciprocal link</p>}{tool.evidenceStatus === "needs-review" && <p className="pdf-review-status">Details need verification{tool.sourceLinkUnavailable ? " · Source link unavailable" : ""}</p>}
    <p className="pdf-tool-description">{tool.description}</p>
    <div className="pdf-feature-list">{tool.features.slice(0, 3).map((feature) => <span key={feature}>{feature}</span>)}</div>
    <div className="pdf-tool-facts"><span><ProcessingIcon size={14} aria-hidden="true" />{tool.processing === "Local" ? "On your device" : tool.processing === "Cloud" ? "Cloud processing" : tool.processing === "Mixed" ? "Varies by feature" : tool.processing === "Self-hosted" ? "Your own server" : tool.processing === "Not applicable" ? "Data processing not applicable" : "Processing not verified"}</span><span title={tool.platform}>{tool.platform}</span></div>
    <div className="pdf-tool-card-footer"><CompareToggle slug={tool.slug} name={tool.name} /><Link href={`/item/${tool.slug}`} className="pdf-details-link">Details <ArrowRight size={15} aria-hidden="true" /></Link></div>
  </article>;
}

function TaskLinks({ selected, tools }: { selected: string; tools: PdfTool[] }) {
  return <nav className="pdf-task-nav" aria-label="Tool tasks"><Link className={!selected ? "is-selected" : ""} href="/" aria-current={!selected ? "page" : undefined}><FileText size={17} aria-hidden="true" />All tools<span>{tools.length}</span></Link>{pdfCategories.filter(category => tools.some(tool => tool.categories.includes(category.slug))).map((category) => { const Icon = taskIcons[category.icon]; return <Link className={selected === category.slug ? "is-selected" : ""} href={`/category/${category.slug}`} key={category.slug} aria-current={selected === category.slug ? "page" : undefined}><Icon size={17} aria-hidden="true" />{category.name}<span>{tools.filter((tool) => tool.categories.includes(category.slug)).length}</span></Link>; })}</nav>;
}

export function PdfDirectory({ title, description, tools = pdfTools, catalog = tools, params, action = "/", category = "", home = false }: { title: string; description: string; tools?: PdfTool[]; catalog?: PdfTool[]; params?: DirectoryParams; action?: string; category?: string; home?: boolean }) {
  const query = paramValue(params, "q");
  const price = paramValue(params, "price");
  const processing = paramValue(params, "processing");
  const sort = paramValue(params, "sort");
  const selectedCategory = category || paramValue(params, "category");
  const filtered = filterPdfTools(tools, params);
  const { pageSize, totalPages, page } = pdfPagination(filtered.length, params);
  const visibleTools = filtered.slice((page - 1) * pageSize, page * pageSize);
  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    for (const key of ["q", "price", "processing", "sort", "category"]) {
      const value = paramValue(params, key);
      if (value) search.set(key, value);
    }
    if (nextPage > 1) search.set("page", String(nextPage));
    return `${action}${search.size ? `?${search}` : ""}#browse`;
  }
  const queryCategory = paramValue(params, "category");
  const active = !!(query || price || processing || sort || queryCategory);
  return <>
    {home ? <section className="pdf-home-hero pdf-container"><div className="pdf-hero-copy"><div className="pdf-hero-note"><span aria-hidden="true" />AI, productivity & developer tools</div><h1>Good tools.<br />Clear choices.</h1><p>Write, organize, create or build.<br />Find useful tools with clear purposes,<br className="pdf-desktop-break" /> official sources and honest limitations.</p><a href="#browse" className="pdf-button">Find your tool <ArrowRight size={17} aria-hidden="true" /></a></div><div className="pdf-hero-guide"><div className="pdf-guide-heading"><FileText size={23} aria-hidden="true" /><span>What do you need to do?</span></div>{pdfCategories.filter(category => tools.some(tool => tool.categories.includes(category.slug))).slice(0, 4).map((task) => { const Icon = taskIcons[task.icon]; return <Link key={task.slug} href={`/category/${task.slug}`}><Icon size={19} aria-hidden="true" /><span>{task.name}</span><ArrowUpRight size={17} aria-hidden="true" /></Link>; })}<div className="pdf-hero-guide-foot">A directory of tools. No file upload needed here.</div></div></section> : <div className="pdf-container pdf-page-intro"><PdfBreadcrumb items={[{ label: title }]} /><h1>{title}</h1><p>{description}</p></div>}
    <section className="pdf-container pdf-browse-layout" id="browse">
      <aside className="pdf-sidebar"><h2>Choose your task</h2><TaskLinks selected={selectedCategory} tools={catalog} /><div className="pdf-sidebar-note"><BookOpen size={20} aria-hidden="true" /><h3>Choose with confidence.</h3><p>Each listing includes source links. Missing information stays marked.</p><Link href="/editorial-policy">Our editorial approach <ArrowRight size={14} aria-hidden="true" /></Link></div></aside>
      <div className="pdf-results"><div className="pdf-results-heading"><div><h2>{home ? "Find your next useful tool" : "Explore the tools"}</h2><p>{filtered.length} {filtered.length === 1 ? "tool" : "tools"}{query ? ` matching “${query}”` : " to explore"} · Select up to 3 to compare</p></div><SlidersHorizontal size={19} aria-hidden="true" /></div>
        <form action={action} method="get" className="pdf-filter-form">{queryCategory && <input type="hidden" name="category" value={queryCategory} />}<label className="pdf-search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Search tools</span><input type="search" name="q" placeholder="Search tools, tasks, or features…" defaultValue={query} /></label><div className="pdf-filter-row"><label><span>Price</span><select name="price" defaultValue={price}><option value="">Any price</option><option value="free">Free & open source</option><option value="Freemium">Free tier + paid</option><option value="Paid">Paid</option><option value="Not verified">Not verified</option></select></label><label><span>Data processing</span><select name="processing" defaultValue={processing}><option value="">Anywhere</option><option value="Local">On your device</option><option value="Cloud">Cloud</option><option value="Self-hosted">Self-hosted</option><option value="Mixed">Varies by feature</option><option value="Not verified">Not verified</option></select></label><label><span>Sort</span><select name="sort" defaultValue={sort}><option value="">Featured first</option><option value="name">Name A–Z</option></select></label><button className="pdf-filter-submit" type="submit">Apply filters</button></div></form>
        {active && <div className="pdf-active-filters"><span>Filters applied</span>{queryCategory && <span>Category: {pdfCategories.find(c => c.slug === queryCategory)?.name || queryCategory}</span>}{query && <span>Search: {query}</span>}{price && <span>{price === "free" ? "Free & open source" : price}</span>}{processing && <span>{processing}</span>}<Link href={action}>Clear filters</Link></div>}
        {filtered.length ? <div className="pdf-tool-grid">{visibleTools.map((tool) => <PdfToolCard tool={tool} key={tool.slug} />)}</div> : <div className="pdf-empty-state"><Search size={28} aria-hidden="true" /><h3>No tools match these filters</h3><p>Try a broader task, remove a filter, or search for a tool name.</p><Link className="pdf-button" href={action}>Reset filters <ArrowRight size={16} aria-hidden="true" /></Link></div>}
        {totalPages > 1 && <nav className="pdf-pagination" aria-label="Tool result pages"><p>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} tools</p><div>{page > 1 && <Link href={pageHref(page - 1)} rel="prev">Previous</Link>}{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <Link key={number} href={pageHref(number)} aria-label={`Page ${number}`} aria-current={number === page ? "page" : undefined}>{number}</Link>)}{page < totalPages && <Link href={pageHref(page + 1)} rel="next">Next</Link>}</div></nav>}
        <p className="pdf-catalog-note">Each listing shows its sources, review date, and information still needing verification. Listed features are publisher claims, not hands-on test scores. <Link href="/editorial-policy">How we review →</Link></p>
      </div>
    </section>
    {home && <><section className="pdf-container pdf-collections-section"><div className="pdf-section-heading"><div><h2>A shortcut to the right shortlist.</h2><p>Collections for the decisions that need a little more context.</p></div><Link href="/collection">All collections <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="pdf-collection-grid">{pdfCollections.slice(0, 2).map((collection, i) => <Link className={`pdf-collection-feature ${i === 0 ? "pdf-collection-dark" : ""}`} href={`/collection/${collection.slug}`} key={collection.slug}><span>{i === 0 ? <Monitor size={24} aria-hidden="true" /> : <BookOpen size={24} aria-hidden="true" />}</span><h3>{collection.name}</h3><p>{collection.description}</p><strong>Explore {collection.slugs.length} tools <ArrowRight size={17} aria-hidden="true" /></strong></Link>)}</div></section></>}
  </>;
}
