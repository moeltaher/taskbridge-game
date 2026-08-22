import {parties as powerParties} from '../data/parties.js';

export function leaders(values){
 const max=Math.max(...powerParties.map(party=>Number(values?.[party]||0)));
 return powerParties.filter(party=>Number(values?.[party]||0)===max);
}
export function secondTier(values){
 const first=new Set(leaders(values));
 const remaining=powerParties.filter(party=>!first.has(party));
 if(!remaining.length)return [];
 const max=Math.max(...remaining.map(party=>Number(values?.[party]||0)));
 return remaining.filter(party=>Number(values?.[party]||0)===max);
}
function jaccard(a,b){
 const aa=new Set(a),bb=new Set(b),union=new Set([...aa,...bb]);
 if(!union.size)return 1;
 let overlap=0;
 aa.forEach(value=>{if(bb.has(value))overlap++});
 return overlap/union.size;
}
export function powerAxisCredit(values,reference){
 const primary=reference?.primary||[];
 if(!primary.length)return 0;
 const primaryCredit=jaccard(leaders(values),primary);
 const secondary=reference?.secondary||[];
 if(!secondary.length)return primaryCredit;
 const secondaryCredit=jaccard(secondTier(values),secondary);
 return .7*primaryCredit+.3*secondaryCredit;
}
