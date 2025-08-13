export const metadata = { title: "ParentPath+ (Full Demo)", description: "Live demo with providers, concierge, pre-auth PDF, and Stripe" };
export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body style={{fontFamily:'Inter,ui-sans-serif,system-ui', background:'#f9fafb', color:'#111827'}}>
        <header style={{borderBottom:'1px solid #e5e7eb', background:'#fff', position:'sticky', top:0, zIndex:20}}>
          <div style={{maxWidth:1100, margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <a href="/" style={{fontWeight:800}}>ParentPath+</a>
            <nav style={{display:'flex', gap:16}}>
              <a href="/providers">Providers</a>
              <a href="/concierge">Concierge</a>
              <a href="/preauth">Pre‑Auth</a>
              <a href="/pricing" style={{fontWeight:600}}>Pricing</a>
              <a href="/account" style={{padding:'6px 10px', background:'#000', color:'#fff', borderRadius:6}}>Account</a>
            </nav>
          </div>
        </header>
        <main style={{maxWidth:1100, margin:'0 auto', padding:'24px 16px'}}>{children}</main>
        <footer style={{borderTop:'1px solid #e5e7eb', padding:'24px 0', marginTop:40, fontSize:14, color:'#6b7280'}}>
          <div style={{maxWidth:1100, margin:'0 auto', padding:'0 16px'}}>© {new Date().getFullYear()} ParentPath+</div>
        </footer>
      </body>
    </html>
  );
}
