function Header(){
const {Button}=window.SabiLearnDesignSystem_2488a4;
return <header style={{position:'sticky',top:0,zIndex:10,background:'var(--surface-card)',borderBottom:'1px solid var(--border-default)',padding:'16px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',fontFamily:'var(--font-body)'}}>
<div style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:22,color:'var(--color-primary-active)'}}>Sabi<span style={{color:'var(--gold-500)'}}>Learn</span></div>
<nav style={{display:'flex',gap:32,fontSize:15,fontWeight:600,color:'var(--text-secondary)'}}>
<a href="#" style={{color:'var(--text-secondary)'}}>Quiz Generator</a>
<a href="#" style={{color:'var(--text-secondary)'}}>Courses</a>
<a href="#" style={{color:'var(--text-secondary)'}}>Learn to Code</a>
</nav>
<div style={{display:'flex',gap:12}}>
<Button variant="ghost" size="sm">Log in</Button>
<Button variant="primary" size="sm">Get started</Button>
</div>
</header>;
}
window.Header=Header;
