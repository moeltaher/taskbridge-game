import assert from 'node:assert/strict';
import {powerAxisCredit,leaders,topGroup} from '../assets/js/core/power-scoring.js';

globalThis.location={pathname:'/taskbridge-game/work/index.html'};
const {projectBase,pageFromPath,href}=await import('../assets/js/core/routes.js');
assert.equal(pageFromPath(),'work');
assert.equal(projectBase(),'/taskbridge-game/');
assert.equal(href('management'),'/taskbridge-game/management/');
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
globalThis.localStorage={getItem:key=>localStore.has(key)?localStore.get(key):null,setItem:(key,value)=>localStore.set(key,String(value)),removeItem:key=>localStore.delete(key)};
globalThis.sessionStorage={getItem:key=>sessionStore.has(key)?sessionStore.get(key):null,setItem:(key,value)=>sessionStore.set(key,String(value)),removeItem:key=>sessionStore.delete(key)};
localStore.set('no_boss_v3_state',JSON.stringify({version:'3.0.2',scenarioKey:'data',stage:9,currentPage:'power',powerTouched:['price','allocation']}));
const stateModule=await import('../assets/js/core/state.js');
const {getState,setState,consumeCheckpointTo}=stateModule;
assert.deepEqual(getState().powerTouched,[],'pre-powerEdited sessions must re-approve power axes');
assert.deepEqual(getState().powerEdited,[],'pre-powerEdited sessions must start with no edited axes');
const draft={price:{worker:'10',platform:'50',client:'35',mediator:'5'}};
setState({...getState(),powerDraft:draft,powerEdited:['price'],powerTouched:[]});
assert.deepEqual(getState().powerDraft,draft,'power drafts must survive state migration and reload persistence');
setState({...getState(),selectedRights:['privacy'],currentPage:'rights',stage:11,checkpoints:[{page:'result',target:'rights',snapshot:{}}]});
assert.equal(consumeCheckpointTo('result'),'result');
assert.deepEqual(getState().selectedRights,['privacy'],'returning from Rights must not restore an older result snapshot');

const storage=await import('../assets/js/core/storage.js');
localStore.set('no_boss_v3_results','{}');
localStore.set('taskbridge_v2_results','null');
assert.deepEqual(storage.savedResults(),[],'malformed but valid JSON result stores must not crash');
const originalLocalSet=localStorage.setItem;
localStorage.setItem=()=>{throw new Error('quota')};
sessionStore.clear();
assert.equal(storage.saveState({version:'3.0.2',scenarioKey:'data'}),true,'sessionStorage must back up state when localStorage fails');
assert.equal(JSON.parse(sessionStore.get('no_boss_v3_state')).scenarioKey,'data');
const originalSessionSet=sessionStorage.setItem;
sessionStorage.setItem=()=>{throw new Error('blocked')};
assert.equal(storage.archiveResult({runId:'x',version:'No Boss v3.0.2',scoringVersion:6}),false,'archive must report failure when no storage backend works');
localStorage.setItem=originalLocalSet;sessionStorage.setItem=originalSessionSet;
console.log('No Boss regression checks passed');
