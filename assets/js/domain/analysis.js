import {axes} from '../data/parties.js';
import {powerTargets} from '../data/power-targets.js';
import {powerAxisCredit} from '../core/power-scoring.js';
import {evidenceFor} from './evidence.js';
import {acceptedQuestionReferences,acceptedQuestionAnswer,questionsForState} from './questions.js';

const WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','monitoring','risk','access'];
const NO_WORK_EVIDENCE_DIMENSIONS=['contract','price','allocation','access'];
export const conclusionClaims=[
 {id:'price',title:'من يملك الوزن الأكبر في تحديد المقابل؟',dimension:'price'},
 {id:'allocation',title:'من يملك الوزن الأكبر في توزيع فرص العمل؟',dimension:'allocation'},
 {id:'termination',title:'من يملك بوابة الحساب والوصول للسوق؟',dimension:'access'}
];
export function analysisAxes(state){return state?.noWorkEnding?axes.filter(axis=>['price','allocation','termination'].includes(axis.id)):axes}
export function evidenceDimensions(state){return state?.noWorkEnding?NO_WORK_EVIDENCE_DIMENSIONS:WORK_EVIDENCE_DIMENSIONS}
export function powerMapComplete(state){return analysisAxes(state).every(axis=>(state.powerTouched||[]).includes(axis.id)&&(state.powerEdited||[]).includes(axis.id))}
function evidenceCredit(evidence,selected){if(selected===evidence.preferredKind)return 1;if((evidence.validKinds||[]).includes(selected))return .5;return 0}
export function claimLinkCredit(scenario,state){let correct=0;for(const claim of conclusionClaims){const id=state.claimEvidence?.[claim.id];if(!id)continue;const evidence=evidenceFor(id,scenario,state);if(evidence.dimension===claim.dimension)correct++}return {correct,total:conclusionClaims.length}}
export function scoreAnalysis(scenario,state){
 const references=acceptedQuestionReferences(scenario.type),questions=questionsForState(state);
 let questionCorrect=0;
 for(const question of questions){if(acceptedQuestionAnswer(references[question.id],state.answers[question.id]))questionCorrect++}
 const questionTotal=questions.length;
 const qScore=Math.round(questionCorrect/questionTotal*25);
 const dimensions=new Map(evidenceDimensions(state).map(dimension=>[dimension,[]]));
 for(const id of state.evidence){const evidence=evidenceFor(id,scenario,state),credit=evidenceCredit(evidence,state.evidenceSort[id]);if(dimensions.has(evidence.dimension))dimensions.get(evidence.dimension).push(credit)}
 const dimensionScores=[...dimensions.values()].map(values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0);
 const evidenceCorrect=dimensionScores.reduce((a,b)=>a+b,0),evidenceTotal=dimensionScores.length;
 const sortScore=Math.round(evidenceCorrect/evidenceTotal*25);
 const targets=powerTargets[scenario.type],activeAxes=analysisAxes(state);
 let powerRaw=0;
 for(const axis of activeAxes)powerRaw+=powerAxisCredit(state.power[axis.id],targets[axis.id]);
 const powerScore=Math.round(powerRaw/activeAxes.length*35);
 const links=claimLinkCredit(scenario,state),linkScore=Math.round(links.correct/links.total*15);
 return {score:Math.min(100,qScore+sortScore+powerScore+linkScore),qScore,sortScore,powerScore,linkScore,questionCorrect,questionTotal,evidenceCorrect,evidenceTotal,claimLinksCorrect:links.correct,claimLinksTotal:links.total};
}
