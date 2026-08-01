function CodeLessonScreen({language,onBack}){
const {Button,ProgressBar}=window.SabiLearnDesignSystem_2488a4;
const [ran,setRan]=React.useState(false);
return <div style={{maxWidth:720,margin:'0 auto',padding:'32px 24px',display:'flex',flexDirection:'column',gap:16}}>
<div style={{display:'flex',alignItems:'center',gap:12}}>
<button onClick={onBack} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><i className="lucide lucide-arrow-left" data-lucide="arrow-left" style={{width:18,height:18,color:'var(--text-secondary)'}}></i></button>
<ProgressBar value={35} />
</div>
<div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-xl)',color:'var(--text-primary)'}}>{language}: Print statements</div>
<p style={{color:'var(--text-secondary)',lineHeight:1.6}}>A print statement shows text to the screen. Try printing your name below.</p>
<div style={{background:'var(--neutral-900)',borderRadius:'var(--radius-md)',padding:'20px',fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:'var(--green-200)'}}>
<div style={{color:'var(--neutral-400)',marginBottom:8}}># main.py</div>
<div>print(<span style={{color:'var(--gold-300)'}}>"Hello, SabiLearn!"</span>)</div>
</div>
<div style={{display:'flex',gap:12}}>
<Button variant="primary" onClick={()=>setRan(true)}>Run code</Button>
<Button variant="ghost">Reset</Button>
</div>
{ran&&<div style={{background:'var(--neutral-800)',borderRadius:'var(--radius-md)',padding:'16px 20px',fontFamily:'var(--font-mono)',fontSize:'var(--text-sm)',color:'#fff'}}>
<div style={{color:'var(--neutral-400)',marginBottom:6}}>Console</div>
Hello, SabiLearn!
</div>}
<Button variant="primary" size="lg" disabled={!ran}>Next lesson</Button>
</div>;
}
window.CodeLessonScreen=CodeLessonScreen;
