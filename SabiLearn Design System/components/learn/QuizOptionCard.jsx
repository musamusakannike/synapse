import React from 'react';
export function QuizOptionCard({label,state='default',onClick}){
const styles={
default:{border:'2px solid var(--border-default)',background:'var(--surface-card)',color:'var(--text-primary)'},
selected:{border:'2px solid var(--color-primary)',background:'var(--green-50)',color:'var(--color-primary-active)'},
correct:{border:'2px solid var(--color-success)',background:'var(--color-success-soft)',color:'var(--color-success)'},
incorrect:{border:'2px solid var(--color-error)',background:'var(--color-error-soft)',color:'var(--color-error)'}
};
const s=styles[state]||styles.default;
return React.createElement('button',{onClick,style:{...s,width:'100%',textAlign:'left',padding:'16px 20px',borderRadius:'var(--radius-md)',fontFamily:'var(--font-body)',fontWeight:'var(--weight-medium)',fontSize:'var(--text-base)',cursor:'pointer',transition:'all var(--dur-fast) var(--ease-standard)'}},label);
}
