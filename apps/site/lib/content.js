import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { sanitizeMDX } from "@/lib/sanitize";
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