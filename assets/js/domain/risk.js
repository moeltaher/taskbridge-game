export const RISK_MODEL_VERSION=3;

const profiles={
 wellbeing:{key:'wellbeing',icon:'🧠',kind:'وقت تعافٍ صحي ونفسي مرتبط بالعمل',title:'ظهرت آثار التعرض للمحتوى الذي راجعته',cause:'بعد إنهاء دفعة المراجعة، احتجت إلى 3 دقائق بعيدًا عن المنصة قبل متابعة الوردية بسبب أثر المحتوى المزعج الذي ظهر في المهمة المنجزة. هذا هو أول ظهور لهذا الأثر في الجولة.',minutes:3,stress:18,consequence:'سجلت المحاكاة 3 دقائق تحديدًا كوقت تعافٍ مرتبط بالعمل بلا مقابل مستقل، وليس كوقت تنفيذ مهمة جديدة.'},
 timeout:{key:'timeout',icon:'⏱',kind:'تحديث تعليمات بعد التسليم',title:'وصل تحديث يستلزم إعادة التحقق من عينة مسلمة',cause:'بعد تسليم مهمة التقييم، ظهر تحديث جديد لإرشادات المشروع وطلبت No Boss إعادة التحقق من جزء من الإجابات التي أرسلتها. احتجت إلى دقيقتين لهذه المراجعة الإضافية. هذا هو أول ظهور للتحديث في الجولة.',minutes:2,stress:10,consequence:'سجلت المحاكاة دقيقتين إضافيتين مرتبطتين بالعمل من دون مهمة جديدة ذات سعر مستقل.'},
 revision:{key:'revision',icon:'↺',kind:'طلب تعديل بعد التسليم',title:'وصل الآن طلب تعديل من العميل',cause:'ظهر إشعار جديد في No Boss: العميل يطلب تغيير بعض المصطلحات في ترجمة سبق أن سلمتها وفق نسخة محدثة من دليل المشروع. هذا هو أول ظهور لهذا الطلب في الجولة.',minutes:4,stress:7,consequence:'احتاج تنفيذ التعديل إلى 4 دقائق إضافية مرتبطة بالعمل لم يسجل لها مقابل مستقل.'},
 connection:{key:'connection',icon:'⌁',kind:'تعطل تقني بعد التنفيذ',title:'تعطلت مزامنة نتائج المهمة مع الخادم',cause:'بعد إنهاء مهمة التصنيف وأثناء مزامنة النتائج المسلمة، انقطع الاتصال بالخادم. استغرقت استعادة الاتصال والتحقق من اكتمال المزامنة دقيقتين. هذا هو أول ظهور لهذا الانقطاع في الجولة.',minutes:2,stress:9,consequence:'سجلت المحاكاة دقيقتين إضافيتين مرتبطتين بالعمل بسبب استعادة الاتصال والتحقق من التسليم.'}
};

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function riskProfile(type){return profiles[type]||profiles.connection}
export function riskEventKey(scenarioKey,riskType){return `${scenarioKey}:${riskType}:independent-v${RISK_MODEL_VERSION}`}

export function riskTransition(scenario,state){
 const profile=riskProfile(scenario.riskType),eventKey=riskEventKey(state.scenarioKey,scenario.riskType),old=state.riskEvent;
 if(state.riskApplied&&old?.eventKey===eventKey)return {event:old,changes:null,isNew:false};
 if(state.riskApplied&&!old?.eventKey){const event={...profile,eventKey};return {event,changes:{riskEvent:event},isNew:false}}
 let time=Number(state.time||0),extraWorkTime=Number(state.extraWorkTime||0),stress=Number(state.stress||0);
 if(state.riskApplied&&old?.eventKey&&old.eventKey!==eventKey){time=Math.max(0,time-Number(old.minutes||0));extraWorkTime=Math.max(0,extraWorkTime-Number(old.minutes||0));stress=clamp(stress-Number(old.stress||0),0,100)}
 const event={...profile,eventKey};
 return {event,isNew:true,changes:{riskEvent:event,riskApplied:true,time:time+event.minutes,extraWorkTime:extraWorkTime+event.minutes,stress:clamp(stress+event.stress,0,100),status:'حدث موقف إضافي مرتبط بالعمل'}};
}
