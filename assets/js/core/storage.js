const CURRENT_VERSION='3.0.2';
const CURRENT_RESULT_VERSION='No Boss v3.0.2';
const CURRENT_SCORING_VERSION=6;
const STATE_KEY='no_boss_v3_state';
const SETTINGS_KEY='no_boss_v3_settings';
const RESULTS_KEY='no_boss_v3_results';
const LEGACY_STATE_KEY='taskbridge_v2_state';
const LEGACY_SETTINGS_KEY='taskbridge_v2_settings';
const LEGACY_RESULTS_KEY='taskbridge_v2_results';

const local=()=>globalThis.localStorage||null;
const session=()=>globalThis.sessionStorage||null;
function readFrom(store,key,fallback=null){if(!store)return fallback;try{const raw=store.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function readPreferred(key,fallback=null){const a=readFrom(local(),key,undefined);if(a!==undefined)return a;const b=readFrom(session(),key,undefined);return b===undefined?fallback:b}
function write(key,value){const raw=JSON.stringify(value);let persistent=false,temporary=false;try{local()?.setItem(key,raw);persistent=!!local()}catch(e){console.warn('No Boss: تعذر الحفظ الدائم',e)}try{session()?.setItem(key,raw);temporary=!!session()}catch(e){console.warn('No Boss: تعذر الحفظ المؤقت',e)}return {ok:persistent||temporary,status:persistent?'persistent':temporary?'session':'failed',persistent,session:temporary}}
function writePersistent(key,value){try{if(!local())return false;local().setItem(key,JSON.stringify(value));return true}catch(e){console.warn('No Boss: تعذر حفظ الأرشيف بصورة دائمة',e);return false}}
function remove(key){let ok=false;for(const store of [local(),session()].filter(Boolean)){try{store.removeItem(key);ok=true}catch(e){console.warn('No Boss: تعذر حذف البيانات من إحدى مساحات التخزين',e)}}return ok}
function asArray(x){return Array.isArray(x)?x:[]}
function isCurrentState(x){return !!x&&x.version===CURRENT_VERSION}
function isCurrentResult(x){return x?.version===CURRENT_RESULT_VERSION&&x?.scoringVersion===CURRENT_SCORING_VERSION}
function resultKey(x){return x?.runId||x?.createdAt}
function mergeArrays(...arrays){const byKey=new Map();arrays.flatMap(asArray).forEach(x=>{const key=resultKey(x);if(x&&typeof x==='object'&&key)byKey.set(key,x)});return [...byKey.values()]}

function migrateCurrentStateFromLegacyKey(){const existing=readPreferred(STATE_KEY);if(isCurrentState(existing))return existing;const legacy=readPreferred(LEGACY_STATE_KEY);if(isCurrentState(legacy)){write(STATE_KEY,legacy);return legacy}return null}
function allResults(){return mergeArrays(readFrom(local(),LEGACY_RESULTS_KEY,[]),readFrom(local(),RESULTS_KEY,[]))}

export function saveState(state){return write(STATE_KEY,state)}
export function loadState(){return migrateCurrentStateFromLegacyKey()}
export function stateStorageMode(){const l=readFrom(local(),STATE_KEY);if(isCurrentState(l))return 'persistent';const s=readFrom(session(),STATE_KEY);return isCurrentState(s)?'session':'none'}
export function clearState(){return remove(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function hasLegacyState(){const slots=[readFrom(local(),STATE_KEY),readFrom(session(),STATE_KEY),readFrom(local(),LEGACY_STATE_KEY),readFrom(session(),LEGACY_STATE_KEY)];return slots.some(x=>x?.scenarioKey&&!isCurrentState(x))}
export function clearLegacyState(){for(const store of [local(),session()].filter(Boolean)){const current=readFrom(store,STATE_KEY);if(current&&!isCurrentState(current)){try{store.removeItem(STATE_KEY)}catch{}}try{store.removeItem(LEGACY_STATE_KEY)}catch{}}}
export function saveSettings(x){return write(SETTINGS_KEY,x)}
export function loadSettings(){const current=readPreferred(SETTINGS_KEY),legacy=readPreferred(LEGACY_SETTINGS_KEY,{});return current&&typeof current==='object'&&!Array.isArray(current)?current:legacy&&typeof legacy==='object'&&!Array.isArray(legacy)?legacy:{}}
export function archiveResult(x){const current=allResults().filter(isCurrentResult),key=resultKey(x),i=current.findIndex(r=>resultKey(r)===key);if(i>=0)current[i]=x;else current.push(x);const old=allResults().filter(r=>!isCurrentResult(r));return writePersistent(RESULTS_KEY,[...old,...current.slice(-30)])}
export function savedResults(){return allResults().filter(isCurrentResult).slice(-30)}
export function legacyResults(){return allResults().filter(x=>!isCurrentResult(x))}
