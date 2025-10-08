import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function ComparisonTable({ columns=[], rows=[] }) {
  if (!columns.length || !rows.length) return null;
  return (
    <Card className="my-6 overflow-hidden">
      <CardHeader><CardTitle className="text-base">Comparison</CardTitle></CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>{columns.map((c,i)=>(<th key={i} className="px-4 py-2 text-left font-medium">{c}</th>))}</tr>
          </thead>
          <tbody>
            {rows.map((r,ri)=>(
              <tr key={ri} className="odd:bg-white even:bg-slate-50/50">
                {r.map((cell,ci)=>(<td key={ci} className="px-4 py-2 align-top">{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
