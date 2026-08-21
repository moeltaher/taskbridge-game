import {samples} from '../data/samples.js';

const DATA_TARGETS=[{x:.27,y:.43,w:.34,h:.35},{x:.45,y:.43,w:.34,h:.35},{x:.36,y:.42,w:.34,h:.36},{x:.18,y:.44,w:.32,h:.34},{x:.50,y:.42,w:.31,h:.36},{x:.31,y:.45,w:.35,h:.33}];
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
 'مشهد طريق أفقي بمركبة رئيسية باهتة نسبيًا تتمركز حول منتصف الصورة.',
 'مشهد طريق أفقي بمركبة رئيسية أقرب إلى الجهة اليسرى، وجزء من ظلها يمتد إلى المنتصف.',
 'مشهد طريق أفقي بمركبة رئيسية على يمين المنتصف مع جسم قصير نسبيًا.',
 'مشهد طريق أفقي بمركبة رئيسية عريضة حول منتصف الطريق.'
];

export function samplePoolSize(type){return type==='data'?DATA_TARGETS.length:(samples[type]?.length||0)}
function seededRandom(seed){let x=(Number(seed)||1)>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
export function createSampleSequence(type,seed=1){const arr=Array.from({length:samplePoolSize(type)},(_,i)=>i),rand=seededRandom(seed);for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
export function nextSampleIndexes(state,count){const seq=state.sampleSequence||[],cursor=Number(state.sampleCursor||0);return seq.slice(cursor,cursor+count)}
export function semanticDataAnswer(sceneIndex,regionId){const target=DATA_TARGETS[sceneIndex],x=DATA_REGION_X[regionId];if(!target||!Number.isFinite(x))return null;return {x,y:target.y,w:target.w,h:target.h,regionId,source:'semantic'}}
export function acceptanceRate(acceptedOffers,offerDecisions){return offerDecisions?Math.round(acceptedOffers/offerDecisions*100):100}
export function intersectionOverUnion(answer,target){if(!answer||typeof answer!=='object'||answer.w*answer.h<.004)return 0;const x1=Math.max(answer.x,target.x),y1=Math.max(answer.y,target.y),x2=Math.min(answer.x+answer.w,target.x+target.w),y2=Math.min(answer.y+answer.h,target.y+target.h);const intersection=Math.max(0,x2-x1)*Math.max(0,y2-y1);return intersection/(answer.w*answer.h+target.w*target.h-intersection||1)}
export function answerCredit(sample,answer){if(answer===sample?.preferred)return 1;if(sample?.acceptable?.includes(answer))return .85;return 0}
export function scoreWork(scenario,answers,{offset=0,sampleIndexes=null}={}){const count=Math.max(1,answers.length),indexes=sampleIndexes||Array.from({length:answers.length},(_,i)=>i+offset);if(scenario.type==='data')return clamp(Math.round(answers.reduce((sum,answer,index)=>sum+intersectionOverUnion(answer,DATA_TARGETS[indexes[index]]),0)/count*100),0,100);return Math.round(answers.reduce((sum,answer,index)=>sum+answerCredit(samples[scenario.type][indexes[index]],answer),0)/count*100)}
export function qualityAfterTask(currentQuality,score){return clamp(Math.round((Number(currentQuality)*2+Number(score))/3),0,100)}
export function taskRecord({id,job,sampleIndexes,answers,score,qualityBefore,qualityAfter,stressDelta}){return {id,jobId:job.id||id,title:job.title,sampleIndexes:[...sampleIndexes],answers:structuredClone(answers),score,pay:Number(job.pay),clientValue:Number(job.clientValue),duration:Number(job.duration),stressDelta:Number(stressDelta||0),qualityBefore:Number(qualityBefore),qualityAfter:Number(qualityAfter)}}
export function firstTaskOutcome(scenario,state){const indexes=state.currentTaskSampleIndexes?.length?state.currentTaskSampleIndexes:Array.from({length:state.workAnswers.length},(_,i)=>i),score=scoreWork(scenario,state.workAnswers,{sampleIndexes:indexes}),qualityBefore=state.quality,quality=qualityAfterTask(qualityBefore,score),job=state.selectedJob,stressDelta=Number(job.stress??scenario.jobStress?.[job.id]??(scenario.type==='moderation'?16:10)),stressBefore=state.stress,stressAfter=clamp(stressBefore+stressDelta,0,100),record=taskRecord({id:'task-1',job,sampleIndexes:indexes,answers:state.workAnswers,score,qualityBefore,qualityAfter:quality,stressDelta:stressAfter-stressBefore});return {score,job,record,stressDelta:stressAfter-stressBefore,changes:{workScore:score,quality,qualityAfterFirstTask:quality,time:state.time+job.duration,paidTime:state.paidTime+job.duration,grossWorker:state.grossWorker+job.pay,clientPaid:state.clientPaid+job.clientValue,disputedTaskPay:job.pay,stress:stressAfter,firstTaskStress:{before:stressBefore,after:stressAfter,delta:stressAfter-stressBefore},completedTasks:[...(state.completedTasks||[]),record],sampleCursor:Number(state.sampleCursor||0)+indexes.length,status:'اكتملت المهمة الأولى',workStep:'result'}}}
