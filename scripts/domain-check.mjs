import assert from 'node:assert/strict';
import {scenarios} from '../assets/js/data/scenarios.js';
import {axes,parties} from '../assets/js/data/parties.js';
import {authorityModel,authorityLeaders,authorityReference} from '../assets/js/data/authority-model.js';
import {powerAxisCredit} from '../assets/js/core/power-scoring.js';
import {buildPaymentSettlement,operatingCost} from '../assets/js/domain/payment.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';
import {evidenceFor} from '../assets/js/domain/evidence.js';
import {questionsForState,acceptedQuestionAnswer} from '../assets/js/domain/questions.js';
import {analysisAxes,evidenceDimensions,powerMapComplete,scoreAnalysis} from '../assets/js/domain/analysis.js';
import {intersectionOverUnion,scoreWork,firstTaskOutcome,semanticDataAnswer,createSampleSequence,samplePoolSize,qualityAfterTask,answerCredit} from '../assets/js/domain/work.js';
import {dataTargetForScene} from '../assets/js/data/data-scenes.js';
import {samples} from '../assets/js/data/samples.js';
import {computeManagedAccess,buildSecondOffer,completeSecondTask,monitorDecision,BREAK_MINUTES,BREAK_STRESS_REDUCTION} from '../assets/js/domain/management.js';
import {reviewAppeal,selectReviewTask,disputeConsequences,applyDisputeOutcome,availableAppealGrounds,appealCostChanges} from '../assets/js/domain/dispute.js';
import {riskTransition} from '../assets/js/domain/risk.js';
const close=(a,b,e=1e-9)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
assert.deepEqual(parties,['worker','platform','client']);
for(const [type,sc] of Object.entries(scenarios)){assert.ok(sc.accessPolicy.premiumAt>sc.initial.access);const excellentAccess=computeManagedAccess(sc,{completedTasks:[{score:100}],workScore:100,acceptance:100});assert.equal(buildSecondOffer(sc,excellentAccess).premium,true);const seq=createSampleSequence(type,1234);assert.equal(new Set(seq).size,seq.length);assert.equal(seq.length,samplePoolSize(type))}
for(const [type,model] of Object.entries(authorityModel))for(const axis of Object.keys(model)){const ref=authorityReference(type,axis);assert.ok(ref.primary.length>=1);assert.ok(ref.primary.every(p=>parties.includes(p)));assert.ok(ref.secondary.every(p=>parties.includes(p)));assert.deepEqual(authorityLeaders(type,axis),parties.filter(p=>ref.primary.includes(p)))}
assert.deepEqual(authorityReference('moderation','price'),{primary:['platform'],secondary:['client']});
assert.deepEqual(authorityReference('ai','price'),{primary:['platform'],secondary:['client']});
assert.equal(powerAxisCredit({worker:10,platform:60,client:30},authorityReference('data','price')),1);
assert.equal(powerAxisCredit({worker:20,platform:60,client:20},authorityReference('data','monitoring')),1);
assert.deepEqual(analysisAxes({noWorkEnding:true}).map(a=>a.id),['price','allocation','risk','termination']);
assert.deepEqual(evidenceDimensions({noWorkEnding:true}),['contract','price','allocation','burden','access']);
assert.equal(evidenceFor('payment',scenarios.data,{}).dimension,'settlement');assert.equal(evidenceFor('payment',scenarios.data,{}).scoreable,false);assert.equal(evidenceFor('ownTools',scenarios.data,{}).dimension,'burden');
const fullQuestions=questionsForState({scenarioKey:'data'}),noWorkQuestions=questionsForState({scenarioKey:'data',noWorkEnding:true}),contractQuestions=questionsForState({scenarioKey:'data',contractDeclineEnding:true});
assert.equal(fullQuestions.length,5);assert.equal(noWorkQuestions.length,3);assert.equal(contractQuestions.length,1);assert.equal(acceptedQuestionAnswer(fullQuestions[0],fullQuestions[0].reference[0]),true);
const noWorkPayment=buildPaymentSettlement(scenarios.data,{grossWorker:0,clientPaid:0,hold:0});assert.equal(noWorkPayment.mediator,0);assert.equal(noWorkPayment.transfer,0);close(noWorkPayment.net,-operatingCost(scenarios.data));assert.equal(assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:2}).outcome,'warning');
const target0=dataTargetForScene(0);close(intersectionOverUnion(target0,target0),1);const semanticAnswers=[semanticDataAnswer(0,'leftCenter','standard'),semanticDataAnswer(1,'rightCenter','standard'),semanticDataAnswer(2,'center','standard')];assert.equal(scoreWork(scenarios.data,semanticAnswers,{sampleIndexes:[0,1,2]}),100);assert.equal(qualityAfterTask(90,60),80);assert.equal(answerCredit(samples.translation[0],'B'),0);
const firstState={sampleSequence:[0,1,2,3,4,5],sampleCursor:0,currentTaskSampleIndexes:[0,1,2],completedTasks:[],workAnswers:semanticAnswers,quality:91,selectedJob:{id:'core',title:'مهمة',duration:12,pay:2.1,clientValue:5.8,stress:10},stress:24,time:0,paidTime:0,grossWorker:0,clientPaid:0};const firstTask=firstTaskOutcome(scenarios.data,firstState);assert.equal(firstTask.score,100);
const secondBase={...firstState,...firstTask.changes,stress:95,secondOffer:{id:'second-premium',title:'دفعة مميزة',pay:3.85,duration:18,clientValue:8,premium:true,sampleCount:3,stress:16},offerDecisionResult:{accepted:true},currentTaskSampleIndexes:[3,4,5],secondTaskAnswers:[semanticDataAnswer(3,'left','short'),semanticDataAnswer(4,'right','short'),semanticDataAnswer(5,'center','wide')]};const second=completeSecondTask(scenarios.data,secondBase);assert.equal(second.changes.stress,100);assert.equal(second.stressDelta,5);assert.equal(second.record.stressDelta,5);assert.equal(monitorDecision({stress:42},true).stressAfter,42-BREAK_STRESS_REDUCTION);assert.equal(BREAK_MINUTES,3);
const reviewTask={id:'task-2',score:55,pay:3.85,answers:[semanticAnswers[0]],sampleIndexes:[0],technicalIssue:true};const reviewState={completedTasks:[{id:'task-1',score:92,pay:2,answers:[semanticAnswers[0]],sampleIndexes:[0]},reviewTask],reviewTaskId:'task-2',initialReviewSeverity:1,appealGround:'technical'};
assert.equal(selectReviewTask(reviewState).id,'task-2');assert.ok(availableAppealGrounds(scenarios.data,reviewState).technical);assert.equal(reviewAppeal(scenarios.data,reviewState).accepted,true);
const noTechnical={...reviewState,completedTasks:[{...reviewTask,technicalIssue:false}],appealGround:'technical'};assert.equal(availableAppealGrounds(scenarios.data,noTechnical).technical,undefined);assert.equal(reviewAppeal(scenarios.data,noTechnical).accepted,false);
assert.equal(appealCostChanges({stress:99,time:0,extraWorkTime:0}).appealCost.stress,1);
const major=disputeConsequences(reviewState,2);close(major.hold,.693);assert.equal(applyDisputeOutcome({qualityBeforeDispute:80,completedTasks:[{id:'task-1',pay:2}],reviewTaskId:'task-1',initialReviewSeverity:2,finalReviewSeverity:1}).changes.quality,76);
let technicalRisk=null;for(let seed=1;seed<500&&!technicalRisk;seed++){const base={riskSeed:seed,time:12,extraWorkTime:0,stress:30,riskEvent:null,completedTasks:[{id:'task-1',score:90,sampleIndexes:[0]},{id:'task-2',score:80,sampleIndexes:[1]}]};const out=riskTransition(scenarios.data,base);if(out.event.occurred)technicalRisk=out}
assert.ok(technicalRisk);assert.equal(technicalRisk.event.affectedTaskId,'task-2');assert.equal(technicalRisk.changes.completedTasks[0].technicalIssue,false);assert.equal(technicalRisk.changes.completedTasks[1].technicalIssue,true);
function perfectValues(ref){const out={worker:0,platform:0,client:0};if(ref.primary.length===2){ref.primary.forEach(p=>out[p]=45);parties.filter(p=>!ref.primary.includes(p)).forEach(p=>out[p]=10)}else if(ref.secondary.length===2){out[ref.primary[0]]=50;ref.secondary.forEach(p=>out[p]=25)}else if(ref.secondary.length===1){out[ref.primary[0]]=60;out[ref.secondary[0]]=30;parties.filter(p=>!ref.primary.includes(p)&&!ref.secondary.includes(p)).forEach(p=>out[p]=10)}else{out[ref.primary[0]]=60;parties.filter(p=>p!==ref.primary[0]).forEach(p=>out[p]=20)}return out}
const perfectPower=Object.fromEntries(axes.map(a=>[a.id,perfectValues(authorityReference('data',a.id))]));
const perfectEvidence=['contract','ownTools','priceSetting','allocation','monitoring','clientQuality','payment','accessDecision'],perfectSort={contract:'dep',ownTools:'dep',priceSetting:'ctrl',allocation:'ctrl',monitoring:'ctrl',clientQuality:'ctrl',accessDecision:'ctrl'},analysisState={evidence:perfectEvidence,evidenceSort:perfectSort,power:perfectPower,powerTouched:axes.map(a=>a.id)};
assert.equal(powerMapComplete(analysisState),true);const analysis=scoreAnalysis(scenarios.data,analysisState);assert.equal(analysis.score,100);assert.equal(analysis.sortScore,40);assert.equal(analysis.powerScore,60);assert.equal('qScore' in analysis,false);
console.log('No Boss domain checks passed');
