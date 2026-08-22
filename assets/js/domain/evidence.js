import {evidenceTemplates} from '../data/evidence-templates.js';

export function evidenceFor(id,scenario,state){
 const evidence={...(evidenceTemplates[id]||{title:id,dimension:'other',preferredKind:'dep',validKinds:['dep'],text:''})};
 if(id==='priceSetting'){
  evidence.text=scenario.priceMechanism;
  evidence.validKinds=['ctrl','dep'];
  evidence.preferredKind='ctrl';
 }
 if(id==='allocation'){
  evidence.text=scenario.allocationMechanism;
  evidence.validKinds=['ctrl','dep'];
  evidence.preferredKind='ctrl';
 }
 if(id==='monitoring'){
  evidence.text=scenario.monitoring==='light'?'تسجل المنصة وقت التسليم وسجل التعديلات.':scenario.monitoring==='intensive'?'تسجل المنصة سرعة القرار والخمول وبعض مؤشرات النشاط.':scenario.monitoring==='timing'?'تسجل المنصة أزمنة المهمة وتبديل التبويب وتعديلات الإجابات.':'تسجل المنصة النشاط والخمول وتغييرات النافذة.';
 }
 if(id==='risk'){
  const event=state.riskEvent;
  evidence.title='حادث أضاف وقتًا مرتبطًا بالعمل بلا مقابل مستقل';
  evidence.text=event?.occurred===true?`${event.title}: أضاف الحدث ${event.minutes} دقيقة مرتبطة بالعمل من دون مهمة جديدة ذات سعر مستقل.`:'لم يقع حادث في هذه الجولة؛ لا ينبغي استخدام هذا العنصر كدليل على واقعة لم تحدث.';
  evidence.validKinds=['dep'];
  evidence.preferredKind='dep';
 }
 return evidence;
}