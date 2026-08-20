const STATE_KEY='no_boss_v3_state';
const SETTINGS_KEY='no_boss_v3_settings';
const RESULTS_KEY='no_boss_v3_results';
const LEGACY_STATE_KEY='taskbridge_v2_state';
const LEGACY_SETTINGS_KEY='taskbridge_v2_settings';
const LEGACY_RESULTS_KEY='taskbridge_v2_results';

function read(key,fallback=null){try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function isV3State(x){return !!x&&String(x.version||'').startsWith('3.')}
function isV3Result(x){return String(x?.version||'').includes('No Boss v3')}

function migrateV3StateFromLegacyKey(){const existing=read(STATE_KEY);if(existing)return existing;const legacy=read(LEGACY_STATE_KEY);if(isV3State(legacy)){localStorage.setItem(STATE_KEY,JSON.stringify(legacy));return legacy}return null}
function migrateV3ResultsFromLegacyKey(){let current=read(RESULTS_KEY,[]);const legacy=read(LEGACY_RESULTS_KEY,[]);const imported=legacy.filter(isV3Result);if(imported.length){const byKey=new Map(current.map(x=>[x.runId||x.createdAt,x]));imported.forEach(x=>{const key=x.runId||x.createdAt;if(!byKey.has(key))byKey.set(key,x)});current=[...byKey.values()].slice(-30);localStorage.setItem(RESULTS_KEY,JSON.stringify(current))}return current}

export function saveState(state){localStorage.setItem(STATE_KEY,JSON.stringify(state))}
export function loadState(){return migrateV3StateFromLegacyKey()}
export function clearState(){localStorage.removeItem(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function hasLegacyState(){const x=read(LEGACY_STATE_KEY);return !!x?.scenarioKey&&!isV3State(x)}
export function saveSettings(x){localStorage.setItem(SETTINGS_KEY,JSON.stringify(x))}
export function loadSettings(){return read(SETTINGS_KEY,read(LEGACY_SETTINGS_KEY,{}))||{}}
export function archiveResult(x){let a=savedResults();const key=x.runId||x.createdAt,i=a.findIndex(r=>(r.runId||r.createdAt)===key);if(i>=0)a[i]=x;else a.push(x);localStorage.setItem(RESULTS_KEY,JSON.stringify(a.slice(-30)))}
export function savedResults(){return migrateV3ResultsFromLegacyKey()}
export function legacyResults(){return read(LEGACY_RESULTS_KEY,[]).filter(x=>!isV3Result(x))}
