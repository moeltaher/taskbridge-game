import {samples} from '../data/samples.js';

const DATA_TARGETS=[{x:.27,y:.43,w:.34,h:.35},{x:.45,y:.43,w:.34,h:.35},{x:.36,y:.42,w:.34,h:.36}];
const DATA_REGION_X={left:.08,leftCenter:.27,center:.36,rightCenter:.45,right:.58};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export const dataRegionOptions=[
 {id:'left',label:'الجزء الأيسر من الطريق'},
 {id:'leftCenter',label:'بين اليسار والمنتصف'},
 {id:'center',label:'حول منتصف الطريق'},
 {id:'rightCenter',label:'بين المنتصف واليمين'},
 {id:'right',label:'الجزء الأيمن من الطريق'}
];

export const dataSceneDescriptions=[
 'مشهد طريق أفقي بمركبة رئيسية واضحة يبدأ جسمها في الربع الأيسر ويمتد نحو منتصف الصورة.',
 'مشهد طريق أفقي بمركبة رئيسية واضحة يبدأ جسمها قرب منتصف الصورة ويمتد نحو الجهة اليمنى.',
 'مشهد طريق أفقي بمركبة رئيسية باهتة نسبيًا تتمركز حول منتصف الصورة.'
];

export function semanticDataAnswer(sceneIndex,regionId){
 const target=DATA_TARGETS[sceneIndex],x=DATA_REGION_X[regionId];
 if(!target||!Number.isFinite(x))return null;
 return {x,y:target.y,w:target.w,h:target.h,regionId,source:'semantic'};
}

export function acceptanceRate(acceptedOffers,offerDecisions){return offerDecisions?Math.round(acceptedOffers/offerDecisions*100):100}

export function intersectionOverUnion(answer,target){
 if(!answer||typeof answer!=='object'||answer.w*answer.h<.004)return 0;
 const x1=Math.max(answer.x,target.x),y1=Math.max(answer.y,target.y),x2=Math.min(answer.x+answer.w,target.x+target.w),y2=Math.min(answer.y+answer.h,target.y+target.h);
 const intersection=Math.max(0,x2-x1)*Math.max(0,y2-y1);
 return intersection/(answer.w*answer.h+target.w*target.h-intersection||1);
}

export function scoreWork(scenario,answers){
 if(scenario.type==='data')return clamp(Math.round(answers.reduce((sum,answer,index)=>sum+intersectionOverUnion(answer,DATA_TARGETS[index]),0)/DATA_TARGETS.length*100),0,100);
 if(scenario.type==='moderation')return Math.round(answers.reduce((sum,answer,index)=>sum+(answer===samples.moderation[index].hidden),0)/samples.moderation.length*100);
 if(scenario.type==='ai')return Math.round(answers.reduce((sum,answer,index)=>sum+(answer===samples.ai[index].hidden),0)/samples.ai.length*100);
 return Math.round(answers.reduce((sum,answer,index)=>sum+(answer===samples.translation[index].published),0)/samples.translation.length*100);
}

export function firstTaskOutcome(scenario,state){
 const score=scoreWork(scenario,state.workAnswers);
 const quality=clamp(Math.round((state.quality*2+score)/3),0,100);
 const job=state.selectedJob;
 const stressDelta=scenario.type==='moderation'?16:10;
 const stressBefore=state.stress;
 const stressAfter=clamp(stressBefore+stressDelta,0,100);
 return {score,quality,job,stressBefore,stressAfter,stressDelta:stressAfter-stressBefore,changes:{workScore:score,quality,qualityAfterFirstTask:quality,time:state.time+job.duration,paidTime:state.paidTime+job.duration,grossWorker:state.grossWorker+job.pay,clientPaid:state.clientPaid+job.clientValue,jobsDone:state.jobsDone+1,stress:stressAfter,firstTaskStress:{before:stressBefore,after:stressAfter,delta:stressAfter-stressBefore},status:'اكتملت المهمة الأولى',workStep:'result'}};
}
