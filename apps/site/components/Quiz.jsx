'use client';
export default function Quiz({ data }) {
  const title = (data && data.title) || "Quiz";
  const items = (data && data.items) || [];
  return (
    <div className="rounded-2xl border p-4">
      <strong>{title}</strong>
      <ul className="mt-2 space-y-1">
        {items.map((q, i) => <li key={i}>• {q}</li>)}
      </ul>
    </div>
  );
}
