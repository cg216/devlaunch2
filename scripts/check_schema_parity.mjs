#!/usr/bin/env node
import fs from "fs"; import path from "path";
let fail = false;
function walk(d){ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); const s=fs.statSync(p);
  if(s.isDirectory()) walk(p); else if(f==="index.mdx"){ const t=fs.readFileSync(p,"utf8");
    const hasFAQ = /###\s*FAQ/i.test(t);
    const hasVideo = /<Video[A-Za-z]*\b/.test(t) || /VideoObject/i.test(t);
    const hasFAQSchemaNote = /schema:\s*true/i.test(t);
    if (hasFAQ && !hasFAQSchemaNote) { console.log("PARITY", p, "FAQ present but 'schema: true' missing in FM"); fail=true; }
    // (stub; your renderer will emit real JSON-LD based on blocks)
  }}
}
walk("content");
if (fail) process.exit(1);
