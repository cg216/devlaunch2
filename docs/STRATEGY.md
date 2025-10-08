# Multi-Tenant Content System — Strategy

**Goal:** one perfect, guardrailed pipeline that clones per niche with Level-2 isolation (new Vercel project + envs + domain). OpenAI generates; CI blocks low quality.

## Architecture
- **apps/site**: Next.js (App Router, Tailwind, shadcn-ready, Recharts, Framer). Content loaded from `.content` (copied at build).
- **packages/pipeline**: generators (OpenAI), embeddings, interlinker, media workers.
- **packs/**: per-tenant JSON (brand, IA, cadence, thresholds override).
- **content/**: canonical MDX inventory per tenant (source of truth).
- **.github/workflows**: QC gates (duplicate, parity, a11y, perf, links, schema).

## L2 Isolation
- 1 Vercel project per site; set `TENANT_SLUG`, `NEXT_PUBLIC_SITE_URL`.
- Optional: shared Supabase with RLS per tenant or DB-per-tenant.

## Publish Governance
- **Pre-publish blockers**: InfoGain, Evidence (whitelist citations), Similarity (corpus), Link budget, A11y, Web Vitals budgets, Schema parity. Red blocks; Amber → reviewer rewrite; Green → publish + IndexNow.
- **Noindex-until-useful** by default; flip only on GREEN.

## OpenAI Orchestration
1. **Plan** (outline + unique value: calc/quiz/chart/video).
2. **Draft** (MDX + Blocks, citations from whitelisted sources).
3. **QC** (automated gates) → **Rewrite** if amber.
4. **Human** (only amber).
5. **Publish** (flip noindex, enqueue backlinks).

## Duplication
- Create Tenant Pack → run `create-tenant` → domain + env → seed 2–3 cornerstones → enable cron for daily planner.
- Everything else derives from Pack + inventory.

## Ops
- Generate: `./scripts/gen_and_track.sh <tenant> <slug> "Title" <seed>`
- QC + tick: `./scripts/qc_run.sh <tenant> <slug>`
- Publish: `./scripts/publish_now.sh <tenant> <slug> "https://domain/articles/<slug>/"`

