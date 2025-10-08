'use client';
export default function Calculator({ data }) {
  const title = (data && data.title) || "Calculator";
  return (
    <div style={{border:"1px solid #e5e7eb", padding:12, borderRadius:8}}>
      <strong>{title}</strong>
      <div style={{display:"grid", gap:6, marginTop:8}}>
        <label>Old <input type="number" id="old" /></label>
        <label>New <input type="number" id="new" /></label>
        <button type="button" onClick={()=>{
          const old = parseFloat(document.getElementById("old").value || "0");
          const neu = parseFloat(document.getElementById("new").value || "0");
          const pct = old === 0 ? 0 : ((neu - old) / old) * 100;
          alert(`${pct.toFixed(2)}%`);
        }}>Compute</button>
      </div>
    </div>
  );
}
