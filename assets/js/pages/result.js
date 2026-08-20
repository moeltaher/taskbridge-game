import {scenarios,axes,parties,partyNames,powerTargets,questionRef} from '../data/scenarios.js';import {getState,money} from '../core/state.js';import {href} from '../core/routes.js';import {archiveResult} from '../core/storage.js';

function outcomeLabel(o){return o==='suspended'?'تعليق الحساب العام':o==='project'?'تقييد الوصول إلى المشروع الحالي':'تحذير مع استمرار الحساب'}
function monitoringLabel(sc){if(sc.monitoring==='light')return 'وقت التسليم وسجل التعديلات';if(sc.monitoring==='intensive')return 'سرعة القرار والخمول وبعض مؤشرات النشاط';if(sc.monitoring==='timing')return 'زمن المهمة وتبديل التبويبات وتعديلات الإجابة';return 'النشاط والخمول وتغييرات النافذة'}
function disputeLabel(s){if(s.disputeSeverity>=2)return s.appealed?'ظهر اختلاف جوهري وطلبت مراجعة إضافية':'ظهر اختلاف جوهري وتابعت دون مراجعة إضافية';if(s.disputeSeverity===1)return s.appealed?'ظهر اختلاف محدود وطلبت مراجعة إضافية':'ظهر اختلاف محدود وتابعت دون مراجعة إضافية';return 'لم يظهر اختلاف مؤثر في مراجعة الجودة'}
function offerLabel(s){const d=s.offerDecisionResult;if(!d)return 'لا توجد بيانات كافية عن العرض الثاني';return d.accepted?`قبلت ${d.title} مقابل ${money(d.pay)} وأضيفت ${d.duration} دقيقة مدفوعة.`:`رفضت ${d.title}؛ لم يضف دخل أو وقت مدفوع، وسُجل الرفض في ملف الأداء.`}
function breakLabel(s){const d=s.monitorDecision;if(!d)return 'لا توجد بيانات كافية عن قرار الاستراحة.';return d.tookBreak?`أخذت استراحة دقيقة: +1 دقيقة غير مدفوعة، والضغط ${d.stressBefore} ← ${d.stressAfter}.`:`واصلت دون استراحة: لم تضف وقت توقف، والضغط ${d.stressBefore} ← ${d.stressAfter}.`}
function accessExplanation(s){const d=s.accessDecision;if(!d)return outcomeLabel(s.accountOutcome);if(s.accountOutcome==='suspended')return `بلغت مؤشرات الخطر ${d.points} نقاط مقابل حد تعليق ${d.suspendAt}؛ لذلك علّقت TaskBridge الحساب العام.`;if(s.accountOutcome==='project')return `بلغت مؤشرات الخطر ${d.points} نقاط مقابل حد تقييد المشروع ${d.projectAt}؛ لذلك قيّدت TaskBridge الوصول إلى المشروع الحالي مع بقاء الحساب العام.`;return `بلغت مؤشرات الخطر ${d.points} نقاط، وهي أقل من حد تقييد المشروع ${d.projectAt}؛ لذلك بقي الحساب نشطًا مع تحذير.`}

const questionTitles={
 parties:'الأطراف الفاعلة في علاقة العمل',
 price:'الطرف ذو الوزن الأكبر في تحديد السعر الذي يراه العامل',
 allocation:'الطرف ذو الوزن الأكبر في توزيع فرص العمل',
 monitoring:'الطرف الذي يجمع مؤشرات الأداء المرتبطة بالمنصة',
 risk:'الطرف الذي تحمل الجزء الأكبر من الوقت والأدوات والمخاطر',
 termination:'الطرف الذي يملك صلاحية الحساب العام والوصول إلى سوق المهام'
};

function questionRows(sc,s){const expected={parties:'العامل + المنصة + العميل + الوسيط',...questionRef[sc.type]};return Object.keys(questionTitles).map(id=>{const got=s.answers[id]||'لم تُجب',ref=expected[id],ok=got===ref;return `<div class="card"><small class="muted">${questionTitles[id]}</small><p><b>إجابتك:</b> ${got}</p><p><b>المرجع التدريبي:</b> ${ref}</p><span class="pill">${ok?'متطابقة مع المرجع':'مختلفة عن المرجع'}</span></div>`}).join('')}

function powerRows(sc,s){const target=powerTargets[sc.type];return axes.map(a=>{const p=s.power[a.id],t=target[a.id],dominant=parties.reduce((best,x)=>p[x]>p[best]?x:best,parties[0]),refDominant=parties.reduce((best,x)=>t[x]>t[best]?x:best,parties[0]);return `<div class="power-card"><h3>${a.title}</h3><div class="small"><b>توزيعك:</b> ${parties.map(x=>`${partyNames[x]} ${p[x]}`).join(' · ')}</div><div class="stacked" style="margin:7px 0 10px">${parties.map(x=>`<span class="seg ${x}" style="width:${p[x]}%"></span>`).join('')}</div><div class="small"><b>المرجع التدريبي المستخدم في التصحيح:</b> ${parties.map(x=>`${partyNames[x]} ${t[x]}`).join(' · ')}</div><p class="small muted">الطرف الأعلى في توزيعك: <b>${partyNames[dominant]}</b> · الطرف الأعلى في المرجع: <b>${partyNames[refDominant]}</b>.</p></div>`}).join('')}

function scoreBreakdown(r){return `<div class="grid-4"><div class="metric"><small>أسئلة علاقة العمل</small><b>${r.qScore ?? 0}/30</b><span class="stat-help">تقارن إجاباتك الست بالمرجع التدريبي للحالة.</span></div><div class="metric"><small>تصنيف الأدلة</small><b>${r.sortScore ?? 0}/25</b><span class="stat-help">يقيس مدى اتساق تصنيفك للأدلة مع التصنيف المستخدم في المحاكاة.</span></div><div class="metric"><small>خريطة السلطة</small><b>${r.powerScore ?? 0}/35</b><span class="stat-help">تقارن الطرف المهيمن والمسافة بين توزيعك والتوزيع المرجعي.</span></div><div class="metric"><small>تنوع الأدلة المختارة</small><b>${r.evidenceBalance ?? 0}/10</b><span class="stat-help">يكافئ الاستناد إلى أكثر من نوع واحد من الأدلة في الاستنتاج.</span></div></div>`}

function paymentSummary(s){const p=s.payment;if(!p)return '<p class="muted">لم تُحفظ بيانات التسوية المالية لهذه الجولة.</p>';return `<div class="grid-4"><div class="metric"><small>ما دفعه العملاء</small><b>${money(p.clientPaid)}</b></div><div class="metric"><small>المقابل المتفق عليه للعامل</small><b>${money(p.contracted)}</b></div><div class="metric"><small>الحجز في نزاع الجودة</small><b>${money(p.hold)}</b></div><div class="metric"><small>الصافي بعد الرسوم وتكاليف التشغيل</small><b>${money(p.net)}</b></div></div>`}

export async function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey],r=s.resultData||{score:0,qScore:0,sortScore:0,powerScore:0,evidenceBalance:0},pct=Math.round(s.unpaidTime/Math.max(1,s.time)*100),elapsed=s.realStartedAt?Math.max(1,Math.round(((s.realFinishedAt||Date.now())-s.realStartedAt)/60000)):0;
 root.innerHTML=`<div class="panel">
  <div class="result-banner"><div class="eyebrow" style="color:#bfe5f2">درجة التمرين التحليلي</div><div class="score">${r.score}/100</div><div>${r.score>=88?'اتساق مرتفع مع المرجع التدريبي':r.score>=74?'اتساق جيد مع وجود فروق في بعض الإجابات':'توجد فروق واضحة تستحق مراجعة الأدلة'}</div><div class="small">هذه الدرجة لا تقيّم صحة وصف قانوني ولا جودة النص الذي كتبته؛ بل تجمع أربع مكونات محددة موضحة أدناه.</div></div>

  <h3>كيف حُسبت الدرجة؟</h3>
  ${scoreBreakdown(r)}
  <div class="notice info"><b>مهم:</b><div style="margin-top:5px">نص «استنتاجك» لا يُحلَّل دلاليًا آليًا في هذه النسخة. يشترط فقط أن تكتب نصًا بالحد الأدنى وأن تختار ثلاثة أدلة على الأقل. لذلك لا نصف الدرجة بأنها تقييم مباشر لجودة الاستنتاج المكتوب.</div></div>

  <h3>ملخص جولتك الفعلي</h3>
  <div class="grid-4"><div class="metric"><small>الشخصية / نوع العمل</small><b>${sc.name}</b><span class="stat-help">${sc.role}</span></div><div class="metric"><small>زمن المشاركة الفعلي</small><b>${elapsed} د</b></div><div class="metric"><small>زمن الوردية في المحاكاة</small><b>${s.time} د</b></div><div class="metric"><small>الوقت غير المدفوع</small><b>${s.unpaidTime} د · ${pct}%</b></div></div>

  <div class="timeline">
   <div class="tl"><small>المهمة الأولى</small><b>نتيجة العينات ${s.workScore}% · جودة الحساب ${s.quality}%</b><div class="muted small">المقابل المسجل للمهمة الأولى: ${s.selectedJob?money(s.selectedJob.pay):'—'}.</div></div>
   <div class="tl"><small>العرض الثاني</small><b>${s.offerDecisionResult?.accepted?'قبلت العرض':'رفضت العرض'}</b><div class="muted small">${offerLabel(s)}</div></div>
   <div class="tl"><small>قرار الاستراحة</small><b>${s.monitorDecision?.tookBreak?'أخذت استراحة':'واصلت دون استراحة'}</b><div class="muted small">${breakLabel(s)}</div></div>
   <div class="tl"><small>الموقف غير المتوقع</small><b>${s.riskEvent?.title||'لا توجد بيانات'}</b><div class="muted small">${s.riskEvent?`${s.riskEvent.minutes} دقيقة غير مدفوعة أضيفت بسبب هذا الحدث.`:'—'}</div></div>
   <div class="tl"><small>مراجعة الجودة</small><b>${disputeLabel(s)}</b><div class="muted small">الحجز الناتج في التسوية: ${money(s.hold||0)}.</div></div>
   <div class="tl"><small>قرار الوصول في نهاية الوردية</small><b>${outcomeLabel(s.accountOutcome)}</b><div class="muted small">${accessExplanation(s)}</div></div>
  </div>

  <h3>التسوية المالية</h3>
  ${paymentSummary(s)}

  <h3>العقد مقابل ما حدث فعليًا</h3>
  <div class="grid-2"><div class="card"><h3>ما يقوله العقد</h3><p>• تعمل بصفتك مقدم خدمة مستقلًا، لا موظفًا لدى TaskBridge.</p><p>• تختار وقت الدخول والخروج ويمكنك العمل لجهات أخرى.</p><p>• تستخدم جهازك واتصالك وتتحمل النفقات المرتبطة بالعمل.</p><p>• يمكن استخدام مؤشرات الأداء لتحديد وصولك إلى أنواع من المهام.</p></div><div class="card"><h3>ما حدث في هذه الجولة</h3><p>• <b>التسعير:</b> ${sc.priceActor==='المنصة'?'TaskBridge حددت المقابل الذي ظهر لك للعامل ضمن آلية تسعير المشروع.':'العميل نشر سعر المشروع، والمنصة أدارت الرسوم والدفع.'}</p><p>• <b>توزيع العمل:</b> ${sc.allocationMechanism}</p><p>• <b>المراقبة:</b> سجّلت TaskBridge ${monitoringLabel(sc)}.</p><p>• <b>الخطر:</b> ${s.riskEvent?s.riskEvent.title:'لا توجد بيانات خطر محفوظة'}.</p><p>• <b>الجودة:</b> ${disputeLabel(s)}.</p><p>• <b>الوصول:</b> ${accessExplanation(s)}</p></div></div>

  <h3>إجاباتك في أسئلة علاقة العمل</h3>
  <div class="grid-2">${questionRows(sc,s)}</div>

  <h3>خريطة السلطة: توزيعك مقابل المرجع التدريبي</h3>
  <div class="notice"><b>ما معنى المرجع هنا؟</b><div style="margin-top:5px">هو توزيع صُمم داخل اللعبة لتصحيح هذا السيناريو، وليس حقيقة قانونية أو قياسًا تجريبيًا نهائيًا. نعرضه الآن لأن الدرجة تستخدمه فعلًا في حساب نقاط خريطة السلطة.</div></div>
  ${powerRows(sc,s)}

  <h3>استنتاجك كما كتبته</h3>
  <div class="notice info">${s.analysisText}</div>
  <p class="small muted">هذا النص محفوظ للعرض والمقارنة، لكنه لا يدخل في الدرجة عبر تقييم لغوي أو دلالي آلي في النسخة الحالية.</p>

  <div class="notice"><b>تنبيه قانوني:</b> المحاكاة تساعد على تحليل الوقائع وتوزيع وظائف السيطرة والمخاطر. لا تصدر توصيفًا قانونيًا نهائيًا لعلاقة العمل.</div>

  <div class="actions"><button class="btn" id="rights">اربط التجربة بالحقوق</button><button class="btn secondary" id="archive">حفظ النتيجة للمقارنة</button><button class="btn ghost" id="restartScenario">تجربة حالة أخرى</button></div>
 </div>`;
 document.getElementById('rights').onclick=()=>location.href=href('rights');
 document.getElementById('archive').onclick=()=>{archiveResult({version:'TaskBridge v2.0.0',scenario:s.scenarioKey,scenarioName:sc.role,score:r.score,scoreBreakdown:{questions:r.qScore,evidenceSort:r.sortScore,power:r.powerScore,evidenceBalance:r.evidenceBalance},outcome:s.accountOutcome,simMinutes:s.time,paidMinutes:s.paidTime,unpaidMinutes:s.unpaidTime,power:s.power,answers:s.answers,analysis:s.analysisText,createdAt:new Date().toISOString()});alert('تم حفظ النتيجة للمقارنة على هذا الجهاز.')};
 document.getElementById('restartScenario').onclick=()=>location.href=href('scenario')
}
