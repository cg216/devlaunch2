import fs from "fs"; import path from "path";
const [,, tenant, slug] = process.argv;
if(!tenant||!slug){ console.error("Usage: node scripts/ensure_related.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd(); const dir=path.join(root,"content",tenant);
const me=path.join(dir,slug,"index.mdx");
if(!fs.existsSync(me)) { console.error("Not found:", me); process.exit(1); }
const all=fs.readdirSync(dir).filter(s=>s!==slug && fs.existsSync(path.join(dir,s,"index.mdx")));
const picks = all.slice(0,5); // simple: first few other pages
const links = picks.map(s=>`- [${s.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase())}](/articles/${s}/)`).join("\n");

let txt=fs.readFileSync(me,"utf8");
const hasSection=/^###\s*Related Reading/m.test(txt);
if (!hasSection) {
  // insert before "## Sources" if present, else append
  const ins = `\n\n### Related Reading\n\n${links}\n`;
  if (/^##\s*Sources/m.test(txt)) {
    txt = txt.replace(/^##\s*Sources/m, ins + "\n## Sources");
  } else {
    txt += ins;
  }
} else {
  // ensure at least 2 internal article links
  const count = (txt.match(/\]\(\/articles\//g)||[]).length;
  if (count < 2) {
    txt = txt.replace(/^###\s*Related Reading[^\n]*\n([\s\S]*?)(\n#+|\n?$)/m,
      (m, body, tail)=>`### Related Reading\n\n${links}\n`+(tail.startsWith("\n#")?tail:""));
  }
}
fs.writeFileSync(me, txt);
console.log("✅ ensured Related Reading for", `${tenant}/${slug}`);
