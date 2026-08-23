import {evidenceTemplates} from '../data/evidence-templates.js';

export function evidenceFor(id,scenario,state){
 const evidence={...(evidenceTemplates[id]||{title:id,dimension:'other',preferredKind:'dep',validKinds:['dep'],scoreable:true,text:''})};
 if(evidence.scoreable===undefined)evidence.scoreable=true;
 if(id==='contractGate'&&state?.termsDeclinedBefore&&state?.termsDecision==='accepted'){
  evidence.text='رفض العامل الشروط الموحدة أولًا فمنع من دخول سوق المهام، ثم لم يتمكن من الدخول إلا بعد العودة وقبول الشروط نفسها دون تفاوض فردي. الواقعة تاريخية وتوضح سلطة المنصة على بوابة الدخول.';
 }
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
  evidence.validKinds=['burden'];
  evidence.preferredKind='burden';
 }
 if(id==='marketBurden'){
  const operating=Number(state.payment?.operating||0);
  evidence.text=`قضيت ${Number(state.marketTime||0)} دقيقة في تصفح العروض واتخاذ القرار، وتحملت تكاليف تشغيل مقدرة ${operating.toFixed(2)} دولار حتى مع عدم قبول مهمة.`;
 }
 if(id==='payment'&&state.payment){
  const p=state.payment;
  evidence.text=`دفع العميل ${Number(p.clientPaid||0).toFixed(2)} دولار، وكان المقابل المتفق عليه للعامل ${Number(p.contracted||0).toFixed(2)} دولار، ثم نُفذت رسوم وحجوزات وتحويل قبل وصول ${Number(p.cashPayout||0).toFixed(2)} دولار. هذه المعلومة لا تدخل درجة سلطة العمل.`;
 }
 return evidence;
}
