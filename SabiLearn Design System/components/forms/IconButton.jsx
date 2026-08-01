import React from 'react';
export function IconButton({icon,size=20,variant='ghost',onClick,'aria-label':ariaLabel}){
const bg=variant==='filled'?'var(--color-primary)':'transparent';
const color=variant==='filled'?'var(--text-inverse)':'var(--text-primary)';
const [hover,setHover]=React.useState(false);
return React.createElement('button',{onClick,'aria-label':ariaLabel,onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),
style:{width:size+20,height:size+20,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',border:'none',background:hover?(variant==='filled'?'var(--color-primary-hover)':'var(--surface-sunken)'):bg,color,cursor:'pointer',transition:'background var(--dur-fast) var(--ease-standard)'}
},React.createElement('i',{className:'lucide lucide-'+icon,style:{width:size,height:size,display:'inline-block'},'data-lucide':icon}));
}
