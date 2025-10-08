export default function FAQ({ items = [] }) {
  if (!items.length) return null;
  return (
    <section className="my-8 space-y-3">
      <h2 className="text-lg font-semibold">FAQs</h2>
      {items.map((it, i)=>(
        <details key={i} className="rounded-xl border p-4 bg-white">
          <summary className="cursor-pointer font-medium">{it.q}</summary>
          <div className="mt-2 text-slate-700">{it.a}</div>
        </details>
      ))}
    </section>
  );
}
