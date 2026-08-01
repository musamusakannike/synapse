import React from 'react';
export function Tag({children,selected=false,onClick}){
return React.createElement('button',{onClick,style:{padding:'8px 16px',borderRadius:'var(--radius-pill)',border:'1px solid '+(selected?'var(--color-primary)':'var(--border-default)'),background:selected?'var(--green-50)':'var(--surface-card)',color:selected?'var(--color-primary-active)':'var(--text-secondary)',fontFamily:'var(--font-body)',fontWeight:'var(--weight-medium)',fontSize:'var(--text-sm)',cursor:'pointer',transition:'all var(--dur-fast) var(--ease-standard)'}},children);
}
