import fs from "fs";
import path from "path";

const APP   = process.cwd();                 // apps/site
const ROOT  = path.join(APP, "..", "..");    // repo root
const TENANT = process.env.TENANT_SLUG || "baby-gender";
const SRC   = path.join(ROOT, "content", TENANT);
const DST   = path.join(APP, ".content");

function copyDir(src, dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src)) {
    const s = path.join(src, e), d = path.join(dst, e);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function sanitizeMDX(text) {
  return String(text)
    .replace(/<!--[\s\S]*?-->/g, "")          // strip HTML comments
    .replace(/<!DOCTYPE[^>]*>/gi, "")         // strip doctype
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, ""); // strip CDATA
}

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

if (!fs.existsSync(SRC)) {
  console.warn("No tenant content at", SRC);
  process.exit(0);
}

copyDir(SRC, DST);

// sanitize every index.mdx we just copied
walk(DST, (p) => {
  if (p.endsWith("/index.mdx")) {
    const raw = fs.readFileSync(p, "utf8");
    const out = sanitizeMDX(raw);
    if (out !== raw) {
      fs.writeFileSync(p, out);
      console.log("Sanitized:", p);
    }
  }
});

// copy the tenant pack (for branding/ads) into the bundle
const PACK_SRC = path.join(ROOT, "packs", `${TENANT}.json`);
if (fs.existsSync(PACK_SRC)) {
  fs.copyFileSync(PACK_SRC, path.join(DST, "pack.json"));
  console.log("Packed tenant config:", PACK_SRC, "->", path.join(DST, "pack.json"));
}

console.log("Prepared tenant content:", TENANT, "->", DST);
