function LanguagePicker({onPick}){
const langs=[{name:'Python',icon:'file-code',color:'var(--green-500)'},{name:'JavaScript',icon:'file-code',color:'var(--gold-500)'},{name:'Java',icon:'file-code',color:'var(--color-info)'},{name:'HTML/CSS',icon:'file-code',color:'var(--red-500)'}];
return <div style={{maxWidth:640,margin:'0 auto',padding:'48px 24px',display:'flex',flexDirection:'column',gap:24}}>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'var(--text-2xl)',color:'var(--text-primary)'}}>Pick a language</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
{langs.map((l,i)=><div key={i} onClick={()=>onPick(l.name)} style={{background:'var(--surface-card)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-sm)',padding:'24px',display:'flex',flexDirection:'column',gap:12,cursor:'pointer'}}>
<div style={{width:44,height:44,borderRadius:'var(--radius-md)',background:'var(--surface-sunken)',display:'flex',alignItems:'center',justifyContent:'center'}}>
<i className={'lucide lucide-'+l.icon} data-lucide={l.icon} style={{width:22,height:22,color:l.color}}></i>
</div>
<div style={{fontWeight:700,color:'var(--text-primary)',fontFamily:'var(--font-display)'}}>{l.name}</div>
</div>)}
</div>
</div>;
}
window.LanguagePicker=LanguagePicker;
