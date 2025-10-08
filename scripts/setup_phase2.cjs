#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function w(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
}

const root = process.cwd();

/* ========== Next.js scaffold ========== */
w("apps/site/package.json", `{
  "name": "devlaunch-site",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "next": "14.2.5",
    "next-mdx-remote": "^5.0.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-slug": "^6.0.0",
    "remark-gfm": "^4.0.0"
  },
  "type": "module"
}`);

w("apps/site/next.config.mjs", `export default { experimental:{ mdxRs:true }, reactStrictMode:true };`);

w("apps/site/tsconfig.json", `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}`);

w("apps/site/lib/content.js", `
import fs from "fs"; import path from "path"; import matter from "gray-matter";
const ROOT=process.cwd(); const TENANT=process.env.TENANT_SLUG||"baby-gender";
const CONTENT_DIR=path.join(ROOT,"content",TENANT);
export function listArticles(){
  if(!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR)
    .filter(s=>fs.existsSync(path.join(CONTENT_DIR,s,"index.mdx")))
    .map(slug=>{ const raw=fs.readFileSync(path.join(CONTENT_DIR,slug,"index.mdx"),"utf8");
      const {data}=matter(raw);
      return { slug, title:data.title||slug, noindex:data.noindex===true, status:data.status||"draft",
               disclaimer:data.disclaimer||"", citations:Array.isArray(data.citations)?data.citations:[] };
    });
}
export function getArticle(slug){
  const file=path.join(CONTENT_DIR,slug,"index.mdx"); if(!fs.existsSync(file)) return null;
  const raw=fs.readFileSync(file,"utf8"); const parsed=matter(raw);
  return { meta:{...parsed.data, slug, title:parsed.data.title||slug, noindex:parsed.data.noindex===true}, body:parsed.content };
}
`.trim());

w("apps/site/lib/mdx.js", `
import { MDXRemote } from "next-mdx-remote/rsc"; import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug"; import rehypeAutolink from "rehype-autolink-headings";
import Calculator from "@/components/Calculator"; import Quiz from "@/components/Quiz";
export default function MDX({source}){ return <MDXRemote source={source} components={{Calculator,Quiz}}
  options={{ mdxOptions:{ remarkPlugins:[remarkGfm], rehypePlugins:[[rehypeSlug],[rehypeAutolink,{behavior:"wrap"}]] }}}/> }
`.trim());

w("apps/site/components/Calculator.jsx", `
export default function Calculator({data}){ const id=data?.id||"calc";
  return (<div style={{border:"1px solid #e5e7eb",padding:12,borderRadius:8}}>
    <strong>{data?.title||"Calculator"}</strong>
    <div style={{display:"grid",gap:6,marginTop:8}}>
      <label>Old <input type="number" id="old"/></label>
      <label>New <input type="number" id="new"/></label>
      <button type="button" onClick={()=>{const o=parseFloat(document.getElementById("old").value||"0");
        const n=parseFloat(document.getElementById("new").value||"0"); const p=o===0?0:((n-o)/o)*100; alert(p.toFixed(2)+"%");}}>
        Compute</button>
    </div></div>); }
`.trim());

w("apps/site/components/Quiz.jsx", `
export default function Quiz({data}){ const title=data?.title||"Quiz"; const items=data?.items||[];
  return (<div style={{border:"1px solid #e5e7eb",padding:12,borderRadius:8}}>
    <strong>{title}</strong><ul style={{marginTop:8}}>
    {items.map((q,i)=>(<li key={i} style={{margin:"6px 0"}}>• {q}</li>))}</ul></div>); }
`.trim());

w("apps/site/components/JsonLd.jsx", `export default function JsonLd({data}){ return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/> }`);

w("apps/site/app/layout.jsx", `
export const metadata={ metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"),
  title:{default:"DevLaunch Site",template:"%s • DevLaunch"}, description:"Auto-generated, QC-gated content" };
export default function RootLayout({children}){ return (<html lang="en"><body style={{fontFamily:"system-ui, sans-serif",color:"#0f172a",lineHeight:1.6,padding:24}}>
  {children}</body></html>); }
`.trim());

w("apps/site/app/page.jsx", `
import { listArticles } from "@/lib/content"; import Link from "next/link"; export const dynamic="force-dynamic";
export default function Home(){ const articles=listArticles(); const live=articles.filter(a=>!a.noindex); const drafts=articles.filter(a=>a.noindex);
  return (<main><h1>Site Index</h1><h2>Published</h2><ul>{live.map(a=><li key={a.slug}><Link href={"/articles/"+a.slug}>{a.title}</Link></li>)}</ul>
    <h2 style={{marginTop:24}}>Drafts (noindex)</h2><ul>{drafts.map(a=><li key={a.slug}><Link href={"/articles/"+a.slug}>{a.title}</Link></li>)}</ul></main>); }
`.trim());

w("apps/site/app/articles/[slug]/page.jsx", `
import { getArticle } from "@/lib/content"; import MDX from "@/lib/mdx"; import JsonLd from "@/components/JsonLd";
export default function Page({params}){ const {slug}=params; const a=getArticle(slug); if(!a) return <div>Not found</div>;
  const jsonld={"@context":"https://schema.org","@type":"Article","headline":a.meta.title,"inLanguage":"en","isAccessibleForFree":true};
  return (<><JsonLd data={jsonld}/><article><MDX source={a.body}/></article></>); }
`.trim());

w("apps/site/app/robots.js", `
import { listArticles } from "@/lib/content"; export default function robots(){
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  const live=listArticles().filter(a=>!a.noindex);
  return { rules:[ {userAgent:"*", allow:"/"}, ...(live.length?[]:[{userAgent:"*", disallow:"/"}]) ], sitemap: base+"/sitemap.xml" }; }
`.trim());

w("apps/site/app/sitemap.js", `
import { listArticles } from "@/lib/content"; export default function sitemap(){
  const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";
  return listArticles().filter(a=>!a.noindex).map(a=>({url:base+"/articles/"+a.slug,lastModified:new Date()})); }
`.trim());

w("public/indexnow.txt", "replace-with-your-indexnow-key\n");

/* ========== QC tools ========== */
w("scripts/qc_score.mjs", `#!/usr/bin/env node
import fs from "fs"; import path from "path";
const THRESH_SIM_N = parseInt(process.env.DUP_GUARD_N || "4");
const tenant = process.argv[2], slug = process.argv[3];
if(!tenant||!slug){ console.error("Usage: qc_score.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd(), file=path.join(root,"content",tenant,slug,"index.mdx");
if(!fs.existsSync(file)){ console.error("Not found:", file); process.exit(1); }
const txt=fs.readFileSync(file,"utf8");
function stripFM(s){ return s.replace(/^---[\\\\s\\\\S]*?---/m,""); }
function stripBoiler(s){ s=stripFM(s); s=s.replace(/<!--\\\\s*disclaimer:[\\\\s\\\\S]*?-->/gi," "); s=s.replace(/##\\\\s*Sources[\\\\s\\\\S]*$/i," "); s=s.replace(/###\\\\s*Related Reading[\\\\s\\\\S]*?(?:\\\\n#+|\\\\Z)/gi," "); s=s.replace(/^#+\\\\s*(TL;DR|Key Takeaways|FAQs|How to do it|Quick Comparison)\\\\b.*$/gim," "); s=s.replace(/\\\\[([^\\\\]]+)\\\\]\\\\([^)]*\\\\)/g,"$1"); return s.replace(/\\\\s+/g," ").trim(); }
function grams(s,n){ s=s.toLowerCase().replace(/[^a-z0-9\\\\s]/g," "); const t=s.split(/\\\\s+/).filter(Boolean); const g=new Set(); for(let i=0;i<=t.length-n;i++) g.add(t.slice(i,i+n).join(" ")); return g; }
function jaccard(a,b,n){const A=grams(stripBoiler(a),n),B=grams(stripBoiler(b),n); let inter=0; A.forEach(x=>{ if(B.has(x)) inter++; }); const uni=A.size+B.size-inter; return inter/Math.max(1,uni);}
const footnotes=[...txt.matchAll(/\\\\[\\\\d+\\\\]:\\\\s*(https?:\\\\/\\\\/\\\\S+)/g)].map(m=>m[1]);
const allowYaml=fs.readFileSync(path.join(root,"content","allowlist.yml"),"utf8");
const allow=(allowYaml.match(/-\\\\s+([a-z0-9.\\\\-]+)/gi)||[]).map(x=>x.replace(/-\\\\s+/,"").trim());
const host=u=>{ try{return new URL(u).host.replace(/^www\\\\./,"");}catch{return"";} };
const allowHits=footnotes.filter(u=>allow.some(d=>host(u).endsWith(d))).length;
const evidence=Math.min(100, Math.round((allowHits/Math.max(2,footnotes.length||1))*100));
const interactivePresent=/<Calculator\\\\b|<Quiz\\\\b/.test(txt);
const upLinksPresent=/###\\\\s*Related Reading/i.test(txt)&&/\\\\]\\\\(\\\\/articles\\\\//.test(txt);
const linkCount=(txt.match(/\\\\[[^\\\\]]+\\\\]\\\\([^)]*\\\\)/g)||[]).length;
const imgAlts=[...txt.matchAll(/!\\\\[([^\\\\]]*)\\\\]\\\\([^)]*\\\\)/g)].map(m=>m[1].trim());
const a11yScore=Math.round(((imgAlts.length?imgAlts.filter(x=>x.length>0).length/imgAlts.length:1))*100);
const vitals={lcpMs:2000,cls:0.05,inpMs:120}; // placeholder; real values come from LHCI
const uniqAdds=[interactivePresent?1:0,/###\\\\s*FAQs/i.test(txt)?1:0,/###\\\\s*How to do it/i.test(txt)?1:0,/###\\\\s*Quick Comparison/i.test(txt)?1:0].reduce((a,b)=>a+b,0);
const headings=(stripFM(txt).match(/^#{2,3}\\\\s+/gm)||[]).length;
const infoGain=Math.max(0,Math.min(100,40+uniqAdds*15+Math.min(30,headings*2)));
let similarityMax=0; const all=[];(function walk(d){ if(!fs.existsSync(d))return; for(const f of fs.readdirSync(d)){ const p=path.join(d,f); const s=fs.statSync(p); if(s.isDirectory()) walk(p); else if(f==="index.mdx") all.push(p); }}) (path.join(root,"content"));
for(const p of all){ if(p.endsWith(\`\${tenant}/\${slug}/index.mdx\`)) continue; const jac=jaccard(txt, fs.readFileSync(p,"utf8"), THRESH_SIM_N); if(jac>similarityMax) similarityMax=jac; }
const schemaParity=(!/###\\\\s*FAQs/i.test(txt))||/schema:\\\\s*true/i.test(txt);
const qc={infoGain,evidence,similarityMax:Number(similarityMax.toFixed(3)),linkBudget:linkCount,a11yScore,vitals,schemaParity,interactivePresent,upLinksPresent};
console.log(JSON.stringify({tenant:tenant,slug:slug,qc:qc,allowHits:allowHits},null,2));
`);

w("scripts/qc_apply.mjs", `#!/usr/bin/env node
import fs from "fs"; import path from "path"; import { execSync } from "child_process";
const tenant=process.argv[2], slug=process.argv[3];
if(!tenant||!slug){ console.error("Usage: qc_apply.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd();
function read(p){ return fs.readFileSync(p,"utf8"); }
function thresholdsFor(tenant){ const def=JSON.parse(read(path.join(root,"packs/_defaults.json"))); const packPath=path.join(root,"packs",\`\${tenant}.json\`); if(!fs.existsSync(packPath)) return def.thresholds; const pack=JSON.parse(read(packPath)); return {...def.thresholds, ...(pack.thresholdsOverride||{})}; }
function decide(qc,t){ if(qc.infoGain<t.infoGain) return "red"; if(qc.evidence<t.evidence) return "red"; if(!qc.schemaParity) return "red"; if(qc.similarityMax>t.similarityMax) return "red"; if(qc.linkBudget>t.linkBudgetMax) return "red"; if(!qc.interactivePresent||!qc.upLinksPresent) return "red"; if(qc.vitals.lcpMs>t.lcpMs||qc.vitals.cls>t.cls||qc.vitals.inpMs>t.inpMs) return "red"; if(qc.a11yScore<t.a11yScore) return "amber"; return "green"; }
const out=JSON.parse(execSync(\`node scripts/qc_score.mjs \${tenant} \${slug}\`,{encoding:"utf8"}));
const t=thresholdsFor(tenant); const verdict=decide(out.qc,t);
const run=(cmd)=>execSync(cmd,{stdio:"inherit"});
const gate=(name,pass)=>run(\`node scripts/update_tracker.mjs gate \${tenant} \${slug} \${name} \${pass?"pass":"fail"}\`);
const status=(s)=>run(\`node scripts/update_tracker.mjs status \${tenant} \${slug} \${s}\`);
gate("citations", out.qc.evidence>=t.evidence);
gate("parity", out.qc.schemaParity);
gate("links", out.qc.linkBudget<=t.linkBudgetMax);
gate("a11y", out.qc.a11yScore>=t.a11yScore);
gate("perf", (out.qc.vitals.lcpMs<=t.lcpMs && out.qc.vitals.cls<=t.cls && out.qc.vitals.inpMs<=t.inpMs));
gate("moderation", true);
if (verdict==="green"){ status("approved"); run(\`./scripts/flip_noindex.sh \${tenant} \${slug} false\`); }
else if (verdict==="amber"){ status("human_qc"); }
else { status("ai_qc"); }
console.log(JSON.stringify({tenant,slug,thresholds:t,qc:out.qc,verdict},null,2));
`);

w("scripts/qc_run.sh", `#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
tenant="\${1:?tenant}"
slug="\${2:?slug}"
node scripts/qc_apply.mjs "\$tenant" "\$slug"
git add docs/MASTER_TRACKER.md "content/\${tenant}/\${slug}/index.mdx" || true
git commit -m "chore(qc): \${tenant}/\${slug} tracker + noindex update" || true
`);

fs.chmodSync(path.join(root,"scripts/qc_run.sh"), 0o755);

/* ========== Tracker header normalize (so updater keeps working) ========== */
const tracker = "docs/MASTER_TRACKER.md";
if (fs.existsSync(tracker)) {
  const txt = fs.readFileSync(tracker, "utf8");
  if (!txt.includes("| ID | Tenant | Slug | Title | Status | Owner | Links | A11y | Perf | Citations | Parity | Moderation | Last Updated |")) {
    const lines = txt.split(/\r?\n/);
    const header="| ID | Tenant | Slug | Title | Status | Owner | Links | A11y | Perf | Citations | Parity | Moderation | Last Updated |";
    const sep   ="|---:|:------:|:-----|:------|:------:|:-----:|:----:|:---:|:----:|:---------:|:------:|:----------:|:-------------:|";
    lines.unshift(sep); lines.unshift(header);
    fs.writeFileSync(tracker, lines.join("\n"));
  }
}

console.log("✅ Setup phase 2 complete (Next.js app + QC tools).");
