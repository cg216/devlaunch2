import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Resolve to the monorepo root so we can read /content/<tenant> from the app
const APP_ROOT = process.cwd();
const ROOT = process.env.PROJECT_ROOT || path.join(APP_ROOT, "..", "..");
const TENANT = process.env.TENANT_SLUG || "baby-gender";
const CONTENT_DIR = path.join(ROOT, "content", TENANT);

export function listArticles() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const slugs = fs.readdirSync(CONTENT_DIR).filter(s =>
    fs.existsSync(path.join(CONTENT_DIR, s, "index.mdx"))
  );
  return slugs.map(slug => {
    const file = path.join(CONTENT_DIR, slug, "index.mdx");
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title || slug,
      noindex: data.noindex === true,
      status: data.status || "draft",
      disclaimer: data.disclaimer || "",
      citations: Array.isArray(data.citations) ? data.citations : [],
      file
    };
  });
}

export function getArticle(slug) {
  const file = path.join(CONTENT_DIR, slug, "index.mdx");
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  return {
    meta: {
      ...parsed.data,
      slug,
      title: parsed.data.title || slug,
      noindex: parsed.data.noindex === true
    },
    body: parsed.content
  };
}