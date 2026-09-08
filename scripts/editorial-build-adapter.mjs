/**
 * Guarded adapter for the existing monolithic templates.
 * Produces temporary entries instead of editing the checked-in legacy files.
 * Every insertion has an exact-match contract; template drift fails the build.
 */
import { editorialPrimaryNav } from '../lib/editorial.mjs';
const oldNav = 'const primaryNav = ["/", "/release-date/", "/platforms/", "/trailer/", "/story/", "/media/", "/sources/", "/watchlist/"];';
export function replaceOnce(text, before, after) {
  const count = text.split(before).length - 1;
  if (!before || count !== 1) throw new Error(`Editorial integration expected one match, found ${count}: ${before.slice(0,100)}`);
  return text.replace(before, () => after);
}
export function adaptApp(text) {
  text = `import { EditorialPage, EditorialPreview } from './editorial.jsx';\n${text}`;
  text = replaceOnce(text,oldNav,`const primaryNav = ${JSON.stringify(editorialPrimaryNav)};`);
  text = replaceOnce(text,'const utilityRoutes = [','const utilityRoutes = ["/platforms/", "/story/", "/media/", "/enemies/", "/bosses/",');
  text = replaceOnce(text,'const footerUtilityRoutes = [','const footerUtilityRoutes = ["/platforms/", "/story/", "/media/", "/enemies/", "/bosses/",');
  text = replaceOnce(text,'  const routeInfo = route(path);\n  if (path === "/") return <HomePage />;',
    '  const routeInfo = route(path);\n  if (routeInfo.editorial) return <EditorialPage routeInfo={routeInfo} data={siteData} />;\n  if (path === "/") return <HomePage />;');
  text = replaceOnce(text,'      <LatestVerification />','      <LatestVerification />\n      <EditorialPreview data={siteData} />');
  text = replaceOnce(text,'  if (path === "/characters/") return <CharactersPage routeInfo={routeInfo} />;',
    '  if (path === "/characters/") return <><CharactersPage routeInfo={routeInfo} /><EditorialPreview data={siteData} mode="characters" /></>;');
  const searchStart=text.indexOf('function SearchOverlay(');
  const drawerStart=text.indexOf('function MobileDrawer(');
  if (searchStart < 0 || drawerStart <= searchStart) throw new Error('Missing search integration boundary');
  const search=text.slice(searchStart,drawerStart);
  const updated=replaceOnce(search,'const paths = [...new Set([...primaryNav, "/ja/", ...utilityRoutes, ...footerTrustRoutes])];','const paths = siteData.routes.map((item) => item.path);');
  return text.slice(0,searchStart)+updated+text.slice(drawerStart);
}
export function adaptRenderer(text) {
  text=`import { renderEditorialBody, renderEditorialPreview, editorialSchema, editorialBreadcrumb } from '../lib/editorial.mjs';\n${text}`;
  text=replaceOnce(text,oldNav,`const primaryNav = ${JSON.stringify(editorialPrimaryNav)};`);
  text=replaceOnce(text,'const footerUtilityRoutes = [','const footerUtilityRoutes = ["/platforms/", "/story/", "/media/", "/enemies/", "/bosses/",');
  text=replaceOnce(text,'${route.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}',
    '${route.editorial ? renderEditorialBody(route, data) : route.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}');
  text=replaceOnce(text,'${trustRoute ? "" : `<section class="static-section">\n          <h2>',
    '${trustRoute || route.editorial ? "" : `<section class="static-section">\n          <h2>');
  text=replaceOnce(text,'${routeSpecific(route)}',
    '${routeSpecific(route)}\n        ${route.path === "/" ? renderEditorialPreview(data) : route.path === "/characters/" ? renderEditorialPreview(data, "characters") : ""}');
  text=replaceOnce(text,'${trustRoute || route.path === "/media/" ? "" : mediaGrid(route.path)}',
    '${trustRoute || route.editorial || route.path === "/media/" ? "" : mediaGrid(route.path)}');
  text=replaceOnce(text,'function articleSchema(route) {','function articleSchema(route) {\n  if (route.editorial) return editorialSchema(route, data);');
  text=replaceOnce(text,'function breadcrumbSchema(route) {','function breadcrumbSchema(route) {\n  if (route.editorial) return editorialBreadcrumb(route, data);');
  text=replaceOnce(text,'<link rel="stylesheet" href="${stylesheetPath}" />','<link rel="stylesheet" href="${stylesheetPath}" />\n  <link rel="stylesheet" href="/styles/editorial.css" />');
  // The hero must use the individual article's review date rather than the
  // unrelated global verification timestamp.
  text=replaceOnce(text,'const japaneseRoute = isJapaneseRoute(route);\n  return `',
    'const japaneseRoute = isJapaneseRoute(route);\n  const pageReviewDate = route.editorial?.lastReviewed || data.site.lastVerified;\n  return `');
  // Only change the trust-note interpolation inside staticBody, not old source dates.
  const a=text.indexOf('function staticBody(route) {');
  const z=text.indexOf('function breadcrumbSchema(route) {');
  let body=text.slice(a,z).replaceAll('escapeHtml(data.site.lastVerified)','escapeHtml(pageReviewDate)');
  text=text.slice(0,a)+body+text.slice(z);
  return text;
}
export function adaptValidator(text, expectedRouteCount) {
  if (!Number.isInteger(expectedRouteCount) || expectedRouteCount < 22) throw new Error('Invalid expected route count');
  text = replaceOnce(text,'${route.h1}</h1>','${escapeHtml(route.h1)}</h1>');
  return replaceOnce(text,'if (data.routes.length !== 22) fail(`Expected 22 routes, found ${data.routes.length}`);',
    `if (data.routes.length !== ${expectedRouteCount}) fail(\`Expected ${expectedRouteCount} routes, found \${data.routes.length}\`);`);
}
