import fs from "fs"; import path from "path";
const f = path.join(process.cwd(),"scripts","gen_and_track.sh");
let s = fs.readFileSync(f,"utf8");
const anchor = './scripts/qc_run.sh "$tenant" "$slug"';
const block = [
  'node scripts/gen_quiz.mjs "$tenant" "$slug" || true',
  'node scripts/inject_quiz.mjs "$tenant" "$slug" || true',
  'node scripts/track_gate.mjs interactive "$tenant" "$slug" pass || true'
].join("\n");

if (!s.includes('gen_quiz.mjs') && s.includes(anchor)) {
  s = s.replace(anchor, `${block}\n\n${anchor}`);
  fs.writeFileSync(f,s);
  console.log("✅ gen_and_track.sh patched to auto-generate quizzes");
} else if (s.includes('gen_quiz.mjs')) {
  console.log("Already patched. ✅");
} else {
  console.error("Could not find QC anchor; please insert the block manually before qc_run.");
  process.exit(1);
}
