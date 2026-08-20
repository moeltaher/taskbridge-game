import {scenarios,samples} from '../data/scenarios.js';import {getState,patch,addLog,addEvidence,clamp,money} from '../core/state.js';import {href} from '../core/routes.js';

function dispute(sc,s){
 let worker='',client='',sev=1,reason='';
 if(sc.type==='data'){
  worker='<p>أرسلت ثلاثة إطارات لتحديد المركبة الأساسية في صور الطريق.</p><p>في إحدى العينات، لا يتطابق موضع الإطار تمامًا مع الحدود التي يعتمدها المشروع.</p>';
  client='<p>المشروع يستخدم إطارًا مرجعيًا داخليًا يحدد حدود المركبة بدقة أكبر، خصوصًا في المشهد الأقل وضوحًا.</p>';
  reason='راجع نظام الجودة الإطارات التي رسمتها وقارنها بإطارات مرجعية محفوظة للمشروع.';
  sev=s.workScore>=85?0:s.workScore>=70?1:2;
 }else if(sc.type==='moderation'){
  const i=s.workAnswers.findIndex((a,j)=>a!==samples.moderation[j].hidden),idx=i<0?0:i,x=samples.moderation[idx];
  worker=`<p>${x.text}</p><p>قرارك: <b>${s.workAnswers[idx]}</b></p>`;
  client=`<p>التصنيف المرجعي المستخدم في المراجعة: <b>${x.hidden}</b></p>`;
  reason='قارن نظام الجودة تصنيفك بمرجع داخلي يستخدمه المشروع لمراجعة قرارات المحتوى.';
  sev=i<0?0:(x.hidden!==x.published?1:2);
 }else if(sc.type==='ai'){
  const i=s.workAnswers.findIndex((a,j)=>a!==samples.ai[j].hidden),idx=i<0?0:i,x=samples.ai[idx];
  worker=`<p>${x.q}</p><p>اختيارك: <b>${s.workAnswers[idx]}</b></p>`;
  client=`<p>الإجابة المرجعية المستخدمة في المراجعة: <b>${x.hidden}</b></p>`;
  reason='قارن نظام الجودة اختيارك بإجابة مرجعية يستخدمها المشروع للتحقق من اتساق المقيمين.';
  sev=i<0?0:(x.hidden!==x.published?1:2);
 }else{
  const i=s.workAnswers.findIndex((a,j)=>a!==samples.translation[j].published),idx=i<0?2:i,x=samples.translation[idx];
  worker=`<p>${x.src}</p><p>اختيارك: <b>${s.workAnswers[idx]}</b></p>`;
  client='<p>يرى العميل أن الصياغة المطلوبة وفق دليل المشروع مختلفة أسلوبيًا عن الصياغة التي أُرسلت.</p>';
  reason='راجع العميل عينة من الترجمة وفق دليل الأسلوب والمصطلحات الخاص بالمشروع.';
  sev=i<0?0:2;
 }
 return {worker,client,sev,reason};
}

function consequences(s,sev,appeal=false){
 let hold=0,penalty=0;
 if(sev===1){hold=Math.min(.45,s.grossWorker*.10);penalty=4}
 else if(sev>=2){hold=Math.min(.9,s.grossWorker*.18);penalty=9}
 if(appeal&&penalty>0)penalty=Math.ceil(penalty*.6);
 return {hold,penalty};
}

function finalize(){
 const s=getState(),c=consequences(s,s.disputeSeverity,s.appealed);
 patch({hold:c.hold,quality:clamp(s.quality-c.penalty,55,99),access:clamp(s.access-c.penalty,0,100),status:'قيد التسوية'});
 addLog('أغلقت مراجعة الجودة',c.hold?`حُجز ${money(c.hold)} مؤقتًا من المستحقات، وتغيرت مؤشرات الحساب.`:'انتهت المراجعة دون حجز مالي.');
 location.href=href('payment');
}

export async function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey],d=dispute(sc,s);
 if(s.disputeSeverity!==d.sev)patch({disputeSeverity:d.sev});
 addEvidence('clientQuality');addEvidence('clientRemoval');
 const noAppeal=consequences(getState(),d.sev,false),withAppeal=consequences(getState(),d.sev,true);
 const status=d.sev===0?'لم يظهر اختلاف مؤثر':d.sev===1?'ظهر اختلاف محدود في المراجعة':'ظهر اختلاف جوهري في المراجعة';
 root.innerHTML=`<div class="panel">
  <div class="instruction"><span class="n">10</span><div class="instruction-copy"><div class="instruction-title"><b>وصلت مهمة سابقة إلى مراجعة الجودة</b></div><div class="instruction-subtitle"><small>قبل تسوية مستحقات الوردية، تقارن المنصة أو العميل جزءًا من عملك بمرجع المشروع.</small></div></div></div>

  <h2>ماذا حدث؟</h2>
  <div class="notice info"><b>${status}</b><div style="margin-top:6px">${d.reason}</div>${d.sev===0?'<div style="margin-top:6px">الاختلاف الموجود لا يكفي في هذه المحاكاة لفرض أثر مالي أو خفض مؤشرات حسابك.</div>':'<div style="margin-top:6px">لأن هناك اختلافًا، لم تُغلق التسوية بعد. لديك الآن فرصة لطلب مراجعة إضافية قبل احتساب الأثر النهائي.</div>'}</div>

  <h3>أين يوجد الاختلاف؟</h3>
  <div class="grid-2">
   <div class="card" style="border-top:4px solid var(--worker)"><small class="muted">ما أرسلته أنت</small><h3>عملك</h3>${d.worker}</div>
   <div class="card" style="border-top:4px solid var(--client)"><small class="muted">ما قورِن به العمل</small><h3>مرجع المشروع</h3>${d.client}<p class="small muted">المرجع هو معيار داخلي يستخدمه المشروع للمراجعة؛ لا يعني وجود اختلاف معه بالضرورة أن عملك عديم القيمة، لكنه قد يؤثر في قرار القبول.</p></div>
  </div>

  <h3>ماذا يمكن أن يحدث إذا بقي الاختلاف؟</h3>
  ${d.sev===0?`<div class="notice good"><b>لا يوجد أثر مالي في هذه الحالة.</b> يمكنك المتابعة إلى تسوية المدفوعات.</div>`:`<div class="grid-3"><div class="metric"><small>مبلغ قد يُحجز مؤقتًا</small><b>${money(noAppeal.hold)}</b></div><div class="metric"><small>انخفاض محتمل في الجودة</small><b>-${noAppeal.penalty} نقاط</b></div><div class="metric"><small>انخفاض محتمل في الوصول</small><b>-${noAppeal.penalty} نقاط</b></div></div><div class="notice"><b>ما معنى «الحجز»؟</b><div style="margin-top:5px">هو جزء من مستحقاتك لا يُضاف إلى الصافي في التسوية الحالية بسبب خلاف الجودة. سيظهر هذا المبلغ بوضوح في صفحة الدفع التالية.</div></div>`}

  <h3>ماذا تريد أن تفعل؟</h3>
  ${d.sev===0?`<div class="actions"><button class="btn" id="skip">متابعة إلى تسوية المدفوعات</button></div>`:`<div class="grid-2"><div class="card"><h3>أطلب مراجعة إضافية</h3><p>تسجل اعتراضًا لدى TaskBridge قبل إغلاق قرار الجودة.</p><p class="small muted">في هذه المحاكاة، المراجعة تقلل أثر القرار على مؤشري الجودة والوصول من <b>${noAppeal.penalty}</b> إلى <b>${withAppeal.penalty}</b> نقاط. مبلغ الحجز يبقى ظاهرًا في التسوية.</p><button class="btn" id="appeal">طلب مراجعة</button></div><div class="card"><h3>أقبل نتيجة المراجعة الحالية</h3><p>تتابع إلى التسوية دون طلب مراجعة إضافية.</p><p class="small muted">سيُطبّق الأثر الحالي كما هو: حجز ${money(noAppeal.hold)} وخفض ${noAppeal.penalty} نقاط من الجودة والوصول.</p><button class="btn secondary" id="skip">المتابعة دون اعتراض</button></div></div>`}
  <div id="msg"></div>
 </div>`;

 const appeal=document.getElementById('appeal');
 if(appeal)appeal.onclick=()=>{patch({appealed:true});addEvidence('appeal');addLog('طلبت مراجعة قرار الجودة','قدمت طلب مراجعة إضافية عبر TaskBridge.');document.getElementById('msg').innerHTML=`<div class="notice info"><b>تم تسجيل طلبك.</b><div style="margin-top:5px">ستُغلق المراجعة الآن مع أثر أقل على مؤشري الجودة والوصول في هذه المحاكاة.</div><div class="actions"><button class="btn" id="cont">متابعة إلى تسوية المدفوعات</button></div></div>`;document.getElementById('cont').onclick=finalize};
 document.getElementById('skip').onclick=()=>{patch({appealed:false});addLog('تابعت دون مراجعة إضافية','لم تستخدم مسار المراجعة الإضافية.');finalize()};
}
