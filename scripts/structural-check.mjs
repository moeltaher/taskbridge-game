import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const routeFiles=['index.html','scenario/index.html','onboarding/index.html','work/index.html','management/index.html','risk/index.html','dispute/index.html','payment/index.html','access/index.html','investigation/index.html','power/index.html','conclusion/index.html','result/index.html','rights/index.html'];
for(const file of routeFiles){assert.ok(existsSync(resolve(root,file)),`missing ${file}`);const source=read(file);assert.ok(source.includes('bootstrap.js'),`missing bootstrap in ${file}`);assert.ok(source.includes('No Boss v3.0.2'),`old or missing version title in ${file}`);assert.ok(!source.includes('TaskBridge v2.0.0'),`legacy title remains in ${file}`)}
const required=['assets/js/data/scenarios.js','assets/js/data/parties.js','assets/js/data/power-targets.js','assets/js/data/question-references.js','assets/js/data/evidence-templates.js','assets/js/data/samples.js','assets/js/core/config.js','assets/js/core/html.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/routes.js','assets/js/core/ui.js','assets/js/core/bootstrap.js','assets/js/core/power-scoring.js','assets/js/domain/payment.js','assets/js/domain/access.js','assets/js/domain/evidence.js','assets/js/domain/questions.js','assets/js/domain/analysis.js','assets/js/domain/work.js','assets/js/domain/management.js','assets/js/domain/dispute.js','ARCHITECTURE.md','assets/images/no-boss-logo.svg','scripts/check.mjs','scripts/domain-check.mjs','scripts/generate-pages.mjs','scripts/serve-static.mjs','tests/e2e/smoke.spec.mjs','playwright.config.mjs','package.json','DEPLOY_GITHUB_AR.txt','.github/workflows/check.yml'];
for(const file of required)assert.ok(existsSync(resolve(root,file)),`missing ${file}`);

const config=read('assets/js/core/config.js'),routes=read('assets/js/core/routes.js'),state=read('assets/js/core/state.js'),storage=read('assets/js/core/storage.js'),bootstrap=read('assets/js/core/bootstrap.js'),ui=read('assets/js/core/ui.js'),home=read('assets/js/pages/home.js'),power=read('assets/js/pages/power.js'),conclusion=read('assets/js/pages/conclusion.js'),work=read('assets/js/pages/work.js'),management=read('assets/js/pages/management.js'),dispute=read('assets/js/pages/dispute.js'),investigation=read('assets/js/pages/investigation.js'),rights=read('assets/js/pages/rights.js'),result=read('assets/js/pages/result.js'),payment=read('assets/js/pages/payment.js'),access=read('assets/js/pages/access.js'),deploy=read('DEPLOY_GITHUB_AR.txt'),workflow=read('.github/workflows/check.yml'),generator=read('scripts/generate-pages.mjs'),scenarios=read('assets/js/data/scenarios.js'),playwright=read('playwright.config.mjs'),e2e=read('tests/e2e/smoke.spec.mjs'),pkg=JSON.parse(read('package.json'));

assert.ok(config.includes("APP_VERSION='3.0.2'")&&config.includes('SCORING_VERSION=6'));
assert.ok(routes.includes("scenario:{slug:'scenario',stage:0")&&routes.includes('stageDefault:true')&&routes.includes("result:{slug:'result',stage:11"));
assert.ok(routes.includes('isPublicPage')&&routes.includes('isResearcherPage')&&routes.includes('pageForStage'));
assert.ok(scenarios.includes("export {partyNames,parties,axes} from './parties.js'")&&scenarios.includes("export {samples} from './samples.js'"));
assert.ok(!scenarios.includes('export const powerTargets=')&&!scenarios.includes('export const evidenceTemplates=')&&!scenarios.includes('export const samples='));
assert.ok(state.includes("import {APP_VERSION,TIME_MODEL_VERSION} from './config.js'"));
assert.ok(state.includes('latestStateRevision')&&state.includes('storageWriterId')&&state.includes('export function commit'));
assert.ok(state.includes("checkpoint(page,{persistNow:false})")&&state.includes('if(state.currentPage===page)return state'));
assert.ok(state.includes('routePageForStage')&&state.includes('routeStageForPage')&&state.includes('isPublicPage'));
assert.ok(storage.includes("import {APP_VERSION,RESULT_VERSION,SCORING_VERSION} from './config.js'"));
assert.ok(storage.includes('latestStateRevision')&&storage.includes('compareStateCandidates')&&storage.includes('compactResult'));
assert.ok(bootstrap.includes('isPublicPage(page)')&&bootstrap.includes('pageForStage(currentStage)')&&bootstrap.includes('beforeunload'));
assert.ok(ui.includes("page==='rights'?consumeCheckpointTo('result'):undoCheckpoint()")&&ui.includes('isResearcherPage(page)'));
assert.ok(ui.includes('aria-label="رجوع"')&&ui.includes('aria-label="بدء من جديد"')&&ui.includes('role="progressbar"'));
assert.ok(home.includes('resumePage')&&home.includes('outcomeLabel')&&home.includes('stateStorageMode')&&home.includes('<caption'));
assert.ok(rights.includes('consumeCheckpointTo')&&!rights.includes('undoCheckpointTo')&&rights.includes('updateSummary'));
assert.ok(power.includes('powerDraft')&&power.includes('rawValuesFor')&&power.includes('escapeAttribute')&&!power.includes('render(root).then'));
assert.ok(conclusion.includes('powerMapComplete')&&conclusion.includes('scoreAnalysis')&&conclusion.includes("from '../domain/evidence.js'")&&conclusion.includes("from '../domain/analysis.js'"));
assert.ok(work.includes("from '../domain/work.js'")&&work.includes('firstTaskOutcome')&&work.includes('commit({')&&work.includes('ResizeObserver'));
assert.ok(management.includes("from '../domain/management.js'")&&management.includes('secondOfferDecision')&&management.includes('monitorDecision')&&management.includes('commit({'));
assert.ok(dispute.includes("from '../domain/dispute.js'")&&dispute.includes('publishedTranslationText')&&dispute.includes('applyDisputeOutcome')&&dispute.includes('commit({'));
assert.ok(!dispute.includes('id="msg"'));
assert.ok(investigation.includes('role="tabpanel"')&&investigation.includes('aria-controls')&&investigation.includes("from '../domain/evidence.js'")&&investigation.includes("from '../domain/questions.js'")&&!investigation.includes('render(root).then'));
assert.ok(storage.includes('writePersistent')&&storage.includes('stateStorageMode')&&storage.includes('function local(){try')&&storage.includes('function session(){try'));
assert.ok(payment.includes("from '../domain/payment.js'")&&payment.includes('commit({'));
assert.ok(access.includes("from '../domain/access.js'")&&access.includes('commit({'));
assert.ok(result.includes('const ok=archiveResult')&&result.includes('تعذر حفظ النتيجة'));
assert.ok(generator.includes("import {pages} from '../assets/js/core/routes.js'")&&generator.includes("process.argv.includes('--check')"));
assert.equal(pkg.scripts['test:e2e'],'playwright test');
assert.ok(pkg.devDependencies['@playwright/test']);
assert.ok(playwright.includes("name:'chromium'")&&playwright.includes("name:'mobile-chromium'")&&playwright.includes('serve-static.mjs'));
assert.ok(e2e.includes('startDataScenario')&&e2e.includes('home resume returns to current active stage')&&e2e.includes('direct protected route without state returns home'));
assert.ok(deploy.includes('محتويات المشروع كاملة')&&deploy.includes('مجلد assets/ كاملًا')&&!deploy.includes('خلف الشاشة'));
assert.ok(workflow.includes('node scripts/generate-pages.mjs --check')&&workflow.includes('node scripts/structural-check.mjs')&&workflow.includes('node scripts/check.mjs')&&workflow.includes('node scripts/domain-check.mjs')&&workflow.includes('node --check')&&workflow.includes('npm run test:e2e'));

console.log('No Boss structural guards passed');
