import fs from "fs"; import path from "path";
const [,, tenant, slug] = process.argv;
if(!tenant||!slug){ console.error("Usage: node scripts/inject_quiz.mjs <tenant> <slug>"); process.exit(2); }
const ROOT=process.cwd();
const mdxPath = path.join(ROOT,"content",tenant,slug,"index.mdx");
const quizPath = path.join(ROOT,"content",tenant,slug,"quiz.generated.json");
if(!fs.existsSync(mdxPath)) { console.error("Not found:", mdxPath); process.exit(1); }
if(!fs.existsSync(quizPath)) { console.error("Missing quiz JSON:", quizPath); process.exit(1); }

const mdx = fs.readFileSync(mdxPath,"utf8");
const quiz = JSON.parse(fs.readFileSync(quizPath,"utf8"));
if (/<Quiz\b/.test(mdx)) { console.log("Quiz already present, skipping injection."); process.exit(0); }

const json = JSON.stringify(quiz.items); // valid JSON for MDX prop
const seed = quiz.seed || 1;
const block = `

<Quiz seed={${seed}} items={${json}} />

`;

let out = mdx;
if (/^##\s+/m.test(out)) out = out.replace(/^##\s+.*$/m, (h)=> h + block);
else out += block;

fs.writeFileSync(mdxPath, out);
console.log("✅ quiz injected into", `${tenant}/${slug}`);
