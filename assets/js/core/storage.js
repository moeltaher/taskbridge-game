const STATE_KEY='taskbridge_v2_state';const SETTINGS_KEY='taskbridge_v2_settings';const RESULTS_KEY='taskbridge_v2_results';
export function saveState(state){localStorage.setItem(STATE_KEY,JSON.stringify(state))}
export function loadState(){try{return JSON.parse(localStorage.getItem(STATE_KEY)||'null')}catch{return null}}
export function clearState(){localStorage.removeItem(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function saveSettings(x){localStorage.setItem(SETTINGS_KEY,JSON.stringify(x))}
export function loadSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}catch{return {}}}
export function archiveResult(x){let a=savedResults();const key=x.runId||x.createdAt,i=a.findIndex(r=>(r.runId||r.createdAt)===key);if(i>=0)a[i]=x;else a.push(x);localStorage.setItem(RESULTS_KEY,JSON.stringify(a.slice(-30)))}
export function savedResults(){try{return JSON.parse(localStorage.getItem(RESULTS_KEY)||'[]')}catch{return []}}
