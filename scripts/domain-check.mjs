import assert from 'node:assert/strict';
import {scenarios} from '../assets/js/data/scenarios.js';
import {samples} from '../assets/js/data/samples.js';
import {axes} from '../assets/js/data/parties.js';
import {powerTargets} from '../assets/js/data/power-targets.js';
import {buildPaymentSettlement,PAYMENT_PROCESSOR_RATE,PAYMENT_PROCESSOR_CAP} from '../assets/js/domain/payment.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';
import {evidenceFor} from '../assets/js/domain/evidence.js';
import {relationshipQuestions,questionsForState,acceptedQuestionReferences} from '../assets/js/domain/questions.js';
import {analysisAxes,powerMapComplete,scoreAnalysis} from '../assets/js/domain/analysis.js';
import {acceptanceRate,intersectionOverUnion,scoreWork,firstTaskOutcome,dataRegionOptions,dataSceneDescriptions,semanticDataAnswer} from '../assets/js/domain/work.js';
import {computeManagedAccess,buildSecondOffer,secondOfferDecision,completeSecondTask,monitorDecision,BREAK_MINUTES,BREAK_STRESS_REDUCTION} from '../assets/js/domain/management.js';
import {APPEAL_TIME_MINUTES,APPEAL_STRESS,disputeSeverityFromScore,reviewedSeverity,reviewAppeal,disputeConsequences,applyDisputeOutcome,appealCostChanges,publishedTranslationText} from '../assets/js/domain/dispute.js';
import {riskTransition} from '../assets/js/domain/risk.js';
const close=(a,b,e=1e-12)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);

assert.equal(PAYMENT_PROCESSOR_RATE,.03);assert.equal(PAYMENT_PROCESSOR_CAP,.22);
const payment=buildPaymentSettlement({costs:{internet:.55,electricity:.18,device:.42,transfer:.25}},{clientPaid:5.8,grossWorker:2.1,hold:.21});close(payment.net,.427);assert.equal('cashBeforeOperating' in payment,false);
for(const sc of Object.values(scenarios)){assert.ok(sc.accessPolicy?.projectAt>0);assert.ok(sc.accessPolicy?.suspendAt>sc.accessPolicy.projectAt);assert.equal('outcomeStrictness' in sc,false)}
const active=assessAccessDecision(scenarios.data,{finalReviewSeverity:0,rejections:0});assert.equal(active.points,0);assert.equal(active.outcome,'active');
const warning=assessAccessDecision(scenarios.data,{finalReviewSeverity:0,rejections:1});assert.equal(warning.points,1);assert.equal(warning.outcome,'warning');
const project=assessAccessDecision(scenarios.data,{finalReviewSeverity:1,rejections:1});assert.equal(project.points,2);assert.equal(project.outcome,'project');
const suspended=assessAccessDecision(scenarios.data,{finalReviewSeverity:2,rejections:2});assert.equal(suspended.points,4);assert.equal(suspended.outcome,'suspended');
const noWork=assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:2});assert.equal(noWork.points,2);assert.equal(noWork.outcome,'project');assert.equal(noWork.factors[0].value,'لم تُنفذ مهمة');

const evidenceScenario={type:'data',priceMechanism:'سعر مخصص',allocationMechanism:'توزيع مخصص',monitoring:'timing'};const priceEvidence=evidenceFor('priceSetting',evidenceScenario,{});assert.equal(priceEvidence.text,'سعر مخصص');assert.equal(priceEvidence.dimension,'price');assert.equal(priceEvidence.preferredKind,'ctrl');assert.deepEqual(evidenceFor('contract',evidenceScenario,{}).validKinds,['dep']);assert.deepEqual(evidenceFor('multiPlatform',evidenceScenario,{}).validKinds,['ind','dep']);
assert.equal(relationshipQuestions.length,6);assert.equal(questionsForState({noWorkEnding:true}).length,4);assert.equal(analysisAxes({noWorkEnding:true}).length,3);assert.ok(relationshipQuestions.find(q=>q.id==='allocation').options.includes('سلطة مشتركة بين المنصة والعميل'));
const refs=acceptedQuestionReferences('data'),perfectAnswers=Object.fromEntries(relationshipQuestions.map(({id})=>[id,Array.isArray(refs[id])?refs[id][0]:refs[id]])),completedAxes=axes.map(a=>a.id),analysisState={noWorkEnding:false,answers:perfectAnswers,evidence:['contract'],evidenceSort:{contract:'dep'},power:powerTargets.data,powerTouched:completedAxes,powerEdited:completedAxes};assert.equal(powerMapComplete(analysisState),true);const analysis=scoreAnalysis(scenarios.data,analysisState);assert.equal(analysis.score,100);
const partialEvidenceState={...analysisState,evidence:['multiPlatform'],evidenceSort:{multiPlatform:'dep'}};const partialAnalysis=scoreAnalysis(scenarios.data,partialEvidenceState);assert.equal(partialAnalysis.sortScore,15);

assert.equal(acceptanceRate(3,4),75);assert.equal(acceptanceRate(0,0),100);const box={x:.2,y:.3,w:.4,h:.3};close(intersectionOverUnion(box,box),1);assert.equal(dataRegionOptions.length,5);assert.equal(dataSceneDescriptions.length,6);const semanticAnswers=[semanticDataAnswer(0,'leftCenter'),semanticDataAnswer(1,'rightCenter'),semanticDataAnswer(2,'center')];assert.equal(scoreWork(scenarios.data,semanticAnswers),100);
assert.equal(samples.translation.length,8);assert.equal(samples.ai.length,8);assert.ok(samples.ai.some(sample=>sample.preferred==='B'));assert.equal(scoreWork(scenarios.translation,['A','A']),100);assert.equal(scoreWork(scenarios.translation,['B','B']),85);
const firstTask=firstTaskOutcome(scenarios.data,{workAnswers:semanticAnswers,quality:91,selectedJob:{duration:12,pay:2.1,clientValue:5.8},stress:24,time:0,paidTime:0,grossWorker:0,clientPaid:0});assert.equal(firstTask.score,100);assert.equal(firstTask.changes.quality,94);assert.equal(firstTask.changes.paidTime,12);assert.equal(firstTask.changes.disputedTaskPay,2.1);
assert.equal(computeManagedAccess(scenarios.data,{quality:94,initialQuality:91,acceptance:100}),74);assert.equal(computeManagedAccess(scenarios.moderation,{quality:70,initialQuality:89,acceptance:100}),56);assert.equal(buildSecondOffer(scenarios.data,95).premium,true);assert.equal(buildSecondOffer(scenarios.data,70).premium,false);assert.equal(buildSecondOffer(scenarios.data,95).sampleCount,3);
const rejected=secondOfferDecision({secondOffer:{title:'دفعة',pay:1.8,duration:11},acceptance:100,access:80,stress:30,rejections:0,offerDecisions:1,acceptedOffers:1},false);assert.equal(rejected.acceptance,50);assert.equal(rejected.rejections,1);
const completion=completeSecondTask(scenarios.translation,{secondOffer:{pay:3.85,duration:18,clientValue:8,premium:true,sampleCount:3},secondTaskAnswers:['A','B','A'],offerDecisionResult:{accepted:true,beforeAccess:80},access:80,stress:30,grossWorker:3,clientPaid:7.5,time:14,paidTime:14});assert.equal('access' in completion.changes,false);assert.equal(completion.changes.stress,42);assert.equal(completion.changes.paidTime,32);assert.ok(Number.isFinite(completion.score));
assert.equal(BREAK_MINUTES,3);assert.equal(BREAK_STRESS_REDUCTION,8);const breakDecision=monitorDecision({stress:42},true);assert.equal(breakDecision.stressAfter,34);assert.equal(breakDecision.breakDelta,3);
const riskState={time:12,extraWorkTime:0,stress:30,riskEvent:null},risk=riskTransition(scenarios.data,riskState);assert.ok(risk.event);assert.ok(risk.changes);assert.equal(riskTransition(scenarios.data,{...riskState,riskEvent:risk.event}).changes,null);

assert.equal(APPEAL_TIME_MINUTES,2);assert.equal(APPEAL_STRESS,4);assert.equal(disputeSeverityFromScore(85),0);assert.equal(disputeSeverityFromScore(60),1);assert.equal(disputeSeverityFromScore(59),2);assert.equal(reviewedSeverity(2,true),1);assert.equal(reviewedSeverity(2,false),2);
const acceptedAppeal=reviewAppeal(scenarios.translation,{initialReviewSeverity:1,workAnswers:['B','B']});assert.equal(acceptedAppeal.accepted,true);assert.equal(acceptedAppeal.finalSeverity,0);
const rejectedAppeal=reviewAppeal(scenarios.ai,{initialReviewSeverity:2,workAnswers:['B','A','B']});assert.equal(rejectedAppeal.accepted,false);assert.equal(rejectedAppeal.finalSeverity,2);
const limited=disputeConsequences({disputedTaskPay:2,grossWorker:10},1);close(limited.hold,.2);assert.equal(limited.penalty,4);const major=disputeConsequences({disputedTaskPay:2,grossWorker:10},2);close(major.hold,.36);assert.equal(major.penalty,9);
const disputeOutcome=applyDisputeOutcome({qualityBeforeDispute:80,disputedTaskPay:2,grossWorker:10,initialReviewSeverity:2,finalReviewSeverity:1,disputeSeverity:2,appealed:true});assert.equal(disputeOutcome.finalSeverity,1);assert.equal(disputeOutcome.changes.quality,76);close(disputeOutcome.changes.hold,.2);assert.equal('access' in disputeOutcome.changes,false);
const appealChanges=appealCostChanges({time:10,extraWorkTime:1,stress:98});assert.equal(appealChanges.time,12);assert.equal(appealChanges.extraWorkTime,3);assert.equal(appealChanges.stress,100);assert.deepEqual(appealChanges.appealCost,{minutes:2,stress:4});assert.equal(publishedTranslationText({a:'A text',b:'B text',preferred:'B'}),'B text');
console.log('No Boss domain checks passed');
