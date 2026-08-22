import {questionRef} from '../data/question-references.js';

const authorityOptions=['المنصة','العميل','سلطة مشتركة بين المنصة والعميل','العامل'];
export const relationshipQuestions=[
 {id:'parties',title:'من الأطراف التي تؤثر مباشرة في شروط العمل وإدارته؟',resultTitle:'أطراف علاقة العمل المباشرة',options:['العامل + المنصة + العميل','العامل + المنصة + العميل + وسيط الدفع','العامل + العميل فقط','العامل + المنصة فقط'],orientation:true},
 {id:'price',title:'أين يتركز الوزن المؤثر في تحديد السعر الذي يراه العامل؟',resultTitle:'مركز الثقل في تحديد المقابل',options:authorityOptions},
 {id:'allocation',title:'أين يتركز الوزن المؤثر في توزيع فرص العمل؟',resultTitle:'مركز الثقل في توزيع العمل',options:authorityOptions},
 {id:'monitoring',title:'أين يتركز الوزن المؤثر في جمع مؤشرات الأداء واستخدامها؟',resultTitle:'مركز الثقل في المراقبة',options:authorityOptions},
 {id:'quality',title:'أين يتركز الوزن المؤثر في تحديد معيار جودة المشروع وقبول المخرجات؟',resultTitle:'مركز الثقل في معيار الجودة',options:authorityOptions},
 {id:'risk',title:'من تحمل الجزء الأكبر من تكاليف الأدوات والوقت الإضافي المرتبط بالعمل؟',resultTitle:'الطرف الذي تحمل الجزء الأكبر من التكاليف والوقت الإضافي',options:['العامل','المنصة','العميل','سلطة مشتركة بين المنصة والعميل']},
 {id:'termination',title:'أين يتركز الوزن المؤثر في التحكم بالحساب العام والوصول إلى سوق المهام؟',resultTitle:'مركز الثقل في الوصول للسوق',options:authorityOptions}
];
export function questionsForState(state){
 if(state?.contractDeclineEnding)return relationshipQuestions.filter(q=>q.id==='termination');
 if(state?.noWorkEnding)return relationshipQuestions.filter(q=>['parties','price','allocation','termination'].includes(q.id));
 return relationshipQuestions;
}
export function scoredQuestionsForState(state){return questionsForState(state).filter(q=>!q.orientation)}
export function acceptedQuestionReferences(scenarioType){return {parties:['العامل + المنصة + العميل'],...questionRef[scenarioType]}}
export function acceptedQuestionAnswer(reference,answer){const values=Array.isArray(reference)?reference:[reference];return values.includes(answer)}
