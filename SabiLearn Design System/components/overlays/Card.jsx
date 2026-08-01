import React from 'react';
export function Card({children,interactive=false,style}){
const [hover,setHover]=React.useState(false);
return React.createElement('div',{onMouseEnter:()=>interactive&&setHover(true),onMouseLeave:()=>interactive&&setHover(false),
style:{background:'var(--surface-card)',borderRadius:'var(--radius-md)',boxShadow:hover?'var(--shadow-md)':'var(--shadow-sm)',padding:'var(--space-6)',transition:'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',transform:hover?'translateY(-2px)':'none',cursor:interactive?'pointer':'default',...style}
},children);
}
