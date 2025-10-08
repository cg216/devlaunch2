const { fail, warn, markdown } = require("danger");
const fs = require("fs");

function readAllowlist() {
  const y = fs.readFileSync("content/allowlist.yml","utf8");
  const m = y.match(/-\s+([a-z0-9.\-]+)/gi) || [];
  return m.map(x => x.replace(/-\s+/,'').trim());
}
const ALLOW = new Set(readAllowlist());

const changed = danger.git.created_files.concat(danger.git.modified_files);
const files = changed.filter(f => f.endsWith(".md") || f.endsWith(".mdx"));

for (const file of files) {
  const txt = fs.readFileSync(file, "utf8");

  // Front-matter
  const fmMatch = txt.match(/^---([\s\S]*?)---/m);
  if (!fmMatch) { fail(`Front-matter missing in \`${file}\``); continue; }
  const fm = fmMatch[1];
  ["title","slug","tenant","citations","schema","disclaimer","noindex"].forEach(k=>{
    if (!new RegExp(`^${k}:`, "m").test(fm)) fail(`Front-matter missing \`${k}\` in \`${file}\``);
  });

  // Citations
  const cites = [...txt.matchAll(/\[(\d+)\]:\s*(https?:\/\/\S+)/g)].map(m=>m[2]);
  if (cites.length < 2) fail(`Need ≥2 citations in \`${file}\``);
  cites.forEach(u => {
    try { const host = (new URL(u)).host.replace(/^www\./,'');
      if (![...ALLOW].some(d=>host.endsWith(d))) fail(`Citation not allow-listed: ${u}`);
    } catch {}
  });

  // Disclaimer anchor
  if (!txt.includes("<!-- disclaimer:")) warn(`Missing disclaimer block in \`${file}\``);

  // Link budget (rough)
  const linkCount = (txt.match(/\[.+?\]\(.+?\)/g) || []).length;
  if (linkCount > 12) fail(`Link budget exceeded (${linkCount}/12) in \`${file}\``);

  // Required up-links section
  if (!/### Related Reading/i.test(txt)) warn(`Consider adding “Related Reading” (up-links/side-links) in \`${file}\``);
}
