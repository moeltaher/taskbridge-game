import {samples} from '../data/samples.js';
const profiles={
 wellbeing:{occurred:true,icon:'🧠',kind:'أثر نفسي متأخر مرتبط بالتعرض للمحتوى',title:'ظهر أثر نفسي متأخر بعد مراجعة المحتوى',cause:'تضمنت العينات التي راجعتها في هذه الجولة إساءة أو تهديدًا. بعد إغلاق العمل ظهر احتياج إضافي للتعافي بعيدًا عن المنصة. هذا حدث لاحق مستقل عن قرار أخذ استراحة قصيرة قبل المراجعة؛ الاستراحة تخفض العبء في وقتها لكنها لا تمحو تلقائيًا أثر التعرض.',minutes:3,stress:18,consequence:'سجلت المحاكاة 3 دقائق إضافية كوقت تعافٍ مرتبط بالعمل بلا مقابل مستقل.'},
 timeout:{occurred:true,icon:'⏱',kind:'تحديث تعليمات بعد التسليم',title:'وصل تحديث يستلزم إعادة التحقق من عينة مسلمة',cause:'بعد تسليم مهمة التقييم ظهر تحديث جديد لإرشادات المشروع وطلبت No Boss إعادة التحقق من جزء من الإجابات.',minutes:2,stress:10,consequence:'سجلت المحاكاة دقيقتين إضافيتين مرتبطتين بالعمل من دون مهمة جديدة ذات سعر مستقل.'},
 revision:{occurred:true,icon:'↺',kind:'طلب تعديل بعد التسليم',title:'وصل الآن طلب تعديل من العميل',cause:'ظهر إشعار جديد في No Boss: العميل يطلب تغيير بعض المصطلحات في ترجمة سبق أن سلمتها وفق نسخة محدثة من دليل المشروع.',minutes:4,stress:7,consequence:'احتاج تنفيذ التعديل إلى 4 دقائق إضافية مرتبطة بالعمل لم يسجل لها مقابل مستقل.'},
 connection:{occurred:true,icon:'⌁',kind:'عطل تقني أثّر في عرض/مزامنة الإجابة',title:'حدث خلل تقني أثناء مزامنة نتيجة التصنيف',cause:'بعد إنهاء آخر مهمة تصنيف ظهر خلل في مزامنة أحد إطارات التحديد، واضطررت إلى التحقق من أن آخر حدود مرئية حُفظت كما أرسلتها. إذا أصبحت هذه المهمة نفسها محل مراجعة، يمكن الاستناد إلى الواقعة التقنية.',minutes:2,stress:9,technicalIssue:true,consequence:'سجلت المحاكاة دقيقتين إضافيتين مرتبطتين بالعمل، وربطت الواقعة التقنية بالمهمة التي تأثرت بها بدل تعميمها على كل الجولة.'}
};
const noEvent={occurred:false,icon:'✓',kind:'لم يقع حدث إضافي',title:'لم يقع حدث إضافي في هذه الوردية',cause:'وجود خطر بنيوي في هذا النوع من العمل لا يعني أن الضرر أو التعطل يقع في كل وردية. هذه الجولة انتهت دون حادث إضافي بعد التسليم.',minutes:0,stress:0,technicalIssue:false,consequence:'لا يضاف وقت أو عبء بسبب حدث افتراضي لم يقع.'};
const probability={wellbeing:85,connection:65,timeout:60,revision:55};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function riskProfile(type){return profiles[type]||profiles.connection}
function deterministicRoll(scenario,state){
 const stableSeed=Number(state.riskSeed??state.realStartedAt??1)||1,seed=`${scenario.type}|${scenario.riskType}|${stableSeed}`;
 let hash=0;
 for(let i=0;i<seed.length;i++)hash=(hash*31+seed.charCodeAt(i))>>>0;
 return hash%100;
}
function moderationExposure(state){
 const indexes=(state.completedTasks||[]).flatMap(task=>task.sampleIndexes||[]);
 return indexes.some(index=>['تهديد','مضايقة/إساءة'].includes(samples.moderation?.[index]?.preferred));
}
export function riskTransition(scenario,state){
 if(state.riskEvent)return {event:state.riskEvent,changes:null};
 const profile=riskProfile(scenario.riskType),eligible=scenario.riskType!=='wellbeing'||moderationExposure(state);
 const threshold=eligible?(probability[scenario.riskType]??65):0,roll=deterministicRoll(scenario,state);
 const occurs=roll<threshold,affectedTask=profile.technicalIssue?(state.completedTasks||[]).at(-1):null;
 const event=occurs?{...profile,affectedTaskId:affectedTask?.id||null}:{...noEvent,affectedTaskId:null};
 const time=Number(state.time||0),extraWorkTime=Number(state.extraWorkTime||0),stress=Number(state.stress||0);
 const completedTasks=event.technicalIssue&&event.affectedTaskId?(state.completedTasks||[]).map(task=>({...task,technicalIssue:task.id===event.affectedTaskId})):(state.completedTasks||[]);
 return {event:{...event,roll,threshold},changes:{riskEvent:{...event,roll,threshold},completedTasks,time:time+event.minutes,extraWorkTime:extraWorkTime+event.minutes,stress:clamp(stress+event.stress,0,100),status:event.occurred?'حدث موقف إضافي مرتبط بالعمل':'انتهت الوردية دون حدث إضافي'}};
}
