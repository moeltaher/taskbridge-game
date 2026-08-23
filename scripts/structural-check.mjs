import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,relative,normalize} from 'node:path';
import {APP_VERSION,ECONOMY_MODEL_VERSION,SCORE_MODEL_VERSION} from '../assets/js/core/config.js';
import {pages} from '../assets/js/core/routes.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),read=path=>readFileSync(resolve(root,path),'utf8');
const routeFiles=['index.html',...Object.entries(pages).filter(([id])=>id!=='home').map(([,page])=>`${page.slug}/index.html`)];
for(const file of routeFiles){assert.ok(existsSync(resolve(root,file)),`missing ${file}`);const source=read(file);assert.ok(source.includes('bootstrap.js'));assert.ok(source.includes(`No Boss v${APP_VERSION}`),`stale route ${file}`)}
const required=['assets/js/data/data-scenes.js','assets/js/data/authority-model.js','assets/js/data/authority-rationales.js','assets/js/data/task-guides.js','assets/js/data/parties.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/task-ui.js','assets/js/core/power-scoring.js','assets/js/domain/analysis.js','assets/js/domain/dispute.js','assets/js/domain/payment.js','assets/js/domain/questions.js','assets/js/domain/work.js','assets/js/pages/work.js','assets/js/pages/management.js','assets/js/pages/power.js','assets/js/pages/conclusion.js','assets/js/pages/result.js','scripts/generate-pages.mjs','scripts/check.mjs','scripts/domain-check.mjs','scripts/semantic-invariants-check.mjs','tests/e2e/accessibility.spec.mjs','tests/e2e/journey.spec.mjs','package.json','.github/workflows/check.yml'];
for(const file of required)assert.ok(existsSync(resolve(root,file)),`missing ${file}`);
for(const obsolete of ['assets/js/data/power-targets.js','assets/js/data/question-references.js'])assert.equal(existsSync(resolve(root,obsolete)),false,`obsolete file still exists: ${obsolete}`);
const state=read('assets/js/core/state.js'),analysis=read('assets/js/domain/analysis.js'),management=read('assets/js/domain/management.js'),result=read('assets/js/pages/result.js'),ui=read('assets/js/core/ui.js'),power=read('assets/js/pages/power.js'),work=read('assets/js/domain/work.js'),payment=read('assets/js/domain/payment.js');
assert.ok(state.includes('STATE_SCHEMA_VERSION=10'));assert.equal(SCORE_MODEL_VERSION,'9');assert.equal(ECONOMY_MODEL_VERSION,'4');assert.ok(!state.includes('powerTouched'));assert.ok(!power.includes('powerTouched'));assert.ok(analysis.includes('authorityReferenceForState'));assert.ok(management.includes('baselineAcceptanceRate'));assert.ok(result.includes('authorityReferenceForState'));assert.ok(result.includes('مراجعة تصنيف الأدلة'));assert.ok(!ui.includes('معدل القبول يحسب قرارات العروض داخل هذه الجولة فقط'));assert.ok(!work.includes('technicalIssue:technicalIssue===true'));assert.ok(!payment.includes('net:availableNet'));
const pkg=JSON.parse(read('package.json'));assert.equal(pkg.version,APP_VERSION);for(const script of ['check','check:routes','check:structural','check:regression','check:domain','check:semantic','check:syntax','test:e2e'])assert.ok(pkg.scripts[script],`missing npm script ${script}`);
function walk(dir){const out=[];for(const entry of readdirSync(dir)){const absolute=resolve(dir,entry);if(statSync(absolute).isDirectory())out.push(...walk(absolute));else if(entry.endsWith('.js'))out.push(absolute)}return out}
const jsRoot=resolve(root,'assets/js'),allJs=walk(jsRoot),toRel=absolute=>relative(root,absolute).replaceAll('\\','/');
const moduleFiles=new Set(allJs.map(toRel));
const roots=new Set(['assets/js/core/bootstrap.js',...Object.keys(pages).map(id=>`assets/js/pages/${id}.js`).filter(path=>moduleFiles.has(path))]);
const importPattern=/(?:import\s+(?:[^'"()]*?\s+from\s+)?|export\s+[^'"()]*?\s+from\s+|import\s*\()\s*['"]([^'"]+)['"]/g;
function dependencies(path){const source=read(path),base=dirname(resolve(root,path)),deps=[];for(const match of source.matchAll(importPattern)){const spec=match[1];if(!spec?.startsWith('.'))continue;const absolute=normalize(resolve(base,spec));const rel=toRel(absolute);if(moduleFiles.has(rel))deps.push(rel)}return deps}
const reachable=new Set(),queue=[...roots];while(queue.length){const path=queue.pop();if(reachable.has(path)||!moduleFiles.has(path))continue;reachable.add(path);queue.push(...dependencies(path))}
const orphans=[...moduleFiles].filter(path=>!reachable.has(path));assert.deepEqual(orphans,[],`orphan JS modules: ${orphans.join(', ')}`);
console.log('No Boss structural guards passed');
