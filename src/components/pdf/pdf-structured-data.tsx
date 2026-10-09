import { siteConfig } from "@/config/site";
import { brandAssets } from "@/config/brand";

export function PdfStructuredData({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function PdfSiteIdentity() {
  const url = `${siteConfig.url}/`;
  return <PdfStructuredData data={{
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${url}#website`, name: siteConfig.name, url, description: siteConfig.description, publisher: { "@id": `${url}#organization` } },
      { "@type": "Organization", "@id": `${url}#organization`, name: siteConfig.name, url, logo: new URL(brandAssets.icon192, siteConfig.url).href },
    ],
  }} />;
}
