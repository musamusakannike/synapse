import React from 'react';
export function Input({label,placeholder,type='text',value,onChange,error,icon}){
const [focus,setFocus]=React.useState(false);
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'6px',fontFamily:'var(--font-body)'}},
label&&React.createElement('label',{style:{fontSize:'var(--text-sm)',fontWeight:'var(--weight-semibold)',color:'var(--text-primary)'}},label),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'12px 16px',borderRadius:'var(--radius-md)',border:'1px solid '+(error?'var(--color-error)':focus?'var(--border-focus)':'var(--border-default)'),background:'var(--surface-card)',boxShadow:focus?'var(--shadow-focus)':'none',transition:'box-shadow var(--dur-fast) var(--ease-standard)'}},
icon&&React.createElement('i',{className:'lucide lucide-'+icon,'data-lucide':icon,style:{width:18,height:18,color:'var(--text-muted)'}}),
React.createElement('input',{type,placeholder,value,onChange,onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),style:{border:'none',outline:'none',flex:1,fontSize:'var(--text-base)',fontFamily:'var(--font-body)',background:'transparent',color:'var(--text-primary)'}})),
error&&React.createElement('span',{style:{fontSize:'var(--text-xs)',color:'var(--color-error)'}},error));
}
