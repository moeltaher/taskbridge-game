import {questionRef} from '../data/question-references.js';

const authorityOptions=['المنصة','العميل','سلطة مشتركة بين المنصة والعميل','العامل','الوسيط'];
export const relationshipQuestions=[
 {id:'parties',title:'من الأطراف الفاعلة في علاقة العمل؟',resultTitle:'الأطراف الفاعلة',options:['العامل + المنصة + العميل + الوسيط','العامل + العميل فقط','العامل + المنصة فقط']},
 {id:'price',title:'من يملك الوزن الأكبر في تحديد السعر الذي يراه العامل؟',resultTitle:'الطرف ذو الوزن الأكبر في تحديد المقابل',options:authorityOptions},
 {id:'allocation',title:'من يملك الوزن الأكبر في توزيع فرص العمل؟',resultTitle:'الطرف ذو الوزن الأكبر في توزيع العمل',options:authorityOptions},
 {id:'monitoring',title:'من يجمع مؤشرات الأداء المرتبطة بالمنصة؟',resultTitle:'الطرف الذي يجمع مؤشرات الأداء',options:authorityOptions},
 {id:'risk',title:'من تحمل الجزء الأكبر من تكاليف الأدوات والوقت الإضافي المرتبط بالعمل؟',resultTitle:'الطرف الذي تحمل الجزء الأكبر من التكاليف والوقت الإضافي',options:['العامل','المنصة','العميل','سلطة مشتركة بين المنصة والعميل','الوسيط']},
 {id:'termination',title:'من يملك صلاحية الحساب العام والوصول إلى سوق المهام؟',resultTitle:'الطرف الذي يملك الحساب العام والوصول للسوق',options:authorityOptions}
];
export function acceptedQuestionReferences(scenarioType){return {parties:['العامل + المنصة + العميل + الوسيط'],...questionRef[scenarioType]}}
export function acceptedQuestionAnswer(reference,answer){const values=Array.isArray(reference)?reference:[reference];return values.includes(answer)}
