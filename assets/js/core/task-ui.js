import {samples} from '../data/samples.js';
import {taskGuideFor} from '../data/task-guides.js';
import {getState,patch,clamp} from './state.js';
import {dataRegionOptions,dataSizeOptions,dataSceneDescriptions,semanticDataAnswer,roadSceneSVG} from '../domain/work.js';
function answerButton(i,value,content,answers,prefix){const selected=answers[i]===value;return `<button class="choice task-answer ${selected?'selected':''}" aria-pressed="${selected}" data-task-prefix="${prefix}" data-i="${i}" data-v="${value}">${content}</button>`}
function semanticControls(i,sceneIndex,answer,prefix){
 const region=answer?.source==='semantic'?answer.regionId:'',size=answer?.source==='semantic'?answer.sizeId:'';
 return `<fieldset class="semantic-region"><legend>طريقة بديلة غير بصرية — استخدمها بدل الرسم</legend><p class="small">${dataSceneDescriptions[sceneIndex]}</p><p class="small muted">حدد موضع المركبة وعرضها التقريبي. اختيار القيم هنا يستبدل أي صندوق رسمته لهذه العينة؛ لا يلزم تنفيذ الطريقتين.</p><div class="semantic-options"><label><span>الموضع الأفقي</span><select data-semantic-region="${prefix}-${i}"><option value="">اختر الموضع</option>${dataRegionOptions.map(o=>`<option value="${o.id}" ${region===o.id?'selected':''}>${o.label}</option>`).join('')}</select></label><label><span>العرض التقريبي</span><select data-semantic-size="${prefix}-${i}"><option value="">اختر الحجم</option>${dataSizeOptions.map(o=>`<option value="${o.id}" ${size===o.id?'selected':''}>${o.label}</option>`).join('')}</select></label></div></fieldset>`;
}
export function taskGuideHTML(sc,second=false){
 const guide=taskGuideFor(sc.type),title=sc.styleGuide?.length?(second?'دليل أسلوب العميل ما زال ساريًا:':'دليل أسلوب العميل قبل التنفيذ:'):'';
 return `<div class="notice info"><b>${guide.title}</b><p class="small">${guide.intro}</p>${guide.rules.length?`<ul>${guide.rules.map(rule=>`<li>${rule}</li>`).join('')}</ul>`:''}</div>${title?`<div class="notice info"><b>${title}</b><ul>${sc.styleGuide.map(rule=>`<li>${rule}</li>`).join('')}</ul></div>`:''}${sc.type==='moderation'?'<div class="notice"><b>تنبيه محتوى:</b> قد تتضمن العينات تهديدًا أو إساءة لفظية.</div>':''}`;
}
export function taskSamplesHTML(sc,indexes,answers,{prefix='task'}={}){
 if(sc.type==='data')return indexes.map((sceneIndex,i)=>`<div class="sample"><h3>المشهد ${i+1}</h3><p class="small"><b>طريقة الرسم:</b> اسحب من إحدى زوايا المركبة إلى الزاوية المقابلة لتكوين صندوق واحد.</p><div class="annotation-wrap" data-draw="${prefix}-${i}" aria-hidden="true">${roadSceneSVG(sceneIndex)}<div class="drawbox" style="display:none"></div></div><p class="small muted"><b>قاعدة الترميز:</b> اجعل الإطار ملاصقًا قدر الإمكان للحدود الخارجية المرئية للمركبة بما فيها العجلات، ولا تضم الطريق أو الظل.</p>${semanticControls(i,sceneIndex,answers[i],prefix)}</div>`).join('');
 return indexes.map((sampleIndex,i)=>{
  const sample=samples[sc.type][sampleIndex];
  if(sc.type==='moderation')return `<div class="sample"><div class="card">${sample.text}</div><div class="choices">${['مسموح','مضايقة/إساءة','تهديد','غير واضح'].map(v=>answerButton(i,v,v,answers,prefix)).join('')}</div></div>`;
  return `<div class="sample"><h3>${sc.type==='ai'?sample.q:sample.src}</h3><div class="choices">${answerButton(i,'A',sc.type==='ai'?`<b>A</b><br>${sample.a}`:sample.a,answers,prefix)}${answerButton(i,'B',sc.type==='ai'?`<b>B</b><br>${sample.b}`:sample.b,answers,prefix)}</div></div>`;
 }).join('');
}
function drawStyle(box,answer,element){
 if(!answer||typeof answer.x!=='number')return;
 const rect=element.getBoundingClientRect();
 Object.assign(box.style,{display:'block',left:(answer.x*rect.width)+'px',top:(answer.y*rect.height)+'px',width:(answer.w*rect.width)+'px',height:(answer.h*rect.height)+'px'});
}
function refocusSemantic(root,prefix,i,kind){
 queueMicrotask(()=>{
  const next=root.querySelector(`[data-semantic-region="${prefix}-${i+1}"]`);
  const current=root.querySelector(`[data-semantic-${kind}="${prefix}-${i}"]`);
  (next||current)?.focus();
 });
}
export function bindTaskInputs(root,sc,{answerField,indexField='currentTaskSampleIndexes',prefix='task',rerender}={}){
 root.querySelectorAll(`.task-answer[data-task-prefix="${prefix}"]`).forEach(button=>button.onclick=()=>{
  const i=Number(button.dataset.i),value=button.dataset.v,answers=[...(getState()[answerField]||[])];
  answers[i]=value;patch({[answerField]:answers});rerender();
  queueMicrotask(()=>{const next=root.querySelector(`.task-answer[data-task-prefix="${prefix}"][data-i="${i+1}"]`),current=root.querySelector(`.task-answer[data-task-prefix="${prefix}"][data-i="${i}"][data-v="${value}"]`);(next||current)?.focus()});
 });
 if(sc.type!=='data')return;
 root.querySelectorAll(`[data-draw^="${prefix}-"]`).forEach((el,i)=>{
  let start=null;const box=el.querySelector('.drawbox'),saved=getState()[answerField]?.[i];
  if(saved?.source==='visual')drawStyle(box,saved,el);
  const pos=e=>{const r=el.getBoundingClientRect();return{x:clamp(e.clientX-r.left,0,r.width),y:clamp(e.clientY-r.top,0,r.height),rw:r.width,rh:r.height}};
  el.onpointerdown=e=>{start=pos(e);el.setPointerCapture(e.pointerId);box.style.display='block'};
  el.onpointermove=e=>{if(!start)return;const p=pos(e),x=Math.min(start.x,p.x),y=Math.min(start.y,p.y),w=Math.abs(p.x-start.x),h=Math.abs(p.y-start.y);Object.assign(box.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'})};
  el.onpointerup=e=>{if(!start)return;const p=pos(e),w=Math.abs(p.x-start.x)/p.rw,h=Math.abs(p.y-start.y)/p.rh,x=Math.min(start.x,p.x)/p.rw,y=Math.min(start.y,p.y)/p.rh,answers=[...(getState()[answerField]||[])];answers[i]=w*h>=.004?{x,y,w,h,source:'visual'}:null;patch({[answerField]:answers});start=null;if(w*h<.004){box.style.display='none';alert('الإطار صغير جدًا.')}else rerender()};
 });
 const update=(i,kind)=>{
  const region=root.querySelector(`[data-semantic-region="${prefix}-${i}"]`)?.value,size=root.querySelector(`[data-semantic-size="${prefix}-${i}"]`)?.value;
  if(!region||!size)return;
  const st=getState(),scene=st[indexField][i],answers=[...(st[answerField]||[])];
  answers[i]=semanticDataAnswer(scene,region,size);patch({[answerField]:answers});rerender();refocusSemantic(root,prefix,i,kind);
 };
 root.querySelectorAll(`[data-semantic-region^="${prefix}-"]`).forEach(select=>select.onchange=()=>update(Number(select.dataset.semanticRegion.split('-').at(-1)),'region'));
 root.querySelectorAll(`[data-semantic-size^="${prefix}-"]`).forEach(select=>select.onchange=()=>update(Number(select.dataset.semanticSize.split('-').at(-1)),'size'));
}
