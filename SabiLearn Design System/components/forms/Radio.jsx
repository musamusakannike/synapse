import React from 'react';
export function Radio({label,checked,onChange}){
return React.createElement('label',{style:{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-base)',color:'var(--text-primary)'}},
React.createElement('span',{onClick:()=>onChange&&onChange(),style:{width:20,height:20,borderRadius:'50%',border:'2px solid '+(checked?'var(--color-primary)':'var(--border-strong)'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
checked&&React.createElement('span',{style:{width:10,height:10,borderRadius:'50%',background:'var(--color-primary)'}})),
label);
}
