'use client';
import { useEffect, useState } from 'react';
export default function Account(){
  const [tickets, setTickets] = useState([]);
  useEffect(()=>{ (async()=>{ try{ const r = await fetch('/api/concierge'); const d = await r.json(); if (Array.isArray(d)) setTickets(d); } catch {} })(); }, []);
  return (
    <div style={{display:'grid', gap:16}}>
      <section style={{background:'#fff', padding:24, borderRadius:16, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
        <div style={{fontSize:20, fontWeight:700}}>Account & Concierge Tickets</div>
        <div style={{marginTop:12}}>
          {tickets.length===0 && <div style={{color:'#6b7280'}}>No tickets yet. Submit one on the Concierge page.</div>}
          {tickets.map(t => (
            <div key={t.id} style={{border:'1px solid #e5e7eb', padding:12, borderRadius:8, marginTop:8}}>
              <div><b>Ticket:</b> {t.id}</div>
              <div><b>Provider:</b> {t.provider||'-'}</div>
              <div><b>Status:</b> {t.status}</div>
              <div style={{fontSize:12, color:'#6b7280'}}>{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
