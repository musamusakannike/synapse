import React from 'react';
export function LessonCard({title,meta,progress=0,locked=false,onClick}){
return React.createElement('div',{onClick:locked?undefined:onClick,style:{background:'var(--surface-card)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-sm)',padding:'var(--space-5)',display:'flex',flexDirection:'column',gap:'var(--space-2)',cursor:locked?'default':'pointer',opacity:locked?0.55:1,fontFamily:'var(--font-body)',minWidth:220}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
React.createElement('div',{style:{width:40,height:40,borderRadius:'50%',background:'var(--green-50)',display:'flex',alignItems:'center',justifyContent:'center'}},
React.createElement('i',{className:'lucide lucide-'+(locked?'lock':'book-open'),'data-lucide':locked?'lock':'book-open',style:{width:18,height:18,color:'var(--color-primary)'}}))),
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:'var(--weight-bold)',fontSize:'var(--text-md)',color:'var(--text-primary)'}},title),
React.createElement('div',{style:{fontSize:'var(--text-sm)',color:'var(--text-secondary)'}},meta),
!locked&&React.createElement('div',{style:{height:8,borderRadius:'var(--radius-pill)',background:'var(--neutral-100)',overflow:'hidden',marginTop:4}},
React.createElement('div',{style:{width:progress+'%',height:'100%',background:'var(--color-primary)'}})));
}
