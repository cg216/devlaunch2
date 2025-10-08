'use client';
import { useEffect, useState } from "react";
export default function ReadingProgress({ containerId="article" }) {
  const [pct, setPct] = useState(0);
  useEffect(()=>{
    const el = document.getElementById(containerId);
    if(!el) return;
    function onScroll(){
      const r = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - (el.offsetTop || 0);
      const p = Math.max(0, Math.min(1, scrolled / Math.max(1,total)));
      setPct(p);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
    window.addEventListener("resize", onScroll);
    return ()=>{ window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  },[containerId]);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${pct*100}%` }} />
    </div>
  );
}
