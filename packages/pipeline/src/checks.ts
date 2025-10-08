// Minimal contracts for QC decisions (wire real scorers later)
export type QC = {
  infoGain: number; evidence: number; similarityMax: number; linkBudget: number; a11yScore: number;
  vitals: { lcpMs: number; cls: number; inpMs: number }; schemaParity: boolean; interactivePresent: boolean; upLinksPresent: boolean;
};
export type Verdict = "green"|"amber"|"red";
export function decide(qc: QC, t: any): Verdict {
  if (qc.infoGain < t.infoGain) return "red";
  if (qc.evidence < t.evidence) return "red";
  if (!qc.schemaParity) return "red";
  if (qc.similarityMax > t.similarityMax) return "red";
  if (qc.linkBudget > t.linkBudgetMax) return "red";
  if (!qc.interactivePresent || !qc.upLinksPresent) return "red";
  if (qc.vitals.lcpMs > t.lcpMs || qc.vitals.cls > t.cls || qc.vitals.inpMs > t.inpMs) return "red";
  if (qc.a11yScore < t.a11yScore) return "amber";
  return "green";
}
