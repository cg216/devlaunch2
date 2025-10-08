# DevLaunch Blueprint (Cloneable, Guardrailed Content System)

## Repo layout
/apps/site           — Next.js site (SSR/ISR; noindex-until-useful switch)
/apps/admin          — v0-generated Ops UI (Planner, Queue, Audits, Links)
/packages/pipeline   — generators, QC scorecards, schema parity, workers
/packages/db         — SQL + seeds (pgvector-ready, RLS later)
/packs               — Tenant Packs (brand, IA, cadence, whitelists, thresholds)

## One-Click Clone (later)
`pnpm run create-tenant --pack=./packs/<tenant>.json` → creates Vercel project, sets envs, seeds IA, whitelists, thresholds, and kicks deploy.

## Governance (Green/Amber/Red)
- **Green**: auto-publish
- **Amber**: reviewer required (cannot override Reds)
- **Red**: blocked (fails CI)

**Blockers**: InfoGain, Evidence (citations), Schema↔On-Page Parity, Similarity/Cannibalization, Link Budget, A11y (axe), Perf (LCP/CLS/INP), Compliance (disclosures), IndexNow after backlink queue.

**Noindex until useful**: pages remain `noindex: true` until all mandatory gates pass + first internal backlinks exist.
