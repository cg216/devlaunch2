import Link from "next/link";
import { listArticles } from "@/lib/content";
import { getTenantPack } from "@/lib/pack";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const pack = getTenantPack();
  const articles = listArticles();
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border bg-white p-8">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl opacity-40" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-200 blur-3xl opacity-40" />
        <h1 className="text-3xl font-bold">{pack?.tenant?.displayName || "Site"}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">High-quality, QC-gated articles with interactive tools, quizzes, and perfect schema parity.</p>
        <div className="mt-4"><Button as="a" href="/articles">Browse Articles</Button></div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(a => {
          const hasQuiz = /<Quiz\b/.test(a.body || "");
          return (
            <Card key={a.slug} className="flex flex-col hover:shadow-sm transition">
              <CardHeader>
                <CardTitle className="text-base">
                  <Link href={`/articles/${a.slug}/`} className="hover:underline">
                    {a.meta?.title || a.slug.replace(/-/g," ")}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 flex-1">
                <p>{a.meta?.description || "Generated, reviewed, and optimized for readers."}</p>
                <div className="mt-3 flex items-center gap-2">
                  {hasQuiz && <Badge variant="green">Has Quiz</Badge>}
                  <Badge variant="gray">QC-Gated</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
