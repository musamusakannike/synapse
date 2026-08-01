import React from 'react';
export function StreakBadge({days=0}){
return React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:'6px',background:'var(--gold-50)',color:'var(--gold-600)',padding:'8px 16px',borderRadius:'var(--radius-pill)',fontFamily:'var(--font-body)',fontWeight:'var(--weight-bold)',fontSize:'var(--text-sm)'}},
React.createElement('i',{className:'lucide lucide-flame','data-lucide':'flame',style:{width:16,height:16}}),days+'-day streak');
}
