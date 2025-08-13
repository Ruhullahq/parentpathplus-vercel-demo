'use client';
import { useEffect, useState } from 'react';

function labelProvider(p){
  const full = p?.name || p?.full || [p?.first, p?.middle, p?.last].filter(Boolean).join(' ');
  const cityState = [p?.city, p?.state].filter(Boolean).join(', ');
  return (full || 'Provider') + (cityState ? ` — ${cityState}` : '');
}
function milesBetween(a, b){
  const toRad = (x)=> x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const c = 2 * Math.asin(Math.sqrt(Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2));
  return (R*c) * 0.621371;
}
const zipCache = new Map();
async function coordsForZip(zip){
  if (!zip) return null;
  if (zipCache.has(zip)) return zipCache.get(zip);
  const r = await fetch(`/api/geo/coords?zip=${zip}`);
  if (!r.ok) return null;
  const d = await r.json();
  zipCache.set(zip, d);
  return d;
}

export default function ProvidersPage(){
  const [q, setQ] = useState('');
  const [state, setState] = useState('IL');
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sugg, setSugg] = useState({providers:[],cities:[],insurers:[],specialties:[]});

  const INSURERS = ['', 'Aetna','UnitedHealthcare','BCBSIL','Illinois Medicaid','Cigna'];
  const SPECS = ['', 'ABA','SLP','OT','PT','BCBA','Feeding','AAC'];
  const [insurer, setInsurer] = useState('');
  const [spec, setSpec] = useState('');
  const [zip, setZip] = useState('');
  const [radius, setRadius] = useState(25);

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
    let d = await r.json();
    let list = d.items || [];

    // Distance annotate/filter
    if (zip && radius){
      const origin = await coordsForZip(zip);
      if (origin){
        const zips = Array.from(new Set(list.map(p => (p.zip||'').slice(0,5)).filter(Boolean)));
        const coordMap = {};
        await Promise.all(zips.map(async z => { const c = await coordsForZip(z); if (c) coordMap[z] = c; }));
        list = list.map(p => {
          const pzip = (p.zip||'').slice(0,5);
          const c = coordMap[pzip];
          const dist = (origin && c) ? milesBetween({lat:origin.lat,lng:origin.lng},{lat:c.lat,lng:c.lng}) : null;
          return { ...p, _distance: dist };
        }).filter(p => (p._distance==null) ? false : p._distance <= radius).sort((a,b)=> (a._distance??9999) - (b._distance??9999));
      }
    }

    // Filters
    const insL = insurer.toLowerCase();
    if (insurer) list = list.filter(p => (p.insurers||[]).some(i => i.toLowerCase().includes(insL)));
    if (spec) list = list.filter(p => (p.specialties||[]).includes(spec));

    setItems(list); setHydrated(d.hydrated||false); setLoading(false);
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
          <input value={zip} onChange={e=>setZip(e.target.value)} placeholder="ZIP" style={{width:90, border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}/>
          <select value={radius} onChange={e=>setRadius(parseInt(e.target.value))} style={{border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}>
            {[5,10,25,50,100].map(m => <option key={m} value={m}>{m} mi</option>)}
          </select>
          <select value={insurer} onChange={e=>setInsurer(e.target.value)} style={{border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}>
            {INSURERS.map(i => <option key={i} value={i}>{i || 'Any insurer'}</option>)}
          </select>
          <select value={spec} onChange={e=>setSpec(e.target.value)} style={{border:'1px solid #e5e7eb', padding:'8px 10px', borderRadius:8}}>
            {SPECS.map(s => <option key={s} value={s}>{s || 'Any specialty'}</option>)}
          </select>
          <button onClick={run} style={{background:'#000', color:'#fff', padding:'8px 12px', borderRadius:8}}>{loading?'Searching…':'Search'}</button>
        </div>
        {(q && q.length>=2) && (sugg.providers.length+sugg.cities.length+sugg.insurers.length+sugg.specialties.length>0) && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:12, fontSize:14}}>
            <Bucket title="Providers" items={sugg.providers.map(p=>labelProvider(p))} />
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
                <div style={{fontWeight:600}}>{p.name || p.full || 'Provider'}</div>
                <div style={{fontSize:14, color:'#6b7280'}}>{[p.city,p.state].filter(Boolean).join(', ')}</div>
                {p.specialties?.length>0 && <div style={{fontSize:14, color:'#6b7280', marginTop:4}}>{p.specialties.join(' • ')}</div>}
                {p._distance!=null && <div style={{fontSize:12, color:'#065f46', marginTop:4}}>{p._distance.toFixed(1)} mi away</div>}
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
        {items.length===0 && <div style={{background:'#fff', padding:24, borderRadius:12, textAlign:'center', color:'#6b7280'}}>No results yet. Try widening your search or removing filters.</div>}
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
