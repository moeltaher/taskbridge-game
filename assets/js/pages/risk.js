import {scenarios} from '../data/scenarios.js';import {getState,patch,addLog,addEvidence,clamp,money} from '../core/state.js';import {href} from '../core/routes.js';import {refreshStats} from '../core/ui.js';

function profile(type){
 if(type==='wellbeing')return {icon:'🧠',title:'احتجت إلى التوقف بعد التعرض لمحتوى مزعج',cause:'أثناء استمرارك في مراجعة المحتوى، تراكم أثر المواد المزعجة مع ضغط السرعة، فاحتجت إلى التوقف 3 دقائق قبل أن تتمكن من المتابعة.',minutes:3,stress:18};
 if(type==='timeout')return {icon:'⏱',title:'انتهت مهلة المهمة قبل إكمال التحقق',cause:'أثناء تنفيذ دفعة التقييم تغيّرت إرشادات المشروع، واضطررت إلى إعادة التحقق من جزء من العمل. انتهت المهلة قبل أن يُحتسب هذا الوقت ضمن المهمة المدفوعة.',minutes:2,stress:10};
 if(type==='revision')return {icon:'↺',title:'طلب العميل تعديلًا بعد التسليم',cause:'بعد أن أرسلت العمل، طلب العميل تغيير بعض المصطلحات وفق نسخة محدثة من دليل المشروع. احتجت إلى 4 دقائق إضافية لإعادة العمل، من دون مقابل مستقل لهذا التعديل.',minutes:4,stress:7};
 return {icon:'⌁',title:'انقطع الاتصال أثناء وجود مهمة مفتوحة',cause:'أثناء عملك على المنصة انقطع الاتصال بالخادم. استغرقت استعادة الاتصال دقيقتين، وخلال ذلك انتهت مهلة المهمة المفتوحة. لم تضف المنصة مقابلًا لهذا الوقت.',minutes:2,stress:9};
}

function stressLabel(v){return v>=70?'مرتفع':v>=40?'متوسط':'منخفض'}

export async function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey];
 let r=s.riskEvent||profile(sc.riskType);
 if(!s.riskApplied){
  patch({riskEvent:r,riskApplied:true,time:s.time+r.minutes,unpaidTime:s.unpaidTime+r.minutes,stress:clamp(s.stress+r.stress,0,100)});
  addEvidence('risk');
  addLog('حدث موقف غير متوقع أثناء العمل',`${r.title}: أضيفت ${r.minutes} دقيقة إلى الوردية دون مقابل إضافي.`);
 }
 r=getState().riskEvent;
 const st=getState();
 const previous=st.tookBreak===true?'كنت قد أخذت استراحة قصيرة، ثم عدت إلى العمل.':st.tookBreak===false?'كنت قد قررت مواصلة العمل دون استراحة.':'كنت تواصل الوردية على TaskBridge.';
 const operating=sc.costs.internet+sc.costs.electricity+sc.costs.device;
 root.innerHTML=`<div class="panel">
  <div class="instruction"><span class="n">9</span><div class="instruction-copy"><div class="instruction-title"><b>حدث موقف غير متوقع أثناء الوردية</b></div><div class="instruction-subtitle"><small>هذه المرحلة توضح من يتحمل الوقت والتكلفة عندما يحدث شيء مرتبط بالعمل لكنه ليس مهمة مدفوعة بحد ذاته.</small></div></div></div>

  <h2>ماذا حدث بالترتيب؟</h2>
  <div class="timeline">
   <div class="tl"><small>قبل الحدث</small><b>كنت تواصل العمل</b><div class="muted small">${previous}</div></div>
   <div class="tl"><small>أثناء الوردية</small><b>${r.title}</b><div class="muted small">${r.cause}</div></div>
   <div class="tl"><small>النتيجة</small><b>${r.minutes} دقيقة إضافية مرتبطة بالعمل، بلا مقابل إضافي</b><div class="muted small">هذا الوقت أصبح جزءًا من وقت ورديتك، لكنه لم يُضف إلى الوقت المدفوع أو إلى مستحقاتك.</div></div>
  </div>

  <div class="notice info"><b>ما الذي تغيّر في أرقامك بسبب هذا الحدث؟</b><div style="margin-top:6px">قبل الحدث لم تكن هذه الدقائق موجودة في الوردية. الآن أضيفت <b>${r.minutes} دقيقة</b> إلى وقتك، وأضيفت الدقائق نفسها إلى الوقت غير المدفوع، بينما بقي المقابل الإضافي <b>$0.00</b>.</div></div>

  <div class="grid-4">
   <div class="metric"><small>زيادة وقت الوردية</small><b>+${r.minutes} د</b></div>
   <div class="metric"><small>زيادة الوقت المدفوع</small><b>+0 د</b></div>
   <div class="metric"><small>زيادة المستحقات</small><b>+$0.00</b></div>
   <div class="metric"><small>الضغط بعد الحدث</small><b>${st.stress}/100 · ${stressLabel(st.stress)}</b></div>
  </div>

  <h3>ولماذا تظهر تكاليف الإنترنت والكهرباء والجهاز؟</h3>
  <div class="notice"><b>هذه ليست تكاليف جديدة سبّبها الحدث.</b><div style="margin-top:5px">منذ بداية الوردية تستخدم جهازك واتصالك أنت، وفق شروط العمل التي وافقت عليها. لذلك تتحمل تكاليف التشغيل حتى عندما يضيع جزء من الوقت بسبب انقطاع أو إعادة عمل أو توقف مرتبط بالمهمة.</div></div>
  <div class="grid-3">
   <div class="metric"><small>تكلفة الإنترنت المقدّرة للوردية</small><b>${money(sc.costs.internet)}</b></div>
   <div class="metric"><small>الكهرباء المقدّرة</small><b>${money(sc.costs.electricity)}</b></div>
   <div class="metric"><small>استهلاك الجهاز المقدّر</small><b>${money(sc.costs.device)}</b></div>
  </div>
  <p class="small muted">إجمالي تكاليف التشغيل المقدّرة حتى التسوية: ${money(operating)}. ستظهر هذه التكاليف لاحقًا عند حساب صافي ما تبقى لك.</p>

  <div class="notice info"><b>الخلاصة في هذه المرحلة:</b><div style="margin-top:5px">حدث أمر مرتبط بالعمل أضاف وقتًا وضغطًا إلى ورديتك، لكن TaskBridge لم تضف مقابلاً ماليًا له. الهدف هو أن تلاحظ من يتحمل هذا النوع من المخاطر التشغيلية.</div></div>

  <div class="notice"><b>ما الذي سيحدث بعد ذلك؟</b><div style="margin-top:5px">قبل تسوية المستحقات، ستراجع المنصة أو العميل عينة من العمل الذي أرسلته سابقًا وتقارنها بمعيار الجودة الخاص بالمشروع. إذا ظهر اختلاف، سترى سببه قبل اتخاذ أي قرار.</div></div>
  <div class="actions"><button class="btn" id="next">متابعة إلى مراجعة جودة العمل</button></div>
 </div>`;
 refreshStats();
 document.getElementById('next').onclick=()=>location.href=href('dispute');
}
