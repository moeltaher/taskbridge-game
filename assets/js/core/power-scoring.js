export const powerParties=['worker','platform','client','mediator'];
export function leaders(v){const m=Math.max(...powerParties.map(p=>Number(v[p]||0)));return powerParties.filter(p=>Number(v[p]||0)===m)}
export function topGroup(v,count=2){const values=[...new Set(powerParties.map(p=>Number(v[p]||0)))].sort((a,b)=>b-a),cutoff=values[Math.min(Math.max(count,1)-1,values.length-1)];return powerParties.filter(p=>Number(v[p]||0)>=cutoff)}
function sameSet(a,b){return a.length===b.length&&a.every(x=>b.includes(x))}
function jaccard(a,b){const aa=new Set(a),bb=new Set(b),union=new Set([...aa,...bb]);if(!union.size)return 0;let overlap=0;aa.forEach(x=>{if(bb.has(x))overlap++});return overlap/union.size}
export function powerAxisCredit(v,target){const userLeaders=leaders(v),refLeaders=leaders(target),leaderMatch=sameSet(userLeaders,refLeaders),topOverlap=jaccard(topGroup(v,2),topGroup(target,2));return (leaderMatch?.65:0)+.35*topOverlap}
