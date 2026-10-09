"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ArrowRight, X } from "lucide-react";

const CompareContext = createContext<{ selected: string[]; toggle: (slug: string, name:string) => void }>({ selected: [], toggle: () => {} });

export function PdfCompareProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showCompareBar = !/^\/(?:admin|account|submit-tool)(?:\/|$)/.test(pathname);
  const [selected, setSelected] = useState<string[]>([]);
  const [names,setNames]=useState<Record<string,string>>({});
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
    if (!active) return;
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem("veronica-comparison") || "[]");
      if (Array.isArray(saved)) setSelected(Array.from(new Set(saved.filter((slug): slug is string => typeof slug === "string" && /^[a-z0-9][a-z0-9-]{1,79}$/.test(slug)))).slice(0, 3));
    } catch { /* Comparison still works if browser storage is unavailable. */ }
    setRestored(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (restored) {
      try { sessionStorage.setItem("veronica-comparison", JSON.stringify(selected)); }
      catch { /* Keep the current selection in memory. */ }
    }
  }, [selected, restored]);
  useEffect(()=>{
    const missing=selected.filter(slug=>!names[slug]);if(!missing.length)return;
    const controller=new AbortController();
    fetch(`/api/tools?slugs=${missing.join(',')}`,{signal:controller.signal}).then(async response=>{
      if(!response.ok)return;const data=await response.json();if(controller.signal.aborted||!Array.isArray(data.tools))return;
      const found=new Map<string,string>(data.tools.filter((tool:{slug:string;name:unknown})=>missing.includes(tool.slug)&&typeof tool.name==='string').map((tool:{slug:string;name:string})=>[tool.slug,tool.name]));
      setNames(current=>({...current,...Object.fromEntries(found)}));setSelected(current=>current.filter(slug=>!missing.includes(slug)||found.has(slug)));
    }).catch(()=>{});return ()=>controller.abort();
  },[selected,names]);
  function toggle(slug: string,name:string) {
    setNames(current=>({...current,[slug]:name}));
    setSelected((current) => current.includes(slug) ? current.filter((value) => value !== slug) : current.length < 3 ? [...current, slug] : current);
  }
  return <CompareContext.Provider value={{ selected, toggle }}>
    {children}
    {showCompareBar && selected.length > 0 && <aside className="pdf-compare-bar" aria-label="Selected tools">
      <div><strong>{selected.length} of 3 selected</strong><span>{selected.map((slug) => names[slug]||slug).join(" · ")}</span></div>
      <div className="pdf-compare-actions">
        <button type="button" className="pdf-text-button" onClick={() => setSelected([])}>Clear <X size={14} aria-hidden="true" /></button>
        {selected.length >= 2 ? <Link className="pdf-button" href={`/compare?tools=${selected.join(",")}`}>Compare tools <ArrowRight size={16} aria-hidden="true" /></Link> : <span className="pdf-compare-hint">Choose one more to compare</span>}
      </div>
    </aside>}
  </CompareContext.Provider>;
}

export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const { selected, toggle } = useContext(CompareContext);
  const checked = selected.includes(slug);
  const disabled = selected.length >= 3 && !checked;
  return <label className={`pdf-compare-toggle${disabled ? " is-disabled" : ""}`}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(slug,name)} aria-label={`Compare ${name}`} />
    <span>{disabled ? "3-tool limit" : "Compare"}</span>
  </label>;
}
