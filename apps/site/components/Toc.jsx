'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function slugify(text) {
  const s = (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // drop punctuation
    .replace(/\s+/g, "-")       // spaces -> dashes
    .replace(/-+/g, "-")        // collapse dashes
    .replace(/^-|-$/g, "");     // trim dashes
  return s || "h";
}

export default function Toc({ containerId = "article" }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    const heads = Array.from(root.querySelectorAll("h2, h3"));

    // Ensure every heading has a unique id (and fix collisions)
    const seen = new Map(); // id -> count
    heads.forEach((h) => {
      const base = h.id ? h.id : slugify(h.textContent || "");
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      const finalId = count > 1 ? `${base}-${count}` : base;
      if (!h.id || h.id !== finalId) h.id = finalId;
    });

    const list = heads.map((h) => ({
      id: h.id,
      text: h.textContent || "",
      level: h.tagName === "H2" ? 2 : 3,
    }));
    setItems(list);

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the first heading crossing the threshold nearest the top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target.offsetTop || 0) - (b.target.offsetTop || 0));
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] }
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, [containerId]);

  if (!items.length) return null;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-sm">On this page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <nav className="text-sm">
          {items.map((it) => (
            <a
              key={it.id}                // now guaranteed unique
              href={`#${it.id}`}
              className={[
                "block truncate py-1",
                it.level === 3 ? "pl-4 text-slate-600" : "pl-0",
                active === it.id ? "text-emerald-700 font-medium" : "text-slate-700 hover:text-slate-900",
              ].join(" ")}
              title={it.text}
            >
              {it.text}
            </a>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
