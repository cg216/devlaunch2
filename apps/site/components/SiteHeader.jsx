import Link from "next/link";
import { getTenantPack } from "@/lib/pack";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  const pack = getTenantPack();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          {pack?.tenant?.displayName || "Site"}
        </Link>
        <nav className="hidden md:flex gap-4 text-sm">
          <Link href="/articles" className="hover:text-slate-900 text-slate-600">Articles</Link>
          <Link href="/about" className="hover:text-slate-900 text-slate-600">About</Link>
        </nav>
        <Button as="a" href="/articles" size="sm" variant="outline">Browse</Button>
      </div>
    </header>
  );
}
