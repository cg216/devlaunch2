'use client';
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Calculator({ type="gender-fun" }) {
  const [week, setWeek] = useState(12);
  const [hbpm, setHbpm] = useState(150);
  const score = useMemo(()=>{
    // playful, not medical!
    let s = 0.5;
    s += Math.sin((week/40)*Math.PI) * 0.1;
    s += (hbpm-140)/2000;
    return Math.max(0, Math.min(1, s));
  },[week,hbpm]);
  const pct = Math.round(score*100);

  return (
    <Card className="my-8">
      <CardHeader><CardTitle className="text-base">For-fun Gender Calculator</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm">Gestational week: {week}</label>
          <input type="range" min={5} max={40} value={week} onChange={e=>setWeek(+e.target.value)} className="w-full"/>
        </div>
        <div>
          <label className="text-sm">Heart rate (bpm): {hbpm}</label>
          <input type="range" min={110} max={180} value={hbpm} onChange={e=>setHbpm(+e.target.value)} className="w-full"/>
        </div>
        <div className="text-sm text-slate-700">
          Result (for fun only): <strong>{pct}% “girl”, {100-pct}% “boy”</strong>.
        </div>
        <p className="text-xs text-slate-500">This is not medical advice.</p>
      </CardContent>
    </Card>
  );
}
