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

function previousDecisionHTML(st){
 const d=st.monitorDecision;
 if(!d)return `<div class="notice"><b>قرارك السابق:</b><div style="margin-top:5px">${st.tookBreak===true?'أخذت استراحة قصيرة قبل العودة إلى العمل.':st.tookBreak===false?'واصلت العمل دون استراحة.':'واصلت الوردية.'}</div></div>`;
 if(d.tookBreak)return `<div class="notice good"><b>قبل هذا الحدث: كنت قد أخذت استراحة.</b><div style="margin-top:5px">أضفت <b>دقيقة واحدة غير مدفوعة</b> إلى الوردية، وانخفض الضغط من <b>${d.stressBefore}/100</b> إلى <b>${d.stressAfter}/100</b>. بعد ذلك عدت إلى العمل، ثم وقع الحدث أدناه.</div></div>`;
 return `<div class="notice info"><b>قبل هذا الحدث: كنت قد واصلت العمل دون استراحة.</b><div style="margin-top:5px">لم تضف دقيقة توقف إلى الوردية، لكن الضغط ارتفع من <b>${d.stressBefore}/100</b> إلى <b>${d.stressAfter}/100</b>. بعد ذلك واصلت العمل، ثم وقع الحدث أدناه.</div></div>`;
}

export async function render(root){
 const s0=getState(),sc=scenarios[s0.scenarioKey],r=ensureRisk(sc),st=getState();
 root.innerHTML=`<div class="panel"><div class="instruction"><span class="n">9</span><div class="instruction-copy"><div class="instruction-title"><b>بعد قرارك السابق، حدث موقف جديد أثناء العمل</b></div><div class="instruction-subtitle"><small>قرار الاستراحة أو الاستمرار غيّر وقتك وضغطك، أما هذا الحدث فهو موقف مستقل مرتبط بطبيعة حالة ${sc.name}.</small></div></div></div>${previousDecisionHTML(st)}<div class="notice info"><b>أنت تلعب الآن بشخصية ${sc.name}</b><div style="margin-top:5px">نوع الخطر في هذه الحالة: <b>${r.kind}</b>.</div></div><h2>${r.icon} ${r.title}</h2><div class="timeline"><div class="tl"><small>بعد قرارك السابق</small><b>عدت إلى سير الوردية</b><div class="muted small">واصلت تنفيذ العمل على TaskBridge بالقيم الجديدة للوقت والضغط.</div></div><div class="tl"><small>ثم حدث هذا الموقف</small><b>${r.title}</b><div class="muted small">${r.cause}</div></div><div class="tl"><small>أثر هذا الحدث وحده</small><b>${r.minutes} دقيقة مرتبطة بالعمل دون مقابل إضافي</b><div class="muted small">${r.consequence}</div></div></div><div class="grid-4"><div class="metric"><small>نوع الخطر</small><b>${r.kind}</b></div><div class="metric"><small>وقت غير مدفوع بسبب هذا الحدث</small><b>+${r.minutes} د</b></div><div class="metric"><small>مقابل إضافي عن الحدث</small><b>$0.00</b></div><div class="metric"><small>الضغط بعد القرار والحدث</small><b>${st.stress}/100 · ${stressLabel(st.stress)}</b></div></div><div class="notice"><b>تكاليف التشغيل في هذه الحالة</b><div style="margin-top:5px">الإنترنت ${money(sc.costs.internet)} · الكهرباء ${money(sc.costs.electricity)} · استهلاك الجهاز ${money(sc.costs.device)}. هذه التكاليف تختلف أيضًا حسب الحالة.</div></div><div class="notice"><b>ما الذي سيحدث بعد ذلك؟</b><div style="margin-top:5px">ستنتقل إلى مراجعة جودة لجزء من العمل الذي أنجزته في هذه الحالة.</div></div><div class="actions"><button class="btn" id="next">متابعة إلى مراجعة جودة العمل</button></div></div>`;
 refreshStats();document.getElementById('next').onclick=()=>location.href=href('dispute');
}
