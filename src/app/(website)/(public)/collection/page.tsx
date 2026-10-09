import Link from "next/link";
import { pdfCollections } from "@/data/pdf-catalog";
export const metadata={title:"Tool collections",alternates:{canonical:"/collection"}};
export default function Page(){return <div className="pdf-container pdf-page-intro"><h1>Useful starting points</h1><p>Small, purpose-led shortlists. They are not rankings or performance scores.</p><div className="pdf-collection-grid" style={{marginTop:32}}>{pdfCollections.map(c=><Link className="pdf-collection-feature" key={c.slug} href={"/collection/"+c.slug}><h2>{c.name}</h2><p>{c.description}</p></Link>)}</div></div>;}

