import {scenarios} from '../data/scenarios.js';
import {getState,patch} from '../core/state.js';
import {href} from '../core/routes.js';
import {escapeHTML} from '../core/html.js';
import {evidenceFor} from '../domain/evidence.js';
import {powerMapComplete,scoreAnalysis} from '../domain/analysis.js';

export function render(root){
 const state=getState(),scenario=scenarios[state.scenarioKey];
 root.innerHTML=`<div class="panel"><div class="instruction"><span class="n">17</span><div><b>اكتب استنتاجك</b><small>فسر أين تتركز السلطة وما الذي بقي للعامل أو العميل من استقلال.</small></div></div><div class="notice info"><b>كيف تستخدم الدرجة؟</b><div style="margin-top:5px">نصك سيظهر لك للمراجعة لكنه لا يخضع لتقييم لغوي آلي. الدرجة الحالية موزعة على: <b>30 نقطة لأسئلة العلاقة، 30 لتصنيف الأدلة، و40 لخريطة السلطة</b>. خريطة السلطة تقيم <b>الطرف أو الأطراف الأعلى والترتيب النسبي مع احتساب التعادلات صراحة</b>، لا مدى قربك من رقم مرجعي دقيق.</div></div><div class="notice"><b>حدود نزاهة التقييم:</b><div style="margin-top:5px">No Boss تعمل بالكامل داخل المتصفح كأداة تدريبية، وليست اختبارًا مراقبًا أو نظام تقييم آمنًا. لذلك ينبغي استخدام الدرجة للتغذية الراجعة والنقاش، لا كدرجة اعتماد رسمية.</div></div><label for="analysis"><b>استنتاجك التحليلي</b></label><textarea id="analysis" class="analysis-input" rows="6" placeholder="اذكر أين تتركز السلطة وما الأدلة التي تدعم ذلك...">${escapeHTML(state.analysisText)}</textarea><h3>أدلة تريد إرفاقها باستنتاجك — اختياري</h3><p class="small muted">يمكنك اختيار ما تشاء لتوثيق تحليلك. لا يمنح عدد المربعات نقاطًا ولا يمنعك من إظهار النتيجة.</p><div class="evidence-grid">${state.evidence.map(id=>{const evidence=evidenceFor(id,scenario,state);return `<label class="doc"><input type="checkbox" value="${escapeHTML(id)}" ${state.conclusionEvidence.includes(id)?'checked':''}> <b>${escapeHTML(evidence.title)}</b><p class="small">${escapeHTML(evidence.text)}</p></label>`}).join('')}</div><div class="actions"><button class="btn" id="finish">إظهار النتيجة</button></div></div>`;
 document.getElementById('analysis').oninput=event=>patch({analysisText:event.target.value});
 root.querySelectorAll('input[type=checkbox]').forEach(checkbox=>checkbox.onchange=()=>patch({conclusionEvidence:[...root.querySelectorAll('input[type=checkbox]:checked')].map(input=>input.value)}));
 document.getElementById('finish').onclick=()=>{
  const current=getState(),text=current.analysisText.trim();
  if(!powerMapComplete(current)){alert('ارجع إلى خريطة السلطة وعدّل واعتمد المحاور الستة بعد آخر تغيير قبل إظهار النتيجة.');return}
  if(text.length<25){alert('اكتب استنتاجًا مختصرًا من 25 حرفًا على الأقل قبل إظهار النتيجة.');return}
  const missing=current.evidence.filter(id=>!current.evidenceSort[id]);
  if(missing.length){alert('ارجع إلى تصنيف الأدلة وصنف جميع الأدلة قبل إظهار النتيجة.');return}
  patch({resultData:scoreAnalysis(scenario,current),realFinishedAt:Date.now(),stage:11});
  location.href=href('result');
 };
}
