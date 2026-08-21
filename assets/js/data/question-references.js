import {authorityLeaders} from './authority-model.js';

const label={worker:'العامل',platform:'المنصة',client:'العميل',mediator:'الوسيط'};
function leaderAnswers(type,axis){const leaders=authorityLeaders(type,axis);if(leaders.length>1){const answers=['سلطة مشتركة بين المنصة والعميل'];leaders.forEach(p=>answers.push(label[p]));return answers}return leaders.map(p=>label[p])}
export const questionRef=Object.fromEntries(['data','moderation','ai','translation'].map(type=>[type,{
 price:leaderAnswers(type,'price'),
 allocation:leaderAnswers(type,'allocation'),
 monitoring:leaderAnswers(type,'monitoring'),
 risk:leaderAnswers(type,'risk'),
 termination:leaderAnswers(type,'termination')
}]));
