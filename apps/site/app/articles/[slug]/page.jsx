import { getArticle } from "@/lib/content";
import MDX from "@/lib/mdx";
import JsonLd from "@/components/JsonLd";
import { getTenantPack } from "@/lib/pack";
import AdSlot from "@/components/AdSlot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Link as LinkIcon } from "lucide-react";

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}
function extractHeadings(md) {
  const re = /^#{2,3}\s+(.+)$/gm;
  const out = []; let m;
  while ((m = re.exec(md))) {
    const title = m[1].replace(/[*_`~]/g,"").trim();
    out.push({ title, id: slugify(title), level: m[0].startsWith("###") ? 3 : 2 });
  }
  return out.slice(0,30);
}
function readingTime(md) {
  const words = (md.match(/\b\w+\b/g)||[]).length;
  return Math.max(1, Math.round(words/200));
}

export default function Page({ params }) {
  const { slug } = params;
  const a = getArticle(slug);
  if (!a) return <div className="p-6">Not found</div>;

  const pack = getTenantPack();
  const palette = pack?.brand?.palette || { bg: "#ffffff", ink: "#0f172a", muted: "#64748b" };
  const h = extractHeadings(a.body);
  const rt = readingTime(a.body);
  const jsonld = { "@context":"https://schema.org","@type":"Article","headline":a.meta.title,"inLanguage":"en","isAccessibleForFree":true };

  return (
    <>
      <JsonLd data={jsonld} />
      <main className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8">
          <div className="mb-6">
            <h1 className="text-3xl font-black" style={{color:palette.ink}}>{a.meta.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1"><Clock size={14}/>{rt} min read</span>
              {a.meta.noindex ? <Badge variant="amber">Draft</Badge> : <Badge variant="green">Published</Badge>}
            </div>
            {pack?.eeat?.disclaimer && (
              <p className="mt-2 text-xs text-slate-500">{pack.eeat.disclaimer}</p>
            )}
          </div>

          <AdSlot id="inArticleTop" pack={pack} />

          <div className="prose prose-slate max-w-none">
            <MDX source={a.body} />
          </div>

          <Separator className="my-6"/>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><BookOpen size={16}/> Sources & further reading</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p>This article cites authoritative sources and avoids unverified claims. See the “Sources” section within the content.</p>
            </CardContent>
          </Card>

          <footer className="mt-8">
            <AdSlot id="inArticleBottom" pack={pack} />
          </footer>
        </article>

        <aside className="lg:col-span-4">
          {h.length > 0 && (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><LinkIcon size={16}/> On this page</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {h.map((x, i) => (
                    <li key={i} className={x.level===3 ? "pl-3" : ""}>
                      <a href={`#${x.id}`} className="hover:underline">{x.title}</a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <div className="mt-6">
            <AdSlot id="sidebar" pack={pack} />
          </div>
        </aside>
      </main>
    </>
  );
}
