'use client';
import { useEffect, useState } from "react";
export default function ThemeToggle(){
  const [ready,setReady]=useState(false);
  const [dark,setDark]=useState(false);
  useEffect(()=>{ 
    const stored = localStorage.getItem("theme") === "dark";
    setDark(stored);
    document.documentElement.classList.toggle("dark", stored);
    setReady(true);
  },[]);
  if(!ready) return null;
  return (
    <button
      onClick={()=>{
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
      }}
      className="rounded-full border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
      aria-label="Toggle theme"
    >
      {dark ? "☾" : "☀︎"}
    </button>
  );
}
