import React from 'react';
export function Checkbox({label,checked,onChange}){
return React.createElement('label',{style:{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-base)',color:'var(--text-primary)'}},
React.createElement('span',{onClick:()=>onChange&&onChange(!checked),style:{width:20,height:20,borderRadius:'6px',border:'2px solid '+(checked?'var(--color-primary)':'var(--border-strong)'),background:checked?'var(--color-primary)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',transition:'background var(--dur-fast) var(--ease-standard)',flexShrink:0}},
checked&&React.createElement('i',{className:'lucide lucide-check','data-lucide':'check',style:{width:13,height:13,color:'#fff'}})),
label);
}
