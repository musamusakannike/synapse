function Features(){
const {Card}=window.SabiLearnDesignSystem_2488a4;
const items=[
{icon:'file-question',title:'Generate quiz from documents',body:'Upload any note or PDF — get a practice quiz in seconds.'},
{icon:'layout-grid',title:'Ready-made courses',body:'Structured, organized paths so you always know what\u2019s next.'},
{icon:'code-2',title:'Learn to code',body:'Python, JavaScript and more — hands-on, at your pace.'}
];
return <section style={{padding:'0 48px 96px',maxWidth:1280,margin:'0 auto'}}>
<h2 style={{fontFamily:'var(--font-display)',fontSize:'var(--text-3xl)',fontWeight:700,textAlign:'center',marginBottom:48,color:'var(--text-primary)'}}>Everything you need. Nothing you don't.</h2>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
{items.map((it,i)=><Card key={i} style={{display:'flex',flexDirection:'column',gap:16}}>
<div style={{width:52,height:52,borderRadius:'var(--radius-md)',background:'var(--green-50)',display:'flex',alignItems:'center',justifyContent:'center'}}>
<i className={'lucide lucide-'+it.icon} data-lucide={it.icon} style={{width:24,height:24,color:'var(--color-primary)'}}></i>
</div>
<div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-lg)',color:'var(--text-primary)'}}>{it.title}</div>
<div style={{fontSize:'var(--text-base)',color:'var(--text-secondary)',lineHeight:1.6}}>{it.body}</div>
</Card>)}
</div>
</section>;
}
window.Features=Features;
