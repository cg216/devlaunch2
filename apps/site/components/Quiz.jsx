'use client';
import { useMemo, useState } from "react";
import { seededShuffle } from "@/lib/rand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Quiz({ items = [], seed = 1, title = "Quick Quiz" }) {
  const questions = useMemo(() => items.map((q,i)=>({
    ...q,
    _choices: seededShuffle(q.choices.map((c,idx)=>({label:c,idx})), seed + i)
  })), [items, seed]);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const correctCount = useMemo(() => submitted
    ? questions.reduce((acc,q,i)=> acc + ((answers[i]?.idx ?? -1) === q.answer ? 1 : 0), 0)
    : 0, [submitted, answers, questions]);

  if (!items.length) return null;

  return (
    <Card className="my-8">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {questions.map((q, qi) => (
          <div key={qi} className="space-y-2">
            <div className="font-medium">{q.q}</div>
            <div className="grid gap-2">
              {q._choices.map((c, ci) => {
                const picked = answers[qi]?.idx === c.idx;
                const isCorrect = submitted && c.idx === q.answer;
                const isWrong   = submitted && picked && c.idx !== q.answer;
                return (
                  <button
                    key={ci}
                    onClick={()=>!submitted && setAnswers(a=>({...a, [qi]: c}))}
                    className={[
                      "text-left rounded-xl border p-3 transition-colors",
                      picked && !submitted ? "border-slate-900 bg-slate-50" : "",
                      isCorrect ? "border-emerald-600 bg-emerald-50" : "",
                      isWrong   ? "border-rose-600 bg-rose-50" : ""
                    ].join(" ")}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            {submitted && q.explain && (
              <div className="text-sm text-slate-600">{q.explain}</div>
            )}
          </div>
        ))}
        <div className="flex items-center gap-3">
          {!submitted ? (
            <Button onClick={()=>setSubmitted(true)} className="mt-1">Check answers</Button>
          ) : (
            <>
              <div className="font-semibold">{correctCount} / {questions.length} correct</div>
              <Button variant="outline" onClick={()=>{ setSubmitted(false); setAnswers({}); }}>Try again</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
