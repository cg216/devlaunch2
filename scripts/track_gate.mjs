import fs from "fs"; import path from "path";
const [,, gate, tenant, slug, value] = process.argv;
if(!gate||!tenant||!slug||!value){ console.error("Usage: node scripts/track_gate.mjs <gate> <tenant> <slug> <pass|fail|approved|ai_qc|...>"); process.exit(2); }
const F = path.join(process.cwd(),"docs","MASTER_TRACKER.md");
if(!fs.existsSync(F)) { console.error("Missing tracker:",F); process.exit(1); }
let t = fs.readFileSync(F,"utf8").split("\n");

// find header row
const hi = t.findIndex(l=>/^\|/.test(l));
if(hi<0){ console.error("Header row not found"); process.exit(1); }
const header = t[hi].trim();
const cols = header.split("|").map(s=>s.trim()).filter(Boolean);

// ensure tenant/slug columns exist
["tenant","slug"].forEach(req=>{
  if(!cols.includes(req)) cols.splice(1,0,req); // after leading pipe
});

// ensure gate column exists
if(!cols.includes(gate)) cols.push(gate);

// rewrite header + divider
const divider = "|" + cols.map(()=>":--").join("|") + "|";
t[hi] = "|" + cols.join("|") + "|";
t[hi+1] = divider;

// find row by tenant+slug; if missing, create
let ri = t.findIndex(l=>l.includes(`| ${tenant} |`) && l.includes(`| ${slug} |`));
if(ri<0){
  const row = "|" + cols.map(c=>{
    if(c==="tenant") return tenant;
    if(c==="slug") return slug;
    return "";
  }).join("|") + "|";
  t.splice(hi+2,0,row);
  ri = hi+2;
}

// map row to cells
let cells = t[ri].split("|").map(s=>s.trim());
if(cells[0]==="") cells = cells.slice(1,-1); // normalize

// ensure cells length matches cols
while(cells.length < cols.length) cells.push("");

// write value
const idx = cols.indexOf(gate);
cells[idx] = value;

// put back pipes
t[ri] = "|" + cells.join("|") + "|";

// save
fs.writeFileSync(F, t.join("\n"));
console.log(`✅ tracker: set ${gate}=${value} for ${tenant}/${slug}`);
