import JsonLd from "@/components/JsonLd";
import { getTenantPack } from "@/lib/pack";

function tryParseFAQ(content) {
  // Match <FAQ items={[ ...json... ]} />
  const m = content.match(/<FAQ\s+items=\{(\[[\s\S]*?\])\}/m);
  if (!m) return null;
  try {
    const items = JSON.parse(m[1]);
    const mainEntity = items.slice(0, 25).map(it => ({
      "@type": "Question",
      "name": it.q,
      "acceptedAnswer": { "@type": "Answer", "text": it.a }
    }));
    return { "@context":"https://schema.org", "@type":"FAQPage", mainEntity };
  } catch { return null; }
}

function hasCalculator(content) {
  return /<Calculator\b/.test(content);
}

export default function SchemaAuto({ meta, content, breadcrumbs=[] }) {
  const pack = getTenantPack();
  const things = [];

  // Article
  things.push({
    "@context":"https://schema.org",
    "@type":"Article",
    "headline": meta?.title || "",
    "inLanguage":"en",
    "isAccessibleForFree": true,
    "author": pack?.eeat?.authors?.[0]?.name ? { "@type":"Person", "name": pack.eeat.authors[0].name } : undefined
  });

  // Breadcrumbs
  if (breadcrumbs.length) {
    things.push({
      "@context":"https://schema.org",
      "@type":"BreadcrumbList",
      "itemListElement": breadcrumbs.map((b, i)=>({
        "@type":"ListItem", "position": i+1, "name": b.name, "item": b.url
      }))
    });
  }

  // FAQPage if present
  const faq = tryParseFAQ(content);
  if (faq) things.push(faq);

  // Calculator as WebApplication
  if (hasCalculator(content)) {
    things.push({
      "@context":"https://schema.org",
      "@type":"WebApplication",
      "name": `${meta?.title || "Calculator"} – ${pack?.tenant?.displayName || ""}`.trim(),
      "applicationCategory":"Calculator",
      "operatingSystem":"All",
      "isAccessibleForFree": true
    });
  }

  return <JsonLd data={things.length === 1 ? things[0] : things} />;
}
