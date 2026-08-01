import React from 'react';
export function XPPill({amount,delta=false}){
return React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'var(--green-50)',color:'var(--color-primary-active)',padding:'8px 16px',borderRadius:'var(--radius-pill)',fontFamily:'var(--font-body)',fontWeight:'var(--weight-bold)',fontSize:'var(--text-sm)'}},
React.createElement('i',{className:'lucide lucide-zap','data-lucide':'zap',style:{width:16,height:16}}),(delta?'+':'')+amount+' XP');
}
