import MDX from "@/lib/mdx";
import { getArticle } from "@/lib/content";
import { getTenantPack } from "@/lib/pack";
import SchemaAuto from "@/components/SchemaAuto";
import Toc from "@/components/Toc";
import PillarNav from "@/components/PillarNav";
import ShareBar from "@/components/ShareBar";
import ReadingProgress from "@/components/ReadingProgress";
import { Card, CardContent } from "@/components/ui/card";

export default function ArticlePage({ params }) {
  const a = getArticle(params.slug);
  const pack = getTenantPack();
  if (!a) throw new Error("Article not found");

  const title = a.meta?.title || a.slug.replace(/-/g," ");
  const breadcrumbs = [{name:"Home", url:"/"},{name:"Articles", url:"/"}];

  return (
    <>
      <ReadingProgress containerId="article" />
      <SchemaAuto meta={a.meta} content={a.body} breadcrumbs={breadcrumbs} />

      {/* Gradient hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-white p-8 mb-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-200 blur-3xl opacity-40" />
        <h1 className="text-3xl font-bold">{title}</h1>
        {a.meta?.description && <p className="mt-2 max-w-3xl text-slate-600">{a.meta.description}</p>}
      </section>

      <div className="grid gap-8 xl:grid-cols-[56px_1fr_320px]">
        {/* Left share */}
        <div className="hidden xl:block">
          <ShareBar title={title} />
        </div>

        {/* Main content */}
        <article id="article" className="prose prose-slate max-w-none">
          <MDX source={a.body} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Toc />
          <PillarNav />
          {pack?.ads?.enabled ? (
            <Card><CardContent className="py-4">Ad</CardContent></Card>
          ) : (
            <Card><CardContent className="py-4 text-sm text-slate-600">
              {pack?.eeat?.disclaimer || "Educational only; not medical advice."}
            </CardContent></Card>
          )}
        </aside>
      </div>
    </>
  );
}
