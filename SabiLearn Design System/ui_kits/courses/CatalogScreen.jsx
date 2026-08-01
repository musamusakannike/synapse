function CatalogScreen({onOpenCourse}){
const {Tabs,LessonCard,StreakBadge}=window.SabiLearnDesignSystem_2488a4;
const [tab,setTab]=React.useState('All');
const courses=[
{title:'Algebra basics',meta:'12 lessons · 45 min',progress:70},
{title:'English grammar essentials',meta:'9 lessons · 30 min',progress:20},
{title:'WAEC Physics prep',meta:'20 lessons · 1.5 hr',progress:0},
{title:'Intro to Python',meta:'8 lessons · 30 min',locked:true}
];
return <div style={{maxWidth:900,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:24}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'var(--text-2xl)',color:'var(--text-primary)'}}>Your courses</div>
<StreakBadge days={12} />
</div>
<Tabs tabs={['All','Math','English','Science']} active={tab} onChange={setTab} />
<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
{courses.map((c,i)=><LessonCard key={i} title={c.title} meta={c.meta} progress={c.progress||0} locked={c.locked} onClick={()=>onOpenCourse(c)} />)}
</div>
</div>;
}
window.CatalogScreen=CatalogScreen;
