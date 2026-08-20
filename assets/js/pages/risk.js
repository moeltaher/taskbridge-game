import {scenarios} from '../data/scenarios.js';import {getState,patch,addLog,addEvidence,clamp,money} from '../core/state.js';import {href} from '../core/routes.js';import {refreshStats} from '../core/ui.js';

function profile(type){
 if(type==='wellbeing')return {key:'wellbeing',icon:'🧠',kind:'خطر نفسي وصحي',title:'احتجت إلى التوقف بعد التعرض لمحتوى مزعج',cause:'أثناء مراجعة المحتوى، تراكم أثر المواد المزعجة مع ضغط السرعة. احتجت إلى 3 دقائق بعيدًا عن المهمة قبل أن تتمكن من المتابعة.',minutes:3,stress:18,consequence:'وقت التعافي لم يُحتسب ضمن الوقت المدفوع، بينما ارتفع مؤشر الضغط في المحاكاة بصورة أكبر من بقية الحالات.'};
 if(type==='timeout')return {key:'timeout',icon:'⏱',kind:'خطر الوقت وتغيّر التعليمات',title:'تغيّرت الإرشادات ثم انتهت مهلة المهمة',cause:'أثناء تقييم مخرجات الذكاء الاصطناعي، تغيّرت إرشادات المشروع. أعدت التحقق من جزء من العمل، لكن المؤقت انتهى قبل احتساب دقيقتين من هذا التحقق.',minutes:2,stress:10,consequence:'قضيت وقتًا فعليًا في التحقق بسبب تغيير في سير المشروع، لكن الدقيقتين الإضافيتين لم تُحتسبا كوقت مدفوع.'};
 if(type==='revision')return {key:'revision',icon:'↺',kind:'خطر إعادة العمل بعد التسليم',title:'طلب العميل تعديلًا بعد أن سلّمت العمل',cause:'بعد تسليم الترجمة، طلب العميل تغيير بعض المصطلحات وفق نسخة محدثة من دليل المشروع. استغرقت إعادة العمل 4 دقائق.',minutes:4,stress:7,consequence:'أُنجزت إعادة العمل المطلوبة، لكن لم يُضف مقابل مستقل لهذه الدقائق الأربع.'};
 return {key:'connection',icon:'⌁',kind:'خطر تقني وتشغيلي',title:'انقطع الاتصال أثناء وجود مهمة مفتوحة',cause:'أثناء تصنيف الصور انقطع الاتصال بالخادم. استغرقت استعادة الاتصال دقيقتين، وخلال ذلك انتهت مهلة المهمة المفتوحة.',minutes:2,stress:9,consequence:'لم تُدفع الدقيقتان اللتان ضاعتا في استعادة الاتصال، كما بقيت تكاليف الجهاز والإنترنت على العامل.'};
}

function stressLabel(v){return v>=70?'مرتفع':v>=40?'متوسط':'منخفض'}

function ensureRisk(sc){
 let s=getState();
 const current=profile(sc.riskType),eventKey=`${s.scenarioKey}:${sc.riskType}`;
 const old=s.riskEvent;
 if(s.riskApplied&&old?.eventKey&&old.eventKey!==eventKey){
  patch({time:Math.max(0,s.time-(old.minutes||0)),unpaidTime:Math.max(0,s.unpaidTime-(old.minutes||0)),stress:clamp(s.stress-(old.stress||0),0,100),riskApplied:false,riskEvent:null});
  s=getState();
 }
 if(!s.riskApplied){
  const r={...current,eventKey};
  patch({riskEvent:r,riskApplied:true,time:s.time+r.minutes,unpaidTime:s.unpaidTime+r.minutes,stress:clamp(s.stress+r.stress,0,100)});
  addEvidence('risk');
  addLog('حدث خطر أثناء العمل',`${r.title}: أضيفت ${r.minutes} دقيقة غير مدفوعة إلى الوردية.`);
  return r;
 }
 if(!s.riskEvent?.eventKey){const r={...current,eventKey};patch({riskEvent:r});return r;}
 return s.riskEvent;
}

export async function render(root){
 const s0=getState(),sc=scenarios[s0.scenarioKey],r=ensureRisk(sc),st=getState();
 const previous=st.tookBreak===true?'كنت قد أخذت استراحة قصيرة ثم عدت إلى العمل.':st.tookBreak===false?'كنت قد قررت مواصلة العمل دون استراحة.':'كنت تواصل الوردية على TaskBridge.';
 root.innerHTML=`<div class="panel"><div class="instruction"><span class="n">9</span><div class="instruction-copy"><div class="instruction-title"><b>خطر مختلف في حالة ${sc.name}</b></div><div class="instruction-subtitle"><small>${sc.role} · ${r.kind}. هذه المرحلة تختلف باختلاف حالة العمل التي اخترتها.</small></div></div></div><div class="notice info"><b>أنت تلعب الآن بشخصية ${sc.name}</b><div style="margin-top:5px">نوع الخطر في هذه الحالة: <b>${r.kind}</b>.</div></div><h2>${r.icon} ${r.title}</h2><div class="timeline"><div class="tl"><small>قبل الحدث</small><b>سير الوردية</b><div class="muted small">${previous}</div></div><div class="tl"><small>الحدث الخاص بهذه الحالة</small><b>${r.title}</b><div class="muted small">${r.cause}</div></div><div class="tl"><small>الأثر المباشر</small><b>${r.minutes} دقيقة مرتبطة بالعمل دون مقابل إضافي</b><div class="muted small">${r.consequence}</div></div></div><div class="grid-4"><div class="metric"><small>نوع الخطر</small><b>${r.kind}</b></div><div class="metric"><small>وقت غير مدفوع جديد</small><b>+${r.minutes} د</b></div><div class="metric"><small>مقابل إضافي</small><b>$0.00</b></div><div class="metric"><small>الضغط الحالي</small><b>${st.stress}/100 · ${stressLabel(st.stress)}</b></div></div><div class="notice"><b>تكاليف التشغيل في هذه الحالة</b><div style="margin-top:5px">الإنترنت ${money(sc.costs.internet)} · الكهرباء ${money(sc.costs.electricity)} · استهلاك الجهاز ${money(sc.costs.device)}. هذه التكاليف تختلف أيضًا حسب الحالة.</div></div><div class="notice"><b>ما الذي سيحدث بعد ذلك؟</b><div style="margin-top:5px">ستنتقل إلى مراجعة جودة لجزء من العمل الذي أنجزته في هذه الحالة.</div></div><div class="actions"><button class="btn" id="next">متابعة إلى مراجعة جودة العمل</button></div></div>`;
 refreshStats();document.getElementById('next').onclick=()=>location.href=href('dispute');
}
