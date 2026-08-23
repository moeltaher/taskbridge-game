import {samples} from '../data/samples.js';
import {dataAnswerCredit} from './work.js';
export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;
export const appealGrounds={guideline:'تفسير الإرشادات أو غموض المعيار',context:'سياق العينة أو معناها',technical:'مشكلة تقنية مسجلة في المهمة نفسها'};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function reviewSeverityFromScore(score){return score>=85?0:score>=60?1:2}
export function reviewedSeverity(initialSeverity,appealAccepted=true){return appealAccepted&&initialSeverity>0?initialSeverity-1:initialSeverity}
export function selectReviewTask(state){
 const tasks=state.completedTasks||[];
 if(!tasks.length)return null;
 const lowest=Math.min(...tasks.map(task=>Number(task.score)));
 return tasks.filter(task=>Number(task.score)===lowest).at(-1)||null;
}
export function availableAppealGrounds(scenario,state,taskOverride=null){
 const task=taskOverride||(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state);
 if(scenario.type==='data'){
  const ids=['guideline'];
  if(task?.technicalIssue===true)ids.push('technical');
  return Object.fromEntries(ids.map(id=>[id,appealGrounds[id]]));
 }
 if(scenario.type==='moderation'||scenario.type==='translation')return {guideline:appealGrounds.guideline,context:appealGrounds.context};
 if(scenario.type==='ai')return {guideline:appealGrounds.guideline};
 return {};
}
function groundMatches(scenario,ground,{reviewableErrors=0,hardErrors=0,technicalIssues=0}={}){
 if(!ground)return false;
 if(scenario.type==='data'){
  if(ground==='technical')return technicalIssues>0;
  if(ground==='guideline')return reviewableErrors>0&&hardErrors<=1;
  return false;
 }
 if(scenario.type==='moderation')return reviewableErrors>0&&hardErrors<=1&&(ground==='context'||ground==='guideline');
 if(scenario.type==='ai')return reviewableErrors>0&&hardErrors<=1&&ground==='guideline';
 if(scenario.type==='translation')return reviewableErrors>0&&hardErrors<=1&&(ground==='guideline'||ground==='context');
 return false;
}
function dataReviewProfile(task){
 let reviewableErrors=0,hardErrors=0;
 task.answers.forEach((answer,i)=>{
  const credit=dataAnswerCredit(task.sampleIndexes[i],answer);
  if(credit>=.55&&credit<.85)reviewableErrors++;
  else if(credit<.55)hardErrors++;
 });
 return {reviewableErrors,hardErrors,technicalIssues:task.technicalIssue===true?1:0};
}
export function reviewProfile(scenario,task){
 if(!task)return {reviewableErrors:0,hardErrors:0,technicalIssues:0};
 if(scenario.type==='data')return dataReviewProfile(task);
 let reviewableErrors=0,hardErrors=0;
 task.answers.forEach((answer,i)=>{
  const sample=samples[scenario.type][task.sampleIndexes[i]];
  if(sample?.acceptable?.includes(answer))return;
  if(sample?.reviewable?.includes(answer))reviewableErrors++;
  else hardErrors++;
 });
 return {reviewableErrors,hardErrors,technicalIssues:0};
}
export function reviewAppeal(scenario,state){
 const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),initial=Number(state.initialReviewSeverity??0),ground=state.appealGround;
 if(!task||initial<=0)return {accepted:false,finalSeverity:0,reason:'لا توجد مراجعة سلبية تستدعي تخفيفًا.',reviewableErrors:0,hardErrors:0,ground};
 if(!ground)return {accepted:false,finalSeverity:initial,reason:'لم يُحدد سبب للاعتراض، لذلك لا توجد مسألة محددة لإعادة الفحص.',reviewableErrors:0,hardErrors:0,ground};
 if(!availableAppealGrounds(scenario,state,task)[ground])return {accepted:false,finalSeverity:initial,reason:'سبب الاعتراض المختار غير متاح لهذه المهمة وفق الوقائع المسجلة.',reviewableErrors:0,hardErrors:0,ground};
 const profile=reviewProfile(scenario,task),accepted=groundMatches(scenario,ground,profile);
 if(scenario.type==='data')return {accepted,finalSeverity:reviewedSeverity(initial,accepted),...profile,ground,reason:accepted&&ground==='technical'?'المهمة محل المراجعة نفسها تحمل واقعة تقنية مسجلة مرتبطة بعرض/مزامنة الإجابة، لذلك أعيد فحصها وخُفض القرار درجة واحدة.':accepted?`وجدت المراجعة ${profile.reviewableErrors} انحرافًا حدّيًا يمكن مناقشته وفق قاعدة الترميز، وكان سبب الاعتراض (${appealGrounds[ground]}) مرتبطًا به؛ لذلك خُفض القرار درجة واحدة.`:`الانحرافات المسجلة لا تدعم سبب الاعتراض (${appealGrounds[ground]}) بما يكفي لتغيير القرار.`};
 return {accepted,finalSeverity:reviewedSeverity(initial,accepted),...profile,ground,reason:accepted?`وجدت المراجعة ${profile.reviewableErrors} إجابة قابلة للدفاع، وكان سبب الاعتراض (${appealGrounds[ground]}) ذا صلة بنوع الخلاف؛ لذلك خُفضت شدة القرار درجة واحدة.`:`وجدت المراجعة ${profile.reviewableErrors} إجابة قابلة للدفاع و${profile.hardErrors} خطأ واضحًا، لكن سبب الاعتراض (${appealGrounds[ground]}) لم يكن كافيًا لتغيير النتيجة في هذه الحالة.`};
}
export function disputeConsequences(state,severity){
 const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId),disputedPay=Number(task?.pay||0);
 let hold=0,penalty=0;
 if(severity===1){hold=Math.min(.45,disputedPay*.10);penalty=4}
 else if(severity>=2){hold=Math.min(.9,disputedPay*.18);penalty=9}
 return {hold,penalty,disputedPay};
}
export function applyDisputeOutcome(state){
 const qualityBefore=state.qualityBeforeDispute??state.quality,initialSeverity=Number(state.initialReviewSeverity??0),finalSeverity=Number(state.finalReviewSeverity??initialSeverity);
 const consequences=disputeConsequences(state,finalSeverity),qualityAfter=clamp(qualityBefore-consequences.penalty,0,100);
 return {consequences,initialSeverity,finalSeverity,qualityBefore,qualityAfter,changes:{hold:consequences.hold,quality:qualityAfter,initialReviewSeverity:initialSeverity,finalReviewSeverity:finalSeverity,qualityBeforeDispute:qualityBefore,disputeFinalized:true,stage:6,status:'قيد التسوية',payment:null}};
}
export function appealCostChanges(state){
 const stressBefore=Number(state.stress||0),stressAfter=clamp(stressBefore+APPEAL_STRESS,0,100),stressDelta=stressAfter-stressBefore;
 return {appealCost:{minutes:APPEAL_TIME_MINUTES,stress:stressDelta},time:state.time+APPEAL_TIME_MINUTES,extraWorkTime:Number(state.extraWorkTime||0)+APPEAL_TIME_MINUTES,stress:stressAfter};
}
export function publishedTranslationText(sample){
 const key=String(sample?.preferred||'A').toLowerCase();
 return sample?.[key]??sample?.a??'';
}
