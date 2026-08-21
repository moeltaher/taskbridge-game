import {parties as powerParties} from '../data/parties.js';

export function leaders(values){const max=Math.max(...powerParties.map(party=>Number(values[party]||0)));return powerParties.filter(party=>Number(values[party]||0)===max)}
export function topGroup(values,count=2){const levels=[...new Set(powerParties.map(party=>Number(values[party]||0)))].sort((a,b)=>b-a),cutoff=levels[Math.min(Math.max(count,1)-1,levels.length-1)];return powerParties.filter(party=>Number(values[party]||0)>=cutoff)}
function sameSet(a,b){return a.length===b.length&&a.every(value=>b.includes(value))}
function jaccard(a,b){const aa=new Set(a),bb=new Set(b),union=new Set([...aa,...bb]);if(!union.size)return 0;let overlap=0;aa.forEach(value=>{if(bb.has(value))overlap++});return overlap/union.size}
export function powerAxisCredit(values,target){const userLeaders=leaders(values),referenceLeaders=leaders(target),leaderMatch=sameSet(userLeaders,referenceLeaders),topOverlap=jaccard(topGroup(values,2),topGroup(target,2));return (leaderMatch?.65:0)+.35*topOverlap}
