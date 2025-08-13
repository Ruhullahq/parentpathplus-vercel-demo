import { NextResponse } from 'next/server';

async function nppesSearch({ first_name, city, state }){
  const base = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
  const params = new URLSearchParams();
  if (first_name) params.set('first_name', first_name);
  if (city) params.set('city', city);
  if (state) params.set('state', state);
  const url = `${base}&${params.toString()}`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || [];
    return results.map(r => {
      const basic = r.basic || {};
      const addr = (r.addresses || []).find(a => a.address_purpose==='LOCATION') || {};
      const tax = (r.taxonomies || []).map(t => t.desc).filter(Boolean);
      return {
        npi: r.number?.toString(),
        name: [basic.first_name, basic.last_name, basic.organization_name].filter(Boolean).join(' ').trim() || 'Unknown',
        specialties: tax,
        phone: addr.telephone_number || null,
        city: addr.city || null,
        state: addr.state || null,
        zip: (addr.postal_code||'').slice(0,5) || null
      };
    });
  } catch { return []; }
}

const LOCAL = [
  { id:'p1', name:'Example Clinic Naperville', city:'Naperville', state:'IL', phone:'+1-312-555-0100', website:'https://example.com', specialties:['ABA','SLP'] },
  { id:'p2', name:'Chicago Pediatric SLP Group', city:'Chicago', state:'IL', phone:'+1-312-555-0111', specialties:['SLP'] },
];

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q')||'').trim();
  const state = searchParams.get('state') || 'IL';
  const city = searchParams.get('city') || '';
  let items = LOCAL.filter(p => (!q || p.name.toLowerCase().includes(q.toLowerCase()) || (p.city||'').toLowerCase().includes(q.toLowerCase())) && (state? p.state===state : true));
  let hydrated = false;
  if (items.length < 5 && q){
    const live = await nppesSearch({ first_name:q, city, state });
    items = [...items, ...live];
    hydrated = live.length > 0;
  }
  return NextResponse.json({ items, hydrated });
}
