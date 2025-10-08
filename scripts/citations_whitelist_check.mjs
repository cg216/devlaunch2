import fs from "fs"; import path from "path"; import url from "url";
const [,, tenant, slug] = process.argv;
const ROOT = process.cwd();
const pack = JSON.parse(fs.readFileSync(path.join(ROOT,"packs",`${tenant}.json`),"utf8"));
const allowed = new Set((pack.sources_whitelist||[]).map(s=>s.toLowerCase()));

const mdxPath = path.join(ROOT,"content",tenant,slug,"index.mdx");
if(!fs.existsSync(mdxPath)) { console.error("not found", mdxPath); process.exit(2); }
const mdx = fs.readFileSync(mdxPath,"utf8");

const links = [...mdx.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>m[1]);
const offenders = [];
for (const href of links) {
  try {
    const h = new URL(href);
    const host = h.hostname.replace(/^www\./,'').toLowerCase();
    const ok = [...allowed].some(a => host.endsWith(a));
    if (!ok) offenders.push(host+" → "+href);
  } catch {}
}

if (offenders.length) {
  console.error("❌ Non-whitelisted citations:\n- " + offenders.join("\n- "));
  process.exit(1);
} else {
  console.log("✅ All citations are whitelisted.");
}
