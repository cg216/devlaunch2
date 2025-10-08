import fs from "fs"; import path from "path";
const [,, gate, tenant, slug, value] = process.argv;
if(!gate||!tenant||!slug||!value){ console.error("Usage: node scripts/track_gate.mjs <gate> <tenant> <slug> <value>"); process.exit(2); }
const F = path.join(process.cwd(),"docs","MASTER_TRACKER.md");
if(!fs.existsSync(F)) { console.error("Missing tracker:",F); process.exit(1); }
let t = fs.readFileSync(F,"utf8").split("\n");

// header
const hi = t.findIndex(l=>/^\|/.test(l));
if(hi<0){ console.error("Header row not found"); process.exit(1); }
let cols = t[hi].trim().split("|").map(s=>s.trim()).filter(Boolean);

// ensure columns
["tenant","slug"].forEach(req=>{ if(!cols.includes(req)) cols.splice(1,0,req); });
if(!cols.includes(gate)) cols.push(gate);

// rewrite header + divider
t[hi]   = "|" + cols.join("|") + "|";
t[hi+1] = "|" + cols.map(()=>":--").join("|") + "|";

// find or create row
let ri = t.findIndex(l=>l.includes(`| ${tenant} |`) && l.includes(`| ${slug} |`));
if(ri<0){
  const row = "|" + cols.map(c => c==="tenant" ? tenant : c==="slug" ? slug : "").join("|") + "|";
  t.splice(hi+2,0,row);
  ri = hi+2;
}

// update cell
let cells = t[ri].split("|").map(s=>s.trim()); if(cells[0]==="") cells = cells.slice(1,-1);
while(cells.length < cols.length) cells.push("");
cells[cols.indexOf(gate)] = value;
t[ri] = "|" + cells.join("|") + "|";

fs.writeFileSync(F, t.join("\n"));
console.log(`✅ tracker: set ${gate}=${value} for ${tenant}/${slug}`);
