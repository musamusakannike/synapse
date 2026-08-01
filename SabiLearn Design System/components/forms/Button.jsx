import React from 'react';
const sizes={sm:{padding:'8px 14px',font:'var(--text-sm)'},md:{padding:'12px 20px',font:'var(--text-base)'},lg:{padding:'16px 28px',font:'var(--text-md)'}};
const variants={
primary:{background:'var(--color-primary)',color:'var(--text-inverse)',border:'none'},
'primary-hover':{background:'var(--color-primary-hover)'},
secondary:{background:'var(--green-50)',color:'var(--color-primary-active)',border:'none'},
'secondary-hover':{background:'var(--green-100)'},
ghost:{background:'transparent',color:'var(--text-primary)',border:'1px solid var(--border-default)'},
'ghost-hover':{background:'var(--surface-sunken)'},
accent:{background:'var(--color-accent)',color:'var(--neutral-900)',border:'none'},
'accent-hover':{background:'var(--color-accent-hover)'}
};
export function Button({children,variant='primary',size='md',disabled=false,onClick,style}){
const s=sizes[size]||sizes.md;const v=variants[variant]||variants.primary;
const [hover,setHover]=React.useState(false);
const hv=variants[variant+'-hover']||{};
return React.createElement('button',{
onClick:disabled?undefined:onClick,
onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),
disabled,
style:{...s,...v,...(hover&&!disabled?hv:{}),fontFamily:'var(--font-body)',fontWeight:'var(--weight-semibold)',borderRadius:'var(--radius-pill)',cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,transition:'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',transform:hover&&!disabled?'scale(0.98)':'scale(1)',...style}
},children);
}
