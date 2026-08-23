import {scenarios} from '../data/scenarios.js';
import {getState,commit,money,wellbeingLabel} from '../core/state.js';
import {href} from '../core/routes.js';
import {taskGuideHTML,taskSamplesHTML,bindTaskInputs} from '../core/task-ui.js';
import {BREAK_MINUTES,BREAK_STRESS_REDUCTION,computeManagedAccess,buildSecondOffer,secondOfferDecision,prepareSecondTask,completeSecondTask,monitorDecision} from '../domain/management.js';
function goalLine(sc,s,extra=0,label='المستحق الحالي'){
 const projected=s.grossWorker+extra,diff=projected-sc.goal;
 return `<div class="goal-strip"><b>هدف الوردية ${money(sc.goal)}</b><span>${label}: ${money(projected)}</span><span>${diff>=0?`يتجاوز الهدف بـ ${money(diff)}`:`ينقص عن الهدف ${money(-diff)}`}</span></div>`;
}
function ranking(root,sc,s){
 const access=computeManagedAccess(sc,s),before=s.rankingBeforeAccess??s.access,taskScore=s.completedTasks?.[0]?.score??s.workScore;
 if(s.rankingBeforeAccess===null||s.rankingBeforeAccess===undefined||s.access!==access)commit({changes:{rankingBeforeAccess:before,access,opportunityRankingDecision:{before,after:access,taskScore,acceptance:s.acceptance}},evidence:['allocation','opacity'],log:{title:'أعيد حساب الوصول إلى المهام',text:`اعتمد التحديث على نتيجة المهمة الأولى ${taskScore}% ومعدل قبول العروض ${s.acceptance}%. تغير الوصول من ${before} إلى ${access}.`}});
 const premium=access>=sc.accessPolicy.premiumAt,change=access-before;
 root.innerHTML=`<div class="panel"><div class="task-now outcome"><span>⚡ حدث</span><b>No Boss أعادت ترتيب حسابك بعد المهمة الأولى.</b></div><div class="grid-4"><div class="metric"><small>الوصول قبل التحديث</small><b>${before}/100</b></div><div class="metric"><small>نتيجة المهمة</small><b>${taskScore}%</b></div><div class="metric"><small>معدل القبول</small><b>${s.acceptance}%</b></div><div class="metric"><small>الوصول بعد التحديث</small><b>${access}/100</b></div></div><div class="notice ${premium?'good':'info'}"><b>${change>0?`ارتفع الوصول ${change} نقاط`:change<0?`انخفض الوصول ${Math.abs(change)} نقاط`:'لم يتغير الوصول'}.</b> المستوى المميز يبدأ عند ${sc.accessPolicy.premiumAt}. ${premium?'أداؤك فتح العرض المميز فعلًا.':'سترى عرضًا عاديًا هذه المرة.'}</div><div class="actions"><button class="btn" id="nextOffer">رؤية العرض الناتج عن هذا التحديث</button></div></div>`;
 document.getElementById('nextOffer').onclick=()=>{commit({changes:{secondOffer:buildSecondOffer(sc,getState().access),currentTaskSampleIndexes:[],secondTaskAnswers:[],managementStep:'offer',status:'وصل عرض مهمة ثانية'},checkpointLabel:'العودة إلى نتيجة إعادة ترتيب الفرص'});render(root)};
}
function offer(root,sc,s){
 const o=s.secondOffer;
 root.innerHTML=`<div class="panel"><div class="task-now decision"><span>⚖️ قرار</span><b>اقبل العرض أو ارفضه أو أنهِ الوردية دون تسجيل رفض جديد.</b></div><div class="notice info"><b>لماذا ظهر؟</b> وصولك ${s.access}/100، والحد المميز ${sc.accessPolicy.premiumAt}. لذلك ظهر ${o.premium?'العرض المميز':'العرض العادي'}. مواصفات العرض هي نفسها التي ظهرت لك في سوق المهام.</div>${goalLine(sc,s,o.pay,'إذا قبلت وأكملت المهمة')}<div class="job"><span class="pill">${o.premium?'عرض مميز':'عرض عادي'}</span><h2>${o.title}</h2><div class="price">${money(o.pay)}</div><p>${o.duration} دقيقة · ${o.sampleCount} عينات · عبء اسمي حتى +${o.stress}</p></div><div class="notice">المقابل المعروض هنا متوقع فقط؛ لا يضاف إلى مستحقاتك إلا إذا قبلت المهمة وأرسلتها مكتملة. إنهاء الوردية هنا لا يُحسب رفضًا للعرض ولا يغير معدل قبولك.</div><div class="actions"><button class="btn good" id="yes">أقبل المهمة</button><button class="btn secondary" id="no">أرفض هذا العرض</button><button class="btn ghost" id="endShift">أنهي الوردية الآن</button></div></div>`;
 document.getElementById('yes').onclick=()=>decide(true,root);
 document.getElementById('no').onclick=()=>decide(false,root);
 document.getElementById('endShift').onclick=()=>{commit({changes:{offerDecisionResult:{accepted:null,completed:false,title:o.title,endedShift:true},managementStep:'monitor',status:'أنهيت استقبال العروض'},evidence:['monitoring'],log:{title:'أنهيت الوردية دون رفض العرض الثاني',text:'توقفت عن استقبال عمل إضافي؛ لم يضف القرار رفضًا أو يغير معدل القبول.'},checkpointLabel:'العودة إلى العرض الثاني قبل إنهاء الوردية'});render(root)};
}
function decide(accepted,root){
 const st=getState(),out=secondOfferDecision(st,accepted);
 if(accepted){
  const indexes=prepareSecondTask(st);
  commit({changes:{offerDecisions:out.offerDecisions,acceptedOffers:out.acceptedOffers,acceptance:out.acceptance,offerDecisionResult:out.result,currentTaskSampleIndexes:indexes,secondTaskAnswers:[],managementStep:'secondTask',status:'ينفذ المهمة الثانية'},log:{title:'قبلت العرض الثاني',text:`قبلت ${st.secondOffer.title}. لن يضاف المقابل إلا بعد التنفيذ.`},checkpointLabel:'التراجع عن قبول العرض الثاني'});
 }else commit({changes:{offerDecisions:out.offerDecisions,acceptedOffers:out.acceptedOffers,acceptance:out.acceptance,rejections:out.rejections,offerDecisionResult:out.result,managementStep:'offerResult',status:'رفض المهمة الثانية'},evidence:['decline'],log:{title:'رفضت العرض الثاني',text:`رفضت ${st.secondOffer.title}. سجل الرفض كقرار عرض.`},checkpointLabel:'التراجع عن رفض العرض الثاني'});
 render(root);
}
function secondTask(root,sc,s){
 const o=s.secondOffer;
 root.innerHTML=`<div class="panel"><div class="task-now"><span>🎯 مهمتك الآن</span><b>نفذ ${o.sampleCount} عينات جديدة ثم أرسل الدفعة الثانية.</b></div>${goalLine(sc,s,o.pay,'المستحق المتوقع بعد إرسال المهمة')}<div class="notice info">العينات لا تتكرر من المهمة الأولى. المقابل لا يصبح مستحقًا إلا بعد الإرسال. بعد الإرسال ستحدث نتيجة هذه المهمة جودة الحساب.</div>${taskGuideHTML(sc,true)}${taskSamplesHTML(sc,s.currentTaskSampleIndexes||[],s.secondTaskAnswers,{prefix:'second'})}<div class="actions"><button class="btn" id="completeSecond">إرسال المهمة الثانية</button></div></div>`;
 bindTaskInputs(root,sc,{answerField:'secondTaskAnswers',prefix:'second',rerender:()=>render(root)});
 document.getElementById('completeSecond').onclick=()=>{
  const st=getState();
  if(st.secondTaskAnswers.slice(0,o.sampleCount).filter(Boolean).length<o.sampleCount){alert(`أكمل العينات ${o.sampleCount} قبل الإرسال.`);return}
  const out=completeSecondTask(sc,st);
  commit({changes:out.changes,log:{title:'أكملت المهمة الثانية',text:`نتيجة المهمة ${out.score}%. تغيرت الجودة من ${out.record.qualityBefore}% إلى ${out.record.qualityAfter}%، وارتفع العبء فعليًا ${out.stressDelta} نقطة.`},checkpointLabel:'العودة إلى تنفيذ المهمة الثانية قبل الإرسال'});
  render(root);
 };
}
function offerResult(root,sc,s){
 const d=s.offerDecisionResult||{},accepted=d.accepted===true,task=s.completedTasks?.find(t=>t.id==='task-2');
 root.innerHTML=`<div class="panel"><div class="task-now outcome"><span>✓ نتيجة</span><b>${accepted?'اكتملت المهمة الثانية وأثرت في الحساب.':'رفضت العرض الثاني وسُجل القرار.'}</b></div>${goalLine(sc,s)}${accepted?`<div class="grid-4"><div class="metric"><small>نتيجة المهمة</small><b>${task?.score}%</b></div><div class="metric"><small>الجودة</small><b>${task?.qualityBefore}% ← ${task?.qualityAfter}%</b></div><div class="metric"><small>المقابل</small><b>+${money(task?.pay)}</b></div><div class="metric"><small>العبء الفعلي</small><b>+${task?.stressDelta}</b></div></div>`:'<div class="notice info">لم يزد الوقت أو الدخل. الرفض سيظهر كعامل مستقل في قرار الوصول النهائي.</div>'}<div class="actions"><button class="btn" id="toMonitor">متابعة إلى إغلاق الوردية</button></div></div>`;
 document.getElementById('toMonitor').onclick=()=>{commit({changes:{managementStep:'monitor',status:'مراجعة مؤشرات الوردية'},evidence:['monitoring'],checkpointLabel:'العودة إلى نتيجة العرض الثاني'});render(root)};
}
function monitoringCopy(sc){if(sc.monitoring==='light')return 'وقت التسليم وسجل التعديلات';if(sc.monitoring==='intensive')return 'سرعة القرار وفترات الخمول وبعض مؤشرات النشاط';if(sc.monitoring==='timing')return 'زمن المهمة وتبديل التبويبات وتعديلات الإجابة';return 'فترات النشاط والخمول وتغييرات النافذة'}
function monitor(root,sc,s){
 const ended=s.offerDecisionResult?.endedShift===true;
 const taskText=ended?'قبل إغلاق الوردية، اختر أخذ استراحة قصيرة أو الانتقال مباشرة إلى المراجعة.':'اختر أخذ استراحة قصيرة أو الانتقال إلى المراجعة دون استراحة.';
 root.innerHTML=`<div class="panel"><div class="task-now decision"><span>⚖️ قرار قبل الإغلاق</span><b>${taskText}</b></div><div class="notice info"><b>معلومة تكشفها المنصة الآن:</b> أثناء العمل سجّلت No Boss ${monitoringCopy(sc)}. لم تكن تفاصيل هذا الرصد معروضة لك قبل التنفيذ؛ هذا التأخر مقصود في المحاكاة لتوضيح أثر نقص الشفافية.</div><div class="grid-2"><div class="card"><small>جودة الحساب الحالية</small><h3>${s.quality}%</h3></div><div class="card"><small>عبء الوردية</small><h3>${s.stress}/100 · ${wellbeingLabel(s.stress)}</h3></div></div><div class="notice"><b>أثر الاستراحة معلن:</b> تضيف ${BREAK_MINUTES} دقائق وتخفض العبء حتى ${BREAK_STRESS_REDUCTION} نقاط. هي قرار تعافٍ اختياري، ولا تمنع بذاتها وقوع حدث مستقل لاحقًا في المحاكاة. زر الرجوع في المرحلة التالية سيظهر بوضوح كتراجع عن هذا القرار.</div><div class="actions"><button class="btn secondary" id="break">استراحة ${BREAK_MINUTES} د · عبء -${BREAK_STRESS_REDUCTION}</button><button class="btn" id="continue">الانتقال إلى المراجعة دون استراحة</button></div></div>`;
 document.getElementById('break').onclick=()=>finishMonitor(true);
 document.getElementById('continue').onclick=()=>finishMonitor(false);
}
function finishMonitor(takeBreak){
 const st=getState(),d=monitorDecision(st,takeBreak);
 commit({changes:{monitorDecision:d,stress:d.stressAfter,time:st.time+d.timeDelta,breakTime:st.breakTime+d.breakDelta,stage:4,status:'تقييم مخاطر الوردية'},log:{title:takeBreak?'أخذت استراحة':'انتقلت إلى المراجعة دون استراحة',text:takeBreak?`أضفت ${BREAK_MINUTES} دقائق استراحة وخفضت العبء ${Math.abs(d.stressDelta)} نقاط.`:'أغلقت مرحلة العمل دون استراحة.'},checkpointLabel:takeBreak?'التراجع عن قرار الاستراحة':'التراجع عن قرار المتابعة دون استراحة'});
 location.href=href('risk');
}
export function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey],step=s.managementStep||'ranking';
 if(step==='offer')return offer(root,sc,s);
 if(step==='secondTask')return secondTask(root,sc,s);
 if(step==='offerResult')return offerResult(root,sc,s);
 if(step==='monitor')return monitor(root,sc,s);
 return ranking(root,sc,s);
}
