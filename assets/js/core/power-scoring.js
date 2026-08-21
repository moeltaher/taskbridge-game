import {parties as powerParties} from '../data/parties.js';

export function leaders(values){const max=Math.max(...powerParties.map(party=>Number(values[party]||0)));return powerParties.filter(party=>Number(values[party]||0)===max)}
export function topGroup(values,count=2){const levels=[...new Set(powerParties.map(party=>Number(values[party]||0)))].sort((a,b)=>b-a),cutoff=levels[Math.min(Math.max(count,1)-1,levels.length-1)];return powerParties.filter(party=>Number(values[party]||0)>=cutoff)}
function jaccard(a,b){const aa=new Set(a),bb=new Set(b),union=new Set([...aa,...bb]);if(!union.size)return 0;let overlap=0;aa.forEach(value=>{if(bb.has(value))overlap++});return overlap/union.size}
export function distributionProximity(values,target){const distance=powerParties.reduce((sum,p)=>sum+Math.abs(Number(values[p]||0)-Number(target[p]||0)),0);return Math.max(0,1-distance/200)}
export function powerAxisCredit(values,target){const leaderCredit=jaccard(leaders(values),leaders(target));return .4*leaderCredit+.6*distributionProximity(values,target)}
