export default function FAQ({ items = [] }) {
  if (!items.length) return null;
  return (
    <section className="my-8">
      <h2 className="text-xl font-semibold mb-4">FAQs</h2>
      <div className="space-y-3">
        {items.map((it, i) => (
          <details key={i} className="rounded-xl border p-4">
            <summary className="cursor-pointer font-medium">{it.q}</summary>
            <div className="mt-2 text-sm opacity-90">{it.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
