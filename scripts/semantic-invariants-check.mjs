import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {taskGuideFor} from '../assets/js/data/task-guides.js';
import {normalizeState,timeBreakdown} from '../assets/js/core/state.js';
const legacy=normalizeState({schemaVersion:6,currentPage:'work',stage:2,scenarioKey:'data',storageRevision:4,power:{price:{worker:8,platform:57,client:30,mediator:5}},marketExit:true,powerEdited:['price'],reviewTaskScore:70,initialStress:30,checkpoints:[{page:'old'}]});
for(const key of ['marketExit','powerEdited','reviewTaskScore','initialStress'])assert.equal(key in legacy,false);assert.equal('mediator' in legacy.power.price,false);assert.equal(legacy.checkpoints.length,0);assert.equal(timeBreakdown(legacy).marketTime,0);assert.equal(legacy.termsDeclinedBefore,false);
const moderationGuide=taskGuideFor('moderation');assert.ok(moderationGuide.rules.some(rule=>rule.startsWith('تهديد:')));assert.ok(moderationGuide.rules.some(rule=>rule.startsWith('غير واضح:')));
const work=await readFile(new URL('../assets/js/pages/work.js',import.meta.url),'utf8');assert.match(work,/المستحق المتوقع بعد إرسال المهمة/);assert.match(work,/marketBurden/);assert.match(work,/premiumSampleCount/);
const management=await readFile(new URL('../assets/js/pages/management.js',import.meta.url),'utf8');assert.match(management,/الانتقال إلى المراجعة دون استراحة/);assert.match(management,/العبء الفعلي/);assert.doesNotMatch(management,/refreshStats|factors:\[/);
const risk=await readFile(new URL('../assets/js/domain/risk.js',import.meta.url),'utf8');assert.match(risk,/affectedTaskId/);assert.match(risk,/أثر نفسي متأخر/);
const dispute=await readFile(new URL('../assets/js/pages/dispute.js',import.meta.url),'utf8');assert.match(dispute,/availableAppealGrounds/);assert.match(dispute,/التراجع عن طلب المراجعة الثانية/);assert.match(dispute,/كل الاختلافات/);assert.doesNotMatch(dispute,/APPEAL_STRESS/);
const investigation=await readFile(new URL('../assets/js/pages/investigation.js',import.meta.url),'utf8');assert.match(investigation,/معلومة تفسيرية عن حركة الأموال/);assert.match(investigation,/ArrowLeft/);assert.match(investigation,/data-v="burden"/);
const analysis=await readFile(new URL('../assets/js/domain/analysis.js',import.meta.url),'utf8');assert.match(analysis,/authorityReference/);assert.doesNotMatch(analysis,/powerTargets|qScore/);
const result=await readFile(new URL('../assets/js/pages/result.js',import.meta.url),'utf8');assert.match(result,/نموذج الدرجة \$\{SCORE_MODEL_VERSION\}/);assert.doesNotMatch(result,/power-targets|topGroup/);
const ui=await readFile(new URL('../assets/js/core/ui.js',import.meta.url),'utf8');assert.match(ui,/refreshShellState/);assert.doesNotMatch(ui,/export function refreshStats/);
const components=await readFile(new URL('../assets/css/components.css',import.meta.url),'utf8'),game=await readFile(new URL('../assets/css/game.css',import.meta.url),'utf8');assert.equal((components.match(/\.locked-opportunity/g)||[]).length,0);assert.equal((game.match(/\.locked-opportunity\{/g)||[]).length,1);assert.doesNotMatch(game,/\.actor-flow \.actor-card\{border:/);assert.match(game,/@media\(max-width:1000px\).*flow-arrow::before\{content:'↓'/);
for(const obsolete of ['../assets/js/data/power-targets.js','../assets/js/data/question-references.js']){let missing=false;try{await access(new URL(obsolete,import.meta.url),constants.F_OK)}catch{missing=true}assert.equal(missing,true)}
console.log('No Boss semantic invariants passed');
