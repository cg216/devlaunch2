import { getArticle } from "@/lib/content";
import MDX from "@/lib/mdx";
import JsonLd from "@/components/JsonLd";
import { getTenantPack } from "@/lib/pack";
import AdSlot from "@/components/AdSlot";

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractHeadings(md) {
  // ## / ### headings become anchors (rehype-slug)
  const re = /^#{2,3}\s+(.+)$/gm;
  const out = [];
  let m;
  while ((m = re.exec(md))) {
    const title = m[1].replace(/[*_`~]/g, "").trim();
    out.push({ title, id: slugify(title), level: (m[0].startsWith("###") ? 3 : 2) });
  }
  return out.slice(0, 30);
}

function readingTime(md) {
  const words = (md.match(/\b\w+\b/g) || []).length;
  return Math.max(1, Math.round(words / 200));
}

export default function Page({ params }) {
  const { slug } = params;
  const a = getArticle(slug);
  if (!a) return <div className="p-6">Not found</div>;

  const pack = getTenantPack();
  const palette = pack?.brand?.palette || { bg: "#ffffff", ink: "#0f172a", muted: "#94a3b8" };
  const h = extractHeadings(a.body);
  const rt = readingTime(a.body);

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": a.meta.title,
    "inLanguage": "en",
    "isAccessibleForFree": true
  };

  return (
    <>
      <JsonLd data={jsonld} />
      <main className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8">
          <header className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold" style={{ color: palette.ink }}>{a.meta.title}</h1>
            <div className="mt-2 text-sm" style={{ color: palette.muted }}>
              {pack?.eeat?.authors?.[0]?.name ? <>By {pack.eeat.authors[0].name} · </> : null}
              {rt} min read
              {a.meta.noindex ? <> · <span className="uppercase tracking-wide">DRAFT</span></> : null}
            </div>
            {pack?.eeat?.disclaimer && (
              <p className="mt-2 text-xs" style={{ color: palette.muted }}>
                {pack.eeat.disclaimer}
              </p>
            )}
            <AdSlot id="inArticleTop" pack={pack} />
          </header>

          <div className="prose prose-slate max-w-none">
            <MDX source={a.body} />
          </div>

          <footer className="mt-8">
            <AdSlot id="inArticleBottom" pack={pack} />
          </footer>
        </article>

        <aside className="lg:col-span-4">
          {h.length > 0 && (
            <nav className="sticky top-6 rounded-2xl border p-4">
              <div className="font-semibold mb-2">On this page</div>
              <ul className="space-y-1 text-sm">
                {h.map((x, i) => (
                  <li key={i} className={x.level === 3 ? "pl-3" : ""}>
                    <a href={`#${x.id}`} className="hover:underline">{x.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="mt-6">
            <AdSlot id="sidebar" pack={pack} />
          </div>
        </aside>
      </main>
    </>
  );
}
