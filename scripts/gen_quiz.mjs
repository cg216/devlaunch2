import fs from "fs"; import path from "path"; import crypto from "crypto";

const [,, tenant, slug] = process.argv;
if(!tenant||!slug){ console.error("Usage: node scripts/gen_quiz.mjs <tenant> <slug>"); process.exit(2); }
const ROOT=process.cwd();
const mdxPath = path.join(ROOT,"content",tenant,slug,"index.mdx");
if(!fs.existsSync(mdxPath)){ console.error("Not found:", mdxPath); process.exit(1); }
const mdx = fs.readFileSync(mdxPath,"utf8");
const seed = parseInt(crypto.createHash('md5').update(slug).digest('hex').slice(0,8),16);

async function withOpenAI(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const prompt = `Extract 5 high-quality multiple-choice quiz questions from the following article. 
Return strictly valid JSON with an array "items", each item: 
{ "q": "...", "choices": ["A","B","C","D"], "answer": <index of correct choice 0-3>, "explain": "..." }.
Avoid ambiguous or trivial questions.\n\nARTICLE:\n${text.slice(0, 12000)}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method:"POST",
      headers:{ "Authorization":`Bearer ${key}`, "Content-Type":"application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{role:"user", content: prompt}],
        temperature: 0.2
      })
    });
    const j = await res.json();
    const content = j?.choices?.[0]?.message?.content || "";
    const json = JSON.parse(content.trim());
    return json?.items?.length ? json.items : null;
  } catch(e){ return null; }
}

function fallback(text) {
  // naive: generate T/F and fact recall from headings & numbers
  const heads = [...text.matchAll(/^#{2,3}\s+(.+)$/gm)].map(m=>m[1]).slice(0,5);
  const nums  = [...text.matchAll(/\b(\d{1,3}(?:\.\d+)?%?)\b/g)].map(m=>m[1]).slice(0,5);
  const items = [];
  if (heads[0]) items.push({ q:`Which section appears in this article?`, choices:[heads[0],"Banana", "Weather", "Unrelated"], answer:0, explain:"Pulled from headings." });
  if (nums[0]) items.push({ q:`Which figure appears in this article?`, choices:[nums[0],"1000","0.1","13"], answer:0, explain:"Pulled from numbers present." });
  while (items.length < 5) {
    items.push({ q:"NIPT is diagnostic.", choices:["True","False","Depends","Unknown"], answer:1, explain:"NIPT is screening, not diagnostic." });
  }
  return items.slice(0,5);
}

const items = (await withOpenAI(mdx)) || fallback(mdx);
const outPath = path.join(ROOT,"content",tenant,slug,"quiz.generated.json");
fs.writeFileSync(outPath, JSON.stringify({ items, seed }, null, 2));
console.log("✅ quiz generated:", outPath);
