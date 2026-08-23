import {axes} from '../data/parties.js';
import {authorityReference} from '../data/authority-model.js';
import {powerAxisCredit} from '../core/power-scoring.js';
import {evidenceFor} from './evidence.js';

const WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','monitoring','quality','burden','access'];
const NO_WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','burden','access'];
const CONTRACT_DECLINE_DIMENSIONS=['contract','access'];
export function analysisAxes(state){if(state?.contractDeclineEnding)return axes.filter(axis=>axis.id==='termination');if(state?.noWorkEnding)return axes.filter(axis=>['price','allocation','risk','termination'].includes(axis.id));return axes}
export function evidenceDimensions(state){if(state?.contractDeclineEnding)return CONTRACT_DECLINE_DIMENSIONS;return state?.noWorkEnding?NO_WORK_EVIDENCE_DIMENSIONS:WORK_EVIDENCE_DIMENSIONS}
export function powerMapComplete(state){return analysisAxes(state).every(axis=>(state.powerConfirmed||[]).includes(axis.id))}
function evidenceCredit(evidence,selected){if(evidence.scoreable===false)return null;if(selected===evidence.preferredKind)return 1;if((evidence.validKinds||[]).includes(selected))return .5;return 0}
export function scoreAnalysis(scenario,state){
 const dimensions=new Map(evidenceDimensions(state).map(dimension=>[dimension,[]]));
 for(const id of state.evidence){const evidence=evidenceFor(id,scenario,state),credit=evidenceCredit(evidence,state.evidenceSort[id]);if(credit!==null&&dimensions.has(evidence.dimension))dimensions.get(evidence.dimension).push(credit)}
 const dimensionScores=[...dimensions.values()].map(values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0),evidenceCorrect=dimensionScores.reduce((a,b)=>a+b,0),evidenceTotal=dimensionScores.length,sortScore=evidenceTotal?Math.round(evidenceCorrect/evidenceTotal*40):40,activeAxes=analysisAxes(state);
 let powerRaw=0;for(const axis of activeAxes)powerRaw+=powerAxisCredit(state.power[axis.id],authorityReference(scenario.type,axis.id));
 const powerScore=activeAxes.length?Math.round(powerRaw/activeAxes.length*60):60;
 return {score:Math.min(100,sortScore+powerScore),sortScore,powerScore,evidenceCorrect,evidenceTotal};
}
