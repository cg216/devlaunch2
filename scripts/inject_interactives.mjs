import fs from "fs"; import path from "path";

const [,, tenant, slug] = process.argv;
if(!tenant||!slug){ console.error("Usage: node scripts/inject_interactives.mjs <tenant> <slug>"); process.exit(2); }
const root=process.cwd();
const file=path.join(root,"content",tenant,slug,"index.mdx");
if(!fs.existsSync(file)) { console.error("Not found:", file); process.exit(1); }

let mdx = fs.readFileSync(file,"utf8");

// ensure Calculator or Chart exists
const hasCalc = /<Calculator\b/.test(mdx);
const hasChart = /<Chart\b/.test(mdx);
const needsInteractive = !(hasCalc || hasChart);

// ensure FAQ or ProsCons exists
const hasFAQ = /<FAQ\b/.test(mdx);
const hasPC  = /<ProsCons\b/.test(mdx);
const needsValueAdd = !(hasFAQ || hasPC);

// ensure Related Reading exists (basic)
const hasRelated = /^###\s*Related Reading/m.test(mdx);

const blocks = [];

if (needsInteractive) {
  blocks.push(`
<Calculator data={{ "title": "Percentage Change" }} />
  `.trim());
}

if (needsValueAdd) {
  blocks.push(`
<FAQ items={[
  { q: "How accurate is this method?", a: "It is not diagnostic. Always confirm with clinical testing such as NIPT or ultrasound with a clinician." },
  { q: "When should I use it?", a: "Only as a fun heuristic; timelines vary and evidence is mixed." }
]} />
  `.trim());
}

if (!hasRelated) {
  blocks.push(`
### Related Reading

- [Nub Theory Explained](/articles/nub-theory-explained/)
- [Skull Theory Explained](/articles/skull-theory-explained/)
  `.trim());
}

// inject blocks after the first h2 or append
if (blocks.length) {
  const insertion = "\n\n" + blocks.join("\n\n") + "\n\n";
  if (/^##\s+/m.test(mdx)) {
    mdx = mdx.replace(/^##\s+.*$/m, (h)=>h + insertion);
  } else {
    mdx += insertion;
  }
  fs.writeFileSync(file, mdx);
  console.log("✅ injected blocks into", `${tenant}/${slug}`);
} else {
  console.log("ℹ︎ no injection needed for", `${tenant}/${slug}`);
}
