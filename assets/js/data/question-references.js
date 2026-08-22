import {authorityLeaders,significantAuthorities} from './authority-model.js';

const label={worker:'العامل',platform:'المنصة',client:'العميل'};
function authorityAnswers(type,axis){
 const significant=significantAuthorities(type,axis,{within:15});
 if(significant.length===2&&significant.includes('platform')&&significant.includes('client'))return ['سلطة مشتركة بين المنصة والعميل'];
 return authorityLeaders(type,axis).map(p=>label[p]);
}
export const questionRef=Object.fromEntries(['data','moderation','ai','translation'].map(type=>[type,{
 price:authorityAnswers(type,'price'),
 allocation:authorityAnswers(type,'allocation'),
 monitoring:authorityAnswers(type,'monitoring'),
 quality:authorityAnswers(type,'quality'),
 risk:authorityAnswers(type,'risk'),
 termination:authorityAnswers(type,'termination')
}]));
