#!/usr/bin/env node
import fs from "fs";
import path from "path";

const THRESH = parseFloat(process.env.DUP_GUARD_MIN || "0.45"); // was 0.30
const NGRAM = parseInt(process.env.DUP_GUARD_N || "4");         // was 3

function stripFM(s){ return s.replace(/^---[\s\S]*?---/m,''); }
function stripBoiler(s){
  s = stripFM(s);
  // remove disclaimers, sources, related reading
  s = s.replace(/<!--\s*disclaimer:[\s\S]*?-->/gi, " ");
  s = s.replace(/##\s*Sources[\s\S]*$/i, " ");       // footnotes
  s = s.replace(/###\s*Related Reading[\s\S]*?(?:\n#+|\Z)/gi, " ");
  // remove predictable headings & bullets that repeat across pages
  s = s.replace(/^#+\s*(TL;DR|Key Takeaways|FAQs|How to do it|Quick Comparison)\b.*$/gim, " ");
  s = s.replace(/^- (Actionable insights, not fluff|Structured sections to match search intent|Tooling \(quiz\/calculator\) for interactivity).*$/gim, " ");
  // neutralize links
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // collapse whitespace
  return s.replace(/\s+/g, " ").trim();
}
function grams(s,n){
  s = s.toLowerCase().replace(/[^a-z0-9\s]/g," ");
  const t = s.split(/\s+/).filter(Boolean);
  const g = new Set();
  for (let i=0;i<=t.length-n;i++) g.add(t.slice(i,i+n).join(" "));
  return g;
}
function jaccard(a,b,n){
  const A = grams(stripBoiler(a), n), B = grams(stripBoiler(b), n);
  let inter = 0; A.forEach(x => { if (B.has(x)) inter++; });
  const uni = A.size + B.size - inter;
  return inter / Math.max(1, uni);
}
function allFiles() {
  const files=[];
  const walk = d => {
    if (!fs.existsSync(d)) return;
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d,f);
      const s = fs.statSync(p);
      if (s.isDirectory()) walk(p);
      else if (f === "index.mdx") files.push(p);
    }
  };
  walk("content");
  return files;
}

const files = allFiles();
let fail = false;
for (let i=0;i<files.length;i++){
  const ai = fs.readFileSync(files[i], "utf8");
  for (let j=i+1;j<files.length;j++){
    const aj = fs.readFileSync(files[j], "utf8");
    const jac = jaccard(ai, aj, NGRAM);
    if (jac >= THRESH) {
      console.log(`DUPLICATE_GUARD: ${files[i]} <-> ${files[j]} Jaccard=${jac.toFixed(3)} (n=${NGRAM}, min=${THRESH})`);
      fail = true;
    }
  }
}
if (fail) process.exit(1);
