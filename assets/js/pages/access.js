import {scenarios} from '../data/scenarios.js';import {getState,patch,addEvidence,addLog,clamp} from '../core/state.js';import {href} from '../core/routes.js';

function disputePoints(s){return Number(s.disputeSeverity||0)}
function qualityPoints(s){return s.quality<72?3:s.quality<82?1:0}
function accessPointsValue(v){return v<42?3:v<58?1:0}
function rejectionPoints(s){return s.rejections>=2?1:0}
function disputeLabel(v){return v>=2?'اختلاف جوهري في مراجعة الجودة':v===1?'اختلاف محدود في مراجعة الجودة':'لا اختلاف مؤثر في مراجعة الجودة'}

function penaltyAfterDispute(s){let p=s.disputeSeverity===1?4:s.disputeSeverity>=2?9:0;if(s.appealed&&p>0)p=Math.ceil(p*.6);return p}
function accessBeforeDecision(s){
 const logs=[...(s.log||[])].reverse();
 const row=logs.find(x=>x.title==='أعيد حساب الوصول إلى المهام'||x.title==='أعيد ترتيب الوصول');
 if(row){
  const m=String(row.text||'').match(/(?:إلى|الوصول)\s*(\d+)\/100/);
  if(m){let v=Number(m[1]);if(s.rushAccepted===true)v+=5;else if(s.rushAccepted===false)v-=2;v-=penaltyAfterDispute(s);return clamp(v,0,100)}
 }
 return s.access;
}

function assess(sc,s,accessBefore=s.access){
 const factors=[
  {title:'مراجعة الجودة',value:disputeLabel(s.disputeSeverity),points:disputePoints(s),why:s.disputeSeverity?'ظهر اختلاف في مراجعة العمل، فدخل في حساب القرار.':'لم تضف مراجعة الجودة نقاط خطر.'},
  {title:'جودة الحساب',value:`${s.quality}%`,points:qualityPoints(s),why:s.quality<72?'الجودة أقل من 72%، لذلك كان أثرها كبيرًا.':s.quality<82?'الجودة أقل من 82%، لذلك أضافت نقطة خطر.':'الجودة لم تضف نقاط خطر.'},
  {title:'الوصول قبل القرار',value:`${accessBefore}/100`,points:accessPointsValue(accessBefore),why:accessBefore<42?'مؤشر الوصول كان منخفضًا جدًا.':accessBefore<58?'مؤشر الوصول كان منخفضًا ودخل في القرار.':'مؤشر الوصول لم يضف نقاط خطر.'},
  {title:'رفض عروض العمل',value:`${s.rejections} مرة`,points:rejectionPoints(s),why:s.rejections>=2?'رفض عرضين أو أكثر أضاف نقطة خطر في هذه المحاكاة.':'سجل الرفض لم يضف نقاط خطر.'}
 ];
 const points=factors.reduce((n,x)=>n+x.points,0),suspendAt=5+sc.outcomeStrictness,projectAt=3+Math.floor(sc.outcomeStrictness/2);
 const outcome=points>=suspendAt?'suspended':points>=projectAt?'project':'warning';
 return {scenarioKey:s.scenarioKey,points,suspendAt,projectAt,outcome,accessBefore,quality:s.quality,rejections:s.rejections,disputeSeverity:s.disputeSeverity,factors};
}

function factorCards(d){return d.factors.map(f=>`<div class="card"><small class="muted">${f.title}</small><h3>${f.value}</h3><p class="small">${f.why}</p><span class="pill">${f.points?`+${f.points} نقطة خطر`:'0 نقاط خطر'}</span></div>`).join('')}

export async function render(root){
 const s=getState(),sc=scenarios[s.scenarioKey];
 let decision=s.accessDecision;
 if(!decision||decision.scenarioKey!==s.scenarioKey){decision=assess(sc,s,s.accountOutcome?accessBeforeDecision(s):s.access);patch({accessDecision:decision})}
 const o=s.accountOutcome||decision.outcome;
 if(!s.accountOutcome){
  if(o==='suspended'){patch({accountOutcome:o,status:'معلّق',access:0});addEvidence('suspension');addLog('علقت المنصة الوصول',`بلغت مؤشرات الخطر ${decision.points} نقاط، فتجاوزت حد تعليق الحساب (${decision.suspendAt}).`)}
  else if(o==='project'){patch({accountOutcome:o,status:'مقيد',access:clamp(s.access,20,48)});addLog('قُيّد الوصول إلى المشروع',`بلغت مؤشرات الخطر ${decision.points} نقاط، فتجاوزت حد الاستمرار في المشروع (${decision.projectAt}).`)}
  else{patch({accountOutcome:o,status:'نشط بتحذير',access:clamp(s.access,45,70)});addLog('صدر تحذير أداء',`بلغت مؤشرات الخطر ${decision.points} نقاط، وهي أقل من حد الاستبعاد من المشروع (${decision.projectAt}).`)}
 }
 const n=getState();
 const headline=o==='suspended'?'تم تعليق الوصول إلى سوق المهام':o==='project'?'تم تقييد وصولك إلى المشروع الحالي':'الحساب ما زال نشطًا';
 const icon=o==='suspended'?'⛔':o==='project'?'⚠':'✓';
 const explanation=o==='suspended'
  ?`مجموع مؤشرات حسابك بلغ <b>${decision.points} نقاط خطر</b>، بينما حد تعليق الحساب في هذه الحالة هو <b>${decision.suspendAt}</b>. لذلك علّقت TaskBridge الوصول إلى سوق المهام كله.`
  :o==='project'
   ?`مجموع مؤشرات حسابك بلغ <b>${decision.points} نقاط خطر</b>، بينما حد الاستمرار في المشروع الحالي هو أقل من <b>${decision.projectAt}</b> نقاط. لذلك قيّدت TaskBridge وصولك إلى <b>هذا المشروع فقط</b>. لم يُغلق حسابك العام.`
   :`مجموع مؤشرات حسابك بلغ <b>${decision.points} نقاط خطر</b>، وهو أقل من حد الاستبعاد من المشروع (<b>${decision.projectAt}</b>). لذلك بقي الحساب نشطًا مع تحذير.`;

 root.innerHTML=`<div class="panel">
  <div class="instruction"><span class="n">12</span><div class="instruction-copy"><div class="instruction-title"><b>TaskBridge تعيد تقييم وصولك بعد نهاية الوردية</b></div><div class="instruction-subtitle"><small>القرار لا يظهر عشوائيًا: تجمع المنصة في هذه المحاكاة نتيجة مراجعة الجودة، وجودة الحساب، ومؤشر الوصول، وسجل الرفض.</small></div></div></div>

  <div class="card" style="text-align:center"><div style="font-size:56px">${icon}</div><h2>${headline}</h2><p>${explanation}</p></div>

  <h3>لماذا وصلت إلى هذه النتيجة؟</h3>
  <div class="grid-4">${factorCards(decision)}</div>
  <div class="notice info"><b>كيف يُتخذ القرار؟</b><div style="margin-top:5px">مجموع نقاط الخطر في جولتك: <b>${decision.points}</b>. حد الاستبعاد من المشروع: <b>${decision.projectAt}</b>. حد تعليق الحساب العام: <b>${decision.suspendAt}</b>. كلما ارتفع المجموع زادت شدة تقييد الوصول.</div></div>

  ${o==='project'?`<div class="notice"><b>مهم: من اتخذ قرار الاستبعاد هنا؟</b><div style="margin-top:5px">في هذه الجولة لم تسجل اللعبة طلبًا منفصلًا من العميل لاستبعادك. النتيجة جاءت من <b>آلية الوصول التي تديرها TaskBridge</b> بعد تجميع مؤشرات حسابك. العميل يملك معايير مشروعه ويمكنه في حالات أخرى طلب استبعاد عامل من مشروع بعينه، لكنه لا يغلق الحساب العام.</div></div>`:''}

  <h3>من يملك أي سلطة؟</h3>
  <div class="grid-3" style="margin-top:12px"><div class="card"><h3>العميل</h3><p class="small">يحدد متطلبات مشروعه ومعيار الجودة، ويمكن أن يؤثر في الأهلية داخل مشروعه، لكنه لا يدير حسابك العام.</p></div><div class="card"><h3>DataConnect</h3><p class="small">وسيط دفع وتحقق؛ لا يملك صلاحية تغيير حالة الحساب أو إتاحة المهام.</p></div><div class="card"><h3>TaskBridge</h3><p class="small">تدير الحساب العام ومؤشر الوصول وتقرر ما إذا كانت المهام أو المشروعات ستظل متاحة لك داخل المنصة.</p></div></div>

  <div class="actions"><button class="btn" id="next">انتقل من العامل إلى الباحث</button></div>
 </div>`;
 document.getElementById('next').onclick=()=>{patch({status:'انتهت الوردية',investigationStep:'case'});location.href=href('investigation')}
}
