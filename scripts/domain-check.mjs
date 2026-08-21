import assert from 'node:assert/strict';
import {scenarios} from '../assets/js/data/scenarios.js';
import {axes} from '../assets/js/data/parties.js';
import {powerTargets} from '../assets/js/data/power-targets.js';
import {buildPaymentSettlement,PAYMENT_PROCESSOR_RATE,PAYMENT_PROCESSOR_CAP} from '../assets/js/domain/payment.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';
import {evidenceFor} from '../assets/js/domain/evidence.js';
import {relationshipQuestions,acceptedQuestionReferences} from '../assets/js/domain/questions.js';
import {powerMapComplete,scoreAnalysis} from '../assets/js/domain/analysis.js';
import {acceptanceRate,intersectionOverUnion,scoreWork,firstTaskOutcome,dataRegionOptions,dataSceneDescriptions,semanticDataAnswer} from '../assets/js/domain/work.js';
import {computeManagedAccess,buildSecondOffer,secondOfferDecision,completeSecondTask,monitorDecision} from '../assets/js/domain/management.js';
import {APPEAL_TIME_MINUTES,APPEAL_STRESS,disputeSeverityFromScore,disputeConsequences,applyDisputeOutcome,appealCostChanges,publishedTranslationText} from '../assets/js/domain/dispute.js';

const close=(actual,expected,epsilon=1e-12)=>assert.ok(Math.abs(actual-expected)<epsilon,`${actual} != ${expected}`);

assert.equal(PAYMENT_PROCESSOR_RATE,.03);
assert.equal(PAYMENT_PROCESSOR_CAP,.22);
const payment=buildPaymentSettlement({costs:{internet:.55,electricity:.18,device:.42,transfer:.25}},{clientPaid:5.8,grossWorker:2.1,hold:.21});
close(payment.clientPaid,5.8);close(payment.contracted,2.1);close(payment.platformService,3.7);close(payment.mediator,.063);close(payment.cashPayout,1.577);close(payment.operating,1.15);close(payment.net,.427);

const baseScenario={outcomeStrictness:1};
const warning=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:0,qualityBeforeDispute:90,accessBeforeDispute:70,rejections:0});
assert.equal(warning.points,0);assert.equal(warning.outcome,'warning');
const project=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:1,qualityBeforeDispute:75,accessBeforeDispute:70,rejections:1});
assert.equal(project.points,3);assert.equal(project.outcome,'project');
const suspended=assessAccessDecision(baseScenario,{scenarioKey:'data',disputeSeverity:2,qualityBeforeDispute:65,accessBeforeDispute:70,rejections:3});
assert.equal(suspended.points,6);assert.equal(suspended.outcome,'suspended');

const evidenceScenario={priceMechanism:'سعر مخصص',allocationMechanism:'توزيع مخصص',monitoring:'timing'};
assert.equal(evidenceFor('priceSetting',evidenceScenario,{}).text,'سعر مخصص');
assert.deepEqual(evidenceFor('allocation',evidenceScenario,{}).validKinds,['ctrl','dep']);
assert.match(evidenceFor('monitoring',evidenceScenario,{}).text,/تبديل التبويب/);
const riskEvidence=evidenceFor('risk',evidenceScenario,{riskEvent:{title:'إعادة تحقق',minutes:3}});
assert.equal(riskEvidence.title,'وقت إضافي مرتبط بالعمل بلا مقابل مستقل');assert.match(riskEvidence.text,/3 دقيقة/);

assert.equal(relationshipQuestions.length,6);
const refs=acceptedQuestionReferences('data');
const perfectAnswers=Object.fromEntries(relationshipQuestions.map(({id})=>[id,Array.isArray(refs[id])?refs[id][0]:refs[id]]));
const completedAxes=axes.map(axis=>axis.id);
const analysisState={answers:perfectAnswers,evidence:['contract'],evidenceSort:{contract:'ind'},power:powerTargets.data,powerTouched:completedAxes,powerEdited:completedAxes};
assert.equal(powerMapComplete(analysisState),true);
const analysis=scoreAnalysis(scenarios.data,analysisState);
assert.equal(analysis.questionCorrect,6);assert.equal(analysis.qScore,30);assert.equal(analysis.sortScore,30);assert.equal(analysis.powerScore,40);assert.equal(analysis.score,100);

assert.equal(acceptanceRate(3,4),75);assert.equal(acceptanceRate(0,0),100);
const box={x:.2,y:.3,w:.4,h:.3};close(intersectionOverUnion(box,box),1);
assert.equal(dataRegionOptions.length,5);assert.equal(dataSceneDescriptions.length,3);
const semanticAnswers=[semanticDataAnswer(0,'leftCenter'),semanticDataAnswer(1,'rightCenter'),semanticDataAnswer(2,'center')];
assert.equal(semanticAnswers.every(answer=>answer?.source==='semantic'),true);
assert.equal(scoreWork(scenarios.data,semanticAnswers),100);
assert.equal(semanticDataAnswer(0,'missing'),null);
assert.equal(scoreWork(scenarios.translation,['A','A','A']),100);
const firstTask=firstTaskOutcome(scenarios.data,{workAnswers:[{x:.27,y:.43,w:.34,h:.35},{x:.45,y:.43,w:.34,h:.35},{x:.36,y:.42,w:.34,h:.36}],quality:91,selectedJob:{duration:12,pay:2.1,clientValue:5.8},stress:24,time:0,paidTime:0,grossWorker:0,clientPaid:0,jobsDone:0});
assert.equal(firstTask.score,100);assert.equal(firstTask.quality,94);assert.equal(firstTask.changes.paidTime,12);assert.equal(firstTask.changes.grossWorker,2.1);assert.equal(firstTask.changes.stress,34);

const managedState={quality:94,acceptance:100};
assert.equal(computeManagedAccess(scenarios.data,managedState),95);
assert.equal(buildSecondOffer(scenarios.data,95).premium,true);
assert.equal(buildSecondOffer(scenarios.data,70).premium,false);
const rejectedDecision=secondOfferDecision({secondOffer:{title:'دفعة',pay:1.8,duration:11},acceptance:100,access:80,stress:30,rejections:0,offerDecisions:1,acceptedOffers:1},false);
assert.equal(rejectedDecision.offerDecisions,2);assert.equal(rejectedDecision.acceptance,50);assert.equal(rejectedDecision.rejections,1);
const secondCompletion=completeSecondTask({secondOffer:{pay:3.85,duration:18,clientValue:8,premium:true},offerDecisionResult:{accepted:true,beforeAccess:80},access:80,stress:30,grossWorker:2.1,clientPaid:5.8,time:12,paidTime:12,jobsDone:1});
assert.equal(secondCompletion.changes.access,85);assert.equal(secondCompletion.changes.stress,42);assert.equal(secondCompletion.changes.paidTime,30);
const breakDecision=monitorDecision({stress:42},true);assert.equal(breakDecision.stressAfter,32);assert.equal(breakDecision.breakDelta,1);

assert.equal(APPEAL_TIME_MINUTES,2);assert.equal(APPEAL_STRESS,4);
assert.equal(disputeSeverityFromScore(85),0);assert.equal(disputeSeverityFromScore(60),1);assert.equal(disputeSeverityFromScore(59),2);
const limited=disputeConsequences({grossWorker:4},1,false);close(limited.hold,.4);assert.equal(limited.penalty,4);
const appealedMajor=disputeConsequences({grossWorker:10},2,true);close(appealedMajor.hold,.9);assert.equal(appealedMajor.penalty,6);
const disputeOutcome=applyDisputeOutcome({qualityBeforeDispute:80,accessBeforeDispute:70,grossWorker:4,disputeSeverity:1,appealed:false,appealCost:null});
assert.equal(disputeOutcome.changes.quality,76);assert.equal(disputeOutcome.changes.access,66);close(disputeOutcome.changes.hold,.4);
const appealChanges=appealCostChanges({time:10,extraWorkTime:1,stress:98});
assert.equal(appealChanges.time,12);assert.equal(appealChanges.extraWorkTime,3);assert.equal(appealChanges.stress,100);
assert.equal(publishedTranslationText({a:'صياغة A',b:'صياغة B',published:'B'}),'صياغة B');

console.log('No Boss domain checks passed');
