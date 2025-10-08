'use client';
export default function ShareBar({ title, url }) {
  const u = typeof window !== "undefined" ? (url || window.location.href) : (url || "");
  const share = () => { if (navigator.share) navigator.share({ title, url: u }).catch(()=>{}); };
  const links = [
    { name:"X",    href:`https://twitter.com/intent/tweet?text=${encodeURIComponent(title||"")}&url=${encodeURIComponent(u)}` },
    { name:"FB",   href:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
    { name:"LN",   href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
  ];
  return (
    <div className="hidden xl:block sticky top-28 space-y-2">
      <button onClick={share} className="block rounded-full border px-3 py-1 text-sm hover:bg-slate-50">Share</button>
      {links.map(l=>(
        <a key={l.name} href={l.href} target="_blank"
           className="block rounded-full border px-3 py-1 text-sm text-slate-600 hover:bg-slate-50">{l.name}</a>
      ))}
    </div>
  );
}
