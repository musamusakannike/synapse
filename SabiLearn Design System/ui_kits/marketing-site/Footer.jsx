function ProofStrip(){
const {StreakBadge,XPPill,Badge}=window.SabiLearnDesignSystem_2488a4;
return <section style={{background:'var(--surface-dark)',padding:'64px 48px',color:'#fff'}}>
<div style={{maxWidth:1280,margin:'0 auto',display:'flex',alignItems:'center',gap:48}}>
<div style={{flex:1}}>
<h2 style={{fontFamily:'var(--font-display)',fontSize:'var(--text-3xl)',fontWeight:700,marginBottom:16}}>Small wins, every day.</h2>
<p style={{color:'var(--text-on-dark-muted)',fontSize:'var(--text-md)',maxWidth:420,lineHeight:1.6}}>Streaks and XP keep you coming back — not because you have to, but because you want to.</p>
</div>
<div style={{flex:1,display:'flex',gap:12,flexWrap:'wrap'}}>
<StreakBadge days={12} /><XPPill amount={1280} /><Badge tone="success">8/10 quiz</Badge>
</div>
</div>
</section>;
}
window.ProofStrip=ProofStrip;
function Footer(){
return <footer style={{padding:'48px',borderTop:'1px solid var(--border-default)',display:'flex',justifyContent:'space-between',alignItems:'center',color:'var(--text-muted)',fontSize:14}}>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,color:'var(--color-primary-active)'}}>SabiLearn</div>
<div>&copy; 2026 SabiLearn &middot; sabilearn.online</div>
</footer>;
}
window.Footer=Footer;
