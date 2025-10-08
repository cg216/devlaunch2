import { getTenantPack } from "@/lib/pack";
export default function SiteFooter() {
  const pack = getTenantPack();
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
        © {new Date().getFullYear()} {pack?.tenant?.displayName || "Site"} · Educational only; not medical advice.
      </div>
    </footer>
  );
}
