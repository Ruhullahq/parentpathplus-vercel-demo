'use client';
import { useEffect, useState } from 'react';
export default function ProvidersPage(){
  const [q, setQ] = useState('');
  const [state, setState] = useState('IL');
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sugg, setSugg] = useState({providers:[],cities:[],insurers:[],specialties:[]});

  useEffect(()=>{
    const t = setTimeout(async()=>{
      if (!q || q.length < 2) { setSugg({providers:[],cities:[],insurers:[],specialties:[]}); return; }
      const r = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}&state=${state}`);
      const d = await r.json(); setSugg(d);
    }, 200);
    return ()=>clearTimeout(t);
  }, [q, state]);

  async function run(){
    setLoading(true);
    const r = await fetch(`/api/search/providers?q=${encodeURIComponent(q||'')}&state=${state}`);
    const d = await r.json(); setItems(d.items||[]); setHydrated(d.hydrated||false); setLoading(false);
  }
  useEffect(()=>{ run(); }, []);

  return (
    <div style={{display:'grid', gap:16}}>
      <div style={{background:'#fff', padding:16, borderRadius:12, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, city, or specialty" style={{flex:1, border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}/>
          <select value={state} onChange={e=>setState(e.target.value)} style={{border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}>
            {['IL','NJ','PA','NY','TX','GA'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={run} style={{background:'#000', color:'#fff', padding:'8px 12px', borderRadius:8}}>{loading?'Searching…':'Search'}</button>
        </div>
        {(q && q.length>=2) && (sugg.providers.length+sugg.cities.length+sugg.insurers.length+sugg.specialties.length>0) && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:12, fontSize:14}}>
            <Bucket title="Providers" items={sugg.providers.map(p=>`${p.name}${p.city?` — ${p.city}`:''}`)} />
            <Bucket title="Cities" items={sugg.cities.map(c=>`${c.city}, ${c.state}`)} />
            <Bucket title="Insurers" items={sugg.insurers.map(i=>i.name)} />
            <Bucket title="Specialties" items={sugg.specialties.map(s=>s.name)} />
          </div>
        )}
      </div>

      {hydrated && <div style={{fontSize:12, color:'#065f46'}}>Searching wider area… new results added.</div>}

      <div style={{display:'grid', gap:12}}>
        {items.map(p => (
          <div key={p.id || p.npi || Math.random()} style={{background:'#fff', padding:16, borderRadius:12, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
              <div>
                <div style={{fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:14, color:'#6b7280'}}>{[p.city,p.state].filter(Boolean).join(', ')}</div>
                {p.specialties?.length>0 && <div style={{fontSize:14, color:'#6b7280', marginTop:4}}>{p.specialties.join(' • ')}</div>}
              </div>
              <button onClick={()=>alert('Saved ✓')} style={{border:'1px solid #e5e7eb', padding:'4px 10px', borderRadius:6}}>Save</button>
            </div>
            <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
              {p.phone && <a href={`tel:${p.phone}`} style={{border:'1px solid #e5e7eb', padding:'6px 10px', borderRadius:8}}>Call</a>}
              {p.website && <a href={p.website} target="_blank" style={{border:'1px solid #e5e7eb', padding:'6px 10px', borderRadius:8}}>Website</a>}
              <a href="/pricing" style={{background:'#000', color:'#fff', padding:'6px 10px', borderRadius:8}}>Request Concierge (Plus)</a>
            </div>
          </div>
        ))}
        {items.length===0 && <div style={{background:'#fff', padding:24, borderRadius:12, textAlign:'center', color:'#6b7280'}}>No results yet. Try widening your search.</div>}
      </div>
    </div>
  );
}

function Bucket({title, items}){
  return (
    <div>
      <div style={{fontWeight:600, marginBottom:4}}>{title}</div>
      {items.slice(0,6).map((t,i)=>(<div key={i} style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t}</div>))}
    </div>
  );
}
