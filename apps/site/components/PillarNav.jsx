import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantPack } from "@/lib/pack";

export default function PillarNav() {
  const pack = getTenantPack();
  const pillars = pack?.ia?.pillars || [];
  const clusters = pack?.ia?.clusters || [];
  if (!pillars.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Explore topics</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {pillars.map(p=>{
          const kids = clusters.filter(c=>c.pillar===p.slug);
          return (
            <div key={p.slug}>
              <div className="font-medium">{p.title}</div>
              {!!kids.length && (
                <ul className="mt-1 space-y-1 text-sm text-slate-600">
                  {kids.map(c=>(
                    <li key={`${p.slug}-${c.slug}`}>
                      <Link href={`/articles?pillar=${encodeURIComponent(p.slug)}&cluster=${encodeURIComponent(c.slug)}`}
                            className="hover:text-slate-900 underline-offset-2 hover:underline">
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
