'use client';
import { useMemo, useState } from "react";
import { seededShuffle } from "@/lib/rand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Quiz({ items = [], seed = 1, title = "Quick Quiz" }) {
  const questions = useMemo(
    () => items.map((q,i)=>({
      ...q,
      _choices: seededShuffle(q.choices.map((c,idx)=>({label:c,idx})), seed + i)
    })), [items, seed]
  );

  const [step, setStep] = useState(0);       // which question the user is on
  const [answers, setAnswers] = useState({}); // { [qi]: { idx } }
  const [submitted, setSubmitted] = useState(false);

  const correctCount = useMemo(() =>
    submitted
      ? questions.reduce((acc,q,i)=> acc + ((answers[i]?.idx ?? -1) === q.answer ? 1 : 0), 0)
      : 0
  , [submitted, answers, questions]);

  if (!questions.length) return null;

  const last = step >= questions.length;
  const q = questions[step];

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all"
            style={{ width: `${Math.min(step, questions.length)/questions.length*100}%` }}
          />
        </div>

        {/* Completed view */}
        {submitted && last ? (
          <div className="space-y-3">
            <div className="text-lg font-semibold">
              You scored {correctCount} / {questions.length}
            </div>
            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); setStep(0); }}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            {/* Question */}
            <div className="space-y-2">
              <div className="text-sm text-slate-500">Question {step+1} of {questions.length}</div>
              <div className="font-medium">{q.q}</div>
              <div className="grid gap-2">
                {q._choices.map((c, ci) => {
                  const picked = answers[step]?.idx === c.idx;
                  return (
                    <button
                      key={ci}
                      onClick={() => setAnswers(a => ({ ...a, [step]: c }))}
                      className={[
                        "text-left rounded-xl border p-3 transition-colors",
                        picked ? "border-slate-900 bg-slate-50" : "hover:bg-slate-50"
                      ].join(" ")}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center gap-3">
              {step < questions.length - 1 ? (
                <Button
                  onClick={() => setStep(s => Math.min(s+1, questions.length))}
                  disabled={answers[step]?.idx == null}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={() => { setSubmitted(true); setStep(s => s+1); }}
                  disabled={answers[step]?.idx == null}
                >
                  See results
                </Button>
              )}
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s-1))}>
                  Back
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
