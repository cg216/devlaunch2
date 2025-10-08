#!/usr/bin/env node
import fs from "fs";
const file = "docs/MASTER_TRACKER.md";
if (!fs.existsSync(file)) { console.error("Tracker not found:", file); process.exit(1); }

const [,, mode, tenant, slug, key, val] = process.argv;
// modes: status <tenant> <slug> <newStatus>
//        gate   <tenant> <slug> <links|a11y|perf|citations|parity|moderation> <pass|fail>
if (!mode || !tenant || !slug) { console.error("Usage: update_tracker.mjs status <tenant> <slug> <newStatus> | gate <tenant> <slug> <gate> <pass|fail>"); process.exit(2); }

const gateIdx = { links:7, a11y:8, perf:9, citations:10, parity:11, moderation:12 };

const lines = fs.readFileSync(file,"utf8").split(/\r?\n/);
const now = new Date().toISOString().replace(/\.\d+Z$/," UTC").replace('T',' ').replace('Z',' UTC');

for (let i=0;i<lines.length;i++){
  const L = lines[i];
  if (L.includes(`| ${tenant} | ${slug} |`)) {
    const cols = L.split("|").map(s => s.trim());
    // 0:"", 1:ID, 2:Tenant, 3:Slug, 4:Title, 5:Status, 6:Owner, 7:Links, 8:A11y, 9:Perf, 10:Citations, 11:Parity, 12:Moderation, 13:Last Updated, 14:""
    if (mode === "status") {
      const newStatus = key;
      cols[5] = newStatus;
    } else if (mode === "gate") {
      const idx = gateIdx[key];
      if (!idx) { console.error("Unknown gate:", key); process.exit(3); }
      cols[idx] = (val && val.toLowerCase()==="pass") ? "☑" : "☐";
    }
    cols[13] = now;
    lines[i] = "| " + cols.slice(1,14).join(" | ") + " |";
    break;
  }
}
fs.writeFileSync(file, lines.join("\n"), "utf8");
console.log("Updated tracker:", mode, tenant, slug, key||"", val||"");
