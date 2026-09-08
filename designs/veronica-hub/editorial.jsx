import * as React from 'react';
import { renderEditorialBody, renderEditorialPreview, editorialBreadcrumb } from '../../lib/editorial.mjs';

// All interpolated content is escaped by the shared renderer. Using the same
// markup on the server and client prevents spoiler and citation divergence.
export function EditorialPage({routeInfo, data}) {
  const crumbs = editorialBreadcrumb(routeInfo,data).itemListElement;
  return <>
    <section className="page-hero editorial-hero">
      <div className="page-hero-inner">
        <nav className="editorial-breadcrumb" aria-label="Breadcrumb">
          {crumbs.map((item,i) => <React.Fragment key={item.item}>{i > 0 ? <span aria-hidden="true"> / </span> : null}{i === crumbs.length-1 ? <span aria-current="page">{item.name}</span> : <a href={item.item}>{item.name}</a>}</React.Fragment>)}
        </nav>
        <span className="hero-kicker">{routeInfo.editorial.kind === 'news' ? 'Source-checked reporting' : 'The Veronica reading room'}</span>
        <h1>{routeInfo.h1}</h1><p className="page-lede">{routeInfo.intro}</p>
      </div>
    </section>
    <section className="section"><div className="container" dangerouslySetInnerHTML={{__html:renderEditorialBody(routeInfo,data)}} /></section>
  </>;
}
export function EditorialPreview({data, mode='home'}) {
  return <div dangerouslySetInnerHTML={{__html:renderEditorialPreview(data,mode)}} />;
}
