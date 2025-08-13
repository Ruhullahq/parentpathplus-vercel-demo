'use client';
export default function Pricing(){
  async function checkout(plan){
    alert(`Opening checkout for ${plan} (demo)`);
  }
  const tiers = [
    {name:'Essentials', price:'$19/mo', plan:'ESSENTIALS', features:['Navigator','Toolkits','Signals']},
    {name:'Plus', price:'$49/mo', plan:'PLUS', features:['Everything in Essentials','Concierge','Pre-Auth Packet']},
    {name:'VIP Intake', price:'$199 one-time', plan:'VIP', features:['White-glove intake','Priority support']},
  ];
  return (
    <div style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
      {tiers.map(t => (
        <div key={t.name} style={{background:'#fff', padding:24, borderRadius:16, boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
          <div style={{fontSize:20, fontWeight:700}}>{t.name}</div>
          <div style={{marginTop:8, fontSize:28, fontWeight:800}}>{t.price}</div>
          <ul style={{marginTop:12, color:'#4b5563', fontSize:14}}>
            {t.features.map(f => <li key={f} style={{margin:'6px 0'}}>{f}</li>)}
          </ul>
          <button onClick={()=>checkout(t.plan)} style={{marginTop:16, width:'100%', background:'#000', color:'#fff', padding:'10px 14px', borderRadius:8}}>Get {t.name}</button>
        </div>
      ))}
    </div>
  );
}
