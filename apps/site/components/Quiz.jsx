'use client';
export default function Quiz({ data }) {
  const title = (data && data.title) || "Quiz";
  const items = (data && data.items) || [];
  return (
    <div style={{border:"1px solid #e5e7eb", padding:12, borderRadius:8}}>
      <strong>{title}</strong>
      <ul style={{marginTop:8}}>
        {items.map((q, i) => <li key={i} style={{margin:"6px 0"}}>• {q}</li>)}
      </ul>
    </div>
  );
}
