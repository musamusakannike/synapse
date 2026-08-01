function ResultsScreen({onRestart}){
const {Button,XPPill,StreakBadge}=window.SabiLearnDesignSystem_2488a4;
return <div style={{maxWidth:480,margin:'0 auto',padding:'64px 24px',display:'flex',flexDirection:'column',gap:20,alignItems:'center',textAlign:'center'}}>
<div style={{width:88,height:88,borderRadius:'50%',background:'var(--green-50)',display:'flex',alignItems:'center',justifyContent:'center'}}>
<i className="lucide lucide-check-circle" data-lucide="check-circle" style={{width:44,height:44,color:'var(--color-primary)'}}></i>
</div>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'var(--text-2xl)',color:'var(--text-primary)'}}>8/10 — sharp!</div>
<p style={{color:'var(--text-secondary)'}}>Two to review. Keep going, you sabi.</p>
<div style={{display:'flex',gap:12}}><XPPill amount={40} delta /><StreakBadge days={13} /></div>
<Button variant="primary" size="lg" onClick={onRestart} style={{width:'100%'}}>Generate another quiz</Button>
<Button variant="ghost" size="lg" style={{width:'100%'}}>Review answers</Button>
</div>;
}
window.ResultsScreen=ResultsScreen;
