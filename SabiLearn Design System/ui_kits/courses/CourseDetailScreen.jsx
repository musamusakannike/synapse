function CourseDetailScreen({course,onOpenLesson,onBack}){
const {Button,ProgressBar,Badge}=window.SabiLearnDesignSystem_2488a4;
const lessons=[
{title:'Linear equations',done:true},{title:'Quadratic equations',done:true},{title:'Simultaneous equations',done:false},{title:'Word problems',done:false}
];
return <div style={{maxWidth:640,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:20}}>
<button onClick={onBack} style={{background:'none',border:'none',color:'var(--text-secondary)',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:0,width:'fit-content'}}><i className="lucide lucide-arrow-left" data-lucide="arrow-left" style={{width:16,height:16}}></i>Back to courses</button>
<div style={{width:'100%',height:180}}><image-slot id="course-hero" style={{width:'100%',height:'100%'}} shape="rounded" radius="20" placeholder="Course illustration"></image-slot></div>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'var(--text-2xl)',color:'var(--text-primary)'}}>{course.title}</div>
<div style={{display:'flex',gap:8,alignItems:'center'}}><Badge tone="info">{course.meta}</Badge></div>
<ProgressBar value={course.progress||0} />
<div style={{display:'flex',flexDirection:'column',gap:8}}>
{lessons.map((l,i)=><div key={i} onClick={()=>onOpenLesson(l)} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:'var(--surface-card)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-sm)',cursor:'pointer'}}>
<i className={'lucide lucide-'+(l.done?'check-circle':'circle')} data-lucide={l.done?'check-circle':'circle'} style={{width:20,height:20,color:l.done?'var(--color-success)':'var(--border-strong)'}}></i>
<span style={{fontWeight:600,color:'var(--text-primary)'}}>{l.title}</span>
</div>)}
</div>
<Button variant="primary" size="lg" onClick={()=>onOpenLesson(lessons[2])}>Continue course</Button>
</div>;
}
window.CourseDetailScreen=CourseDetailScreen;
