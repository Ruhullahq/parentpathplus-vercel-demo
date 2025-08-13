import { NextResponse } from 'next/server';

const RURL = process.env.UPSTASH_REDIS_REST_URL || '';
const RTOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const LIST_KEY = 'ppp:concierge:list';
const mem = { items: [] }; // ephemeral fallback

async function redis(cmd, ...args){
  if (!RURL || !RTOKEN) return null;
  const res = await fetch(RURL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RTOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: [cmd, ...args] })
  });
  if (!res.ok) throw new Error('redis error');
  const data = await res.json();
  return data.result;
}

export async function GET(){
  if (!RURL || !RTOKEN) return NextResponse.json(mem.items, { status: 200 });
  try {
    const ids = await redis('LRANGE', LIST_KEY, 0, 50) || [];
    if (!Array.isArray(ids)) return NextResponse.json([], { status: 200 });
    // pipeline GET for each id
    const r = await fetch(RURL + '/pipeline', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RTOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands: ids.map(id => ['GET', `ppp:concierge:${id}`]) })
    });
    const arr = await r.json();
    const items = (arr && Array.isArray(arr.results) ? arr.results.map(x => { try { return JSON.parse(x.result); } catch { return null; } }).filter(Boolean) : []);
    return NextResponse.json(items, { status: 200 });
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(req){
  const b = await req.json();
  const id = Math.random().toString(36).slice(2,10);
  const item = { id, provider: b.provider||'', notes: b.notes||'', email: b.email||'', status:'RECEIVED', createdAt: Date.now() };
  if (!RURL || !RTOKEN){
    mem.items.unshift(item);
    return NextResponse.json(item, { status: 201 });
  }
  try {
    await fetch(RURL + '/pipeline', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RTOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands: [
        ['SET', `ppp:concierge:${id}`, JSON.stringify(item) ],
        ['LPUSH', LIST_KEY, id ]
      ] })
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'storage_failed' }, { status: 500 });
  }
}
