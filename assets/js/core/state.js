import {axes} from '../data/scenarios.js';import {saveState,loadState,clearState} from './storage.js';
export function freshState(){const power={};axes.forEach(a=>power[a.id]={worker:25,platform:25,client:25,mediator:25});return {version:'2.0.0',scenarioKey:null,status:'غير نشط',grossWorker:0,clientPaid:0,time:0,paidTime:0,unpaidTime:0,quality:92,qualityAfterFirstTask:null,acceptance:100,acceptedOffers:10,offerDecisions:10,access:72,stress:22,jobsDone:0,rejections:0,rejectedJobs:[],selectedJob:null,workAnswers:[],workScore:0,workStep:'market',secondOffer:null,managementStep:'ranking',rankingBeforeAccess:null,rushAccepted:null,offerDecisionResult:null,tookBreak:null,monitorDecision:null,riskEvent:null,riskApplied:false,appealed:null,disputeSeverity:0,hold:0,payment:null,accountOutcome:null,accessDecision:null,evidence:['contract','ownTools','multiPlatform'],log:[],evidenceSort:{},answers:{},investigationStep:'case',power,analysisText:'',conclusionEvidence:[],selectedRights:[],resultData:null,realStartedAt:null,realFinishedAt:null,currentPage:'home',checkpoints:[]};}
const saved=loadState();let state=saved?{...freshState(),...saved}:freshState();
export function getState(){return state}
export function setState(next){state={...freshState(),...next};saveState(state);return state}
export function patch(p){Object.assign(state,p);saveState(state);return state}
export function reset(){state=freshState();clearState();saveState(state);return state}
export function checkpoint(targetPage){const snap=structuredClone(state);snap.checkpoints=[];state.checkpoints.push({page:state.currentPage,snapshot:snap,target:targetPage});if(state.checkpoints.length>24)state.checkpoints.shift();saveState(state)}
export function enterPage(page,{record=true}={}){if(record&&state.currentPage!==page)checkpoint(page);state.currentPage=page;saveState(state)}
export function undoCheckpoint(){const item=state.checkpoints.pop();if(!item)return null;const keep=state.checkpoints;state=structuredClone(item.snapshot);state.checkpoints=keep;saveState(state);return item.page}
export function addEvidence(id){if(!state.evidence.includes(id))state.evidence.push(id);saveState(state)}
export function addLog(title,text){const h=9+Math.floor(state.time/60),m=String(state.time%60).padStart(2,'0');state.log.push({time:`${String(h).padStart(2,'0')}:${m}`,title,text});saveState(state)}
export function recalcAcceptance(){state.acceptance=Math.round(state.acceptedOffers/state.offerDecisions*100);saveState(state)}
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));export const money=v=>'$'+Number(v||0).toFixed(2);
