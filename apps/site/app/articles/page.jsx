import Link from "next/link";
import { listArticles } from "@/lib/content";
import { getTenantPack } from "@/lib/pack";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ArticlesIndex({ searchParams }) {
  const pack = getTenantPack();
  const pillar = searchParams?.pillar || "";
  const cluster = searchParams?.cluster || "";
  const all = listArticles();
  const filtered = all.filter(a=>{
    const p=a.meta?.pillar||""; const c=a.meta?.cluster||"";
    return (!pillar || p===pillar) && (!cluster || c===cluster);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Articles</h1>
      <div className="text-sm text-slate-600">
        {pillar && <span className="mr-3">Pillar: <b>{pillar}</b></span>}
        {cluster && <span>Cluster: <b>{cluster}</b></span>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(a=>(
          <Card key={a.slug} className="hover:shadow-sm transition">
            <CardHeader><CardTitle className="text-base">
              <Link href={`/articles/${a.slug}/`} className="hover:underline">
                {a.meta?.title || a.slug.replace(/-/g," ")}
              </Link>
            </CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p>{a.meta?.description || "QC-gated, helpful content."}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
