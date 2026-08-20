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

const store=new Map();
globalThis.localStorage={getItem:key=>store.has(key)?store.get(key):null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
store.set('no_boss_v3_state',JSON.stringify({version:'3.0.2',scenarioKey:'data',stage:9,currentPage:'power',powerTouched:['price','allocation']}));
const {getState}=await import('../assets/js/core/state.js');
assert.deepEqual(getState().powerTouched,[],'pre-powerEdited sessions must re-approve power axes');
assert.deepEqual(getState().powerEdited,[],'pre-powerEdited sessions must start with no edited axes');
const storage=await import('../assets/js/core/storage.js');
store.set('no_boss_v3_results','{}');
store.set('taskbridge_v2_results','null');
assert.deepEqual(storage.savedResults(),[],'malformed but valid JSON result stores must not crash');
const originalSet=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota')};
assert.doesNotThrow(()=>storage.saveState({version:'3.0.2'}),'storage write failures must not crash the app');
localStorage.setItem=originalSet;
console.log('No Boss regression checks passed');
