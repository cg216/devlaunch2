import fs from "fs";
import path from "path";
const APP = process.cwd();
export function getTenantPack() {
  const file = path.join(APP, ".content", "pack.json");
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return null; }
}
