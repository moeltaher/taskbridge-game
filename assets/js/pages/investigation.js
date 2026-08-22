import {scenarios} from '../data/scenarios.js';
import {getState,patch,commit,timeBreakdown} from '../core/state.js';
import {href} from '../core/routes.js';
import {timelineHTML} from '../core/ui.js';
import {evidenceFor} from '../domain/evidence.js';
import {questionsForState} from '../domain/questions.js';
function scoreableIds(s,sc){return s.evidence.filter(id=>evidenceFor(id,sc,s).scoreable!==false)}
function evidenceComplete(s,sc){const ids=scoreableIds(s,sc);return ids.length>0&&ids.every(id=>s.evidenceSort[id])}
function tabs(step,s,sc){
 const done=evidenceComplete(s,sc),items=[['case','1 · ملف القضية',true],['evidence','2 · تصنيف الأدلة',true],['questions','3 · أسئلة تشخيصية',done]];
 return `<div class="section-tabs" role="tablist" aria-label="مراحل التحقيق">${items.map(([id,label,enabled])=>`<button id="tab-${id}" role="tab" aria-controls="panel-${id}" aria-selected="${step===id}" tabindex="${step===id?'0':'-1'}" class="${step===id?'active':''}" data-step="${id}" ${enabled?'':'disabled'}>${label}</button>`).join('')}</div>`;
}
function actorFlow(sc,s){
 if(s.contractDeclineEnding)return `<div class="actor-flow"><div class="actor-card worker"><span class="actor-icon">👤</span><b>العامل · ${sc.name}</b><p>${sc.role} · ${sc.city}</p></div><div class="actor-card platform"><span class="actor-icon">⬡</span><b>المنصة · No Boss</b><p>وضعت شروط الحساب وربطت قبولها بالدخول إلى سوق المهام.</p></div></div>`;
 const mediator=s.payment&&Number(s.payment.contracted)>0?`<div class="actor-card mediator"><span class="actor-icon">⇄</span><b>وسيط الدفع</b><p>شارك في التسوية المالية فقط؛ لا يدخل خريطة سلطة العمل.</p></div>`:'';
 return `<div class="actor-flow"><div class="actor-card worker"><span class="actor-icon">👤</span><b>العامل · ${sc.name}</b><p>${sc.role} · ${sc.city}</p></div><div class="actor-card platform"><span class="actor-icon">⬡</span><b>المنصة · No Boss</b><p>الحساب، عرض العمل، الترتيب، الاعتراض والوصول.</p></div><div class="actor-card client"><span class="actor-icon">🏢</span><b>العميل · ${sc.client}</b><p>${sc.clientCountry} · متطلبات المشروع ومعيار الجودة.</p></div>${mediator}</div>`;
}
function caseView(sc,s){
 const t=timeBreakdown(s),recent=s.log.slice(-6);
 const context=s.contractDeclineEnding?'<div class="notice info"><b>هذه الجولة انتهت عند بوابة العقد.</b> لم تدخل سوق العمل، لذلك التحليل يركز على الاتفاقية الموحدة ومن يملك قرار الدخول إلى السوق. لن تظهر وقائع عن تسعير مهمة أو مراقبة أو دفع لم تحدث.</div>':s.noWorkEnding?`<div class="notice info"><b>هذه وردية انتهت بلا عمل.</b> التحليل يركز على العروض والتسعير والتوزيع والوصول، ويضيف محورًا مستقلًا لعبء المشاركة: ${t.marketTime} دقائق بحث وتكاليف تشغيل رغم غياب الدخل.</div>`:`<div class="notice info"><b>زمن الوردية:</b> ${t.marketTime} د سوق/بحث · ${t.taskTime} د مهمات · ${t.extraWorkTime} د وقت إضافي · ${t.breakTime} د استراحة.</div>`;
 return `<div class="task-now"><span>🎯 مهمتك الآن</span><b>راجع الأطراف والوقائع الأساسية ثم انتقل إلى الأدلة.</b></div>${actorFlow(sc,s)}${context}<h3>آخر الوقائع المهمة</h3>${timelineHTML(recent)}<div class="notice"><b>العناصر المتاحة:</b> ${s.evidence.length}. بعضها أدلة قابلة للتصنيف، وقد توجد معلومات مالية منفصلة لا تدخل الدرجة.</div><div class="evidence-index">${s.evidence.map(id=>{const e=evidenceFor(id,sc,s);return `<span class="pill">${e.title}${e.scoreable===false?' · غير محسوب':''}</span>`}).join('')}</div><div class="actions"><button class="btn" data-next="evidence">ابدأ تصنيف الأدلة</button></div>`;
}
const dimensionLabel={contract:'العقد',price:'السعر',allocation:'توزيع العمل',monitoring:'المراقبة',quality:'معيار الجودة',burden:'العبء والتكاليف',settlement:'التسوية المالية',access:'الوصول',other:'أدلة أخرى'};
function evidenceView(sc,s){
 const ids=scoreableIds(s,sc),done=ids.filter(id=>s.evidenceSort[id]).length;
 return `<div class="task-now"><span>🎯 مهمتك الآن</span><b>صنّف الأدلة التي تتعلق بسلطة العمل أو استقلال العامل، واقرأ معلومات التسوية بصورة منفصلة.</b></div><div class="notice info"><b>التقدم في الأدلة المحسوبة:</b> ${done}/${ids.length}. أفضل قراءة تحصل على الدرجة الكاملة، والقراءة البديلة القابلة للدفاع تحصل على درجة جزئية. عناصر التسوية المالية الموسومة «غير محسوب» لا تدخل هذه الدرجة.</div><div class="evidence-grid">${s.evidence.map(id=>{const e=evidenceFor(id,sc,s),sel=s.evidenceSort[id];if(e.scoreable===false)return `<div class="doc"><span class="pill">${dimensionLabel[e.dimension]||e.dimension} · غير محسوب</span><b>${e.title}</b><p class="small">${e.text}</p><div class="notice info small">هذه معلومة تفسيرية عن حركة الأموال، وليست سؤالًا عن سلطة العمل أو استقلال العامل.</div></div>`;return `<div class="doc"><span class="pill">${dimensionLabel[e.dimension]||e.dimension}</span><b>${e.title}</b><p class="small">${e.text}</p><div class="ev-actions" role="group" aria-label="تصنيف دليل ${e.title}"><button class="sort ${sel==='ctrl'?'sel':''}" aria-pressed="${sel==='ctrl'}" data-id="${id}" data-v="ctrl">دليل على سلطة أحد الأطراف</button><button class="sort ${sel==='ind'?'sel':''}" aria-pressed="${sel==='ind'}" data-id="${id}" data-v="ind">دليل على استقلال العامل</button><button class="sort ${sel==='dep'?'sel':''}" aria-pressed="${sel==='dep'}" data-id="${id}" data-v="dep">دليل مختلط / يحتاج سياقًا</button></div></div>`}).join('')}</div><div class="actions"><button class="btn" data-next="questions">انتقل إلى الأسئلة التشخيصية</button></div>`;
}
function questionView(s){
 const questions=questionsForState(s);
 return `<div class="task-now"><span>🎯 مهمتك الآن</span><b>اختبر الفروق المفاهيمية التي ستحتاجها قبل بناء الخريطة.</b></div><div class="notice info"><b>هذه الأسئلة تشخيصية وغير محسوبة في الدرجة.</b> وهي لا تعيد سؤال الخريطة محورًا بمحور؛ بل تختبر الفرق بين العبء والسلطة، وبين سلطة المشروع والحساب، وبين التسعير والتمويل، وبين الترتيب المرحلي والقرار النهائي.</div><p class="small muted">${s.contractDeclineEnding?'هذا المسار يختبر فقط معنى بوابة الدخول التعاقدية.':s.noWorkEnding?'لا تظهر أسئلة عن مراقبة أو مراجعة أو تسوية لم تحدث.':'التسوية المالية تُسأل كمفهوم مستقل حتى لا تختلط بدور إدارة العمل.'}</p><div class="qgrid">${questions.map(({id,title,options})=>`<div class="qcard"><label for="q-${id}"><b>${title}</b></label><span class="pill">تشخيصي · غير محسوب</span><select id="q-${id}" data-q="${id}"><option value="">اختر بناء على الوقائع</option>${options.map(option=>`<option ${s.answers[id]===option?'selected':''}>${option}</option>`).join('')}</select></div>`).join('')}</div><div class="actions"><button class="btn" id="toPower">ابن خريطة السلطة والعبء</button></div>`;
}
export function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey],step=s.investigationStep||'case';
 if(step==='questions'&&!evidenceComplete(s,sc)){patch({investigationStep:'evidence'});return render(root)}
 const panels={case:caseView(sc,s),evidence:evidenceView(sc,s),questions:questionView(s)};
 root.innerHTML=`<div class="panel">${tabs(step,s,sc)}${Object.entries(panels).map(([id,body])=>`<div id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}" tabindex="0" ${step===id?'':'hidden'}>${body}</div>`).join('')}</div>`;
 const activate=(id,focus=false)=>{if(id==='questions'&&!evidenceComplete(getState(),sc))return;patch({investigationStep:id});render(root);if(focus)root.querySelector(`#tab-${id}`)?.focus()};
 const tabButtons=[...root.querySelectorAll('[role="tab"]')];
 tabButtons.forEach(b=>{b.onclick=()=>{if(!b.disabled)activate(b.dataset.step,true)};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const enabled=tabButtons.filter(x=>!x.disabled),current=enabled.indexOf(b);let target=current;if(e.key==='Home')target=0;else if(e.key==='End')target=enabled.length-1;else target=(current+(e.key==='ArrowLeft'?-1:1)+enabled.length)%enabled.length;enabled[target]?.focus()}});
 root.querySelector('[data-next="evidence"]')?.addEventListener('click',()=>activate('evidence',true));
 root.querySelector('[data-next="questions"]')?.addEventListener('click',()=>{const st=getState(),missing=scoreableIds(st,sc).filter(id=>!st.evidenceSort[id]);if(missing.length){alert(`صنف جميع الأدلة المحسوبة قبل المتابعة. بقي ${missing.length} دليل.`);return}activate('questions',true)});
 root.querySelectorAll('.sort').forEach(b=>b.onclick=()=>{const id=b.dataset.id,v=b.dataset.v,st=getState();patch({evidenceSort:{...st.evidenceSort,[id]:v}});render(root);root.querySelector(`.sort[data-id="${id}"][data-v="${v}"]`)?.focus()});
 root.querySelectorAll('select[data-q]').forEach(sel=>sel.onchange=()=>{const st=getState();patch({answers:{...st.answers,[sel.dataset.q]:sel.value}})});
 document.getElementById('toPower')?.addEventListener('click',()=>{const st=getState(),questions=questionsForState(st);if(questions.some(({id})=>!st.answers[id])){alert(`أجب عن الأسئلة ${questions.length} قبل الانتقال.`);return}commit({changes:{stage:9,powerAxisIndex:0},checkpointLabel:'العودة إلى الأسئلة التشخيصية'});location.href=href('power')});
}
