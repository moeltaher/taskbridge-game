import {samples} from '../data/samples.js';
import {dataAnswerCredit} from './work.js';
export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;
export const appealGrounds={guideline:'تفسير الإرشادات أو غموض المعيار',context:'سياق العينة أو معناها',technical:'مشكلة تقنية مسجلة في العينة نفسها'};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function reviewSeverityFromScore(score){return score>=85?0:score>=60?1:2}
export function reviewedSeverity(initialSeverity,appealAccepted=true){return appealAccepted&&initialSeverity>0?initialSeverity-1:initialSeverity}
export function selectReviewTask(state){const tasks=state.completedTasks||[];if(!tasks.length)return null;const lowest=Math.min(...tasks.map(task=>Number(task.score)));return tasks.filter(task=>Number(task.score)===lowest).at(-1)||null}
export function availableAppealGrounds(scenario,state,taskOverride=null){
 const task=taskOverride||(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),profile=reviewProfile(scenario,task);
 if(scenario.type==='data'){const ids=[];if(profile.reviewableErrors>0)ids.push('guideline');if(profile.technicalIssues>0)ids.push('technical');return Object.fromEntries(ids.map(id=>[id,appealGrounds[id]]))}
 const ids=Object.keys(profile.groundCounts||{}).filter(id=>profile.groundCounts[id]>0);return Object.fromEntries(ids.map(id=>[id,appealGrounds[id]]).filter(([,label])=>label));
}
function groundMatches(scenario,ground,{reviewableErrors=0,hardErrors=0,technicalIssues=0,technicalHardErrors=0,groundCounts={}}={}){
 if(!ground)return false;
 if(scenario.type==='data'){
  if(ground==='technical')return technicalIssues>0&&(hardErrors-technicalHardErrors)<=1;
  if(ground==='guideline')return reviewableErrors>0&&hardErrors<=1;
  return false;
 }
 return Number(groundCounts[ground]||0)>0&&hardErrors<=1;
}
function dataReviewProfile(task){
 let reviewableErrors=0,hardErrors=0,technicalIssues=0,technicalHardErrors=0;const technicalSamples=new Set(task?.technicalIssueSampleIndexes||[]);
 task.answers.forEach((answer,i)=>{const sampleIndex=task.sampleIndexes[i],credit=dataAnswerCredit(sampleIndex,answer),technical=technicalSamples.has(sampleIndex)&&credit<.85;if(credit>=.55&&credit<.85)reviewableErrors++;else if(credit<.55)hardErrors++;if(technical){technicalIssues++;if(credit<.55)technicalHardErrors++}});
 return {reviewableErrors,hardErrors,technicalIssues,technicalHardErrors,groundCounts:{guideline:reviewableErrors,technical:technicalIssues}};
}
export function reviewProfile(scenario,task){
 if(!task)return {reviewableErrors:0,hardErrors:0,technicalIssues:0,technicalHardErrors:0,groundCounts:{}};
 if(scenario.type==='data')return dataReviewProfile(task);
 let reviewableErrors=0,hardErrors=0;const groundCounts={};
 task.answers.forEach((answer,i)=>{const sample=samples[scenario.type][task.sampleIndexes[i]];if(sample?.acceptable?.includes(answer))return;if(sample?.reviewable?.includes(answer)){reviewableErrors++;for(const ground of sample?.reviewableGrounds?.[answer]||[])groundCounts[ground]=(groundCounts[ground]||0)+1}else hardErrors++});
 return {reviewableErrors,hardErrors,technicalIssues:0,technicalHardErrors:0,groundCounts};
}
export function reviewAppeal(scenario,state){
 const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),initial=Number(state.initialReviewSeverity??0),ground=state.appealGround;
 if(!task||initial<=0)return {accepted:false,finalSeverity:0,reason:'لا توجد مراجعة سلبية تستدعي تخفيفًا.',reviewableErrors:0,hardErrors:0,ground};
 if(!ground)return {accepted:false,finalSeverity:initial,reason:'لم يُحدد سبب للاعتراض، لذلك لا توجد مسألة محددة لإعادة الفحص.',reviewableErrors:0,hardErrors:0,ground};
 if(!availableAppealGrounds(scenario,state,task)[ground])return {accepted:false,finalSeverity:initial,reason:'سبب الاعتراض المختار غير مدعوم باختلاف قابل للمراجعة أو واقعة تقنية مرتبطة بخطأ في هذه المهمة.',reviewableErrors:0,hardErrors:0,ground};
 const profile=reviewProfile(scenario,task),accepted=groundMatches(scenario,ground,profile);
 if(scenario.type==='data')return {accepted,finalSeverity:reviewedSeverity(initial,accepted),...profile,ground,reason:accepted&&ground==='technical'?`العطل التقني مرتبط بعينة خاطئة محددة داخل المهمة، ولم توجد أخطاء جسيمة غير مرتبطة تكفي وحدها لتثبيت القرار؛ لذلك خُفض القرار درجة واحدة.`:accepted?`وجدت المراجعة ${profile.reviewableErrors} انحرافًا حدّيًا يمكن مناقشته وفق قاعدة الترميز، وكان سبب الاعتراض (${appealGrounds[ground]}) مرتبطًا به؛ لذلك خُفض القرار درجة واحدة.`:`لا يفسر سبب الاعتراض (${appealGrounds[ground]}) الأخطاء المسجلة بما يكفي لتغيير القرار.`};
 const matched=Number(profile.groundCounts?.[ground]||0);return {accepted,finalSeverity:reviewedSeverity(initial,accepted),...profile,ground,reason:accepted?`وجدت المراجعة ${matched} اختلافًا قابلًا للدفاع يدعم سبب الاعتراض المحدد (${appealGrounds[ground]}). لذلك خُفضت شدة القرار درجة واحدة.`:`لا يوجد اختلاف قابل للمراجعة يدعم السبب المحدد (${appealGrounds[ground]}) بما يكفي لتغيير النتيجة.`};
}
export function disputeConsequences(state,severity){const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId),disputedPay=Number(task?.pay||0);let hold=0,penalty=0;if(severity===1){hold=Math.min(.45,disputedPay*.10);penalty=4}else if(severity>=2){hold=Math.min(.9,disputedPay*.18);penalty=9}return {hold,penalty,disputedPay}}
export function applyDisputeOutcome(state){const qualityBefore=state.qualityBeforeDispute??state.quality,initialSeverity=Number(state.initialReviewSeverity??0),finalSeverity=Number(state.finalReviewSeverity??initialSeverity),consequences=disputeConsequences(state,finalSeverity),qualityAfter=clamp(qualityBefore-consequences.penalty,0,100);return {consequences,initialSeverity,finalSeverity,qualityBefore,qualityAfter,changes:{hold:consequences.hold,quality:qualityAfter,initialReviewSeverity:initialSeverity,finalReviewSeverity:finalSeverity,qualityBeforeDispute:qualityBefore,disputeFinalized:true,stage:6,status:'قيد التسوية',payment:null}}}
export function appealCostChanges(state){const stressBefore=Number(state.stress||0),stressAfter=clamp(stressBefore+APPEAL_STRESS,0,100),stressDelta=stressAfter-stressBefore;return {appealCost:{minutes:APPEAL_TIME_MINUTES,stress:stressDelta},time:state.time+APPEAL_TIME_MINUTES,extraWorkTime:Number(state.extraWorkTime||0)+APPEAL_TIME_MINUTES,stress:stressAfter}}
export function publishedTranslationText(sample){const key=String(sample?.preferred||'A').toLowerCase();return sample?.[key]??sample?.a??''}
