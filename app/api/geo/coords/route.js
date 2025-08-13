import { NextResponse } from 'next/server';
export async function GET(req){
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip');
  if (!zip) return NextResponse.json({ error: 'zip required' }, { status: 400 });
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`, { cache: 'force-cache' });
    if (!r.ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const d = await r.json();
    const place = (d.places || [])[0];
    if (!place) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const lat = parseFloat(place.latitude);
    const lng = parseFloat(place.longitude);
    return NextResponse.json({ lat, lng, state: d['state abbreviation'] || d.state, city: place['place name'] });
  } catch (e) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 });
  }
}
