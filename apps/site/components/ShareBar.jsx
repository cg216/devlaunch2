'use client';
import { useEffect, useState } from "react";

export default function ShareBar({ title, url }) {
  // Match SSR on first render: use the passed prop or empty string
  const [u, setU] = useState(url || "");

  // After hydration, if no url was provided, upgrade to window.location.href
  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setU(window.location.href);
    }
  }, [url]);

  const share = () => {
    if (navigator.share && u) {
      navigator.share({ title, url: u }).catch(() => {});
    }
  };

  const links = [
    { name: "X",  href: u ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title||"")}&url=${encodeURIComponent(u)}` : "#" },
    { name: "FB", href: u ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` : "#" },
    { name: "LN", href: u ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` : "#" },
  ];

  return (
    <div className="hidden xl:block sticky top-28 space-y-2">
      <button onClick={share} className="block rounded-full border px-3 py-1 text-sm hover:bg-slate-50">Share</button>
      {links.map(l => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="block rounded-full border px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          aria-label={`Share on ${l.name}`}
        >
          {l.name}
        </a>
      ))}
    </div>
  );
}
