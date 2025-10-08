export default function ProsCons({ pros = [], cons = [] }) {
  if (!pros.length && !cons.length) return null;
  return (
    <div className="grid md:grid-cols-2 gap-4 my-8">
      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-2">Pros</div>
        <ul className="list-disc pl-5 space-y-1">{pros.map((p,i)=><li key={i}>{p}</li>)}</ul>
      </div>
      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-2">Cons</div>
        <ul className="list-disc pl-5 space-y-1">{cons.map((c,i)=><li key={i}>{c}</li>)}</ul>
      </div>
    </div>
  );
}
