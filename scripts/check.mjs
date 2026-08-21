import assert from 'node:assert/strict';
import {APP_VERSION,RESULT_VERSION} from '../assets/js/core/config.js';
import {powerAxisCredit,leaders,topGroup} from '../assets/js/core/power-scoring.js';

assert.equal(APP_VERSION,'3.0.2');
assert.equal(RESULT_VERSION,'No Boss v3.0.2');

globalThis.location={pathname:'/taskbridge-game/work/index.html'};
const {projectBase,pageFromPath,href,pageForStage,stageForPage,isPublicPage,isResearcherPage}=await import('../assets/js/core/routes.js');
assert.equal(pageFromPath(),'work');
assert.equal(projectBase(),'/taskbridge-game/');
assert.equal(href('management'),'/taskbridge-game/management/');
assert.equal(pageForStage(0),'scenario');
assert.equal(pageForStage(11),'result');
assert.equal(stageForPage('rights'),11);
assert.equal(isPublicPage('home'),true);
assert.equal(isPublicPage('scenario'),true);
assert.equal(isPublicPage('work'),false);
assert.equal(isResearcherPage('investigation'),true);
assert.equal(isResearcherPage('work'),false);
location.pathname='/taskbridge-game/index.html';
assert.equal(pageFromPath(),'home');
assert.equal(projectBase(),'/taskbridge-game/');

const equal={worker:25,platform:25,client:25,mediator:25};
const target={worker:8,platform:57,client:30,mediator:5};
assert.deepEqual(leaders(equal),['worker','platform','client','mediator']);
assert.deepEqual(topGroup(equal,2),['worker','platform','client','mediator']);
assert.equal(powerAxisCredit(target,target),1);
assert.ok(powerAxisCredit(equal,target)<=0.18,'equal default distribution must not receive leader credit');
assert.ok(powerAxisCredit({worker:60,platform:10,client:20,mediator:10},target)<0.4,'wrong leader should not receive majority credit');

const localStore=new Map(),sessionStore=new Map();
const localStorageObject={getItem:key=>localStore.has(key)?localStore.get(key):null,setItem:(key,value)=>localStore.set(key,String(value)),removeItem:key=>localStore.delete(key)};
const sessionStorageObject={getItem:key=>sessionStore.has(key)?sessionStore.get(key):null,setItem:(key,value)=>sessionStore.set(key,String(value)),removeItem:key=>sessionStore.delete(key)};
globalThis.localStorage=localStorageObject;
globalThis.sessionStorage=sessionStorageObject;

const stateModule=await import('../assets/js/core/state.js');
const {getState,setState,commit,consumeCheckpointTo,resumePage,enterPage,undoCheckpoint,freshState}=stateModule;
assert.deepEqual(getState(),freshState(),'empty storage must start from a fresh state');
const draft={price:{worker:'10',platform:'50',client:'35',mediator:'5'}};
setState({...getState(),powerDraft:draft,powerEdited:['price'],powerTouched:[]});
assert.deepEqual(getState().powerDraft,draft,'state writes must preserve the current power draft');
const beforeCommitRevision=getState().storageRevision;
commit({changes:{status:'اختبار دفعة واحدة'},evidence:['contract','ownTools'],log:{title:'اختبار',text:'عملية واحدة'}});
assert.equal(getState().storageRevision,beforeCommitRevision+1,'a batched commit must persist once');
assert.deepEqual(getState().evidence,['contract','ownTools']);
assert.equal(getState().log.at(-1)?.title,'اختبار');
setState({...getState(),selectedRights:['privacy'],currentPage:'rights',stage:11,checkpoints:[{page:'result',target:'rights',snapshot:{}}]});
assert.equal(consumeCheckpointTo('result'),'result');
assert.deepEqual(getState().selectedRights,['privacy'],'returning from Rights must keep current result state');

setState({...getState(),scenarioKey:'data',stage:1,currentPage:'scenario',checkpoints:[]});
const beforeEnterRevision=getState().storageRevision;
enterPage('onboarding');
assert.equal(getState().storageRevision,beforeEnterRevision+1,'entering a new page must persist checkpoint and current page once');
assert.equal(getState().currentPage,'onboarding');
assert.equal(getState().checkpoints.at(-1)?.page,'scenario','entering Onboarding must preserve a Scenario checkpoint');
const samePageRevision=getState().storageRevision;
enterPage('onboarding');
assert.equal(getState().storageRevision,samePageRevision,'re-entering the current page must not create a storage write');
assert.equal(undoCheckpoint(),'scenario','Back from Onboarding must return to Scenario');
assert.equal(resumePage({scenarioKey:'data',stage:1,currentPage:'scenario'}),'onboarding');
assert.equal(resumePage({scenarioKey:'data',stage:11,currentPage:'rights'}),'rights');
assert.equal(resumePage({scenarioKey:'data',stage:5,currentPage:'work'}),'dispute');

const storage=await import('../assets/js/core/storage.js');
localStore.set('no_boss_results','{}');
assert.deepEqual(storage.savedResults(),[],'malformed result stores must not crash');

localStore.set('no_boss_state',JSON.stringify({storageRevision:4,storageWriterId:'local-a',scenarioKey:'ai',stage:2,currentPage:'work'}));
sessionStore.set('no_boss_state',JSON.stringify({storageRevision:5,storageWriterId:'session-a',scenarioKey:'data',stage:9,currentPage:'power'}));
assert.equal(storage.loadState().scenarioKey,'data','newer session state must beat stale persistent state');
assert.equal(storage.stateStorageMode(),'session');
assert.equal(storage.latestStateRevision(),5);

localStore.set('no_boss_state',JSON.stringify({storageRevision:8,storageWriterId:'other-tab',scenarioKey:'ai',stage:2,currentPage:'work'}));
sessionStore.set('no_boss_state',JSON.stringify({storageRevision:8,storageWriterId:'this-tab',scenarioKey:'data',stage:4,currentPage:'risk'}));
assert.equal(storage.loadState().scenarioKey,'data','an equal-revision conflict must preserve this tab session copy');
assert.equal(storage.stateStorageMode(),'session');
setState({...getState(),scenarioKey:'data',stage:4,currentPage:'risk'});
assert.ok(getState().storageRevision>8,'the next state write must advance beyond the highest shared revision');
assert.ok(getState().storageWriterId,'state writes must record a tab writer id');

localStore.set('no_boss_state',JSON.stringify({storageRevision:getState().storageRevision,storageWriterId:'same-tab',scenarioKey:'ai',stage:2,currentPage:'work'}));
const originalLocalSet=localStorageObject.setItem;
localStorageObject.setItem=()=>{throw new Error('quota')};
const fallback=storage.saveState({storageRevision:getState().storageRevision+1,storageWriterId:'same-tab',scenarioKey:'data',stage:4,currentPage:'risk'});
assert.equal(fallback.status,'session','sessionStorage must back up state when localStorage fails');
assert.equal(storage.loadState().currentPage,'risk','fallback reads must choose the newer session copy over stale local data');
assert.equal(storage.archiveResult({runId:'x'}),false,'result archive must require persistent storage');
localStorageObject.setItem=originalLocalSet;

assert.equal(storage.archiveResult({scenarioName:'بلا معرف',score:1}),false,'current result archive must require a run id');
const archived=storage.archiveResult({runId:'compact',scenarioName:'سامي',score:88,outcome:'warning',simMinutes:42,netEconomic:3.25,finalStress:51,breakTaken:true,analysis:'لا حاجة للاحتفاظ بهذا النص',answers:{price:'المنصة'},power:{price:{worker:1,platform:99}},createdAt:'2026-08-21T12:00:00.000Z',scenario:'data'});
assert.equal(archived,true);
const storedArchive=JSON.parse(localStore.get('no_boss_results'));
const compact=storedArchive.find(result=>result.runId==='compact');
assert.ok(compact,'the compact result must be persisted');
assert.deepEqual(Object.keys(compact).sort(),['breakTaken','finalStress','netEconomic','outcome','runId','scenarioName','score','simMinutes'].sort(),'archive must retain only the current comparison schema');
assert.equal(compact.score,88);

Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('blocked')}});
sessionStore.clear();
const guarded=storage.saveState({storageRevision:getState().storageRevision+2,storageWriterId:'guarded',scenarioKey:'moderation',stage:3,currentPage:'management'});
assert.equal(guarded.status,'session','a SecurityError while accessing localStorage must still allow session fallback');
assert.equal(storage.loadState().currentPage,'management');
Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:localStorageObject});

console.log('No Boss regression checks passed');
