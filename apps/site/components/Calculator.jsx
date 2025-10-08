'use client';
export default function Calculator({ data }) {
  const title = (data && data.title) || "Calculator";
  return (
    <div className="rounded-2xl border p-4">
      <strong>{title}</strong>
      <div className="grid gap-2 mt-2">
        <label>Old <input type="number" id="old" className="border rounded px-2 py-1" /></label>
        <label>New <input type="number" id="new" className="border rounded px-2 py-1" /></label>
        <button type="button" className="rounded px-3 py-1 border"
          onClick={()=>{
            const old = parseFloat(document.getElementById("old").value || "0");
            const neu = parseFloat(document.getElementById("new").value || "0");
            const pct = old === 0 ? 0 : ((neu - old) / old) * 100;
            alert(pct.toFixed(2) + "%");
          }}>Compute</button>
      </div>
    </div>
  );
}
