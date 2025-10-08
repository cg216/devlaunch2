export default function Callout({ type="info", children }) {
  const styles = {
    info:  "border-sky-400 bg-sky-50",
    warn:  "border-amber-500 bg-amber-50",
    good:  "border-emerald-500 bg-emerald-50",
    bad:   "border-rose-500 bg-rose-50",
  }[type] || "border-slate-300 bg-slate-50";
  return (
    <div className={`my-6 rounded-xl border p-4 ${styles}`}>
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}
