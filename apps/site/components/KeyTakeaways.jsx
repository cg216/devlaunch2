import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function KeyTakeaways({ items=[] }) {
  if(!items.length) return null;
  return (
    <Card className="my-6 shadow-sm">
      <CardHeader><CardTitle className="text-base">Key takeaways</CardTitle></CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1">
          {items.map((t,i)=>(<li key={i} className="text-slate-700">{t}</li>))}
        </ul>
      </CardContent>
    </Card>
  );
}
