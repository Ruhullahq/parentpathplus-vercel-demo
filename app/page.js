import Link from 'next/link';
export default function Home(){
  return (
    <div style={{display:'grid', gap:16}}>
      <section style={{background:'#fff', padding:24, borderRadius:16, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
        <h1 style={{fontSize:28, fontWeight:800}}>Practical help for autism families</h1>
        <p style={{marginTop:8, color:'#4b5563'}}>Find in-network providers, request concierge scheduling, and generate insurer-ready pre‑auth packets.</p>
        <div style={{marginTop:16, display:'flex', gap:12, flexWrap:'wrap'}}>
          <Link href="/providers" style={{background:'#000', color:'#fff', padding:'10px 14px', borderRadius:8}}>Find providers</Link>
          <Link href="/concierge" style={{border:'1px solid #e5e7eb', padding:'10px 14px', borderRadius:8}}>Concierge</Link>
          <Link href="/preauth" style={{border:'1px solid #e5e7eb', padding:'10px 14px', borderRadius:8}}>Pre‑Auth</Link>
          <Link href="/pricing" style={{border:'1px solid #e5e7eb', padding:'10px 14px', borderRadius:8}}>Pricing</Link>
        </div>
      </section>
    </div>
  );
}
