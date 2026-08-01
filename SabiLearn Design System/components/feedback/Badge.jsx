import React from 'react';
const tones={neutral:{bg:'var(--neutral-100)',fg:'var(--neutral-700)'},success:{bg:'var(--color-success-soft)',fg:'var(--color-success)'},warning:{bg:'var(--color-warning-soft)',fg:'var(--gold-600)'},error:{bg:'var(--color-error-soft)',fg:'var(--color-error)'},info:{bg:'var(--color-info-soft)',fg:'var(--color-info)'}};
export function Badge({children,tone='neutral'}){
const t=tones[tone]||tones.neutral;
return React.createElement('span',{style:{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'var(--radius-pill)',background:t.bg,color:t.fg,fontFamily:'var(--font-body)',fontWeight:'var(--weight-semibold)',fontSize:'var(--text-xs)'}},children);
}
