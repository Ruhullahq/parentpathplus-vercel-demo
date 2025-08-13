import { NextResponse } from 'next/server';

async function nlmSuggest(q){
  if (!q || q.length < 2) return [];
  const url = `https://clinicaltables.nlm.nih.gov/api/npi_idv/v3/search?terms=${encodeURIComponent(q)}&df=npi,name,addr_practice_city,addr_practice_state`;
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    const rows = data[3] || [];
    // Normalize to unified shape
    return rows.slice(0,10).map(r => ({ npi: r[0], name: r[1], city: r[2], state: r[3] }));
  } catch { return []; }
}

const INSURERS = [
  { id:'aetna', name:'Aetna', synonyms:['Aetna PPO','Aetna HMO'], states:['ALL'] },
  { id:'uhc', name:'UnitedHealthcare', synonyms:['UHC','UMR'], states:['ALL'] },
  { id:'bcbs_il', name:'Blue Cross Blue Shield of Illinois', synonyms:['BCBSIL','Blue Cross IL'], states:['IL'] },
  { id:'medicaid_il', name:'Illinois Medicaid', synonyms:['HFS'], states:['IL'] },
  { id:'cigna', name:'Cigna', synonyms:['Cigna PPO','Cigna OAP'], states:['ALL'] },
];
const SPECIALTIES = ['ABA','SLP','OT','PT','BCBA','Feeding','AAC'];
const CITIES = [
  { city:'Naperville', state:'IL' },
  { city:'Chicago', state:'IL' },
  { city:'Schaumburg', state:'IL' },
  { city:'Springfield', state:'IL' },
];

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const state = searchParams.get('state') || 'IL';
  const s = q.toLowerCase();

  const providers = await nlmSuggest(q);
  const cities = CITIES.filter(c => c.city.toLowerCase().includes(s) && (state ? c.state===state : true)).slice(0,5);
  const insurers = INSURERS.filter(i => (i.name.toLowerCase().includes(s) || i.synonyms.some(x=>x.toLowerCase().includes(s))) && (i.states.includes('ALL') || i.states.includes(state))).slice(0,5);
  const specialties = SPECIALTIES.filter(sp => sp.toLowerCase().includes(s)).map(sp => ({ code:sp, name:sp })).slice(0,5);

  return NextResponse.json({ providers, cities, insurers, specialties });
}
