#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
function w(p, s){ fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, s); }
function j(p){ return JSON.parse(fs.readFileSync(p, "utf8")); }
function jw(p, obj){ fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }
const sitePkg = "apps/site/package.json";

/* 1) Tailwind + PostCSS + globals */
jw("apps/site/tailwind.config.ts", {
  content: ["./app/**/*.{js,jsx,ts,tsx,mdx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} }, plugins: []
});
w("apps/site/postcss.config.mjs", `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };`);
w("apps/site/app/globals.css", `@tailwind base; @tailwind components; @tailwind utilities; body{ @apply bg-white text-slate-900; }`);

/* 2) Client components + Chart */
w("apps/site/components/Calculator.jsx", `'use client';
export default function Calculator({ data }) {
  const title = (data && data.title) || "Calculator";
  return (
    <div className="rounded-2xl border p-4">
      <strong>{title}</strong>
      <div className="grid gap-2 mt-2">
        <label>Old <input type="number" id="old" className="border rounded px-2 py-1" /></label>
        <label>New <input type="number" id="new" className="border rounded px-2 py-1" /></label>
        <button type="button" className="rounded px-3 py-1 border"
          onClick={()=>{
            const old = parseFloat(document.getElementById("old").value || "0");
            const neu = parseFloat(document.getElementById("new").value || "0");
            const pct = old === 0 ? 0 : ((neu - old) / old) * 100;
            alert(pct.toFixed(2) + "%");
          }}>Compute</button>
      </div>
    </div>
  );
}
`);
w("apps/site/components/Quiz.jsx", `'use client';
export default function Quiz({ data }) {
  const title = (data && data.title) || "Quiz";
  const items = (data && data.items) || [];
  return (
    <div className="rounded-2xl border p-4">
      <strong>{title}</strong>
      <ul className="mt-2 space-y-1">
        {items.map((q, i) => <li key={i}>• {q}</li>)}
      </ul>
    </div>
  );
}
`);
w("apps/site/components/Chart.jsx", `'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function Chart({ data = [] }) {
  return (
    <div className="rounded-2xl border p-4">
      <strong>Trend</strong>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
`);

/* 3) MDX renderer remains server, imports client blocks */
w("apps/site/lib/mdx.js", `
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolink from "rehype-autolink-headings";
import Calculator from "@/components/Calculator";
import Quiz from "@/components/Quiz";
import Chart from "@/components/Chart";
export default function MDX({ source }) {
  return (
    <MDXRemote
      source={source}
      components={{ Calculator, Quiz, Chart }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypeSlug], [rehypeAutolink, { behavior: "wrap" }]]
        }
      }}
    />
  );
}
`.trim());

/* 4) Make layout import Tailwind globals */
const layoutPath = "apps/site/app/layout.jsx";
let layout = fs.readFileSync(layoutPath, "utf8");
if (!/globals\.css/.test(layout)) {
  layout = layout.replace(
    /export default function RootLayout/,
    `import "./globals.css";\nexport default function RootLayout`
  );
  fs.writeFileSync(layoutPath, layout);
}

/* 5) Vercel-safe content prep: copy /content/<tenant> into apps/site/.content at build */
w("apps/site/scripts/prepare_content.mjs", `
import fs from "fs"; import path from "path";
const APP = process.cwd();
const ROOT = path.join(APP, "..", "..");         // monorepo root
const TENANT = process.env.TENANT_SLUG || "baby-gender";
const SRC = path.join(ROOT, "content", TENANT);
const DST = path.join(APP, ".content");
function copyDir(src, dst){
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e), d = path.join(dst, e);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s,d); else fs.copyFileSync(s,d);
  }
}
if (!fs.existsSync(SRC)) { console.error("No tenant content at", SRC); process.exit(0); }
copyDir(SRC, DST);
console.log("Prepared tenant content:", TENANT, "->", DST);
`);
w("apps/site/lib/content.js", `
import fs from "fs";
import path from "path";
import matter from "gray-matter";
const APP = process.cwd();                 // Vercel project root (apps/site)
const CONTENT_DIR = path.join(APP, ".content");
export function listArticles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const slugs = fs.readdirSync(CONTENT_DIR).filter(s => fs.existsSync(path.join(CONTENT_DIR, s, "index.mdx")));
  return slugs.map(slug => {
    const file = path.join(CONTENT_DIR, slug, "index.mdx");
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    return { slug, title: data.title || slug, noindex: data.noindex === true, status: data.status || "draft" };
  });
}
export function getArticle(slug) {
  const file = path.join(CONTENT_DIR, slug, "index.mdx");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  return { meta: { ...parsed.data, slug, title: parsed.data.title || slug, noindex: parsed.data.noindex === true }, body: parsed.content };
}
`.trim());

/* 6) Error boundary to avoid blank “Digest …” pages */
w("apps/site/app/error.jsx", `'use client';
export default function GlobalError({ error }) {
  return (
    <html><body style={{padding:24,fontFamily:"system-ui"}}>
      <h1>Oops — something went wrong</h1>
      <pre style={{whiteSpace:"pre-wrap"}}>{String(error?.message||"Unknown error")}</pre>
    </body></html>
  );
}
`);

/* 7) Update package.json scripts + deps for Tailwind/shadcn/recharts/framer + build hook */
const pkg = j(sitePkg);
pkg.scripts = { ...(pkg.scripts||{}),
  "dev": "next dev --turbo",
  "build": "node ./scripts/prepare_content.mjs && next build",
  "start": "next start"
};
pkg.dependencies = { ...(pkg.dependencies||{}),
  "autoprefixer":"^10.4.20",
  "postcss":"^8.4.47",
  "tailwindcss":"^3.4.13",
  "recharts":"^2.12.7",
  "framer-motion":"^11.2.10"
};
jw(sitePkg, pkg);

console.log("✅ Vercel-ready setup done.");
