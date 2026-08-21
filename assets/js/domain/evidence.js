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
  evidence.title='وقت إضافي مرتبط بالعمل بلا مقابل مستقل';
  evidence.text=state.riskEvent?`${state.riskEvent.title}: أضاف الحدث ${state.riskEvent.minutes} دقيقة مرتبطة بالعمل من دون مهمة جديدة ذات سعر مستقل.`:'ظهر وقت إضافي مرتبط بالعمل خارج زمن المهمات.';
  evidence.validKinds=['dep'];
  evidence.preferredKind='dep';
 }
 return evidence;
}
