#!/usr/bin/env node
import fs from "fs"; import path from "path"; import { execSync } from "child_process";
const tenant=process.argv[2], slug=process.argv[3];
if(!tenant||!slug){ console.error("Usage: qc_apply.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd();
function read(p){ return fs.readFileSync(p,"utf8"); }
function thresholdsFor(tenant){ const def=JSON.parse(read(path.join(root,"packs/_defaults.json"))); const packPath=path.join(root,"packs",`${tenant}.json`); if(!fs.existsSync(packPath)) return def.thresholds; const pack=JSON.parse(read(packPath)); return {...def.thresholds, ...(pack.thresholdsOverride||{})}; }
function decide(qc,t){ if(qc.infoGain<t.infoGain) return "red"; if(qc.evidence<t.evidence) return "red"; if(!qc.schemaParity) return "red"; if(qc.similarityMax>t.similarityMax) return "red"; if(qc.linkBudget>t.linkBudgetMax) return "red"; if(!qc.interactivePresent||!qc.upLinksPresent) return "red"; if(qc.vitals.lcpMs>t.lcpMs||qc.vitals.cls>t.cls||qc.vitals.inpMs>t.inpMs) return "red"; if(qc.a11yScore<t.a11yScore) return "amber"; return "green"; }
const out=JSON.parse(execSync(`node scripts/qc_score.mjs ${tenant} ${slug}`,{encoding:"utf8"}));
const t=thresholdsFor(tenant); const verdict=decide(out.qc,t);
const run=(cmd)=>execSync(cmd,{stdio:"inherit"});
const gate=(name,pass)=>run(`node scripts/update_tracker.mjs gate ${tenant} ${slug} ${name} ${pass?"pass":"fail"}`);
const status=(s)=>run(`node scripts/update_tracker.mjs status ${tenant} ${slug} ${s}`);
gate("citations", out.qc.evidence>=t.evidence);
gate("parity", out.qc.schemaParity);
gate("links", out.qc.linkBudget<=t.linkBudgetMax);
gate("a11y", out.qc.a11yScore>=t.a11yScore);
gate("perf", (out.qc.vitals.lcpMs<=t.lcpMs && out.qc.vitals.cls<=t.cls && out.qc.vitals.inpMs<=t.inpMs));
gate("moderation", true);
if (verdict==="green"){ status("approved"); try { const fs2 = await import("fs"); if (fs2.default.existsSync("./scripts/flip_noindex.sh")) run(`./scripts/flip_noindex.sh ${tenant} ${slug} false`); } catch {} }
else if (verdict==="amber"){ status("human_qc"); }
else { status("ai_qc"); }
console.log(JSON.stringify({tenant,slug,thresholds:t,qc:out.qc,verdict},null,2));
