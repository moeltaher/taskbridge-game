const CURRENT_VERSION='3.0.1';
const CURRENT_RESULT_VERSION='No Boss v3.0.1';
const STATE_KEY='no_boss_v3_state';
const SETTINGS_KEY='no_boss_v3_settings';
const RESULTS_KEY='no_boss_v3_results';
const LEGACY_STATE_KEY='taskbridge_v2_state';
const LEGACY_SETTINGS_KEY='taskbridge_v2_settings';
const LEGACY_RESULTS_KEY='taskbridge_v2_results';

function read(key,fallback=null){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function isCurrentState(x){return !!x&&x.version===CURRENT_VERSION}
function isCurrentResult(x){return x?.version===CURRENT_RESULT_VERSION}
function resultKey(x){return x?.runId||x?.createdAt}

function migrateCurrentStateFromLegacyKey(){const existing=read(STATE_KEY);if(isCurrentState(existing))return existing;const legacy=read(LEGACY_STATE_KEY);if(isCurrentState(legacy)){localStorage.setItem(STATE_KEY,JSON.stringify(legacy));return legacy}return null}
function migrateCurrentResultsFromLegacyKey(){let current=read(RESULTS_KEY,[]);const legacy=read(LEGACY_RESULTS_KEY,[]).filter(isCurrentResult);if(legacy.length){const byKey=new Map(current.map(x=>[resultKey(x),x]));legacy.forEach(x=>{const key=resultKey(x);if(!byKey.has(key))byKey.set(key,x)});current=[...byKey.values()].slice(-30);localStorage.setItem(RESULTS_KEY,JSON.stringify(current))}return current}

export function saveState(state){localStorage.setItem(STATE_KEY,JSON.stringify(state))}
export function loadState(){return migrateCurrentStateFromLegacyKey()}
export function clearState(){localStorage.removeItem(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function hasLegacyState(){const currentSlot=read(STATE_KEY),oldSlot=read(LEGACY_STATE_KEY);return !!((currentSlot?.scenarioKey&&!isCurrentState(currentSlot))||(oldSlot?.scenarioKey&&!isCurrentState(oldSlot)))}
export function saveSettings(x){localStorage.setItem(SETTINGS_KEY,JSON.stringify(x))}
export function loadSettings(){return read(SETTINGS_KEY,read(LEGACY_SETTINGS_KEY,{}))||{}}
export function archiveResult(x){let a=migrateCurrentResultsFromLegacyKey();const key=resultKey(x),i=a.findIndex(r=>resultKey(r)===key);if(i>=0)a[i]=x;else a.push(x);localStorage.setItem(RESULTS_KEY,JSON.stringify(a.slice(-30)))}
export function savedResults(){return migrateCurrentResultsFromLegacyKey().filter(isCurrentResult)}
export function legacyResults(){const currentOld=read(RESULTS_KEY,[]).filter(x=>!isCurrentResult(x)),legacyOld=read(LEGACY_RESULTS_KEY,[]).filter(x=>!isCurrentResult(x));const byKey=new Map();[...currentOld,...legacyOld].forEach(x=>byKey.set(resultKey(x),x));return [...byKey.values()]}
