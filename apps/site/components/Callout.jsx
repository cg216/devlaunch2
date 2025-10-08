export default function Callout({ title="Heads up", children }) {
  return (
    <div className="my-6 rounded-2xl border p-4 bg-slate-50">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}
