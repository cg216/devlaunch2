#!/usr/bin/env node
import fs from "fs"; import path from "path";
const THRESH_SIM_N = parseInt(process.env.DUP_GUARD_N || "4");
const tenant = process.argv[2], slug = process.argv[3];
if(!tenant||!slug){ console.error("Usage: qc_score.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd(), file=path.join(root,"content",tenant,slug,"index.mdx");
if(!fs.existsSync(file)){ console.error("Not found:", file); process.exit(1); }
const txt=fs.readFileSync(file,"utf8");
function stripFM(s){ return s.replace(/^---[\\s\\S]*?---/m,""); }
function stripBoiler(s){ s=stripFM(s); s=s.replace(/<!--\\s*disclaimer:[\\s\\S]*?-->/gi," "); s=s.replace(/##\\s*Sources[\\s\\S]*$/i," "); s=s.replace(/###\\s*Related Reading[\\s\\S]*?(?:\\n#+|\\Z)/gi," "); s=s.replace(/^#+\\s*(TL;DR|Key Takeaways|FAQs|How to do it|Quick Comparison)\\b.*$/gim," "); s=s.replace(/\\[([^\\]]+)\\]\\([^)]*\\)/g,"$1"); return s.replace(/\\s+/g," ").trim(); }
function grams(s,n){ s=s.toLowerCase().replace(/[^a-z0-9\\s]/g," "); const t=s.split(/\\s+/).filter(Boolean); const g=new Set(); for(let i=0;i<=t.length-n;i++) g.add(t.slice(i,i+n).join(" ")); return g; }
function jaccard(a,b,n){const A=grams(stripBoiler(a),n),B=grams(stripBoiler(b),n); let inter=0; A.forEach(x=>{ if(B.has(x)) inter++; }); const uni=A.size+B.size-inter; return inter/Math.max(1,uni);}
const footnotes=[...txt.matchAll(/\\[\\d+\\]:\\s*(https?:\\/\\/\\S+)/g)].map(m=>m[1]);
const allowYaml=fs.readFileSync(path.join(root,"content","allowlist.yml"),"utf8");
const allow=(allowYaml.match(/-\\s+([a-z0-9.\\-]+)/gi)||[]).map(x=>x.replace(/-\\s+/,"").trim());
const host=u=>{ try{return new URL(u).host.replace(/^www\\./,"");}catch{return"";} };
const allowHits=footnotes.filter(u=>allow.some(d=>host(u).endsWith(d))).length;
const evidence=Math.min(100, Math.round((allowHits/Math.max(2,footnotes.length||1))*100));
const interactivePresent=/<Calculator\\b|<Quiz\\b/.test(txt);
const upLinksPresent=/###\\s*Related Reading/i.test(txt)&&/\\]\\(\\/articles\\//.test(txt);
const linkCount=(txt.match(/\\[[^\\]]+\\]\\([^)]*\\)/g)||[]).length;
const imgAlts=[...txt.matchAll(/!\\[([^\\]]*)\\]\\([^)]*\\)/g)].map(m=>m[1].trim());
const a11yScore=Math.round(((imgAlts.length?imgAlts.filter(x=>x.length>0).length/imgAlts.length:1))*100);
const vitals={lcpMs:2000,cls:0.05,inpMs:120}; // placeholder; real values come from LHCI
const uniqAdds=[interactivePresent?1:0,/###\\s*FAQs/i.test(txt)?1:0,/###\\s*How to do it/i.test(txt)?1:0,/###\\s*Quick Comparison/i.test(txt)?1:0].reduce((a,b)=>a+b,0);
const headings=(stripFM(txt).match(/^#{2,3}\\s+/gm)||[]).length;
const infoGain=Math.max(0,Math.min(100,40+uniqAdds*15+Math.min(30,headings*2)));
let similarityMax=0; const all=[];(function walk(d){ if(!fs.existsSync(d))return; for(const f of fs.readdirSync(d)){ const p=path.join(d,f); const s=fs.statSync(p); if(s.isDirectory()) walk(p); else if(f==="index.mdx") all.push(p); }}) (path.join(root,"content"));
for(const p of all){ if(p.endsWith(`${tenant}/${slug}/index.mdx`)) continue; const jac=jaccard(txt, fs.readFileSync(p,"utf8"), THRESH_SIM_N); if(jac>similarityMax) similarityMax=jac; }
const schemaParity=(!/###\\s*FAQs/i.test(txt))||/schema:\\s*true/i.test(txt);
const qc={infoGain,evidence,similarityMax:Number(similarityMax.toFixed(3)),linkBudget:linkCount,a11yScore,vitals,schemaParity,interactivePresent,upLinksPresent};
console.log(JSON.stringify({tenant:tenant,slug:slug,qc:qc,allowHits:allowHits},null,2));
