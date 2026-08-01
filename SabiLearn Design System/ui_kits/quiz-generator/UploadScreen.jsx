function UploadScreen({onGenerate}){
const {Button}=window.SabiLearnDesignSystem_2488a4;
const [file,setFile]=React.useState(null);
return <div style={{maxWidth:480,margin:'0 auto',padding:'64px 24px',display:'flex',flexDirection:'column',gap:24,alignItems:'center',textAlign:'center'}}>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'var(--text-2xl)',color:'var(--text-primary)'}}>Turn any note into a quiz</div>
<p style={{color:'var(--text-secondary)',fontSize:'var(--text-base)'}}>Upload a PDF, Word doc, or photo of your notes.</p>
<div onClick={()=>setFile('Biology_Chapter4.pdf')} style={{width:'100%',border:'2px dashed var(--border-strong)',borderRadius:'var(--radius-lg)',padding:'40px 20px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:12,background:'var(--surface-card)'}}>
<i className="lucide lucide-upload-cloud" data-lucide="upload-cloud" style={{width:36,height:36,color:'var(--color-primary)'}}></i>
<div style={{fontWeight:600,color:'var(--text-primary)'}}>{file?file:'Click to upload a document'}</div>
<div style={{fontSize:'var(--text-sm)',color:'var(--text-muted)'}}>PDF, DOCX, JPG up to 20MB</div>
</div>
<Button variant="primary" size="lg" disabled={!file} onClick={onGenerate} style={{width:'100%'}}>Generate quiz</Button>
</div>;
}
window.UploadScreen=UploadScreen;
