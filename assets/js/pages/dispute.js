import {scenarios} from '../data/scenarios.js';
import {samples} from '../data/samples.js';
import {getState,commit,money} from '../core/state.js';
import {href} from '../core/routes.js';
import {APPEAL_TIME_MINUTES,appealGrounds,availableAppealGrounds,reviewSeverityFromScore,selectReviewTask,reviewProfile,reviewAppeal,disputeConsequences,applyDisputeOutcome,appealCostChanges,publishedTranslationText} from '../domain/dispute.js';
function labelSeverity(sev){return sev>=2?'اختلاف جوهري':sev===1?'اختلاف محدود':'لا اختلاف مؤثر'}
function taskLabel(task){return task?.id==='task-2'?'المهمة الثانية':'المهمة الأولى'}
function answerText(sc,sample,answer){
 if(answer===null||answer===undefined)return '—';
 if(sc.type==='ai'||sc.type==='translation')return sample?.[String(answer).toLowerCase()]??String(answer);
 return String(answer);
}
function referenceText(sc,sample){
 if(sc.type==='ai')return sample?.[String(sample?.preferred||'A').toLowerCase()]??sample?.preferred??'—';
 if(sc.type==='translation')return publishedTranslationText(sample);
 return sample?.preferred??'—';
}
function differenceRows(sc,task){
 if(!task||sc.type==='data')return '';
 const rows=[];
 task.answers.forEach((answer,i)=>{
  const sample=samples[sc.type][task.sampleIndexes[i]];
  if(sample?.acceptable?.includes(answer))return;
  const kind=sample?.reviewable?.includes(answer)?'قابل للمراجعة الثانية':'خطأ واضح';
  const prompt=sc.type==='moderation'?sample.text:sc.type==='ai'?sample.q:sample.src;
  rows.push(`<div class="doc"><span class="pill">${kind}</span><p class="small"><b>العينة:</b> ${prompt}</p><p class="small"><b>إجابتك:</b> ${answerText(sc,sample,answer)}</p><p class="small"><b>المرجع:</b> ${referenceText(sc,sample)}</p></div>`);
 });
 return rows.length?`<h3>كل الاختلافات التي بنت عليها المراجعة قرارها</h3><div class="evidence-grid">${rows.join('')}</div>`:'<div class="notice good">لم تسجل المهمة اختلافات عن الإجابات المقبولة.</div>';
}
function referenceFor(sc,task){
 if(!task)return {worker:'—',client:'—'};
 if(sc.type==='data')return {worker:`${taskLabel(task)}: أرسلت ${task.sampleIndexes.length} إطارات تحديد، والنتيجة ${task.score}%.`,client:`المراجعة تقارن جميع إطارات هذه المهمة بالحدود المرجعية للمركبات.${task.technicalIssue===true?' هذه المهمة نفسها تحمل واقعة تقنية مسجلة مرتبطة بعرض/مزامنة الإجابة.':''}`};
 const profile=reviewProfile(sc,task);
 return {worker:`المهمة تضم ${task.sampleIndexes.length} عينات، ونتيجتها ${task.score}%.`,client:`المراجعة فحصت المهمة كلها: ${profile.reviewableErrors} اختلافًا قابلًا للمراجعة الثانية و${profile.hardErrors} خطأ واضحًا.`};
}
function registerAppeal(root,sc){
 const state=getState();if(state.appealCost)return;
 if(!state.appealGround){alert('اختر سببًا محددًا للاعتراض قبل طلب المراجعة الثانية.');return}
 const task=(state.completedTasks||[]).find(t=>t.id===state.reviewTaskId)||selectReviewTask(state),available=availableAppealGrounds(sc,state,task);
 if(!available[state.appealGround]){alert('هذا السبب غير متاح للمهمة محل المراجعة وفق الوقائع المسجلة.');return}
 const review=reviewAppeal(sc,state),cost=appealCostChanges(state);
 commit({changes:{...cost,appealed:true,appealReview:review,finalReviewSeverity:review.finalSeverity},evidence:['appeal'],log:{title:'طلبت مراجعة إضافية',text:`سبب الاعتراض: ${appealGrounds[state.appealGround]}. ${review.reason}`},checkpointLabel:'التراجع عن طلب المراجعة الثانية'});
 render(root);
}
function finalize(){
 const state=getState();
 if(state.disputeFinalized){commit({changes:{stage:6,status:'قيد التسوية'},checkpointLabel:'العودة إلى نتيجة مراجعة الجودة'});location.href=href('payment');return}
 const out=applyDisputeOutcome(state);
 commit({changes:out.changes,log:{title:'أغلقت مراجعة الجودة',text:out.consequences.hold?`النتيجة النهائية ${labelSeverity(out.finalSeverity)}؛ حجز ${money(out.consequences.hold)} من أجر المهمة وخفض الجودة ${out.consequences.penalty} نقاط.`:'انتهت المراجعة دون حجز أو خفض للجودة.'},checkpointLabel:'التراجع عن إغلاق مراجعة الجودة'});
 location.href=href('payment');
}
export function render(root){
 const initial=getState(),sc=scenarios[initial.scenarioKey],task=(initial.completedTasks||[]).find(t=>t.id===initial.reviewTaskId)||selectReviewTask(initial);
 if(!task){commit({changes:{stage:6,status:'لا توجد مهمة للمراجعة'},checkpointLabel:'العودة إلى نتيجة المخاطر'});location.href=href('payment');return}
 const severity=reviewSeverityFromScore(task.score);
 if(initial.disputeFinalized){
  root.innerHTML=`<div class="panel"><div class="task-now outcome"><span>✓ نتيجة</span><b>مراجعة الجودة مغلقة.</b></div><div class="notice info">المهمة محل النزاع: <b>${taskLabel(task)}</b> · نتيجتها ${task.score}%.</div><div class="actions"><button class="btn" id="toPayment">متابعة التسوية</button></div></div>`;
  document.getElementById('toPayment').onclick=()=>{commit({changes:{stage:6,status:'قيد التسوية'},checkpointLabel:'العودة إلى نتيجة مراجعة الجودة'});location.href=href('payment')};return;
 }
 if(initial.appealCost&&initial.appealed===true){
  const review=initial.appealReview||reviewAppeal(sc,initial),after=disputeConsequences(initial,review.finalSeverity);
  root.innerHTML=`<div class="panel"><div class="task-now outcome"><span>✓ نتيجة المراجعة الثانية</span><b>${labelSeverity(initial.initialReviewSeverity)} ← ${labelSeverity(review.finalSeverity)}</b></div><div class="notice ${review.accepted?'good':'info'}"><b>${review.accepted?'غيّرت المراجعة الثانية النتيجة.':'ثبتت المراجعة الثانية النتيجة.'}</b> ${review.reason}</div>${review.accepted?'<div class="notice"><b>نطاق التصحيح في هذه المحاكاة:</b> تخفّض المراجعة شدة قرار الجودة، لكنها لا تعيد حساب درجة المهمة نفسها ولا تعيد تشغيل أي قرار ترتيب سابق كان قد صدر قبل المراجعة.</div>':''}<div class="grid-3"><div class="metric"><small>إجابات قابلة للدفاع</small><b>${review.reviewableErrors??0}</b></div><div class="metric"><small>أخطاء واضحة</small><b>${review.hardErrors??0}</b></div><div class="metric"><small>الحجز النهائي</small><b>${money(after.hold)}</b></div></div><div class="notice"><b>كلفة الاعتراض الفعلية:</b> +${APPEAL_TIME_MINUTES} د و+${initial.appealCost.stress??0} عبء.</div><div class="actions"><button class="btn" id="contAppeal">إغلاق المراجعة ومتابعة التسوية</button></div></div>`;
  document.getElementById('contAppeal').onclick=finalize;return;
 }
 const changes={reviewTaskId:task.id};if(initial.initialReviewSeverity!==severity)changes.initialReviewSeverity=severity;if(initial.finalReviewSeverity!==severity)changes.finalReviewSeverity=severity;if(initial.qualityBeforeDispute===null)changes.qualityBeforeDispute=initial.quality;
 commit({changes,evidence:['clientQuality',...(sc.type!=='data'?['clientRemoval']:[])]});
 const current=getState(),ref=referenceFor(sc,task),profile=reviewProfile(sc,task),noAppeal=disputeConsequences(current,severity),grounds=availableAppealGrounds(sc,current,task);
 const technicalNote=sc.type==='data'&&task.technicalIssue!==true?'<div class="notice info">لا توجد واقعة تقنية مسجلة على المهمة محل المراجعة، لذلك لا يظهر السبب التقني ضمن أسباب الاعتراض المتاحة.</div>':'';
 root.innerHTML=`<div class="panel"><div class="task-now ${severity?'decision':'outcome'}"><span>${severity?'⚖️ قرار':'✓ نتيجة'}</span><b>${severity?'حدد سبب اعتراضك ثم قرر هل تطلب مراجعة ثانية.':'لم يظهر اختلاف مؤثر؛ تابع إلى التسوية.'}</b></div><div class="notice info"><b>أي مهمة تراجع؟</b> اختارت No Boss أقل مهمة مكتملة نتيجةً: <b>${taskLabel(task)}</b> بنتيجة ${task.score}%. <b>وعند تعادل مهمتين في النتيجة، تراجع الأحدث منهما.</b></div><div class="grid-2"><div class="card"><h3>ما أرسلته</h3><p>${ref.worker}</p></div><div class="card"><h3>أساس المراجعة</h3><p>${ref.client}</p></div></div><div class="notice info"><b>ملخص المهمة كلها:</b> ${profile.reviewableErrors} اختلافًا قابلًا للمراجعة الثانية · ${profile.hardErrors} خطأ واضحًا${profile.technicalIssues?` · ${profile.technicalIssues} واقعة تقنية مرتبطة بالمهمة`:''}.</div>${differenceRows(sc,task)}${technicalNote}${severity===0?'<div class="actions"><button class="btn" id="skip">متابعة إلى التسوية</button></div>':`<div class="grid-2"><div class="card"><h3>قبول النتيجة الأولى</h3><p>${labelSeverity(severity)} · حجز ${money(noAppeal.hold)} · خفض جودة ${noAppeal.penalty} نقاط.</p><button class="btn secondary" id="skip">المتابعة دون اعتراض</button></div><div class="card"><h3>طلب مراجعة ثانية</h3><p>تظهر فقط الأسباب التي يمكن أن تنطبق مبدئيًا على نوع المهمة والوقائع المسجلة؛ قبول السبب نفسه يظل مرتبطًا بمحتوى الأخطاء.</p><fieldset><legend>سبب الاعتراض</legend>${Object.entries(grounds).map(([id,label])=>`<label><input type="radio" name="appeal-ground" value="${id}" ${current.appealGround===id?'checked':''}> ${label}</label>`).join('<br>')}</fieldset><button class="btn" id="appeal">طلب مراجعة إضافية</button></div></div>`}</div>`;
 root.querySelectorAll('input[name="appeal-ground"]').forEach(input=>input.onchange=()=>{if(input.checked)commit({changes:{appealGround:input.value}})});
 document.getElementById('appeal')?.addEventListener('click',()=>registerAppeal(root,sc));
 document.getElementById('skip').onclick=()=>{commit({changes:{appealed:false,appealGround:null,appealReview:null,finalReviewSeverity:severity},log:severity?{title:'تابعت دون مراجعة إضافية',text:`ثبتت نتيجة ${taskLabel(task)} عند ${labelSeverity(severity)}.`}:null});finalize()};
}
