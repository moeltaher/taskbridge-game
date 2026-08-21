import {axes} from '../data/parties.js';
import {powerTargets} from '../data/power-targets.js';
import {powerAxisCredit} from '../core/power-scoring.js';
import {evidenceFor} from './evidence.js';
import {acceptedQuestionReferences,acceptedQuestionAnswer,questionsForState} from './questions.js';

export function analysisAxes(state){return state?.noWorkEnding?axes.filter(axis=>['price','allocation','termination'].includes(axis.id)):axes}
export function powerMapComplete(state){return analysisAxes(state).every(axis=>(state.powerTouched||[]).includes(axis.id)&&(state.powerEdited||[]).includes(axis.id))}
function evidenceCredit(evidence,selected){if(selected===evidence.preferredKind)return 1;if((evidence.validKinds||[]).includes(selected))return .5;return 0}
export function scoreAnalysis(scenario,state){
 const references=acceptedQuestionReferences(scenario.type),questions=questionsForState(state);
 let questionCorrect=0;
 for(const question of questions){if(acceptedQuestionAnswer(references[question.id],state.answers[question.id]))questionCorrect++}
 const questionTotal=questions.length;
 const qScore=Math.round(questionCorrect/questionTotal*30);
 const dimensions=new Map();
 for(const id of state.evidence){const evidence=evidenceFor(id,scenario,state),credit=evidenceCredit(evidence,state.evidenceSort[id]);if(!dimensions.has(evidence.dimension))dimensions.set(evidence.dimension,[]);dimensions.get(evidence.dimension).push(credit)}
 const dimensionScores=[...dimensions.values()].map(values=>values.reduce((a,b)=>a+b,0)/values.length);
 const evidenceCorrect=dimensionScores.reduce((a,b)=>a+b,0),evidenceTotal=dimensionScores.length;
 const sortScore=evidenceTotal?Math.round(evidenceCorrect/evidenceTotal*30):0;
 const targets=powerTargets[scenario.type],activeAxes=analysisAxes(state);
 let powerRaw=0;
 for(const axis of activeAxes)powerRaw+=powerAxisCredit(state.power[axis.id],targets[axis.id]);
 const powerScore=Math.round(powerRaw/activeAxes.length*40);
 return {score:Math.min(100,qScore+sortScore+powerScore),qScore,sortScore,powerScore,questionCorrect,questionTotal,evidenceCorrect,evidenceTotal};
}
