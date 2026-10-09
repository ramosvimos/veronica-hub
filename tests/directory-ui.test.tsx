import { render,screen,within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach,describe,it,expect,vi } from 'vitest';
import { PdfDirectory } from '@/components/pdf/pdf-directory';
import { PdfCompareProvider,CompareToggle } from '@/components/pdf/compare-provider';
import { PdfMobileNav } from '@/components/pdf/pdf-mobile-nav';
import { PdfToolDetail } from '@/components/pdf/pdf-detail';
import { pdfTools } from '@/data/pdf-catalog';
vi.mock('next/navigation',()=>({usePathname:()=>'/'}));
beforeEach(()=>{sessionStorage.clear();vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({tools:[]})})));});
describe('current directory interface',()=>{
 it('puts directory search first and avoids repeating task navigation',()=>{render(<PdfCompareProvider><PdfDirectory home title="Tools" description="Tools" tools={pdfTools}/></PdfCompareProvider>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Good tools.Clear choices.');expect(screen.getAllByRole('article')).toHaveLength(Math.min(24,pdfTools.length));const heroSearch=screen.getByRole('search',{name:'Search the tool directory'});expect(within(heroSearch).getByRole('searchbox',{name:'Search tools, tasks, or features'})).toHaveAttribute('name','q');expect(screen.getAllByRole('search')).toHaveLength(1);expect(screen.queryByRole('navigation',{name:'Tool tasks'})).not.toBeInTheDocument();const taskNavigation=screen.getByRole('navigation',{name:'Browse by task'});expect(taskNavigation).toBeInTheDocument();for(const link of taskNavigation.querySelectorAll('a[href^="/category/"]')){const slug=link.getAttribute('href')?.split('/').pop()??'';expect(link).toHaveTextContent(`${pdfTools.filter(tool=>tool.categories.some(category=>category===slug)).length} tools`);}expect(screen.queryByText(/No file upload needed/)).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'Apply filters'})).toHaveAttribute('type','submit');});
 it('keeps home search and category filters when other filters change',()=>{const {container}=render(<PdfDirectory home title="Tools" description="Tools" tools={pdfTools} params={{q:'obsidian',category:'productivity',price:'Paid'}}/>);expect(screen.getByRole('searchbox',{name:'Search tools, tasks, or features'})).toHaveValue('obsidian');expect(container.querySelector('.pdf-filter-form input[type="hidden"][name="q"]')).toHaveAttribute('value','obsidian');expect(container.querySelector('.pdf-hero-search input[type="hidden"][name="category"]')).toHaveAttribute('value','productivity');expect(screen.getByText('Category: Work & organize')).toBeInTheDocument();});
 it('has actionable no-results reset',()=>{render(<PdfDirectory title="Search" description="Search" tools={pdfTools} action="/search" params={{q:'no-such-zzzz'}}/>);expect(screen.getByRole('heading',{name:'No tools match these filters'})).toBeInTheDocument();expect(screen.getByRole('link',{name:/Reset filters/})).toHaveAttribute('href','/search');});
 it('enforces three comparisons and supports removal and clear',async()=>{const user=userEvent.setup();render(<PdfCompareProvider>{pdfTools.slice(0,4).map(t=><CompareToggle key={t.slug} slug={t.slug} name={t.name}/>)}</PdfCompareProvider>);for(const t of pdfTools.slice(0,3))await user.click(screen.getByRole('checkbox',{name:'Compare '+t.name}));expect(screen.getByRole('checkbox',{name:'Compare '+pdfTools[3].name})).toBeDisabled();expect(screen.getByRole('link',{name:/Compare tools/})).toHaveAttribute('href','/compare?tools=chatgpt,claude,gemini');await user.click(screen.getByRole('checkbox',{name:'Compare ChatGPT'}));expect(screen.getByRole('checkbox',{name:'Compare '+pdfTools[3].name})).toBeEnabled();await user.click(screen.getByRole('button',{name:/Clear/}));expect(screen.queryByRole('complementary',{name:'Selected tools'})).not.toBeInTheDocument();});
 it('opens mobile menu and closes with Escape and link selection',async()=>{const user=userEvent.setup();render(<PdfMobileNav/>);const summary=screen.getByText('Menu');await user.click(summary);const details=summary.closest('details')!;expect(details.open).toBe(true);await user.keyboard('{Escape}');expect(details.open).toBe(false);await user.click(summary);const link=within(screen.getByRole('navigation')).getByRole('link',{name:'Submit a tool'});link.addEventListener('click',e=>e.preventDefault());await user.click(link);expect(details.open).toBe(false);});
 it('exposes official evidence without making up privacy claims',()=>{render(<PdfCompareProvider><PdfToolDetail tool={pdfTools[0]}/></PdfCompareProvider>);expect(screen.getByRole('link',{name:/Official product information/})).toHaveAttribute('href',pdfTools[0].sources[0].url);expect(screen.getByText(/not been independently verified here/)).toBeInTheDocument();expect(screen.getByText(/has not received a hands-on performance test/)).toBeInTheDocument();expect(document.querySelector('img[src*="google.com"]')).toBeNull();});
});

it('keeps query-category filters when the user applies other search filters',()=>{
 render(<PdfDirectory title="Search" description="Search" tools={pdfTools} action="/search" params={{category:'ai'}}/>);
 expect(document.querySelector('input[type="hidden"][name="category"]')).toHaveAttribute('value','ai');
 expect(screen.getByText('Category: AI assistants')).toBeInTheDocument();
 expect(screen.getAllByRole('article')).toHaveLength(8);
});

it('renders submitted HTML-like names and descriptions only as text',()=>{
 const malicious={...pdfTools[0],name:'</script><img src=x onerror=alert(1)>',description:'<svg onload=alert(1)>A valid tool description</svg>'};
 render(<PdfCompareProvider><PdfToolDetail tool={malicious}/></PdfCompareProvider>);
 expect(screen.getByRole('heading',{level:1})).toHaveTextContent(malicious.name);
 expect(document.querySelector('img[src="x"]')).toBeNull();
 expect(document.querySelector('svg[onload]')).toBeNull();
 for(const script of document.querySelectorAll('script')){expect(script.type).toBe('application/ld+json');expect(script.textContent).not.toContain('</script>');expect(()=>JSON.parse(script.textContent||'')).not.toThrow();}
});
