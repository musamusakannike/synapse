import React from 'react';
const tones={success:{bg:'var(--green-800)',icon:'check-circle'},info:{bg:'var(--neutral-800)',icon:'info'},error:{bg:'var(--color-error)',icon:'alert-circle'}};
export function Toast({children,tone='success'}){
const t=tones[tone]||tones.success;
return React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:'10px',padding:'14px 20px',borderRadius:'var(--radius-md)',background:t.bg,color:'#fff',fontFamily:'var(--font-body)',fontWeight:'var(--weight-semibold)',fontSize:'var(--text-sm)',boxShadow:'var(--shadow-lg)'}},
React.createElement('i',{className:'lucide lucide-'+t.icon,'data-lucide':t.icon,style:{width:18,height:18}}),children);
}
