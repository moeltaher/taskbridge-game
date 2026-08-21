import {axes} from '../data/parties.js';
import {powerTargets} from '../data/power-targets.js';
import {powerAxisCredit} from '../core/power-scoring.js';
import {evidenceFor} from './evidence.js';
import {acceptedQuestionReferences,acceptedQuestionAnswer,scoredQuestionsForState} from './questions.js';

const WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','monitoring','quality','risk','access'];
const NO_WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','access'];
const CONTRACT_DECLINE_DIMENSIONS=['contract','access'];
export function analysisAxes(state){
 if(state?.contractDeclineEnding)return axes.filter(axis=>axis.id==='termination');
 if(state?.noWorkEnding)return axes.filter(axis=>['price','allocation','termination'].includes(axis.id));
 return axes;
}
export function evidenceDimensions(state){if(state?.contractDeclineEnding)return CONTRACT_DECLINE_DIMENSIONS;return state?.noWorkEnding?NO_WORK_EVIDENCE_DIMENSIONS:WORK_EVIDENCE_DIMENSIONS}
export function powerMapComplete(state){return analysisAxes(state).every(axis=>(state.powerTouched||[]).includes(axis.id)&&(state.powerEdited||[]).includes(axis.id))}
function evidenceCredit(evidence,selected){if(selected===evidence.preferredKind)return 1;if((evidence.validKinds||[]).includes(selected))return .5;return 0}
export function scoreAnalysis(scenario,state){
 const references=acceptedQuestionReferences(scenario.type),questions=scoredQuestionsForState(state);
 let questionCorrect=0;
 for(const question of questions){if(acceptedQuestionAnswer(references[question.id],state.answers[question.id]))questionCorrect++}
 const questionTotal=questions.length;
 const qScore=questionTotal?Math.round(questionCorrect/questionTotal*30):30;
 const dimensions=new Map(evidenceDimensions(state).map(dimension=>[dimension,[]]));
 for(const id of state.evidence){const evidence=evidenceFor(id,scenario,state),credit=evidenceCredit(evidence,state.evidenceSort[id]);if(dimensions.has(evidence.dimension))dimensions.get(evidence.dimension).push(credit)}
 const dimensionScores=[...dimensions.values()].map(values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0);
 const evidenceCorrect=dimensionScores.reduce((a,b)=>a+b,0),evidenceTotal=dimensionScores.length;
 const sortScore=evidenceTotal?Math.round(evidenceCorrect/evidenceTotal*30):30;
 const targets=powerTargets[scenario.type],activeAxes=analysisAxes(state);
 let powerRaw=0;
 for(const axis of activeAxes)powerRaw+=powerAxisCredit(state.power[axis.id],targets[axis.id]);
 const powerScore=activeAxes.length?Math.round(powerRaw/activeAxes.length*40):40;
 return {score:Math.min(100,qScore+sortScore+powerScore),qScore,sortScore,powerScore,questionCorrect,questionTotal,evidenceCorrect,evidenceTotal};
}