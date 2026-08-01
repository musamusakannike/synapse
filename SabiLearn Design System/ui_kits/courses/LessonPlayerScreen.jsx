function LessonPlayerScreen({lesson,onComplete,onBack}){
const {Button,ProgressBar}=window.SabiLearnDesignSystem_2488a4;
return <div style={{maxWidth:640,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:20}}>
<div style={{display:'flex',alignItems:'center',gap:12}}>
<button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><i className="lucide lucide-x" data-lucide="x" style={{width:20,height:20,color:'var(--text-secondary)'}}></i></button>
<ProgressBar value={45} />
</div>
<div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-xl)',color:'var(--text-primary)'}}>{lesson.title}</div>
<image-slot id="lesson-diagram" style={{width:'100%',height:220}} shape="rounded" radius="16" placeholder="Diagram / worked example illustration"></image-slot>
<p style={{color:'var(--text-secondary)',lineHeight:1.7,fontSize:'var(--text-base)'}}>To solve a system of equations, isolate one variable in the first equation, then substitute it into the second. Work through it step by step — no rushing.</p>
<Button variant="primary" size="lg" onClick={onComplete}>Mark as done</Button>
</div>;
}
window.LessonPlayerScreen=LessonPlayerScreen;
