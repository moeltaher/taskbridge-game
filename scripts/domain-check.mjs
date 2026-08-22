import assert from 'node:assert/strict';
import {scenarios} from '../assets/js/data/scenarios.js';
import {axes} from '../assets/js/data/parties.js';
import {authorityModel,authorityLeaders} from '../assets/js/data/authority-model.js';
import {powerTargets} from '../assets/js/data/power-targets.js';
import {questionRef} from '../assets/js/data/question-references.js';
import {leaders,powerAxisCredit} from '../assets/js/core/power-scoring.js';
import {buildPaymentSettlement} from '../assets/js/domain/payment.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';
import {evidenceFor} from '../assets/js/domain/evidence.js';
import {relationshipQuestions,questionsForState,scoredQuestionsForState,acceptedQuestionReferences} from '../assets/js/domain/questions.js';
import {analysisAxes,evidenceDimensions,powerMapComplete,scoreAnalysis} from '../assets/js/domain/analysis.js';
import {acceptanceRate,intersectionOverUnion,scoreWork,firstTaskOutcome,dataRegionOptions,dataSizeOptions,semanticDataAnswer,createSampleSequence,samplePoolSize,nextSampleIndexes,qualityAfterTask} from '../assets/js/domain/work.js';
import {dataTargetForScene} from '../assets/js/data/data-scenes.js';
import {computeManagedAccess,buildSecondOffer,secondOfferDecision,prepareSecondTask,completeSecondTask,monitorDecision,BREAK_MINUTES,BREAK_STRESS_REDUCTION} from '../assets/js/domain/management.js';
import {reviewAppeal,selectReviewTask,disputeConsequences,applyDisputeOutcome,appealCostChanges} from '../assets/js/domain/dispute.js';
import {riskTransition} from '../assets/js/domain/risk.js';
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
const partyLabel={worker:'العامل',platform:'المنصة',client:'العميل',mediator:'الوسيط'};

for(const [type,sc] of Object.entries(scenarios)){
 assert.ok(sc.accessPolicy.premiumAt>sc.initial.access);
 const excellent={completedTasks:[{score:100}],workScore:100,acceptance:100};
 const excellentAccess=computeManagedAccess(sc,excellent);assert.ok(excellentAccess>=sc.accessPolicy.premiumAt);assert.equal(buildSecondOffer(sc,excellentAccess).premium,true);
 const seq=createSampleSequence(type,1234);assert.equal(seq.length,samplePoolSize(type));assert.equal(new Set(seq).size,seq.length);
}
const payment=buildPaymentSettlement(scenarios.data,{clientPaid:5.8,grossWorker:2.1,hold:.21});close(payment.net,.427);
assert.equal(assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:0}).outcome,'active');
assert.equal(assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:1}).outcome,'warning');
assert.equal(assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:2}).outcome,'warning');
assert.notEqual(assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:2}).outcome,'project');
assert.equal(assessAccessDecision(scenarios.data,{finalReviewSeverity:2,rejections:2}).outcome,'suspended');

for(const [type,model] of Object.entries(authorityModel))for(const [axis,config] of Object.entries(model)){
 assert.deepEqual(powerTargets[type][axis],config.distribution);
 const numericLeaders=leaders(config.distribution);assert.deepEqual(authorityLeaders(type,axis),numericLeaders);
 if(questionRef[type]?.[axis])assert.deepEqual(questionRef[type][axis],numericLeaders.map(p=>partyLabel[p]));
}
assert.equal(relationshipQuestions.length,7);assert.equal(scoredQuestionsForState({}).length,6);assert.equal(questionsForState({noWorkEnding:true}).length,4);assert.equal(questionsForState({contractDeclineEnding:true}).length,1);
assert.deepEqual(analysisAxes({noWorkEnding:true}).map(a=>a.id),['price','allocation','termination']);
assert.deepEqual(analysisAxes({contractDeclineEnding:true}).map(a=>a.id),['termination']);
assert.deepEqual(evidenceDimensions({noWorkEnding:false}),['contract','price','allocation','monitoring','quality','risk','access']);
assert.deepEqual(evidenceDimensions({contractDeclineEnding:true}),['contract','access']);
assert.equal(evidenceFor('clientQuality',scenarios.data,{}).dimension,'quality');

assert.equal(dataRegionOptions.length,5);assert.equal(dataSizeOptions.length,3);
const semanticAnswers=[semanticDataAnswer(0,'leftCenter','standard'),semanticDataAnswer(1,'rightCenter','standard'),semanticDataAnswer(2,'center','standard')];
assert.equal(scoreWork(scenarios.data,semanticAnswers,{sampleIndexes:[0,1,2]}),100);
assert.ok(scoreWork(scenarios.data,[semanticDataAnswer(0,'leftCenter','short')],{sampleIndexes:[0]})<100);
const target0=dataTargetForScene(0);close(intersectionOverUnion(target0,target0),1);
assert.equal(qualityAfterTask(90,60),80);
const sequence=[0,1,2,3,4,5],firstState={sampleSequence:sequence,sampleCursor:0,currentTaskSampleIndexes:[0,1,2],completedTasks:[],workAnswers:semanticAnswers,quality:91,selectedJob:{id:'core',title:'مهمة',duration:12,pay:2.1,clientValue:5.8,stress:10},stress:24,time:0,paidTime:0,grossWorker:0,clientPaid:0};
const firstTask=firstTaskOutcome(scenarios.data,firstState);assert.equal(firstTask.score,100);assert.equal(firstTask.changes.sampleCursor,3);
const secondBase={...firstState,...firstTask.changes,secondOffer:{id:'second-premium',title:'دفعة مميزة',pay:3.85,duration:18,clientValue:8,premium:true,sampleCount:3,stress:16},offerDecisionResult:{accepted:true},currentTaskSampleIndexes:[3,4,5],secondTaskAnswers:[semanticDataAnswer(3,'left','short'),semanticDataAnswer(4,'right','short'),semanticDataAnswer(5,'center','wide')]};
const completion=completeSecondTask(scenarios.data,secondBase);assert.equal(completion.changes.completedTasks.length,2);assert.equal(completion.changes.sampleCursor,6);assert.equal(firstTask.record.sampleIndexes.some(x=>completion.record.sampleIndexes.includes(x)),false);assert.deepEqual(nextSampleIndexes({sampleSequence:sequence,sampleCursor:3},3),[3,4,5]);assert.deepEqual(prepareSecondTask({...secondBase,currentTaskSampleIndexes:[]}),[3,4,5]);

const rejected=secondOfferDecision({secondOffer:{title:'دفعة',pay:1.8,duration:11},acceptance:100,access:80,stress:30,rejections:0,offerDecisions:1,acceptedOffers:1},false);assert.equal(rejected.acceptance,50);assert.equal(rejected.rejections,1);
assert.equal(monitorDecision({stress:42},true).stressAfter,42-BREAK_STRESS_REDUCTION);assert.equal(BREAK_MINUTES,3);
const riskBase={riskSeed:98765,time:12,extraWorkTime:0,stress:30,riskEvent:null,completedTasks:[{score:40}],rejections:0,breakTime:0},riskA=riskTransition(scenarios.data,riskBase),riskB=riskTransition(scenarios.data,{...riskBase,completedTasks:[{score:100}],rejections:8,breakTime:15});assert.equal(riskA.event.occurred,riskB.event.occurred);assert.equal(riskA.event.roll,riskB.event.roll);

const reviewState={completedTasks:[{id:'task-1',score:92,pay:2,answers:['A'],sampleIndexes:[0]},{id:'task-2',score:55,pay:3.85,answers:['A'],sampleIndexes:[6]}]};assert.equal(selectReviewTask(reviewState).id,'task-2');
const appealable={completedTasks:[{id:'task-1',score:70,pay:2.35,answers:['غير واضح','تهديد'],sampleIndexes:[1,0]}],reviewTaskId:'task-1',initialReviewSeverity:1,appealGround:'context'};assert.equal(reviewAppeal(scenarios.moderation,appealable).accepted,true);assert.equal(reviewAppeal(scenarios.moderation,{...appealable,appealGround:'technical'}).accepted,false);
const major=disputeConsequences({...reviewState,reviewTaskId:'task-2'},2);close(major.hold,.693);
const disputeOutcome=applyDisputeOutcome({qualityBeforeDispute:80,completedTasks:[{id:'task-1',pay:2}],reviewTaskId:'task-1',initialReviewSeverity:2,finalReviewSeverity:1});assert.equal(disputeOutcome.changes.quality,76);
assert.equal(appealCostChanges({time:10,extraWorkTime:1,stress:98}).stress,100);

const refs=acceptedQuestionReferences('data'),answers={};for(const q of questionsForState({})){const ref=refs[q.id];answers[q.id]=Array.isArray(ref)?ref[0]:ref}answers.parties='العامل + العميل فقط';
const perfectEvidence=['contract','priceSetting','allocation','monitoring','clientQuality','payment','accessDecision'];const perfectSort={contract:'dep',priceSetting:'ctrl',allocation:'ctrl',monitoring:'ctrl',clientQuality:'ctrl',payment:'dep',accessDecision:'ctrl'};const completedAxes=axes.map(a=>a.id);const analysisState={answers,evidence:perfectEvidence,evidenceSort:perfectSort,power:powerTargets.data,powerTouched:completedAxes,powerEdited:completedAxes};assert.equal(powerMapComplete(analysisState),true);const analysis=scoreAnalysis(scenarios.data,analysisState);assert.equal(analysis.qScore,30);assert.equal(analysis.sortScore,30);assert.equal(analysis.powerScore,40);assert.equal(analysis.score,100);
assert.equal(powerAxisCredit(powerTargets.data.price,powerTargets.data.price),1);
console.log('No Boss domain checks passed');