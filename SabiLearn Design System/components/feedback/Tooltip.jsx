import React from 'react';
export function Tooltip({children,label}){
const [show,setShow]=React.useState(false);
return React.createElement('span',{style:{position:'relative',display:'inline-block'},onMouseEnter:()=>setShow(true),onMouseLeave:()=>setShow(false)},
children,
show&&React.createElement('span',{style:{position:'absolute',bottom:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',background:'var(--neutral-900)',color:'#fff',padding:'6px 10px',borderRadius:'var(--radius-sm)',fontSize:'var(--text-xs)',fontFamily:'var(--font-body)',whiteSpace:'nowrap',boxShadow:'var(--shadow-md)'}},label));
}
