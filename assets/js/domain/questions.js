import {authorityLeaders} from '../data/authority-model.js';
const authorityOptions=['المنصة','العميل','سلطة مشتركة بين المنصة والعميل','العامل'];
const partyLabel={worker:'العامل',platform:'المنصة',client:'العميل'};
function priceReference(type){
 const leaders=authorityLeaders(type,'price');
 if(leaders.length===2&&leaders.includes('platform')&&leaders.includes('client'))return ['سلطة مشتركة بين المنصة والعميل'];
 return leaders.map(p=>partyLabel[p]);
}
function priceQuestion(type){return {id:'priceMechanism',title:'بحسب هذه الحالة، أين يتركز القرار المباشر بشأن السعر الذي يراه العامل؟',resultTitle:'التمييز بين تمويل المشروع وتحديد سعر العامل',options:authorityOptions,reference:priceReference(type)}}
const burdenVsControl={id:'burdenVsControl',title:'إذا تحمل العامل الجزء الأكبر من التكاليف والوقت غير المدفوع، فما القراءة الأدق؟',resultTitle:'العبء ليس سلطة',options:['عبء أكبر على العامل، وليس بالضرورة سلطة أكبر','سلطة أكبر للعامل تلقائيًا','استقلال كامل للعامل','لا علاقة لذلك بتحليل العمل'],reference:['عبء أكبر على العامل، وليس بالضرورة سلطة أكبر']};
const projectVsAccount={id:'projectVsAccount',title:'إذا استطاع العميل اختيار عامل أو استبعاده داخل مشروع، فماذا يعني ذلك؟',resultTitle:'سلطة المشروع مقابل سلطة الحساب',options:['سلطة داخل المشروع لا تساوي إدارة الحساب العام','إدارة كاملة للحساب العام','عدم وجود أي سلطة للعميل','أن وسيط الدفع يدير المشروع'],reference:['سلطة داخل المشروع لا تساوي إدارة الحساب العام']};
const rankingVsFinal={id:'rankingVsFinal',title:'إعادة ترتيب فرص العمل بعد المهمة الأولى والقرار النهائي للوصول في نهاية الوردية هما:',resultTitle:'الترتيب المرحلي مقابل قرار الوصول النهائي',options:['قراران مختلفان يستخدم كل منهما وقائع معلنة في مرحلة مختلفة','القرار نفسه مكرر مرتين','قراران يتخذهما العميل وحده','قراران لا يؤثران في فرص العمل'],reference:['قراران مختلفان يستخدم كل منهما وقائع معلنة في مرحلة مختلفة']};
const settlement={id:'settlement',title:'من ينفذ التسوية المالية، وكيف ترتبط بسلطة إدارة العمل؟',resultTitle:'التسوية المالية منفصلة عن سلطة العمل',options:['المنصة ووسيط الدفع بأدوار مالية مختلفة، ولا يجعل الدفع وسيطَ الدفع مديرًا للعمل','وسيط الدفع وحده يدير العمل لأنه يمرر الأموال','العميل وحده ينفذ كل التسوية ويدير الحساب','العامل يحدد الرسوم بعد انتهاء المهمة'],reference:['المنصة ووسيط الدفع بأدوار مالية مختلفة، ولا يجعل الدفع وسيطَ الدفع مديرًا للعمل']};
const contractGate={id:'contractGate',title:'رفض الشروط الموحدة منع دخول السوق. ما الدلالة الأقرب لهذه الواقعة؟',resultTitle:'بوابة الدخول التعاقدية',options:['للمنصة سلطة على بوابة الدخول حتى مع وجود حق الرفض','رفض الشروط يثبت أن العامل يملك سلطة مساوية للمنصة','لا توجد دلالة لأن العمل لم يبدأ','هذا القرار يخص العميل وحده'],reference:['للمنصة سلطة على بوابة الدخول حتى مع وجود حق الرفض']};
export function questionsForState(state){
 const type=state?.scenarioKey||'data';
 if(state?.contractDeclineEnding)return [contractGate];
 const common=[burdenVsControl,priceQuestion(type),projectVsAccount];
 if(state?.noWorkEnding)return common;
 return [...common,rankingVsFinal,settlement];
}
export function acceptedQuestionAnswer(question,answer){return (question?.reference||[]).includes(answer)}
