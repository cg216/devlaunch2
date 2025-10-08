
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
