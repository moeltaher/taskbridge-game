import {authorityDistribution} from './authority-model.js';

const label={worker:'العامل',platform:'المنصة',client:'العميل',mediator:'الوسيط'};
function strongestAnswers(type,axis){const dist=authorityDistribution(type,axis),entries=Object.entries(dist).sort((a,b)=>b[1]-a[1]),top=entries[0][1],tied=entries.filter(([,value])=>value===top).map(([party])=>party);if(tied.length>1&&tied.includes('platform')&&tied.includes('client'))return ['سلطة مشتركة بين المنصة والعميل'];return tied.map(p=>label[p])}
export const questionRef=Object.fromEntries(['data','moderation','ai','translation'].map(type=>[type,{
 price:strongestAnswers(type,'price'),
 allocation:strongestAnswers(type,'allocation'),
 monitoring:strongestAnswers(type,'monitoring'),
 risk:strongestAnswers(type,'risk'),
 termination:strongestAnswers(type,'termination')
}]));
