'use client';
import { useState } from 'react';
export default function PreAuth(){
  const [state, setState] = useState('IL');
  const [insurance, setInsurance] = useState('Aetna');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  async function generate(){
    const r = await fetch('/api/preauth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ state, insurance, child: { first, last } }) });
    if (r.ok){
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'preauth.pdf'; a.click();
      URL.revokeObjectURL(url);
    } else {
      const d = await r.json(); alert(d.error || 'Error generating PDF');
    }
  }
  return (
    <div style={{maxWidth:600, background:'#fff', padding:24, borderRadius:16, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:20, fontWeight:700}}>Pre‑Authorization Packet</div>
      <div style={{marginTop:12, display:'grid', gap:12}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <select value={state} onChange={e=>setState(e.target.value)} style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}>
            {['IL','NJ','PA','NY','TX','GA'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={insurance} onChange={e=>setInsurance(e.target.value)} placeholder="Insurance" style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <input value={first} onChange={e=>setFirst(e.target.value)} placeholder="Child first name" style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
          <input value={last} onChange={e=>setLast(e.target.value)} placeholder="Child last name" style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
        </div>
        <button onClick={generate} style={{background:'#000', color:'#fff', padding:'10px 14px', borderRadius:8}}>Generate PDF</button>
        <div style={{fontSize:12, color:'#6b7280'}}>This demo returns a PDF download directly. In production we’ll save to S3 and email a link.</div>
      </div>
    </div>
  );
}
