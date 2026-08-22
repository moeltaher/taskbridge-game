import {questionRef} from '../data/question-references.js';
const authorityOptions=['المنصة','العميل','سلطة مشتركة بين المنصة والعميل','العامل'];
export const relationshipQuestions=[
 {id:'parties',title:'من الأطراف التي تؤثر مباشرة في شروط العمل وإدارته؟',resultTitle:'أطراف علاقة العمل المباشرة',options:['العامل + المنصة + العميل','العامل + المنصة + العميل + وسيط الدفع','العامل + العميل فقط','العامل + المنصة فقط'],orientation:true},
 {id:'price',title:'أين يتركز الوزن المؤثر في تحديد السعر الذي يراه العامل؟',resultTitle:'مركز الثقل في تحديد المقابل',options:authorityOptions,orientation:true},
 {id:'allocation',title:'أين يتركز الوزن المؤثر في توزيع فرص العمل؟',resultTitle:'مركز الثقل في توزيع العمل',options:authorityOptions,orientation:true},
 {id:'monitoring',title:'أين يتركز الوزن المؤثر في جمع مؤشرات الأداء واستخدامها؟',resultTitle:'مركز الثقل في المراقبة',options:authorityOptions,orientation:true},
 {id:'quality',title:'أين يتركز الوزن المؤثر في تحديد معيار جودة المشروع وقبول المخرجات؟',resultTitle:'مركز الثقل في معيار الجودة',options:authorityOptions,orientation:true},
 {id:'risk',title:'من تحمل الجزء الأكبر من تكاليف الأدوات والوقت الإضافي المرتبط بالعمل؟',resultTitle:'الطرف الذي تحمل الجزء الأكبر من التكاليف والوقت الإضافي',options:['العامل','المنصة','العميل','سلطة مشتركة بين المنصة والعميل'],orientation:true},
 {id:'termination',title:'أين يتركز الوزن المؤثر في التحكم بالحساب العام والوصول إلى سوق المهام؟',resultTitle:'مركز الثقل في الوصول للسوق',options:authorityOptions,orientation:true},
 {id:'settlement',title:'من ينفذ التسوية المالية ومن يستطيع التأثير في المبلغ المحول بعد إنجاز العمل؟',resultTitle:'سلطة التسوية المالية',options:['المنصة ووسيط الدفع بأدوار مختلفة','وسيط الدفع وحده','العميل وحده','العامل'],orientation:true}
];
export function questionsForState(state){if(state?.contractDeclineEnding)return relationshipQuestions.filter(q=>q.id==='termination');if(state?.noWorkEnding)return relationshipQuestions.filter(q=>['parties','price','allocation','termination'].includes(q.id));return relationshipQuestions}
export function scoredQuestionsForState(){return []}
export function acceptedQuestionReferences(scenarioType){return {parties:['العامل + المنصة + العميل'],...questionRef[scenarioType],settlement:['المنصة ووسيط الدفع بأدوار مختلفة']}}
export function acceptedQuestionAnswer(reference,answer){const values=Array.isArray(reference)?reference:[reference];return values.includes(answer)}