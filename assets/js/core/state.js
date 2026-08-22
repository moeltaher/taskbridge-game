import {axes,parties} from '../data/parties.js';
import {pageForStage as routePageForStage,stageForPage as routeStageForPage,isPublicPage} from './routes.js';
import {saveState,loadState,clearState,stateStorageMode,latestStateRevision,latestStateSnapshot} from './storage.js';

export const STATE_SCHEMA_VERSION=6;
const writerId=globalThis.crypto?.randomUUID?.()||`tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
let lastPersistence={ok:true,status:'persistent',persistent:true,session:false},warnedPersistence=false,warnedSession=false,revisionCounter=0;
function persist(){
 revisionCounter=Math.max(revisionCounter,Number(state.storageRevision)||0,latestStateRevision())+1;
 state.storageRevision=revisionCounter;state.storageWriterId=writerId;state.schemaVersion=STATE_SCHEMA_VERSION;
 lastPersistence=saveState(state);
 if(lastPersistence.status==='session'&&!warnedSession){warnedSession=true;globalThis.alert?.('تعذر الحفظ الدائم، لكن تقدم الجولة محفوظ مؤقتًا داخل هذا التبويب. لا تغلق التبويب إذا أردت الاحتفاظ بالتقدم.')}
 if(lastPersistence.status==='failed'&&!warnedPersistence){warnedPersistence=true;globalThis.alert?.('تعذر حفظ تقدم الجولة في هذا المتصفح. لا تغلق الصفحة أو تنتقل منها قبل السماح بالتخزين؛ قد تضيع التغييرات غير المحفوظة.')}
 if(typeof globalThis.dispatchEvent==='function'&&typeof globalThis.Event==='function')globalThis.dispatchEvent(new Event('no-boss-state-change'));
 return lastPersistence;
}
function knownKeys(){return new Set(Object.keys(freshState()))}
function applyChanges(changes){
 const allowed=knownKeys(),entries=Object.entries(changes||{}).filter(([key])=>allowed.has(key));
 if(!entries.length)return false;
 Object.assign(state,Object.fromEntries(entries));
 return true;
}
function appendLog({title,text}){
 const h=9+Math.floor(state.time/60),m=String(state.time%60).padStart(2,'0');
 state.log.push({time:`${String(h).padStart(2,'0')}:${m}`,title,text});
}
function defaultPower(){
 const power={};
 axes.forEach(axis=>power[axis.id]={worker:35,platform:35,client:30});
 return power;
}
export function freshState(){
 return {schemaVersion:STATE_SCHEMA_VERSION,storageRevision:0,storageWriterId:null,stage:0,scenarioKey:null,status:'غير نشط',grossWorker:0,clientPaid:0,time:0,paidTime:0,marketTime:0,extraWorkTime:0,breakTime:0,quality:92,initialQuality:92,acceptance:100,acceptedOffers:0,offerDecisions:0,access:72,stress:22,rejections:0,rejectedJobs:[],termsDecision:null,contractDeclineEnding:false,selectedJob:null,noWorkEnding:false,workAnswers:[],workScore:0,workStep:'market',sampleSequence:[],sampleCursor:0,currentTaskSampleIndexes:[],completedTasks:[],reviewTaskId:null,secondOffer:null,secondTaskAnswers:[],managementStep:'ranking',rankingBeforeAccess:null,opportunityRankingDecision:null,offerDecisionResult:null,monitorDecision:null,riskSeed:null,riskEvent:null,appealed:null,appealGround:null,appealCost:null,appealReview:null,initialReviewSeverity:0,finalReviewSeverity:0,hold:0,disputeFinalized:false,qualityBeforeDispute:null,payment:null,accountOutcome:null,accessDecision:null,evidence:[],log:[],evidenceSort:{},answers:{},investigationStep:'case',power:defaultPower(),powerTouched:[],powerAxisIndex:0,analysisText:'',conclusionEvidence:[],conclusionCounterEvidence:[],conclusionDualEvidence:[],selectedRights:[],resultData:null,realStartedAt:null,currentPage:'home',checkpoints:[]};
}
const ARRAY_FIELDS=['rejectedJobs','workAnswers','sampleSequence','currentTaskSampleIndexes','completedTasks','secondTaskAnswers','evidence','log','powerTouched','conclusionEvidence','conclusionCounterEvidence','conclusionDualEvidence','selectedRights','checkpoints'];
function migratedPower(prior,fallback){
 const values={};let total=0;
 for(const party of parties){const n=Math.max(0,Number(prior?.[party]??fallback[party]??0));values[party]=n;total+=n}
 if(total<=0)return {...fallback};
 let used=0;
 for(let i=0;i<parties.length;i++){const party=parties[i];if(i===parties.length-1)values[party]=100-used;else{values[party]=Math.max(0,Math.round(values[party]/total*100));used+=values[party]}}
 return values;
}
export function normalizeState(value){
 const base=freshState();
 if(!value||typeof value!=='object'||Array.isArray(value))return base;
 const legacy=Number(value.schemaVersion||0)!==STATE_SCHEMA_VERSION,normalized={...base};
 for(const key of Object.keys(base)){if(Object.prototype.hasOwnProperty.call(value,key))normalized[key]=value[key]}
 normalized.schemaVersion=STATE_SCHEMA_VERSION;
 for(const key of ARRAY_FIELDS)normalized[key]=Array.isArray(value[key])?value[key]:base[key];
 normalized.evidenceSort=value.evidenceSort&&typeof value.evidenceSort==='object'?value.evidenceSort:{};
 normalized.answers=value.answers&&typeof value.answers==='object'?value.answers:{};
 normalized.power={...base.power};
 for(const axis of axes)normalized.power[axis.id]=migratedPower(value.power?.[axis.id],base.power[axis.id]);
 if(legacy)normalized.checkpoints=[];
 return normalized;
}
function syncExternalState(){
 const latest=latestStateSnapshot();
 if(!latest)return false;
 const latestRevision=Number(latest.storageRevision)||0,currentRevision=Number(state.storageRevision)||0;
 if(latestRevision>currentRevision&&latest.storageWriterId&&latest.storageWriterId!==writerId){
  state=normalizeState(latest);revisionCounter=Math.max(revisionCounter,latestRevision);return true;
 }
 return false;
}
const saved=loadState();let state=saved?normalizeState(saved):freshState();
revisionCounter=Number(state.storageRevision)||0;
const initialMode=stateStorageMode();
lastPersistence=initialMode==='session'?{ok:true,status:'session',persistent:false,session:true}:{ok:true,status:'persistent',persistent:true,session:false};
export function getState(){return state}
export function persistenceStatus(){return lastPersistence}
export function resumePage(s=state){
 const current=s?.currentPage,stage=Number(s?.stage||0);
 if(s?.scenarioKey&&current&&!isPublicPage(current)&&routeStageForPage(current)===stage)return current;
 if(s?.scenarioKey&&stage>0)return routePageForStage(stage);
 return current&&current!=='home'?current:'scenario';
}
export function setState(next){
 syncExternalState();state=normalizeState(structuredClone(next));
 revisionCounter=Math.max(revisionCounter,Number(state.storageRevision)||0);persist();return state;
}
function checkpoint({persistNow=true,label='العودة إلى الحالة السابقة'}={}){
 const snap=structuredClone(state);snap.checkpoints=[];
 state.checkpoints.push({page:state.currentPage,label,snapshot:snap});
 if(state.checkpoints.length>30)state.checkpoints.shift();
 if(persistNow)persist();
 return state;
}
export function commit({changes={},evidence=[],log=null,checkpointLabel=null}={}){
 syncExternalState();
 const nextStage=Object.prototype.hasOwnProperty.call(changes,'stage')?Number(changes.stage):Number(state.stage);
 const stageChanges=Number.isFinite(nextStage)&&nextStage!==Number(state.stage);
 if(stageChanges||checkpointLabel)checkpoint({persistNow:false,label:checkpointLabel||'العودة إلى المرحلة السابقة'});
 let dirty=applyChanges(changes);
 for(const id of evidence){if(!state.evidence.includes(id)){state.evidence.push(id);dirty=true}}
 if(log){appendLog(log);dirty=true}
 if(dirty)persist();
 return state;
}
export function patch(changes){return commit({changes})}
export function reset(){
 state=freshState();clearState();warnedPersistence=false;warnedSession=false;revisionCounter=0;persist();return state;
}
export function enterPage(page,{record=true}={}){
 syncExternalState();
 if(state.currentPage===page)return state;
 if(record&&state.checkpoints.at(-1)?.page!==state.currentPage)checkpoint({persistNow:false,label:'العودة إلى الصفحة السابقة'});
 state.currentPage=page;persist();return state;
}
export function currentBackLabel(){return state.checkpoints.at(-1)?.label||'رجوع'}
export function undoCheckpoint(){
 syncExternalState();
 const item=state.checkpoints.pop();
 if(!item)return null;
 const keep=state.checkpoints;
 state=normalizeState(structuredClone(item.snapshot));
 state.checkpoints=keep;state.currentPage=item.page;persist();
 return item.page;
}
export function consumeCheckpointTo(expectedPage){
 syncExternalState();
 const item=state.checkpoints.at(-1);
 if(item?.page!==expectedPage)return null;
 state.checkpoints.pop();state.currentPage=expectedPage;persist();return expectedPage;
}
export function timeBreakdown(s=state){return {taskTime:Number(s.paidTime||0),marketTime:Number(s.marketTime||0),extraWorkTime:Number(s.extraWorkTime||0),breakTime:Number(s.breakTime||0),totalTime:Number(s.time||0)}}
export function wellbeingLabel(v){return v>=70?'عبء مرتفع':v>=40?'عبء متوسط':'عبء منخفض'}
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const money=v=>{const n=Number(v||0),text=n<0?`-$${Math.abs(n).toFixed(2)}`:`$${n.toFixed(2)}`;return `\u2066${text}\u2069`};
