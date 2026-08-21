export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function disputeSeverityFromScore(score){return score>=85?0:score>=60?1:2}

export function disputeConsequences(state,severity,appeal=false){let hold=0,penalty=0;if(severity===1){hold=Math.min(.45,Number(state.grossWorker||0)*.10);penalty=4}else if(severity>=2){hold=Math.min(.9,Number(state.grossWorker||0)*.18);penalty=9}if(appeal&&penalty>0)penalty=Math.ceil(penalty*.6);return {hold,penalty}}

export function applyDisputeOutcome(state){const qualityBefore=state.qualityBeforeDispute??state.quality,accessBefore=state.access,consequences=disputeConsequences(state,state.disputeSeverity,state.appealed),qualityAfter=clamp(qualityBefore-consequences.penalty,0,100),accessAfter=clamp(accessBefore-consequences.penalty,0,100);return {consequences,qualityBefore,accessBefore,qualityAfter,accessAfter,changes:{hold:consequences.hold,quality:qualityAfter,access:accessAfter,qualityBeforeDispute:qualityBefore,disputeFinalized:true,stage:6,status:'قيد التسوية',payment:null}}}

export function appealCostChanges(state){return {appealCost:{minutes:APPEAL_TIME_MINUTES,stress:APPEAL_STRESS},time:state.time+APPEAL_TIME_MINUTES,extraWorkTime:Number(state.extraWorkTime||0)+APPEAL_TIME_MINUTES,stress:clamp(state.stress+APPEAL_STRESS,0,100)}}

export function publishedTranslationText(sample){const key=String(sample?.published||'A').toLowerCase();return sample?.[key]??sample?.a??''}
