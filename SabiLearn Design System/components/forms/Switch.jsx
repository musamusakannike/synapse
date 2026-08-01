import React from 'react';
export function Switch({checked,onChange}){
return React.createElement('span',{onClick:()=>onChange&&onChange(!checked),style:{width:44,height:26,borderRadius:'var(--radius-pill)',background:checked?'var(--color-primary)':'var(--neutral-300)',padding:3,display:'inline-flex',cursor:'pointer',transition:'background var(--dur-fast) var(--ease-standard)',boxSizing:'border-box'}},
React.createElement('span',{style:{width:20,height:20,borderRadius:'50%',background:'#fff',transform:checked?'translateX(18px)':'translateX(0)',transition:'transform var(--dur-fast) var(--ease-standard)',boxShadow:'var(--shadow-sm)'}}));
}
