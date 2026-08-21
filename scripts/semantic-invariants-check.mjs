import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scenarios} from '../assets/js/data/scenarios.js';
import {axes} from '../assets/js/data/parties.js';
import {authorityModel,authorityLeaders} from '../assets/js/data/authority-model.js';
import {questionRef} from '../assets/js/data/question-references.js';
import {leaders,powerAxisCredit} from '../assets/js/core/power-scoring.js';
import {normalizeState,STATE_SCHEMA_VERSION,timeBreakdown} from '../assets/js/core/state.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';
import {riskTransition} from '../assets/js/domain/risk.js';
import {evidenceFor} from '../assets/js/domain/evidence.js';
import {questionsForState,scoredQuestionsForState,acceptedQuestionReferences} from '../assets/js/domain/questions.js';
import {analysisAxes,evidenceDimensions,scoreAnalysis} from '../assets/js/domain/analysis.js';
import {dataTargetForScene} from '../assets/js/data/data-scenes.js';
import {semanticDataAnswer,scoreWork} from '../assets/js/domain/work.js';

const partyLabel={worker:'العامل',platform:'المنصة',client:'العميل',mediator:'الوسيط'};
for(const [type,model] of Object.entries(authorityModel))for(const [axis,{distribution}] of Object.entries(model)){
 const expected=leaders(distribution);
 assert.deepEqual(authorityLeaders(type,axis),expected,`${type}/${axis}: authority leaders drifted from distribution`);
 if(questionRef[type]?.[axis])assert.deepEqual(questionRef[type][axis],expected.map(p=>partyLabel[p]),`${type}/${axis}: question reference drifted from authority model`);
}
assert.equal(axes.find(axis=>axis.id==='risk')?.metricType,'burden','risk must be modeled as burden, not authority');
assert.ok(axes.filter(axis=>axis.id!=='risk').every(axis=>axis.metricType==='control'),'non-risk map axes must remain control axes');
const target=authorityModel.data.price.distribution;
assert.equal(powerAxisCredit(target,target),1);
assert.equal(powerAxisCredit({worker:5,platform:70,client:20,mediator:5},target),1,'exact hidden percentages must not be required when authority ordering is the same');
assert.ok(powerAxisCredit({worker:70,platform:5,client:20,mediator:5},target)<1,'wrong primary authority must lose credit');

const legacy=normalizeState({currentPage:'work',stage:2,scenarioKey:'data',storageRevision:4,evidence:null,completedTasks:null,power:null,conclusionDualEvidence:null});
assert.equal(legacy.schemaVersion,STATE_SCHEMA_VERSION);
assert.deepEqual(legacy.evidence,[]);
assert.deepEqual(legacy.completedTasks,[]);
assert.deepEqual(legacy.conclusionDualEvidence,[]);
assert.equal(legacy.contractDeclineEnding,false);
assert.equal(legacy.riskSeed,null);
assert.equal(legacy.marketTime,0);
assert.equal(timeBreakdown(legacy).marketTime,0);

const noWorkOne=assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:1,workScore:0,quality:0});
const noWorkTwo=assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:2,workScore:100,quality:100});
assert.equal(noWorkOne.outcome,'warning');
assert.equal(noWorkTwo.outcome,'warning','no-work must never invent a current-project restriction');
assert.notEqual(noWorkTwo.outcome,'project');

const riskBase={riskSeed:424242,time:12,extraWorkTime:0,stress:30,riskEvent:null,breakTime:0,rejections:0,completedTasks:[{score:20}]};
const riskA=riskTransition(scenarios.data,riskBase),riskB=riskTransition(scenarios.data,{...riskBase,breakTime:30,rejections:9,completedTasks:[{score:100}]});
assert.equal(riskA.event.occurred,riskB.event.occurred,'independent risk occurrence must not change with break/rejection/task score');
assert.equal(riskA.event.roll,riskB.event.roll);
const noIncidentState={riskEvent:{occurred:false,title:'لم يقع حدث',minutes:0}};
assert.match(evidenceFor('risk',scenarios.data,noIncidentState).text,/لم يقع حادث/,'no-event must not be described as an incident');

const target0=dataTargetForScene(0);
assert.ok(target0&&target0.w>0&&target0.h>0,'data target must derive from shared scene geometry');
const correctSemantic=semanticDataAnswer(0,'leftCenter','standard');
const wrongSize=semanticDataAnswer(0,'leftCenter','short');
assert.ok(correctSemantic?.regionId&&correctSemantic?.sizeId,'nonvisual answer must encode both location and size');
assert.equal(scoreWork(scenarios.data,[correctSemantic],{sampleIndexes:[0]}),100,'equivalent nonvisual description should reach the same target');
assert.ok(scoreWork(scenarios.data,[wrongSize],{sampleIndexes:[0]})<100,'nonvisual mode must not receive target width for free');

assert.equal(evidenceFor('clientQuality',scenarios.data,{}).dimension,'quality','quality evidence must not be hidden under monitoring');
assert.deepEqual(analysisAxes({contractDeclineEnding:true}).map(axis=>axis.id),['termination']);
assert.deepEqual(evidenceDimensions({contractDeclineEnding:true}),['contract','access']);
assert.deepEqual(questionsForState({contractDeclineEnding:true}).map(q=>q.id),['termination']);
assert.equal(scoredQuestionsForState({noWorkEnding:false}).some(q=>q.id==='parties'),false,'orientation question must not contribute to analytical score');
const refs=acceptedQuestionReferences('data'),fullQuestions=questionsForState({noWorkEnding:false}),answers={};
for(const q of fullQuestions){const ref=refs[q.id];answers[q.id]=Array.isArray(ref)?ref[0]:ref}
answers.parties='العامل + العميل فقط';
const evidence=['contract','priceSetting','allocation','monitoring','clientQuality','payment','accessDecision'];
const evidenceSort={contract:'dep',priceSetting:'ctrl',allocation:'ctrl',monitoring:'ctrl',clientQuality:'ctrl',payment:'dep',accessDecision:'ctrl'};
const perfectPower=structuredClone(authorityModel.data);const power=Object.fromEntries(Object.entries(perfectPower).map(([axis,value])=>[axis,value.distribution]));
const result=scoreAnalysis(scenarios.data,{answers,evidence,evidenceSort,power,powerTouched:axes.map(a=>a.id),powerEdited:axes.map(a=>a.id),noWorkEnding:false});
assert.equal(result.qScore,30,'wrong orientation answer must not reduce analytical score');
assert.equal(result.evidenceTotal,7);

const management=await readFile(new URL('../assets/js/pages/management.js',import.meta.url),'utf8');
assert.match(management,/data-second-size/,'second data task must require a nonvisual size estimate');
const work=await readFile(new URL('../assets/js/pages/work.js',import.meta.url),'utf8');
assert.match(work,/data-semantic-size/,'first data task must require a nonvisual size estimate');
assert.doesNotMatch(work,/role="application"/,'visual annotation must not claim application semantics without keyboard controls');
const riskPage=await readFile(new URL('../assets/js/pages/risk.js',import.meta.url),'utf8');
assert.match(riskPage,/evidence:transition\.event\.occurred\?\['risk'\]:\[\]/,'no-event page must not add incident evidence');
const onboarding=await readFile(new URL('../assets/js/pages/onboarding.js',import.meta.url),'utf8');
assert.match(onboarding,/analyzeDecline/,'contract decline must remain analyzable');
const conclusion=await readFile(new URL('../assets/js/pages/conclusion.js',import.meta.url),'utf8');
assert.match(conclusion,/conclusionDualEvidence/,'conclusion must support evidence with dual argumentative role');
const resultPage=await readFile(new URL('../assets/js/pages/result.js',import.meta.url),'utf8');
assert.match(resultPage,/درجة التوافق مع المرجع التدريبي/,'result score must be named for what it actually measures');
assert.match(resultPage,/authorityRationale/,'reference result must explain its rationale');
const ui=await readFile(new URL('../assets/js/core/ui.js',import.meta.url),'utf8');
assert.match(ui,/marketTime/,'shift summary must expose market/search time');

console.log('No Boss semantic invariants passed');