export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function disputeSeverityFromScore(score){return score>=85?0:score>=60?1:2}
export function reviewedSeverity(initialSeverity,appealed){return appealed&&initialSeverity>0?initialSeverity-1:initialSeverity}
export function disputeConsequences(state,severity){let hold=0,penalty=0;if(severity===1){hold=Math.min(.45,Number(state.grossWorker||0)*.10);penalty=4}else if(severity>=2){hold=Math.min(.9,Number(state.grossWorker||0)*.18);penalty=9}return {hold,penalty}}
export function applyDisputeOutcome(state){const qualityBefore=state.qualityBeforeDispute??state.quality,initialSeverity=Number(state.initialReviewSeverity??state.disputeSeverity??0),finalSeverity=reviewedSeverity(initialSeverity,state.appealed===true),consequences=disputeConsequences(state,finalSeverity),qualityAfter=clamp(qualityBefore-consequences.penalty,0,100);return {consequences,initialSeverity,finalSeverity,qualityBefore,qualityAfter,changes:{hold:consequences.hold,quality:qualityAfter,initialReviewSeverity:initialSeverity,finalReviewSeverity:finalSeverity,disputeSeverity:finalSeverity,qualityBeforeDispute:qualityBefore,disputeFinalized:true,stage:6,status:'قيد التسوية',payment:null}}}
export function appealCostChanges(state){return {appealCost:{minutes:APPEAL_TIME_MINUTES,stress:APPEAL_STRESS},time:state.time+APPEAL_TIME_MINUTES,extraWorkTime:Number(state.extraWorkTime||0)+APPEAL_TIME_MINUTES,stress:clamp(state.stress+APPEAL_STRESS,0,100)}}
export function publishedTranslationText(sample){const key=String(sample?.preferred||'A').toLowerCase();return sample?.[key]??sample?.a??''}
