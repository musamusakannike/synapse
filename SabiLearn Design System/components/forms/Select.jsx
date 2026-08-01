import React from 'react';
export function Select({label,options=[],value,onChange}){
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'6px',fontFamily:'var(--font-body)'}},
label&&React.createElement('label',{style:{fontSize:'var(--text-sm)',fontWeight:'var(--weight-semibold)',color:'var(--text-primary)'}},label),
React.createElement('select',{value,onChange,style:{padding:'12px 16px',borderRadius:'var(--radius-md)',border:'1px solid var(--border-default)',background:'var(--surface-card)',fontSize:'var(--text-base)',fontFamily:'var(--font-body)',color:'var(--text-primary)',outline:'none'}},
options.map((o,i)=>React.createElement('option',{key:i,value:o.value||o},o.label||o))));
}
