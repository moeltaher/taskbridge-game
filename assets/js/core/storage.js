import {APP_VERSION,RESULT_VERSION,SCORING_VERSION} from './config.js';
const CURRENT_VERSION=APP_VERSION;
const CURRENT_RESULT_VERSION=RESULT_VERSION;
const CURRENT_SCORING_VERSION=SCORING_VERSION;
const STATE_KEY='no_boss_v3_state';
const RESULTS_KEY='no_boss_v3_results';
const LEGACY_STATE_KEY='taskbridge_v2_state';
const LEGACY_RESULTS_KEY='taskbridge_v2_results';
const MISSING=Symbol('missing');

function local(){try{return globalThis.localStorage||null}catch{return null}}
function session(){try{return globalThis.sessionStorage||null}catch{return null}}
function readFrom(store,key,fallback=null){if(!store)return fallback;try{const raw=store.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function write(key,value){const raw=JSON.stringify(value),l=local(),s=session();let persistent=false,temporary=false;try{l?.setItem(key,raw);persistent=!!l}catch(e){console.warn('No Boss: تعذر الحفظ الدائم',e)}try{s?.setItem(key,raw);temporary=!!s}catch(e){console.warn('No Boss: تعذر الحفظ المؤقت',e)}return {ok:persistent||temporary,status:persistent?'persistent':temporary?'session':'failed',persistent,session:temporary}}
function writePersistent(key,value){const l=local();try{if(!l)return false;l.setItem(key,JSON.stringify(value));return true}catch(e){console.warn('No Boss: تعذر حفظ الأرشيف بصورة دائمة',e);return false}}
function remove(key){let ok=false;for(const store of [local(),session()].filter(Boolean)){try{store.removeItem(key);ok=true}catch(e){console.warn('No Boss: تعذر حذف البيانات من إحدى مساحات التخزين',e)}}return ok}
function asArray(x){return Array.isArray(x)?x:[]}
function isCurrentState(x){return !!x&&x.version===CURRENT_VERSION}
function stateRevision(x){const n=Number(x?.storageRevision);return Number.isFinite(n)&&n>=0?n:0}
function stateWriter(x){return typeof x?.storageWriterId==='string'?x.storageWriterId:''}
function currentStateCandidate(store,key,mode){const value=readFrom(store,key,MISSING);return isCurrentState(value)?{value,mode,revision:stateRevision(value),writer:stateWriter(value)}:null}
function compareStateCandidates(a,b){if(a.revision!==b.revision)return b.revision-a.revision;if(a.writer&&b.writer&&a.writer!==b.writer){if(a.mode==='session')return -1;if(b.mode==='session')return 1}return a.mode==='persistent'?-1:b.mode==='persistent'?1:0}
function currentStateCandidates(key){return [currentStateCandidate(local(),key,'persistent'),currentStateCandidate(session(),key,'session')].filter(Boolean)}
function newestCurrentState(key){const candidates=currentStateCandidates(key);candidates.sort(compareStateCandidates);return candidates[0]||null}
function isCurrentResult(x){return x?.version===CURRENT_RESULT_VERSION&&x?.scoringVersion===CURRENT_SCORING_VERSION}
function resultKey(x){return x?.runId||x?.createdAt}
function compactResult(x){return {runId:x?.runId,version:x?.version,scoringVersion:x?.scoringVersion,scenario:x?.scenario,scenarioName:x?.scenarioName,score:x?.score,outcome:x?.outcome,simMinutes:x?.simMinutes,netEconomic:x?.netEconomic,finalStress:x?.finalStress,breakTaken:x?.breakTaken,createdAt:x?.createdAt}}
function mergeArrays(...arrays){const byKey=new Map();arrays.flatMap(asArray).forEach(x=>{const key=resultKey(x);if(x&&typeof x==='object'&&key)byKey.set(key,x)});return [...byKey.values()]}

function migrateCurrentStateFromLegacyKey(){const existing=newestCurrentState(STATE_KEY);if(existing)return existing.value;const legacy=newestCurrentState(LEGACY_STATE_KEY);if(legacy){write(STATE_KEY,legacy.value);return legacy.value}return null}
function allResults(){return mergeArrays(readFrom(local(),LEGACY_RESULTS_KEY,[]),readFrom(local(),RESULTS_KEY,[]))}

export function saveState(state){return write(STATE_KEY,state)}
export function loadState(){return migrateCurrentStateFromLegacyKey()}
export function latestStateRevision(){const revisions=currentStateCandidates(STATE_KEY).map(candidate=>candidate.revision);return revisions.length?Math.max(...revisions):0}
export function stateStorageMode(){const current=newestCurrentState(STATE_KEY);if(current)return current.mode;const legacy=newestCurrentState(LEGACY_STATE_KEY);return legacy?.mode||'none'}
export function clearState(){return remove(STATE_KEY)}
export function hasState(){return !!loadState()?.scenarioKey}
export function hasLegacyState(){const slots=[readFrom(local(),STATE_KEY),readFrom(session(),STATE_KEY),readFrom(local(),LEGACY_STATE_KEY),readFrom(session(),LEGACY_STATE_KEY)];return slots.some(x=>x?.scenarioKey&&!isCurrentState(x))}
export function clearLegacyState(){for(const store of [local(),session()].filter(Boolean)){const current=readFrom(store,STATE_KEY);if(current&&!isCurrentState(current)){try{store.removeItem(STATE_KEY)}catch{}}try{store.removeItem(LEGACY_STATE_KEY)}catch{}}}
export function archiveResult(x){const next=compactResult(x),current=allResults().filter(isCurrentResult).map(compactResult),key=resultKey(next),i=current.findIndex(r=>resultKey(r)===key);if(i>=0)current[i]=next;else current.push(next);const old=allResults().filter(r=>!isCurrentResult(r));return writePersistent(RESULTS_KEY,[...old,...current.slice(-30)])}
export function savedResults(){return allResults().filter(isCurrentResult).map(compactResult).slice(-30)}
export function legacyResults(){return allResults().filter(x=>!isCurrentResult(x))}
