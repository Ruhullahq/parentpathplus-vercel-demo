'use client';
import { useState } from 'react';
export default function Concierge(){
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [created, setCreated] = useState(null);
  async function submit(){
    const r = await fetch('/api/concierge', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, notes, email }) });
    const d = await r.json();
    if (r.ok) setCreated(d); else alert(d.error || 'Error');
  }
  return (
    <div style={{maxWidth:600, background:'#fff', padding:24, borderRadius:16, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:20, fontWeight:700}}>Request Concierge</div>
      <div style={{marginTop:12, display:'grid', gap:12}}>
        <input value={provider} onChange={e=>setProvider(e.target.value)} placeholder="Provider name (or NPI)" style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email (confirmation)" style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Availability, insurance, preferences" rows={5} style={{border:'1px solid #e5e7eb', padding:'10px 12px', borderRadius:8}}/>
        <button onClick={submit} style={{background:'#000', color:'#fff', padding:'10px 14px', borderRadius:8}}>Submit</button>
        {created && <div style={{fontSize:14, color:'#065f46'}}>Ticket created: <b>{created.id}</b></div>}
        <div style={{fontSize:12, color:'#6b7280'}}>In this demo, tickets are stored in Upstash Redis if keys are provided; otherwise they are ephemeral.</div>
      </div>
    </div>
  );
}
