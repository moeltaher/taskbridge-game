import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {taskGuideFor} from '../assets/js/data/task-guides.js';
import {normalizeState,timeBreakdown} from '../assets/js/core/state.js';

const legacy=normalizeState({schemaVersion:3,currentPage:'work',stage:2,scenarioKey:'data',storageRevision:4,power:{price:{worker:8,platform:57,client:30,mediator:5}},marketExit:true,powerEdited:['price']});assert.equal('marketExit' in legacy,false);assert.equal('powerEdited' in legacy,false);assert.equal('mediator' in legacy.power.price,false);assert.equal(timeBreakdown(legacy).marketTime,0);
const moderationGuide=taskGuideFor('moderation');assert.ok(moderationGuide.rules.some(rule=>rule.startsWith('تهديد:')));assert.ok(moderationGuide.rules.some(rule=>rule.startsWith('غير واضح:')));
const work=await readFile(new URL('../assets/js/pages/work.js',import.meta.url),'utf8');assert.match(work,/data-semantic-size/);assert.match(work,/taskGuideHTML/);assert.match(work,/buildPaymentSettlement/);assert.doesNotMatch(work,/marketExit/);assert.doesNotMatch(work,/role="application"/);
const management=await readFile(new URL('../assets/js/pages/management.js',import.meta.url),'utf8');assert.match(management,/data-second-size/);assert.match(management,/aria-pressed/);assert.match(management,/taskGuideHTML/);
const onboarding=await readFile(new URL('../assets/js/pages/onboarding.js',import.meta.url),'utf8');assert.match(onboarding,/أعدت النظر في قرار الشروط/);assert.doesNotMatch(onboarding,/filter\(id=>id!==['"]contractGate/);
const power=await readFile(new URL('../assets/js/pages/power.js',import.meta.url),'utf8');assert.match(power,/وسيط الدفع خارج خريطة السلطة/);assert.doesNotMatch(power,/powerEdited/);
const conclusion=await readFile(new URL('../assets/js/pages/conclusion.js',import.meta.url),'utf8');assert.match(conclusion,/اختياري/);assert.doesNotMatch(conclusion,/needsCounter/);assert.doesNotMatch(conclusion,/realFinishedAt/);
const result=await readFile(new URL('../assets/js/pages/result.js',import.meta.url),'utf8');assert.match(result,/runPath/);assert.match(result,/تكاليف تشغيل مقدرة/);assert.doesNotMatch(result,/state\.noWorkEnding\?0/);
const home=await readFile(new URL('../assets/js/pages/home.js',import.meta.url),'utf8');assert.match(home,/runPath/);assert.match(home,/مسار النهاية نفسه/);
const generator=await readFile(new URL('./generate-pages.mjs',import.meta.url),'utf8');assert.match(generator,/Orphan generated route shell/);
console.log('No Boss semantic invariants passed');
