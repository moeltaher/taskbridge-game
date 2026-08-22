import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {APP_VERSION,ECONOMY_MODEL_VERSION,SCORE_MODEL_VERSION} from '../assets/js/core/config.js';
import {pages} from '../assets/js/core/routes.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),read=path=>readFileSync(resolve(root,path),'utf8');
const routeFiles=['index.html',...Object.entries(pages).filter(([id])=>id!=='home').map(([,page])=>`${page.slug}/index.html`)];
for(const file of routeFiles){assert.ok(existsSync(resolve(root,file)),`missing ${file}`);const source=read(file);assert.ok(source.includes('bootstrap.js'));assert.ok(source.includes(`No Boss v${APP_VERSION}`),`stale route ${file}`)}
const required=['assets/js/data/data-scenes.js','assets/js/data/authority-model.js','assets/js/data/task-guides.js','assets/js/data/parties.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/task-ui.js','assets/js/core/power-scoring.js','assets/js/domain/analysis.js','assets/js/domain/dispute.js','assets/js/domain/payment.js','assets/js/domain/questions.js','assets/js/domain/work.js','assets/js/pages/work.js','assets/js/pages/management.js','assets/js/pages/power.js','assets/js/pages/conclusion.js','assets/js/pages/result.js','scripts/generate-pages.mjs','scripts/check.mjs','scripts/domain-check.mjs','scripts/semantic-invariants-check.mjs','tests/e2e/accessibility.spec.mjs','tests/e2e/journey.spec.mjs','package.json','.github/workflows/check.yml'];
for(const file of required)assert.ok(existsSync(resolve(root,file)),`missing ${file}`);
for(const obsolete of ['assets/js/data/power-targets.js','assets/js/data/question-references.js'])assert.equal(existsSync(resolve(root,obsolete)),false,`obsolete file still exists: ${obsolete}`);
const state=read('assets/js/core/state.js'),questions=read('assets/js/domain/questions.js'),analysis=read('assets/js/domain/analysis.js'),access=read('assets/js/domain/access.js'),result=read('assets/js/pages/result.js'),components=read('assets/css/components.css'),game=read('assets/css/game.css');
assert.ok(state.includes('STATE_SCHEMA_VERSION=6'));assert.equal(SCORE_MODEL_VERSION,'5');assert.equal(ECONOMY_MODEL_VERSION,'2');
assert.ok(!questions.includes('scoredQuestionsForState'));assert.ok(!analysis.includes('qScore'));assert.ok(!access.includes('disputeSeverity'));assert.ok(!result.includes('power-targets'));
assert.equal((components.match(/\.locked-opportunity/g)||[]).length,0);assert.equal((game.match(/\.locked-opportunity\{/g)||[]).length,1);
const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,APP_VERSION);
for(const script of ['check','check:routes','check:structural','check:regression','check:domain','check:semantic','check:syntax','test:e2e'])assert.ok(pkg.scripts[script],`missing npm script ${script}`);
console.log('No Boss structural guards passed');
