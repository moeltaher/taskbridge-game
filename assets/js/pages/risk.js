import {scenarios} from '../data/scenarios.js';import {getState,patch,addLog,addEvidence,clamp,money} from '../core/state.js';import {href} from '../core/routes.js';import {refreshStats} from '../core/ui.js';

function profile(type){
 if(type==='wellbeing')return {
  key:'wellbeing',icon:'🧠',kind:'خطر نفسي وصحي',
  title:'ظهرت الآن آثار التعرض لمحتوى مزعج',
  cause:'أثناء مراجعة دفعة جديدة الآن، تعرضت لمحتوى مزعج واحتجت إلى 3 دقائق بعيدًا عن المهمة قبل أن تتمكن من المتابعة. هذا هو أول ظهور لهذا الحدث في الجولة.',
  minutes:3,stress:18,
  consequence:'أضيفت 3 دقائق إلى وقت الوردية كوقت غير مدفوع، وارتفع مؤشر الضغط في المحاكاة بسبب أثر المحتوى.'
 };
 if(type==='timeout')return {
  key:'timeout',icon:'⏱',kind:'تغيّر التعليمات أثناء العمل',
  title:'وصل الآن تحديث جديد لإرشادات المشروع',
  cause:'أثناء تنفيذ مهمة التقييم الحالية ظهر في TaskBridge تحديث جديد لإرشادات المشروع. احتجت إلى دقيقتين لإعادة التحقق من جزء من العمل وفق التعليمات الجديدة. هذا هو أول ظهور لهذا التحديث في الجولة.',
  minutes:2,stress:10,
  consequence:'أضيفت دقيقتان إلى وقت الوردية كوقت غير مدفوع في هذه المحاكاة، وارتفع الضغط بسبب الحاجة إلى إعادة التحقق.'
 };
 if(type==='revision')return {
  key:'revision',icon:'↺',kind:'طلب تعديل بعد التسليم',
  title:'وصل الآن طلب تعديل من العميل',
  cause:'ظهر الآن إشعار جديد في TaskBridge: العميل يطلب تغيير بعض المصطلحات في ترجمة سبق أن سلّمتها وفق نسخة محدثة من دليل المشروع. هذا هو أول ظهور لهذا الطلب في الجولة.',
  minutes:4,stress:7,
  consequence:'احتاج تنفيذ التعديل إلى 4 دقائق إضافية لم تُضف كمقابل مستقل، وارتفع الضغط قليلًا بسبب إعادة العمل.'
 };
 return {
  key:'connection',icon:'⌁',kind:'خطر تقني وتشغيلي',
  title:'حدث الآن انقطاع في الاتصال بالخادم',
  cause:'أثناء وجود مهمة تصنيف مفتوحة الآن، فقدت TaskBridge الاتصال بالخادم لمدة دقيقتين ولم تستطع متابعة المهمة خلالهما. هذا هو أول ظهور لهذا الانقطاع في الجولة.',
  minutes:2,stress:9,
  consequence:'أضيفت دقيقتان إلى وقت الوردية كوقت غير مدفوع، وارتفع الضغط بسبب توقف العمل المفاجئ.'
 };
}

function stressLabel(v){return v>=70?'مرتفع':v>=40?'متوسط':'منخفض'}

function ensureRisk(sc){
 let s=getState();
 const current=profile(sc.riskType),eventKey=`${s.scenarioKey}:${sc.riskType}:independent-v1`,old=s.riskEvent;
 if(s.riskApplied&&old?.eventKey&&old.eventKey!==eventKey){
  patch({time:Math.max(0,s.time-(old.minutes||0)),unpaidTime:Math.max(0,s.unpaidTime-(old.minutes||0)),stress:clamp(s.stress-(old.stress||0),0,100),riskApplied:false,riskEvent:null});
  s=getState();
 }
 if(!s.riskApplied){
  const r={...current,eventKey};
  patch({riskEvent:r,riskApplied:true,time:s.time+r.minutes,unpaidTime:s.unpaidTime+r.minutes,stress:clamp(s.stress+r.stress,0,100)});
  addEvidence('risk');
  addLog('حدث موقف جديد أثناء العمل',`${r.title}: أضيفت ${r.minutes} دقيقة غير مدفوعة إلى الوردية.`);
  return r;
 }
 if(!s.riskEvent?.eventKey){const r={...current,eventKey};patch({riskEvent:r});return r;}
 return s.riskEvent;
}

function previousDecisionHTML(st){
 const d=st.monitorDecision;
 if(!d)return `<div class="notice"><b>قرارك السابق:</b><div style="margin-top:5px">واصلت الوردية إلى أن وقع الحدث الجديد أدناه.</div></div>`;
 if(d.tookBreak)return `<div class="notice good"><b>قبل الحدث: أخذت استراحة دقيقة.</b><div style="margin-top:5px">أضيفت دقيقة واحدة غير مدفوعة إلى الوردية، وانخفض الضغط من <b>${d.stressBefore}/100</b> إلى <b>${d.stressAfter}/100</b>. هذا القرار غيّر وضعك أنت قبل الحدث، لكنه <b>لم يسبب الحدث ولم يغيّر وقت وقوعه</b>.</div></div>`;
 return `<div class="notice info"><b>قبل الحدث: واصلت العمل دون استراحة.</b><div style="margin-top:5px">لم تضف دقيقة توقف إلى الوردية، لكن الضغط ارتفع من <b>${d.stressBefore}/100</b> إلى <b>${d.stressAfter}/100</b>. هذا القرار غيّر وضعك أنت قبل الحدث، لكنه <b>لم يسبب الحدث ولم يغيّر وقت وقوعه</b>.</div></div>`;
}

export async function render(root){
 const s0=getState(),sc=scenarios[s0.scenarioKey],r=ensureRisk(sc),st=getState(),d=st.monitorDecision;
 const decisionUnpaid=d?.unpaidDelta||0,totalNewUnpaid=decisionUnpaid+r.minutes,totalStressDelta=d?(d.stressDelta+r.stress):r.stress;
 root.innerHTML=`<div class="panel">
  <div class="instruction"><span class="n">9</span><div class="instruction-copy"><div class="instruction-title"><b>حدث موقف جديد أثناء الوردية</b></div><div class="instruction-subtitle"><small>الحدث أدناه يحدث الآن لأول مرة. قرار الاستراحة أو الاستمرار السابق لا يخلق هذا الحدث؛ إنما يغيّر وضعك قبل مواجهته.</small></div></div></div>

  ${previousDecisionHTML(st)}

  <div class="notice info"><b>الحالة الحالية: ${sc.name} · ${sc.role}</b><div style="margin-top:5px">نوع الموقف في هذه الحالة: <b>${r.kind}</b>.</div></div>

  <h2>${r.icon} ${r.title}</h2>
  <div class="timeline">
   <div class="tl"><small>الخطوة السابقة</small><b>${d?.tookBreak?'أخذت استراحة دقيقة':'واصلت العمل دون استراحة'}</b><div class="muted small">هذا القرار غيّر الوقت والضغط فقط.</div></div>
   <div class="tl"><small>حدث جديد الآن</small><b>${r.title}</b><div class="muted small">${r.cause}</div></div>
   <div class="tl"><small>أثر الحدث نفسه</small><b>+${r.minutes} دقيقة غير مدفوعة · +${r.stress} ضغط</b><div class="muted small">${r.consequence}</div></div>
  </div>

  <div class="grid-4">
   <div class="metric"><small>أثر قرارك السابق على الوقت</small><b>+${decisionUnpaid} د غير مدفوعة</b></div>
   <div class="metric"><small>أثر الحدث الجديد على الوقت</small><b>+${r.minutes} د غير مدفوعة</b></div>
   <div class="metric"><small>إجمالي الوقت غير المدفوع الجديد</small><b>+${totalNewUnpaid} د</b></div>
   <div class="metric"><small>الضغط الحالي</small><b>${st.stress}/100 · ${stressLabel(st.stress)}</b></div>
  </div>

  <div class="notice"><b>ما الفرق الحقيقي بين الاستراحة والاستمرار؟</b><div style="margin-top:5px">الحدث الخارجي واحد في الحالتين. الفرق هو أنك وصلت إليه بحالة مختلفة: ${d?.tookBreak?`الاستراحة خفّضت الضغط قبل وقوعه، لذلك التغير الصافي منذ قرارك السابق هو <b>${totalStressDelta>=0?'+':''}${totalStressDelta}</b> نقطة ضغط.`:`الاستمرار رفع الضغط قبل وقوعه، لذلك التغير الصافي منذ قرارك السابق هو <b>${totalStressDelta>=0?'+':''}${totalStressDelta}</b> نقطة ضغط.`}</div></div>

  <div class="notice"><b>تكاليف التشغيل في هذه الحالة</b><div style="margin-top:5px">الإنترنت ${money(sc.costs.internet)} · الكهرباء ${money(sc.costs.electricity)} · استهلاك الجهاز ${money(sc.costs.device)}. هذه تكاليف تشغيل عامة للوردية وليست أحداثًا جديدة سبّبها هذا الموقف.</div></div>

  <div class="notice"><b>ما الذي سيحدث بعد ذلك؟</b><div style="margin-top:5px">ستنتقل إلى مراجعة جودة لجزء من العمل الذي أنجزته في هذه الحالة.</div></div>
  <div class="actions"><button class="btn" id="next">متابعة إلى مراجعة جودة العمل</button></div>
 </div>`;
 refreshStats();document.getElementById('next').onclick=()=>location.href=href('dispute');
}
