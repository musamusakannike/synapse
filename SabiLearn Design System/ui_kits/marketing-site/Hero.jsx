function Hero(){
const {Button}=window.SabiLearnDesignSystem_2488a4;
return <section style={{display:'flex',alignItems:'center',gap:64,padding:'80px 48px',maxWidth:1280,margin:'0 auto'}}>
<div style={{flex:1,display:'flex',flexDirection:'column',gap:24}}>
<div style={{display:'inline-flex',width:'fit-content',background:'var(--gold-50)',color:'var(--gold-600)',padding:'6px 14px',borderRadius:'var(--radius-pill)',fontSize:13,fontWeight:700}}>For Nigerian students, everywhere</div>
<h1 style={{fontSize:'var(--text-5xl)',fontFamily:'var(--font-display)',fontWeight:800,lineHeight:1.05,color:'var(--text-primary)'}}>You sabi pass this exam.</h1>
<p style={{fontSize:'var(--text-md)',color:'var(--text-secondary)',maxWidth:440,lineHeight:1.6}}>Turn your notes into quizzes, follow ready-made courses, and learn to code — all in one clean, no-clutter app.</p>
<div style={{display:'flex',gap:12}}>
<Button variant="primary" size="lg">Start learning free</Button>
<Button variant="ghost" size="lg">See how it works</Button>
</div>
</div>
<div style={{flex:1}}>
<image-slot id="hero-illustration" style={{width:'100%',height:380}} shape="rounded" radius="28" placeholder="Drop a hand-drawn hero illustration (student + book/laptop)"></image-slot>
</div>
</section>;
}
window.Hero=Hero;
