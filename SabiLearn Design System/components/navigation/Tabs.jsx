import React from 'react';
export function Tabs({tabs=[],active,onChange}){
return React.createElement('div',{style:{display:'flex',gap:'var(--space-6)',borderBottom:'1px solid var(--border-default)',fontFamily:'var(--font-body)'}},
tabs.map((t,i)=>React.createElement('button',{key:i,onClick:()=>onChange&&onChange(t),style:{background:'none',border:'none',padding:'12px 2px',fontSize:'var(--text-base)',fontWeight:active===t?'var(--weight-bold)':'var(--weight-medium)',color:active===t?'var(--color-primary-active)':'var(--text-secondary)',borderBottom:'3px solid '+(active===t?'var(--color-primary)':'transparent'),cursor:'pointer',marginBottom:-1}},t)));
}
