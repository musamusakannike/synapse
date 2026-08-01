function QuizScreen({onFinish}){
const {Button,ProgressBar,QuizOptionCard}=window.SabiLearnDesignSystem_2488a4;
const [step,setStep]=React.useState(0);
const [picked,setPicked]=React.useState(null);
const questions=[
{q:'What is the powerhouse of the cell?',options:['Nucleus','Mitochondria','Ribosome','Golgi body'],correct:1},
{q:'Photosynthesis occurs mainly in the:',options:['Roots','Stem','Leaves','Flowers'],correct:2}
];
const cur=questions[step];
function pick(i){if(picked!==null)return;setPicked(i);}
function next(){if(step+1<questions.length){setStep(step+1);setPicked(null);}else{onFinish();}}
return <div style={{maxWidth:480,margin:'0 auto',padding:'48px 24px',display:'flex',flexDirection:'column',gap:24}}>
<ProgressBar value={((step)/questions.length)*100} />
<div style={{fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>Question {step+1} of {questions.length}</div>
<div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-xl)',color:'var(--text-primary)'}}>{cur.q}</div>
<div style={{display:'flex',flexDirection:'column',gap:10}}>
{cur.options.map((o,i)=>{
let state='default';
if(picked!==null){if(i===cur.correct)state='correct';else if(i===picked)state='incorrect';}
return <QuizOptionCard key={i} label={o} state={state} onClick={()=>pick(i)} />;
})}
</div>
<Button variant="primary" size="lg" disabled={picked===null} onClick={next}>{step+1<questions.length?'Next':'Finish'}</Button>
</div>;
}
window.QuizScreen=QuizScreen;
