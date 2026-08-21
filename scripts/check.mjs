import assert from 'node:assert/strict';
import {APP_VERSION,RESULT_VERSION,SCORING_VERSION,TIME_MODEL_VERSION} from '../assets/js/core/config.js';
import {powerAxisCredit,leaders,topGroup} from '../assets/js/core/power-scoring.js';

assert.equal(APP_VERSION,'3.0.2');
assert.equal(RESULT_VERSION,'No Boss v3.0.2');
assert.equal(SCORING_VERSION,6);
assert.equal(TIME_MODEL_VERSION,2);

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
localStore.set('no_boss_v3_state',JSON.stringify({version:APP_VERSION,storageRevision:1,scenarioKey:'data',stage:9,currentPage:'power',powerTouched:['price','allocation']}));
const stateModule=await import('../assets/js/core/state.js');
const {getState,setState,consumeCheckpointTo,pageForStage:statePageForStage,resumePage,enterPage,undoCheckpoint}=stateModule;
assert.deepEqual(getState().powerTouched,[],'pre-powerEdited sessions must re-approve power axes');
assert.deepEqual(getState().powerEdited,[],'pre-powerEdited sessions must start with no edited axes');
const draft={price:{worker:'10',platform:'50',client:'35',mediator:'5'}};
setState({...getState(),powerDraft:draft,powerEdited:['price'],powerTouched:[]});
assert.deepEqual(getState().powerDraft,draft,'power drafts must survive state migration and reload persistence');
setState({...getState(),selectedRights:['privacy'],currentPage:'rights',stage:11,checkpoints:[{page:'result',target:'rights',snapshot:{}}]});
assert.equal(consumeCheckpointTo('result'),'result');
assert.deepEqual(getState().selectedRights,['privacy'],'returning from Rights must not restore an older result snapshot');

setState({...getState(),scenarioKey:'data',stage:1,currentPage:'scenario',checkpoints:[]});
assert.equal(getState().currentPage,'scenario','runtime state migration must not skip Scenario before navigation');
enterPage('onboarding');
assert.equal(getState().currentPage,'onboarding');
assert.equal(getState().checkpoints.at(-1)?.page,'scenario','entering Onboarding must preserve a Scenario checkpoint');
assert.equal(undoCheckpoint(),'scenario','Back from Onboarding must return to Scenario');
assert.equal(statePageForStage(1),'onboarding');
assert.equal(resumePage({scenarioKey:'data',stage:1,currentPage:'scenario'}),'onboarding','resume must repair stale public-entry routes using stage');
assert.equal(resumePage({scenarioKey:'data',stage:11,currentPage:'rights'}),'rights','resume must preserve Rights when it matches the current stage');
assert.equal(resumePage({scenarioKey:'data',stage:5,currentPage:'work'}),'dispute','resume must repair a mismatched non-public route');

const storage=await import('../assets/js/core/storage.js');
localStore.set('no_boss_v3_results','{}');
localStore.set('taskbridge_v2_results','null');
assert.deepEqual(storage.savedResults(),[],'malformed but valid JSON result stores must not crash');

localStore.set('no_boss_v3_state',JSON.stringify({version:APP_VERSION,storageRevision:4,scenarioKey:'ai',stage:2,currentPage:'work'}));
sessionStore.set('no_boss_v3_state',JSON.stringify({version:APP_VERSION,storageRevision:5,scenarioKey:'data',stage:9,currentPage:'power'}));
assert.equal(storage.loadState().scenarioKey,'data','newer session state must beat stale persistent state');
assert.equal(storage.stateStorageMode(),'session','storage mode must report the backend containing the newest current state');

localStore.set('no_boss_v3_state',JSON.stringify({version:'3.0.1',storageRevision:99,scenarioKey:'translation',stage:2,currentPage:'work'}));
assert.equal(storage.loadState().scenarioKey,'data','an incompatible local state must not hide a valid current session state');

localStore.set('no_boss_v3_state',JSON.stringify({version:APP_VERSION,storageRevision:5,scenarioKey:'ai',stage:2,currentPage:'work'}));
const originalLocalSet=localStorageObject.setItem;
localStorageObject.setItem=()=>{throw new Error('quota')};
const fallback=storage.saveState({version:APP_VERSION,storageRevision:6,scenarioKey:'data',stage:4,currentPage:'risk'});
assert.equal(fallback.status,'session','sessionStorage must back up state when localStorage fails');
assert.equal(storage.loadState().currentPage,'risk','fallback reads must choose the newer session copy over stale local data');
assert.equal(storage.archiveResult({runId:'x',version:RESULT_VERSION,scoringVersion:SCORING_VERSION}),false,'result archive must require persistent storage');
localStorageObject.setItem=originalLocalSet;

Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('blocked')}});
sessionStore.clear();
const guarded=storage.saveState({version:APP_VERSION,storageRevision:7,scenarioKey:'moderation',stage:3,currentPage:'management'});
assert.equal(guarded.status,'session','a SecurityError while accessing localStorage must still allow session fallback');
assert.equal(storage.loadState().currentPage,'management');
Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:localStorageObject});

console.log('No Boss regression checks passed');
