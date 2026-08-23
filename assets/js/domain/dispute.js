import {samples} from '../data/samples.js';
import {dataAnswerCredit} from './work.js';
export const APPEAL_TIME_MINUTES=2;
export const APPEAL_STRESS=4;
export const appealGrounds={guideline:'تفسير الإرشادات أو غموض المعيار',context:'سياق العينة أو معناها',technical:'مشكلة تقنية مسجلة في العينة نفسها'};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function reviewSeverityFromScore(score){return score>=85?0:score>=60?1:2}
export function selectReviewTask(state){const tasks=state.completedTasks||[];if(!tasks.length)return null;const lowest=Math.min(...tasks.map(task=>Number(task.score)));return tasks.filter(task=>Number(task.score)===lowest).at(-1)||null}
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
export function availableAppealGrounds(scenario,state,taskOverride=null){
 const task=taskOverride||(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),profile=reviewProfile(scenario,task);
 if(scenario.type==='data'){const ids=[];if(profile.reviewableErrors>0)ids.push('guideline');if(profile.technicalIssues>0)ids.push('technical');return Object.fromEntries(ids.map(id=>[id,appealGrounds[id]]))}
 const ids=Object.keys(profile.groundCounts||{}).filter(id=>profile.groundCounts[id]>0);return Object.fromEntries(ids.map(id=>[id,appealGrounds[id]]).filter(([,label])=>label));
}
function correctedDataCredit(task,index,ground){
 const sampleIndex=task.sampleIndexes[index],answer=task.answers[index],credit=dataAnswerCredit(sampleIndex,answer);
 if(ground==='technical'&&(task.technicalIssueSampleIndexes||[]).includes(sampleIndex)&&credit<.85)return 1;
 if(ground==='guideline'&&credit>=.55&&credit<.85)return 1;
 return credit;
}
function correctedCategoricalCredit(scenario,task,index,ground){
 const answer=task.answers[index],sample=samples[scenario.type][task.sampleIndexes[index]];
 if(sample?.acceptable?.includes(answer))return 1;
 if(sample?.reviewable?.includes(answer)&&(sample?.reviewableGrounds?.[answer]||[]).includes(ground))return 1;
 return 0;
}
export function counterfactualAppealScore(scenario,task,ground){
 if(!task?.answers?.length)return Number(task?.score||0);
 const credits=task.answers.map((_,index)=>scenario.type==='data'?correctedDataCredit(task,index,ground):correctedCategoricalCredit(scenario,task,index,ground));
 return Math.round(credits.reduce((sum,value)=>sum+value,0)/credits.length*100);
}
export function reviewAppeal(scenario,state){
 const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),initial=Number(state.initialReviewSeverity??0),ground=state.appealGround;
 if(!task||initial<=0)return {accepted:false,finalSeverity:0,counterfactualScore:Number(task?.score||0),reason:'لا توجد مراجعة سلبية تستدعي إعادة حساب.',reviewableErrors:0,hardErrors:0,ground};
 if(!ground)return {accepted:false,finalSeverity:initial,counterfactualScore:Number(task.score||0),reason:'لم يُحدد سبب للاعتراض، لذلك لا توجد عينات محددة يمكن إعادة تقييمها.',reviewableErrors:0,hardErrors:0,ground};
 if(!availableAppealGrounds(scenario,state,task)[ground])return {accepted:false,finalSeverity:initial,counterfactualScore:Number(task.score||0),reason:'سبب الاعتراض المختار غير مدعوم باختلاف قابل للمراجعة أو واقعة تقنية مرتبطة بعينة خاطئة في هذه المهمة.',reviewableErrors:0,hardErrors:0,ground};
 const profile=reviewProfile(scenario,task),counterfactualScore=counterfactualAppealScore(scenario,task,ground),finalSeverity=reviewSeverityFromScore(counterfactualScore),accepted=finalSeverity<initial,matched=scenario.type==='data'?Number(profile.groundCounts?.[ground]||0):Number(profile.groundCounts?.[ground]||0);
 const reason=accepted?`أعادت المراجعة حساب المهمة بعد تصحيح ${matched} عينة/عينات يدعمها سبب الاعتراض (${appealGrounds[ground]}). ارتفعت الدرجة الافتراضية من ${task.score}% إلى ${counterfactualScore}%، فانخفضت شدة القرار من ${initial} إلى ${finalSeverity}.`:`أعادت المراجعة حساب المهمة بعد تصحيح العينات التي يدعمها سبب الاعتراض (${appealGrounds[ground]}). أصبحت الدرجة الافتراضية ${counterfactualScore}% بدل ${task.score}%، لكنها لم تعبر حدًا يغير شدة القرار؛ لذلك ثبت القرار.`;
 return {accepted,finalSeverity,counterfactualScore,...profile,ground,reason};
}
export function disputeConsequences(state,severity){const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId),disputedPay=Number(task?.pay||0);let hold=0,penalty=0;if(severity===1){hold=Math.min(.45,disputedPay*.10);penalty=4}else if(severity>=2){hold=Math.min(.9,disputedPay*.18);penalty=9}return {hold,penalty,disputedPay}}
export function applyDisputeOutcome(state){const qualityBefore=state.qualityBeforeDispute??state.quality,initialSeverity=Number(state.initialReviewSeverity??0),finalSeverity=Number(state.finalReviewSeverity??initialSeverity),consequences=disputeConsequences(state,finalSeverity),qualityAfter=clamp(qualityBefore-consequences.penalty,0,100);return {consequences,initialSeverity,finalSeverity,qualityBefore,qualityAfter,changes:{hold:consequences.hold,quality:qualityAfter,initialReviewSeverity:initialSeverity,finalReviewSeverity:finalSeverity,qualityBeforeDispute:qualityBefore,disputeFinalized:true,stage:6,status:'قيد التسوية',payment:null}}}
export function appealCostChanges(state){const stressBefore=Number(state.stress||0),stressAfter=clamp(stressBefore+APPEAL_STRESS,0,100),stressDelta=stressAfter-stressBefore;return {appealCost:{minutes:APPEAL_TIME_MINUTES,stress:stressDelta},time:state.time+APPEAL_TIME_MINUTES,extraWorkTime:Number(state.extraWorkTime||0)+APPEAL_TIME_MINUTES,stress:stressAfter}}
export function publishedTranslationText(sample){const key=String(sample?.preferred||'A').toLowerCase();return sample?.[key]??sample?.a??''}
