const CURRENT_VERSION='3.0.2';
const CURRENT_RESULT_VERSION='No Boss v3.0.2';
const CURRENT_SCORING_VERSION=6;
const STATE_KEY='no_boss_v3_state';
const SETTINGS_KEY='no_boss_v3_settings';
const RESULTS_KEY='no_boss_v3_results';
const LEGACY_STATE_KEY='taskbridge_v2_state';
const LEGACY_SETTINGS_KEY='taskbridge_v2_settings';
const LEGACY_RESULTS_KEY='taskbridge_v2_results';

function stores(){return [globalThis.sessionStorage,globalThis.localStorage].filter(Boolean)}
function read(key,fallback=null){for(const store of stores()){try{const raw=store.getItem(key);if(raw!==null)return JSON.parse(raw)}catch{}}return fallback}
function write(key,value){const raw=JSON.stringify(value);let saved=false;for(const store of [globalThis.localStorage,globalThis.sessionStorage].filter(Boolean)){try{store.setItem(key,raw);saved=true}catch(e){console.warn('No Boss: تعذر الحفظ في إحدى مساحات التخزين',e)}}return saved}
function remove(key){let ok=false;for(const store of stores()){try{store.removeItem(key);ok=true}catch(e){console.warn('No Boss: تعذر حذف البيانات من إحدى مساحات التخزين',e)}}return ok}
function asArray(x){return Array.isArray(x)?x:[]}
function isCurrentState(x){return !!x&&x.version===CURRENT_VERSION}
function isCurrentResult(x){return x?.version===CURRENT_RESULT_VERSION&&x?.scoringVersion===CURRENT_SCORING_VERSION}
function resultKey(x){return x?.runId||x?.createdAt}

function migrateCurrentStateFromLegacyKey(){const existing=read(STATE_KEY);if(isCurrentState(existing))return existing;const legacy=read(LEGACY_STATE_KEY);if(isCurrentState(legacy)){write(STATE_KEY,legacy);return legacy}return null}
function allResults(){const a=asArray(read(RESULTS_KEY,[])),b=asArray(read(LEGACY_RESULTS_KEY,[])),byKey=new Map();[...b,...a].forEach(x=>{if(x&&typeof x==='object')byKey.set(resultKey(x),x)});return [...byKey.values()]}

export function saveState(state){return write(STATE_KEY,state)}
export function loadState(){return migrateCurrentStateFromLegacyKey()}
export function clearState(){return remove(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function hasLegacyState(){const currentSlot=read(STATE_KEY),oldSlot=read(LEGACY_STATE_KEY);return !!((currentSlot?.scenarioKey&&!isCurrentState(currentSlot))||(oldSlot?.scenarioKey&&!isCurrentState(oldSlot)))}
export function clearLegacyState(){const currentSlot=read(STATE_KEY);if(currentSlot&&!isCurrentState(currentSlot))remove(STATE_KEY);remove(LEGACY_STATE_KEY)}
export function saveSettings(x){return write(SETTINGS_KEY,x)}
export function loadSettings(){const current=read(SETTINGS_KEY),legacy=read(LEGACY_SETTINGS_KEY,{});return current&&typeof current==='object'?current:legacy&&typeof legacy==='object'?legacy:{}}
export function archiveResult(x){const current=allResults().filter(isCurrentResult),key=resultKey(x),i=current.findIndex(r=>resultKey(r)===key);if(i>=0)current[i]=x;else current.push(x);const old=allResults().filter(r=>!isCurrentResult(r));return write(RESULTS_KEY,[...old,...current.slice(-30)])}
export function savedResults(){return allResults().filter(isCurrentResult).slice(-30)}
export function legacyResults(){return allResults().filter(x=>!isCurrentResult(x))}
