import React from 'react';
export function ProgressBar({value=0,tone='primary'}){
const color=tone==='accent'?'var(--color-accent)':'var(--color-primary)';
return React.createElement('div',{style:{width:'100%',height:'10px',borderRadius:'var(--radius-pill)',background:'var(--neutral-100)',overflow:'hidden'}},
React.createElement('div',{style:{width:Math.max(0,Math.min(100,value))+'%',height:'100%',background:color,borderRadius:'var(--radius-pill)',transition:'width var(--dur-slow) var(--ease-standard)'}}));
}
