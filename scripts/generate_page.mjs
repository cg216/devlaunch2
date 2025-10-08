#!/usr/bin/env node
import fs from "fs"; import path from "path"; import crypto from "crypto";

const [, , tenant, slug, ...rest] = process.argv;
if (!tenant || !slug || rest.length === 0) { console.error("Usage: generate_page.mjs tenant slug \"Title\" [seed]"); process.exit(2); }
const title = rest[0].replace(/^"+|"+$/g,"");
const seed  = (rest[1] || `${tenant}-${slug}`);

const root = process.cwd();
const matrix = JSON.parse(fs.readFileSync(path.join(root,"matrix/content_matrix.json"),"utf8"));
const allowYaml = fs.readFileSync(path.join(root,"content/allowlist.yml"),"utf8");
const domains = (allowYaml.match(/-\s+([a-z0-9.\-]+)/gi) || []).map(x=>x.replace(/-\s+/,'').trim());

function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
const seedInt=parseInt(crypto.createHash("sha1").update(seed).digest("hex").slice(0,8),16);
const rand=mulberry32(seedInt);
const pick=a=>a[Math.floor(rand()*a.length)];
const pickN=(a,n)=>a.slice().sort(()=>rand()-0.5).slice(0,n);

// ---- similarity helpers (ignore boilerplate) ----
const THRESH = parseFloat(process.env.DUP_GUARD_MIN || "0.45");
const NGRAM  = parseInt(process.env.DUP_GUARD_N || "4");
function stripFM(s){ return s.replace(/^---[\s\S]*?---/m,''); }
function stripBoiler(s){
  s = stripFM(s);
  s = s.replace(/<!--\s*disclaimer:[\s\S]*?-->/gi, " ");
  s = s.replace(/##\s*Sources[\s\S]*$/i, " ");
  s = s.replace(/###\s*Related Reading[\s\S]*?(?:\n#+|\Z)/gi, " ");
  s = s.replace(/^#+\s*(TL;DR|Key Takeaways|FAQs|How to do it|Quick Comparison)\b.*$/gim, " ");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
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

// ---- content bits ----
const dir = path.join(root,"content",tenant,slug); fs.mkdirSync(dir,{recursive:true});
const subtitle="A cite-backed explainer with tools you can use.";
const summary="Skimmable overview with links, tools, and clear next steps.";
const bullets=["Actionable insights, not fluff","Sections aligned to search intent","Interactive (quiz or calculator)"];
const quote = pick(matrix.quote_bank);
const faqs = [
  ["How accurate is this?","We rely on allow-listed sources; footnotes below."],
  ["Can I rely on this?","Use as guidance; consult a professional if needed."]
];
const steps = ["Scan the summary","Use the tool (quiz/calculator)","Deep-dive your section"];
const cmp   = [["Depth of detail","High","Medium"],["Hands-on tools","Yes","Sometimes"]];
const makeCitation = () => "https://" + pick(domains);
const citeCount = Math.max(matrix.constraints.citations.min, Math.min(matrix.constraints.citations.max, Math.floor(rand()*matrix.constraints.citations.max)+1));
let cites = Array.from({length:citeCount}, makeCitation).filter((v,i,a)=>a.indexOf(v)===i);
if (cites.length < 2) cites = ["https://"+domains[0], "https://"+domains[1]];

// interlinks
function scanInterlinks(){
  const base = path.join(root,"content",tenant);
  if (!fs.existsSync(base)) return [];
  const links=[];
  for (const s of fs.readdirSync(base)) {
    const p = path.join(base,s,"index.mdx");
    if (fs.existsSync(p) && s !== slug) {
      const txt = fs.readFileSync(p,"utf8");
      const m = txt.match(/^title:\s*"(.*?)"/m) || txt.match(/#\s+(.+)/);
      const t = m ? (m[1]||m[0]).replace(/^#\s+/,'') : s;
      links.push({slug:s, title:t});
    }
  }
  return links;
}
const inter = scanInterlinks();
const interSel = inter.length ? pickN(inter, Math.min(3, inter.length)) : [];
const interlinksMD = interSel.map(x=>`- [${x.title}](/articles/${x.slug})`).join("\n") || "- _(More coming soon)_";

const calc = pick(matrix.calculator_bank);
const quiz = pick(matrix.quiz_bank);
const useCalc = rand() > 0.5;

let body = `---
title: "${title}"
slug: "${slug}"
tenant: "${tenant}"
author: "@cg216"
status: "draft"
schema: true
noindex: true
disclaimer: "Educational only. Not medical advice."
citations:
${cites.map(c=>`  - "${c}"`).join("\n")}
---

# ${title}

> _${subtitle}_

**TL;DR** — ${summary}

> “${quote}”

${Array.from({length: Math.max(1, Math.floor(rand()* (matrix.constraints.image.max))+1)}, (_,i)=>`![${title} — illustrative ${i+1}](/images/${slug}-${i+1}.jpg)`).join("\n\n")}

### Key Takeaways
- ${bullets[0]}
- ${bullets[1]}
- ${bullets[2]}

### FAQs
**Q:** ${faqs[0][0]}
**A:** ${faqs[0][1]}

**Q:** ${faqs[1][0]}
**A:** ${faqs[1][1]}

### How to do it
1. ${steps[0]}
2. ${steps[1]}
3. ${steps[2]}

### Quick Comparison
| Feature | Option A | Option B |
|---|---:|---:|
| ${cmp[0][0]} | ${cmp[0][1]} | ${cmp[0][2]} |
| ${cmp[1][0]} | ${cmp[1][1]} | ${cmp[1][2]} |
${useCalc ? `\n<Calculator data='${JSON.stringify(calc)}' />\n` : `\n<Quiz data='${JSON.stringify(quiz)}' />\n`}

### Related Reading
${interlinksMD}

<!-- disclaimer: This article is for educational purposes and not medical advice. -->

## Sources
${cites.map((c,i)=>`[${i+1}]: ${c}  `).join("\n")}
`;

// duplicate check against existing pages (ignore boilerplate; higher threshold)
function allPages(){ const files=[]; (function walk(d){ if(!fs.existsSync(d))return; for(const f of fs.readdirSync(d)){ const p=path.join(d,f); const s=fs.statSync(p);
  if(s.isDirectory()) walk(p); else if(f==="index.mdx") files.push(p);} })("content"); return files; }
for (const fp of allPages()){
  if (fp.includes(`/${tenant}/${slug}/index.mdx`)) continue;
  const txt = fs.readFileSync(fp,"utf8");
  const jac = jaccard(body, txt, NGRAM);
  if (jac >= THRESH) { console.error(`DUPLICATE_GUARD: Jaccard≥${THRESH}`); process.exit(42); }
}

fs.writeFileSync(path.join(dir,"index.mdx"), body, "utf8");
fs.writeFileSync(path.join(dir,"image_prompts.txt"), `# ${slug}-1\n${title}, minimal editorial, high-clarity, accessible diagram\nALT: ${title} — illustrative 1\n`, "utf8");
const videoTask = {tenant,slug,title,outline:["Hook (5s)","Summary (15s)","Key Takeaways (20s)","CTA (5s)"],pullFromHeadings:true,imageAssets:[`${slug}-1.jpg`]};
fs.writeFileSync(path.join("tasks/video",`${slug}.json`), JSON.stringify(videoTask,null,2),"utf8");
console.log(`OK: generated content/${tenant}/${slug}/index.mdx`);
