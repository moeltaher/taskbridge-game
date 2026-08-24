import {acceptanceRate,scoreWork,qualityAfterTask,taskRecord,nextSampleIndexes} from './work.js';
export const BREAK_MINUTES=3;
export const BREAK_STRESS_REDUCTION=8;
export const SECOND_OFFER_DECISION_MINUTES=2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function baselineAcceptanceRate(state){return acceptanceRate(Number(state.baselineAcceptedOffers||0),Number(state.baselineOfferDecisions||0))}
export function computeManagedAccess(scenario,state){
 const initialQuality=Number(state.initialQuality??85);
 const quality=Number(state.quality??initialQuality);
 const performanceDelta=Math.round((quality-initialQuality)*2);
 const baseline=baselineAcceptanceRate(state);
 const acceptanceDelta=Math.round((Number(state.acceptance??baseline)-baseline)*.3);
 return clamp(Number(scenario.initial.access)+performanceDelta+acceptanceDelta,35,95);
}
export function premiumSampleCount(scenario){return scenario.type==='data'?3:5}
export function buildSecondOffer(scenario,access){
 const premium=access>=scenario.accessPolicy.premiumAt;
 return premium?
  {id:'second-premium',title:'دفعة مميزة إضافية',pay:3.85,duration:18,clientValue:Math.max(7.5,scenario.clientPay*1.2),premium:true,sampleCount:premiumSampleCount(scenario),stress:scenario.jobStress.premium}:
  {id:'second-standard',title:'دفعة إضافية',pay:1.8,duration:11,clientValue:Math.max(3.2,scenario.clientPay*.55),premium:false,sampleCount:2,stress:Math.max(4,Math.round((scenario.jobStress.micro+scenario.jobStress.core)/2))};
}
export function secondOfferDecision(state,accepted){
 const offer=state.secondOffer,before={acceptance:state.acceptance,stress:state.stress};
 const offerDecisions=state.offerDecisions+1,acceptedOffers=state.acceptedOffers+(accepted?1:0),rejections=state.rejections+(accepted?0:1);
 const acceptance=acceptanceRate(acceptedOffers,offerDecisions);
 return {offerDecisions,acceptedOffers,rejections,acceptance,time:Number(state.time||0)+SECOND_OFFER_DECISION_MINUTES,marketTime:Number(state.marketTime||0)+SECOND_OFFER_DECISION_MINUTES,result:{accepted,completed:false,title:offer.title,pay:offer.pay,duration:offer.duration,beforeAcceptance:before.acceptance,afterAcceptance:acceptance,beforeStress:before.stress,afterStress:before.stress,decisionMinutes:SECOND_OFFER_DECISION_MINUTES}};
}
export function prepareSecondTask(state){return nextSampleIndexes(state,state.secondOffer.sampleCount)}
export function completeSecondTask(scenario,state){
 const offer=state.secondOffer,decision=state.offerDecisionResult,indexes=state.currentTaskSampleIndexes||nextSampleIndexes(state,offer.sampleCount);
 const score=scoreWork(scenario,state.secondTaskAnswers,{sampleIndexes:indexes}),qualityBefore=state.quality,quality=qualityAfterTask(qualityBefore,score);
 const stressBefore=Number(state.stress||0),afterStress=clamp(stressBefore+Number(offer.stress||0),0,100),stressDelta=afterStress-stressBefore;
 const record=taskRecord({id:'task-2',job:offer,sampleIndexes:indexes,answers:state.secondTaskAnswers,score,qualityBefore,qualityAfter:quality,stressDelta});
 return {stressDelta,score,record,changes:{grossWorker:state.grossWorker+offer.pay,clientPaid:state.clientPaid+offer.clientValue,time:state.time+offer.duration,paidTime:state.paidTime+offer.duration,stress:afterStress,quality,completedTasks:[...(state.completedTasks||[]),record],sampleCursor:Number(state.sampleCursor||0)+indexes.length,offerDecisionResult:{...decision,completed:true,afterStress,score,qualityBefore,qualityAfter:quality},managementStep:'offerResult',status:'اكتملت المهمة الثانية'}};
}
export function monitorDecision(state,takeBreak){
 const before=state.stress,after=takeBreak?clamp(before-BREAK_STRESS_REDUCTION,0,100):before;
 return {tookBreak:takeBreak,stressBefore:before,stressAfter:after,stressDelta:after-before,timeDelta:takeBreak?BREAK_MINUTES:0,breakDelta:takeBreak?BREAK_MINUTES:0};
}
