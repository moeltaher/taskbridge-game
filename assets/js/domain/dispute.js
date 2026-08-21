export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;

export function disputeSeverityFromScore(score){return score>=85?0:score>=60?1:2}

export function disputeConsequences(state,severity,appeal=false){
 let hold=0,penalty=0;
 if(severity===1){hold=Math.min(.45,Number(state.grossWorker||0)*.10);penalty=4}
 else if(severity>=2){hold=Math.min(.9,Number(state.grossWorker||0)*.18);penalty=9}
 if(appeal&&penalty>0)penalty=Math.ceil(penalty*.6);
 return {hold,penalty};
}

export function publishedTranslationText(sample){
 const key=String(sample?.published||'A').toLowerCase();
 return sample?.[key]??sample?.a??'';
}
