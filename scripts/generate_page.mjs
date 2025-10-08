#!/usr/bin/env node
import fs from "fs"; import path from "path"; import crypto from "crypto";
const [, , tenant, slug, ...rest] = process.argv;
if (!tenant || !slug || rest.length === 0) { console.error("Usage: generate_page.mjs tenant slug \"Title\" [seed]"); process.exit(2); }
const title = rest[0].replace(/^"+|"+$/g,""); const seed = (rest[1] || `${tenant}-${slug}`); const root = process.cwd();
const matrix = JSON.parse(fs.readFileSync(path.join(root,"matrix/content_matrix.json"),"utf8"));
const allowYaml = fs.readFileSync(path.join(root,"content/allowlist.yml"),"utf8");
const domains = (allowYaml.match(/-\s+([a-z0-9.\-]+)/gi) || []).map(x=>x.replace(/-\s+/,'').trim());
function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
const seedInt=parseInt(crypto.createHash("sha1").update(seed).digest("hex").slice(0,8),16); const rand=mulberry32(seedInt);
const pick=a=>a[Math.floor(rand()*a.length)]; const pickN=(a,n)=>a.slice().sort(()=>rand()-0.5).slice(0,n);
function jaccard(a,b,n=3){const sh=s=>{s=s.toLowerCase().replace(/[^a-z0-9\s]/g,' ');const t=s.split(/\s+/).filter(Boolean);const g=new Set();for(let i=0;i<=t.length-n;i++)g.add(t.slice(i,i+n).join(' '));return g;}
  const A=sh(a),B=sh(b);const inter=[...A].filter(x=>B.has(x)).length;const uni=A.size+B.size-inter;return inter/Math.max(1,uni);}
const dir=path.join(root,"content",tenant,slug); fs.mkdirSync(dir,{recursive:true});
const subtitle="A cite-backed explainer with tools you can use."; const summary="Skimmable overview with links, tools, and clear next steps.";
const bullets=["Actionable insights, not fluff","Sections aligned to search intent","An interactive element to add value"]; const quote=pick(matrix.quote_bank);
const faqs=[["How accurate is this?","We keep sources current and update pages regularly."],["Can I rely on this?","Use it as a guide; consult a professional when it matters."]];
const steps=["Scan the summary","Use the tool (quiz/calculator)","Deep-dive the sections you need"];
const cmp=[["Depth of detail","High","Medium"],["Hands-on tools","Yes","Sometimes"]];
const makeCitation=()=> "https://" + pick(domains);
const citeCount=Math.max(matrix.constraints.citations.min, Math.min(matrix.constraints.citations.max, Math.floor(rand()*matrix.constraints.citations.max)+1));
let cites=Array.from({length:citeCount},makeCitation).filter((v,i,a)=>a.indexOf(v)===i); if(cites.length<2)cites=["https://"+domains[0],"https://"+domains[1]];
function scanInterlinks(){const base=path.join(root,"content",tenant); if(!fs.existsSync(base))return[]; const links=[]; for(const s of fs.readdirSync(base)){const p=path.join(base,s,"index.mdx");
  if(fs.existsSync(p)&&s!==slug){const txt=fs.readFileSync(p,"utf8"); const m=txt.match(/^title:\s*"(.*?)"/m)||txt.match(/#\s+(.+)/); const t=m?(m[1]||m[0]):s; links.push({slug:s,title:t.replace(/^#\s+/, '')});}} return links;}
const inter=scanInterlinks(); const interSel = inter.length ? pickN(inter, Math.min(3, inter.length)) : [];
const interlinksMD = interSel.map(x=>`- [${x.title}](/articles/${x.slug})`).join("\n") || "- _(More coming soon)_";
const calc = pick(matrix.calculator_bank); const quiz = pick(matrix.quiz_bank); const useCalc = rand() > 0.5;
const imgCount=Math.max(1,Math.floor(rand()*(matrix.constraints.image.max))+1); const styles=matrix.image_styles;
let images=[]; for(let i=1;i<=imgCount;i++){ images.push({n:i,alt:`${title} — illustrative ${i}`,prompt:`${title}, ${pick(styles)}, high-clarity, accessible diagram`});}
let body=`---
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

${images.map(img=>`![${img.alt}](/images/${slug}-${img.n}.jpg)`).join("\n\n")}

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
function allPages(){const base=path.join(root,"content"); const files=[]; (function walk(d){ if(!fs.existsSync(d))return; for(const f of fs.readdirSync(d)){ const fp=path.join(d,f); const st=fs.statSync(fp);
  if(st.isDirectory()) walk(fp); else if(f==="index.mdx") files.push(fp);} })(base); return files;}
for(const fp of allPages()){ if(fp.includes(`/${tenant}/${slug}/index.mdx`)) continue; const txt=fs.readFileSync(fp,"utf8"); const jac=jaccard(body,txt,3); if(jac>=0.30){ console.error("DUPLICATE_GUARD: Jaccard≥0.30");
  process.exit(42);}}
fs.writeFileSync(path.join(dir,"index.mdx"),body,"utf8");
fs.writeFileSync(path.join(dir,"image_prompts.txt"), images.map(i=>`# ${slug}-${i.n}\n${i.prompt}\nALT: ${i.alt}\n`).join("\n"),"utf8");
const videoTask={tenant,slug,title,outline:["Hook (5s)","Summary (15s)","Key Takeaways (20s)","CTA (5s)"],pullFromHeadings:true,imageAssets:images.map(i=>`${slug}-${i.n}.jpg`)};
fs.writeFileSync(path.join("tasks/video",`${slug}.json`), JSON.stringify(videoTask,null,2),"utf8");
console.log(`OK: generated content/${tenant}/${slug}/index.mdx`);
