#!/usr/bin/env node
/**
 * Chooses 4–5 lines from packs/plans/<tenant>.csv that are NOT yet present in content/<tenant>/*
 * Emits a small "topics.csv" to /tmp and prints the path for the workflow step.
 */
import fs from "fs"; import path from "path"; import os from "os";
const tenant = process.argv[2];
if (!tenant) { console.error("Usage: plan_daily.mjs <tenant>"); process.exit(2); }
const root = process.cwd();
const plan = path.join(root, "packs/plans", `${tenant}.csv`);
if (!fs.existsSync(plan)) { console.error(`No plan file at packs/plans/${tenant}.csv`); process.exit(1); }
const lines = fs.readFileSync(plan,"utf8").split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
const existing = new Set();
const base = path.join(root, "content", tenant);
if (fs.existsSync(base)) {
  for (const s of fs.readdirSync(base)) { if (fs.existsSync(path.join(base,s,"index.mdx"))) existing.add(s); }
}
const candidates = lines.map(l => {
  const [slug,title] = l.split(/,(.+)/); return { slug, title };
}).filter(r => r.slug && !existing.has(r.slug));

const N = Math.min(5, Math.max(4, candidates.length ? 4 : 0));
const pick = arr => arr.sort(()=>0.5-Math.random()).slice(0,N);
const picked = pick(candidates);

if (picked.length === 0) { console.error("No new topics available today."); process.exit(3); }

const out = path.join(os.tmpdir(), `topics-${tenant}-${Date.now()}.csv`);
fs.writeFileSync(out, picked.map(r => `${r.slug},${r.title}`).join("\n")+"\n", "utf8");
console.log(out);
