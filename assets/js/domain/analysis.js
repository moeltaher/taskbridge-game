import {axes,powerTargets} from '../data/scenarios.js';
import {SCORING_VERSION} from '../core/config.js';
import {powerAxisCredit} from '../core/power-scoring.js';
import {evidenceFor} from './evidence.js';
import {acceptedQuestionReferences,acceptedQuestionAnswer,relationshipQuestions} from './questions.js';

export function powerMapComplete(state){return axes.every(axis=>(state.powerTouched||[]).includes(axis.id)&&(state.powerEdited||[]).includes(axis.id))}

export function scoreAnalysis(scenario,state){
 const references=acceptedQuestionReferences(scenario.type);
 let questionCorrect=0;
 for(const question of relationshipQuestions){if(acceptedQuestionAnswer(references[question.id],state.answers[question.id]))questionCorrect++}
 const questionTotal=relationshipQuestions.length;
 const qScore=Math.round(questionCorrect/questionTotal*30);
 let evidenceCorrect=0;
 for(const id of state.evidence){const evidence=evidenceFor(id,scenario,state);if((evidence.validKinds||[]).includes(state.evidenceSort[id]))evidenceCorrect++}
 const evidenceTotal=state.evidence.length;
 const sortScore=evidenceTotal?Math.round(evidenceCorrect/evidenceTotal*30):0;
 const targets=powerTargets[scenario.type];
 let powerRaw=0;
 for(const axis of axes)powerRaw+=powerAxisCredit(state.power[axis.id],targets[axis.id]);
 const powerScore=Math.round(powerRaw/axes.length*40);
 return {score:Math.min(100,qScore+sortScore+powerScore),qScore,sortScore,powerScore,questionCorrect,questionTotal,evidenceCorrect,evidenceTotal,powerAxesCompleted:axes.filter(axis=>(state.powerTouched||[]).includes(axis.id)&&(state.powerEdited||[]).includes(axis.id)).length,scoringVersion:SCORING_VERSION,powerMethod:'tie-aware-relative-ranking'};
}
