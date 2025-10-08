import { listArticles } from "@/lib/content";
import { getTenantPack } from "@/lib/pack";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const pack = getTenantPack();
  const items = listArticles(100);
  const palette = pack?.brand?.palette || { ink: "#0f172a" };

  return (
    <div className="mx-auto max-w-6xl">
      <section className="rounded-3xl border p-8 mb-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black" style={{color:palette.ink}}>
              {pack?.tenant?.displayName || "DevLaunch Site"}
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Auto-generated, QC-gated articles with calculators, quizzes, and evidence-based citations.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="green">Live</Badge>
              <Badge variant="gray">QC Guardrails</Badge>
              <Badge variant="gray">Interlinking</Badge>
            </div>
          </div>
          <Link href="/articles/nub-theory-explained">
            <Button className="gap-2" variant="default">
              Read an article <ArrowRight size={16}/>
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Latest Articles</h2>
          <div className="text-sm text-slate-500 flex items-center gap-2"><Clock size={14}/> Updated continuously</div>
        </div>
        <Separator className="mb-4"/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(a => (
            <Card key={a.slug} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{a.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <FileText size={14}/> Article
                  </span>
                  {a.noindex ? <Badge variant="amber">Draft</Badge> : <Badge variant="green">Published</Badge>}
                </div>
                <Link href={`/articles/${a.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm underline">
                  Open <ArrowRight size={14}/>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
