import React from 'react';
export function Dialog({open,onClose,title,children}){
if(!open)return null;
return React.createElement('div',{style:{position:'fixed',inset:0,background:'var(--surface-overlay)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}},
React.createElement('div',{style:{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)',padding:'var(--space-8)',maxWidth:420,width:'90%',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'var(--space-4)'}},
React.createElement('h3',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-xl)',color:'var(--text-primary)'}},title),
React.createElement('button',{onClick:onClose,style:{border:'none',background:'transparent',cursor:'pointer',fontSize:20,color:'var(--text-muted)'}},'\u00d7')),
children));
}
