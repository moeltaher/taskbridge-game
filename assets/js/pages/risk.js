import {scenarios} from '../data/scenarios.js';import {getState,patch,addLog,addEvidence,clamp,money} from '../core/state.js';import {href} from '../core/routes.js';import {refreshStats} from '../core/ui.js';

function baseProfile(type){
 if(type==='wellbeing')return {key:'wellbeing',icon:'🧠',kind:'خطر نفسي وصحي',title:'التعرض لمحتوى مزعج أثناء المراجعة',cause:'أثناء مراجعة المحتوى، تراكم أثر المواد المزعجة مع ضغط السرعة.',minutes:3,stress:18};
 if(type==='timeout')return {key:'timeout',icon:'⏱',kind:'خطر الوقت وتغيّر التعليمات',title:'تغيّرت الإرشادات أثناء المهمة',cause:'أثناء تقييم مخرجات الذكاء الاصطناعي، تغيّرت إرشادات المشروع واحتجت إلى إعادة التحقق من جزء من العمل.',minutes:2,stress:10};
 if(type==='revision')return {key:'revision',icon:'↺',kind:'خطر إعادة العمل بعد التسليم',title:'طلب العميل تعديلًا بعد التسليم',cause:'بعد تسليم الترجمة، طلب العميل تغيير بعض المصطلحات وفق نسخة محدثة من دليل المشروع.',minutes:4,stress:7};
 return {key:'connection',icon:'⌁',kind:'خطر تقني وتشغيلي',title:'انقطع الاتصال أثناء وجود مهمة مفتوحة',cause:'أثناء تصنيف الصور انقطع الاتصال بالخادم والمهمة ما تزال مفتوحة.',minutes:2,stress:9};
}

function profile(type,tookBreak){
 const b=baseProfile(type);
 if(tookBreak){
  if(type==='wellbeing')return {...b,variant:'break',title:'ظهرت آثار المحتوى المزعج، لكن الاستراحة خففتها',cause:'لأنك أخذت استراحة قبل العودة إلى العمل، وصلت إلى هذه الدفعة بمستوى ضغط أقل. احتجت إلى دقيقة إضافية فقط قبل المتابعة.',minutes:1,stress:6,consequence:'الاستراحة لم تمنع الخطر تمامًا، لكنها خففت وقت التعافي والزيادة في الضغط.'};
  if(type==='timeout')return {...b,variant:'break',title:'راجعت الإرشادات بعد الاستراحة وتفاديت انتهاء المهلة',cause:'خلال توقفك القصير ظهرت الإرشادات المحدثة. عندما عدت إلى العمل قرأتها قبل استكمال المهمة، فاحتجت إلى دقيقة تحقق إضافية فقط.',minutes:1,stress:4,consequence:'الاستراحة منحتك فرصة لالتقاط التغيير مبكرًا، لذلك كان أثره أخف.'};
  if(type==='revision')return {...b,variant:'break',title:'وصل تحديث العميل قبل استكمال الوردية',cause:'أثناء الاستراحة وصل تحديث دليل المصطلحات. عدت إلى العمل وأجريت تعديلًا محدودًا قبل إغلاق الدفعة.',minutes:1,stress:3,consequence:'رؤية التحديث قبل الاستمرار قللت مقدار إعادة العمل اللاحقة.'};
  return {...b,variant:'break',title:'عاد الاتصال قبل أن تنتهي مهلة المهمة',cause:'أثناء الاستراحة استقر الاتصال. عندما عدت إلى المنصة احتجت إلى دقيقة واحدة فقط لاستعادة المهمة ومتابعتها.',minutes:1,stress:3,consequence:'الاستراحة لم تمنع الانقطاع، لكنها قللت الوقت الضائع وأثره على الضغط.'};
 }
 if(type==='wellbeing')return {...b,variant:'continue',title:'احتجت إلى التوقف بعد تراكم أثر المحتوى المزعج',cause:'واصلت العمل دون استراحة، فتراكم أثر المواد المزعجة مع ضغط السرعة واضطررت إلى التوقف 4 دقائق قبل أن تتمكن من المتابعة.',minutes:4,stress:22,consequence:'الاستمرار دون توقف جعل وقت التعافي أطول ورفع الضغط بصورة أكبر.'};
 if(type==='timeout')return {...b,variant:'continue',title:'انتهت مهلة المهمة أثناء إعادة التحقق',cause:'واصلت العمل دون توقف، ثم ظهرت الإرشادات الجديدة أثناء التنفيذ. بدأت إعادة التحقق متأخرًا وانتهت المهلة قبل احتساب 3 دقائق من العمل.',minutes:3,stress:14,consequence:'الاستمرار جعل أثر تغيير الإرشادات أشد لأنك واجهته أثناء التنفيذ لا قبل استئنافه.'};
 if(type==='revision')return {...b,variant:'continue',title:'اضطررت إلى إعادة جزء أكبر من العمل بعد التسليم',cause:'واصلت العمل وأغلقت الدفعة قبل وصول تحديث العميل، ثم طُلب منك تعديل جزء أكبر من الترجمة بعد التسليم.',minutes:5,stress:10,consequence:'لأن التحديث وصل بعد الإغلاق، أصبح حجم إعادة العمل أكبر.'};
 return {...b,variant:'continue',title:'استمر الانقطاع حتى انتهت مهلة المهمة',cause:'واصلت العمل دون استراحة، ثم انقطع الاتصال أثناء المهمة. استغرقت الاستعادة 3 دقائق وانتهت المهلة خلال ذلك.',minutes:3,stress:13,consequence:'الاستمرار دون توقف جعل الوقت الضائع أطول وأثر الانقطاع أكبر.'};
}

function stressLabel(v){return v>=70?'مرتفع':v>=40?'متوسط':'منخفض'}

function ensureRisk(sc){
 let s=getState();
 const tookBreak=s.tookBreak===true,variant=tookBreak?'break':'continue',current=profile(sc.riskType,tookBreak),eventKey=`${s.scenarioKey}:${sc.riskType}:${variant}`;
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
 if(d?.tookBreak)return `<div class="notice good"><b>المسار الذي اخترته: استراحة دقيقة</b><div style="margin-top:5px">دفعت تكلفة فورية صغيرة: دقيقة واحدة غير مدفوعة، وانخفض الضغط من <b>${d.stressBefore}/100</b> إلى <b>${d.stressAfter}/100</b>. في المقابل أصبح الخطر التالي أخف.</div></div>`;
 return `<div class="notice info"><b>المسار الذي اخترته: الاستمرار في العمل</b><div style="margin-top:5px">لم تضف وقت استراحة، لكن الضغط ارتفع من <b>${d?.stressBefore ?? st.stress}/100</b> إلى <b>${d?.stressAfter ?? st.stress}/100</b>. في المقابل أصبح الخطر التالي أشد.</div></div>`;
}

export async function render(root){
 const s0=getState(),sc=scenarios[s0.scenarioKey],r=ensureRisk(sc),st=getState(),take=st.tookBreak===true;
 root.innerHTML=`<div class="panel"><div class="instruction"><span class="n">9</span><div class="instruction-copy"><div class="instruction-title"><b>${take?'الاستراحة خففت أثر الخطر التالي':'الاستمرار جعل أثر الخطر التالي أشد'}</b></div><div class="instruction-subtitle"><small>هذه النتيجة مرتبطة مباشرة بالاختيار الذي اتخذته في المرحلة السابقة.</small></div></div></div>${previousDecisionHTML(st)}<div class="notice info"><b>أنت تلعب الآن بشخصية ${sc.name}</b><div style="margin-top:5px">نوع الخطر في هذه الحالة: <b>${r.kind}</b>.</div></div><h2>${r.icon} ${r.title}</h2><div class="timeline"><div class="tl"><small>قرارك السابق</small><b>${take?'أخذت استراحة دقيقة':'واصلت العمل دون استراحة'}</b><div class="muted small">${take?'انخفض الضغط قبل العودة إلى العمل.':'ارتفع الضغط لأنك واصلت دون توقف.'}</div></div><div class="tl"><small>الحدث بعد القرار</small><b>${r.title}</b><div class="muted small">${r.cause}</div></div><div class="tl"><small>أثر هذا المسار</small><b>${r.minutes} دقيقة غير مدفوعة إضافية</b><div class="muted small">${r.consequence}</div></div></div><div class="grid-4"><div class="metric"><small>المسار</small><b>${take?'استراحة':'استمرار'}</b></div><div class="metric"><small>وقت غير مدفوع بسبب الخطر</small><b>+${r.minutes} د</b></div><div class="metric"><small>زيادة الضغط بسبب الخطر</small><b>+${r.stress}</b></div><div class="metric"><small>الضغط الحالي</small><b>${st.stress}/100 · ${stressLabel(st.stress)}</b></div></div><div class="notice ${take?'good':'bad'}"><b>الفرق بين الخيارين أصبح فعليًا:</b><div style="margin-top:5px">${take?'دفعت دقيقة استراحة غير مدفوعة أولًا، لكنك خففت الوقت والضغط الناتجين عن الخطر اللاحق.':'وفرت دقيقة الاستراحة، لكنك تحملت وقتًا غير مدفوع وضغطًا أكبر عندما وقع الخطر.'}</div></div><div class="notice"><b>تكاليف التشغيل في هذه الحالة</b><div style="margin-top:5px">الإنترنت ${money(sc.costs.internet)} · الكهرباء ${money(sc.costs.electricity)} · استهلاك الجهاز ${money(sc.costs.device)}.</div></div><div class="notice"><b>ما الذي سيحدث بعد ذلك؟</b><div style="margin-top:5px">ستنتقل إلى مراجعة جودة لجزء من العمل الذي أنجزته في هذه الحالة.</div></div><div class="actions"><button class="btn" id="next">متابعة إلى مراجعة جودة العمل</button></div></div>`;
 refreshStats();document.getElementById('next').onclick=()=>location.href=href('dispute');
}
