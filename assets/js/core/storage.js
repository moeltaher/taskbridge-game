const STATE_KEY='no_boss_state';
const RESULTS_KEY='no_boss_results';

function local(){try{return globalThis.localStorage||null}catch{return null}}
function session(){try{return globalThis.sessionStorage||null}catch{return null}}
function readFrom(store,key,fallback=null){if(!store)return fallback;try{const raw=store.getItem(key);return raw===null?fallback:JSON.parse(raw)}catch{return fallback}}
function write(key,value){const raw=JSON.stringify(value),l=local(),s=session();let persistent=false,temporary=false;try{l?.setItem(key,raw);persistent=!!l}catch(e){console.warn('No Boss: تعذر الحفظ الدائم',e)}try{s?.setItem(key,raw);temporary=!!s}catch(e){console.warn('No Boss: تعذر الحفظ المؤقت',e)}return {ok:persistent||temporary,status:persistent?'persistent':temporary?'session':'failed',persistent,session:temporary}}
function writePersistent(key,value){const l=local();try{if(!l)return false;l.setItem(key,JSON.stringify(value));return true}catch(e){console.warn('No Boss: تعذر حفظ الأرشيف بصورة دائمة',e);return false}}
function remove(key){let ok=false;for(const store of [local(),session()].filter(Boolean)){try{store.removeItem(key);ok=true}catch(e){console.warn('No Boss: تعذر حذف البيانات من إحدى مساحات التخزين',e)}}return ok}
function asArray(value){return Array.isArray(value)?value:[]}
function isState(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&Number.isFinite(Number(value.storageRevision??0))&&typeof value.currentPage==='string'}
function stateRevision(value){const revision=Number(value?.storageRevision);return Number.isFinite(revision)&&revision>=0?revision:0}
function stateUpdatedAt(value){const updated=Number(value?.storageUpdatedAt);return Number.isFinite(updated)&&updated>=0?updated:0}
function stateWriter(value){return typeof value?.storageWriterId==='string'?value.storageWriterId:''}
function stateCandidate(store,mode){const value=readFrom(store,STATE_KEY);return isState(value)?{value,mode,revision:stateRevision(value),updatedAt:stateUpdatedAt(value),writer:stateWriter(value)}:null}
function compareStateCandidates(a,b){if(a.revision!==b.revision)return b.revision-a.revision;if(a.updatedAt!==b.updatedAt)return b.updatedAt-a.updatedAt;if(a.writer!==b.writer)return b.writer.localeCompare(a.writer);return a.mode==='persistent'?-1:b.mode==='persistent'?1:0}
function stateCandidates(){return [stateCandidate(local(),'persistent'),stateCandidate(session(),'session')].filter(Boolean)}
function newestState(){const candidates=stateCandidates();candidates.sort(compareStateCandidates);return candidates[0]||null}
function compactResult(value){return {runId:value?.runId,scenarioName:value?.scenarioName,score:value?.score,outcome:value?.outcome,simMinutes:value?.simMinutes,netEconomic:value?.netEconomic,finalStress:value?.finalStress,breakTaken:value?.breakTaken,appVersion:value?.appVersion||'legacy',scoreModelVersion:value?.scoreModelVersion||'legacy'}}

export function saveState(state){return write(STATE_KEY,state)}
export function loadState(){return newestState()?.value||null}
export function latestStateSnapshot(){return newestState()?.value||null}
export function stateStorageMode(){return newestState()?.mode||'none'}
export function clearState(){return remove(STATE_KEY)}
export function pruneStateCandidates(keep){let removed=0;for(const store of [local(),session()].filter(Boolean)){const value=readFrom(store,STATE_KEY);if(value!==null&&!keep(value)){try{store.removeItem(STATE_KEY);removed++}catch(e){console.warn('No Boss: تعذر حذف حالة غير متوافقة',e)}}}return removed}
export function hasState(){return !!loadState()?.scenarioKey}
export function archiveResult(value){if(!value?.runId)return false;const next=compactResult(value),results=asArray(readFrom(local(),RESULTS_KEY,[])).map(compactResult),index=results.findIndex(result=>result.runId===next.runId);if(index>=0)results[index]=next;else results.push(next);return writePersistent(RESULTS_KEY,results.slice(-30))}
export function savedResults(){return asArray(readFrom(local(),RESULTS_KEY,[])).map(compactResult).filter(result=>result.runId&&result.scenarioName).slice(-30)}
export function clearResults(){const l=local();if(!l)return false;try{l.removeItem(RESULTS_KEY);return true}catch(e){console.warn('No Boss: تعذر حذف أرشيف النتائج',e);return false}}
