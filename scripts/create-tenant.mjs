#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/create-tenant.mjs --pack=./packs/baby-gender.json
 * Does:
 *  - reads Tenant Pack
 *  - ensures allowlist merges pack.whitelist
 *  - seeds 3 cornerstone articles (if provided by IA)
 *  - updates MASTER_TRACKER rows
 */
import fs from "fs"; import path from "path"; import { execSync } from "child_process";

const arg = process.argv.find(a=>a.startsWith("--pack="));
if(!arg) { console.error("Missing --pack=path/to/pack.json"); process.exit(2); }
const packPath = arg.split("=")[1];
const pack = JSON.parse(fs.readFileSync(packPath,"utf8"));
const root = process.cwd();

const tenant = pack.tenant.slug;
if (!tenant) { console.error("Pack missing tenant.slug"); process.exit(2); }

// 1) merge whitelist into content/allowlist.yml
const allowPath = path.join(root, "content/allowlist.yml");
const allowTxt = fs.readFileSync(allowPath,"utf8");
let domains = new Set((allowTxt.match(/-\s+([a-z0-9.\-]+)/gi)||[]).map(x=>x.replace(/-\s+/,'').trim()));
(pack.sources_whitelist || []).forEach(d=>domains.add(d));
const merged = "domains:\n" + [...domains].sort().map(d=>"  - "+d).join("\n") + "\n";
fs.writeFileSync(allowPath, merged, "utf8");

// 2) seed 3 cornerstone posts (if present)
const corners = [];
for (const c of (pack.ia?.clusters || [])) {
  if (c.cornerstoneSlug) {
    const slug = c.cornerstoneSlug;
    const title = (c.title || slug).replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
    corners.push({ slug, title });
  }
}
const uniq = new Map(corners.map(x=>[x.slug,x])); // dedupe
const list = [...uniq.values()].slice(0,3);
for (const item of list) {
  execSync(`./scripts/gen_and_track.sh ${tenant} ${item.slug} "${item.title}" seed-corner`, { stdio:"inherit" });
}

// 3) Write a per-tenant daily plan CSV scaffold if not present
const planDir = path.join(root, "packs/plans");
if (!fs.existsSync(planDir)) fs.mkdirSync(planDir, { recursive: true });
const planCsv = path.join(planDir, `${tenant}.csv`);
if (!fs.existsSync(planCsv)) {
  // crude starter list from seed queries
  const rows = (pack.ia?.clusters || []).flatMap(cl =>
    (cl.seedQueries || []).map(q => {
      const slug = q.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const title = q.replace(/\b\w/g,m=>m.toUpperCase());
      return `${slug},${title}`;
    })
  );
  fs.writeFileSync(planCsv, [...new Set(rows)].join("\n")+"\n", "utf8");
  console.log(`Wrote starter plan: packs/plans/${tenant}.csv`);
} else {
  console.log(`Plan exists: packs/plans/${tenant}.csv`);
}

console.log(`✅ Tenant '${tenant}' seeded. Now push and wire Vercel domain/env.`);

// 4) git add (in case user forgot)
try {
  execSync(`git add content docs packs content/allowlist.yml`, { stdio:"inherit" });
  execSync(`git commit -m "feat(tenant): seed ${tenant} (corners + plan + allowlist merge)"`, { stdio:"inherit" });
} catch {}
