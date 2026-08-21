import {acceptanceRate} from './work.js';

export const SECOND_TASK_ACCESS_BONUS=5;
const SECOND_TASK_PREMIUM_STRESS=12;
const SECOND_TASK_STANDARD_STRESS=9;
export const BREAK_MINUTES=1;
export const BREAK_STRESS_REDUCTION=10;

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function secondTaskStressDelta(offer){return offer.premium?SECOND_TASK_PREMIUM_STRESS:SECOND_TASK_STANDARD_STRESS}

export function computeManagedAccess(scenario,state){
 let qualityWeight=.60,acceptanceWeight=.30,base=10;
 if(scenario.type==='translation'){qualityWeight=.42;acceptanceWeight=.18;base=28}
 else if(scenario.type==='moderation'){qualityWeight=.62;acceptanceWeight=.28}
 else if(scenario.type==='ai'){qualityWeight=.55;acceptanceWeight=.25}
 return clamp(Math.round(base+state.quality*qualityWeight+state.acceptance*acceptanceWeight),35,95);
}

export function buildSecondOffer(scenario,access){return access>=80?{title:'دفعة مميزة إضافية',pay:3.85,duration:18,clientValue:Math.max(7.5,scenario.clientPay*1.2),premium:true}:{title:'دفعة إضافية',pay:1.8,duration:11,clientValue:Math.max(3.2,scenario.clientPay*.55),premium:false}}

export function secondOfferDecision(state,accepted){
 const offer=state.secondOffer,before={acceptance:state.acceptance,access:state.access,stress:state.stress};
 const offerDecisions=state.offerDecisions+1,acceptedOffers=state.acceptedOffers+(accepted?1:0),rejections=state.rejections+(accepted?0:1),acceptance=acceptanceRate(acceptedOffers,offerDecisions);
 return {offerDecisions,acceptedOffers,rejections,acceptance,result:{accepted,completed:false,title:offer.title,pay:offer.pay,duration:offer.duration,beforeAcceptance:before.acceptance,afterAcceptance:acceptance,beforeAccess:before.access,afterAccess:before.access,beforeStress:before.stress,afterStress:before.stress}};
}

export function completeSecondTask(state){
 const offer=state.secondOffer,decision=state.offerDecisionResult,stressDelta=secondTaskStressDelta(offer),afterAccess=clamp(state.access+SECOND_TASK_ACCESS_BONUS,0,100),afterStress=clamp(state.stress+stressDelta,0,100);
 return {stressDelta,changes:{grossWorker:state.grossWorker+offer.pay,clientPaid:state.clientPaid+offer.clientValue,time:state.time+offer.duration,paidTime:state.paidTime+offer.duration,stress:afterStress,access:afterAccess,offerDecisionResult:{...decision,completed:true,afterAccess,afterStress},managementStep:'offerResult',status:'اكتملت المهمة الثانية'}};
}

export function monitorDecision(state,takeBreak){const before=state.stress,after=takeBreak?clamp(before-BREAK_STRESS_REDUCTION,0,100):before;return {tookBreak:takeBreak,stressBefore:before,stressAfter:after,stressDelta:after-before,timeDelta:takeBreak?BREAK_MINUTES:0,breakDelta:takeBreak?BREAK_MINUTES:0}}
