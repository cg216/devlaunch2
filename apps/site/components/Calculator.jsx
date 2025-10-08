export default function Calculator({data}){ const id=data?.id||"calc";
  return (<div style={{border:"1px solid #e5e7eb",padding:12,borderRadius:8}}>
    <strong>{data?.title||"Calculator"}</strong>
    <div style={{display:"grid",gap:6,marginTop:8}}>
      <label>Old <input type="number" id="old"/></label>
      <label>New <input type="number" id="new"/></label>
      <button type="button" onClick={()=>{const o=parseFloat(document.getElementById("old").value||"0");
        const n=parseFloat(document.getElementById("new").value||"0"); const p=o===0?0:((n-o)/o)*100; alert(p.toFixed(2)+"%");}}>
        Compute</button>
    </div></div>); }