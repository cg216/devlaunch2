# Publish Blockers (Hard Gates)
1) Link integrity (Lychee) — fail on broken
2) Accessibility (axe/pa11y) — errors=0
3) Performance (Lighthouse) — Perf ≥ 0.85; LCP ≤ 2.5s; CLS ≤ 0.1; INP ≤ 200ms
4) Evidence — ≥2 allow-listed citations; each claim mapped
5) Schema parity — Only output FAQ/HowTo/VideoObject if present on page
6) Similarity — Jaccard ≥ 0.30 (PR pairwise) or embeddings cos>0.85 → block
7) Link budget — ≤12 in-body links; required up-links present
8) Compliance — FTC disclosures where applicable
9) Noindex-until-useful — flip to index only when all above pass and backlinks queued (CI asserts)
