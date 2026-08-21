import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {scenarios} from '../assets/js/data/scenarios.js';
import {authorityModel,authorityLeaders} from '../assets/js/data/authority-model.js';
import {questionRef} from '../assets/js/data/question-references.js';
import {leaders,powerAxisCredit} from '../assets/js/core/power-scoring.js';
import {normalizeState,STATE_SCHEMA_VERSION,timeBreakdown} from '../assets/js/core/state.js';
import {assessAccessDecision} from '../assets/js/domain/access.js';

const partyLabel={worker:'العامل',platform:'المنصة',client:'العميل',mediator:'الوسيط'};
for(const [type,model] of Object.entries(authorityModel))for(const [axis,{distribution}] of Object.entries(model)){
 const expected=leaders(distribution);
 assert.deepEqual(authorityLeaders(type,axis),expected,`${type}/${axis}: authority leaders drifted from distribution`);
 if(questionRef[type]?.[axis])assert.deepEqual(questionRef[type][axis],expected.map(p=>partyLabel[p]),`${type}/${axis}: question reference drifted from authority model`);
}
const target=authorityModel.data.price.distribution;
assert.equal(powerAxisCredit(target,target),1);
assert.equal(powerAxisCredit({worker:5,platform:70,client:20,mediator:5},target),1,'exact hidden percentages must not be required when authority ordering is the same');
assert.ok(powerAxisCredit({worker:70,platform:5,client:20,mediator:5},target)<1,'wrong primary authority must lose credit');

const legacy=normalizeState({currentPage:'work',stage:2,scenarioKey:'data',storageRevision:4,evidence:null,completedTasks:null,power:null});
assert.equal(legacy.schemaVersion,STATE_SCHEMA_VERSION);
assert.deepEqual(legacy.evidence,[]);
assert.deepEqual(legacy.completedTasks,[]);
assert.equal(legacy.marketTime,0);
assert.deepEqual(legacy.conclusionCounterEvidence,[]);
assert.equal(timeBreakdown(legacy).marketTime,0);

const noWorkA=assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:1,workScore:0,quality:0});
const noWorkB=assessAccessDecision(scenarios.data,{noWorkEnding:true,rejections:1,workScore:100,quality:100});
assert.equal(noWorkA.outcome,noWorkB.outcome,'no-work access must not depend on fabricated task quality');

const management=await readFile(new URL('../assets/js/pages/management.js',import.meta.url),'utf8');
assert.match(management,/second-annotation/,'second data task must keep the visual annotation mode');
assert.match(management,/semanticDataAnswer/,'second data task must keep the nonvisual annotation mode');
const rights=await readFile(new URL('../assets/js/pages/rights.js',import.meta.url),'utf8');
assert.match(rights,/opportunityRankingDecision/,'rights page must distinguish mid-shift ranking');
assert.match(rights,/سجل رفض العروض فقط/,'no-work rights explanation must not invent a task score');
assert.match(rights,/monitoring'\)\)add\('privacy'/,'light monitoring must still surface privacy');
assert.match(rights,/riskEvent\?\.occurred===true/,'no-event risk branch must not be presented as an incident');
const work=await readFile(new URL('../assets/js/pages/work.js',import.meta.url),'utf8');
assert.match(work,/marketTime/,'market/search time must be represented in the worker journey');
const onboarding=await readFile(new URL('../assets/js/pages/onboarding.js',import.meta.url),'utf8');
assert.match(onboarding,/id="decline"/,'contract screen must offer a real decline path');
const conclusion=await readFile(new URL('../assets/js/pages/conclusion.js',import.meta.url),'utf8');
assert.match(conclusion,/conclusionCounterEvidence/,'conclusion must preserve counter-evidence');
const dispute=await readFile(new URL('../assets/js/pages/dispute.js',import.meta.url),'utf8');
assert.match(dispute,/appeal-ground/,'appeal must require an explicit ground');

console.log('No Boss semantic invariants passed');
