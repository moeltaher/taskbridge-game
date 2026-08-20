import {pageFromPath,href} from './routes.js';
import {getState,enterPage,reset,patch} from './state.js';
import {shell,bindShell} from './ui.js';

const page=document.body.dataset.page||pageFromPath();
const params=new URLSearchParams(location.search);
let state=getState();

// Developer shortcut: /payment/?debug=1 etc. Seeds a safe scenario so a route can be inspected directly.
if(params.get('debug')==='1'&&!state.scenarioKey){
  reset();
  patch({scenarioKey:'data',status:'وضع تطوير',currentPage:page,realStartedAt:Date.now()});
  state=getState();
}
if(page!=='home'&&!state.scenarioKey){location.replace(href('home'));}

document.getElementById('app').innerHTML=shell(page);
bindShell(page);
if(page!=='home'||!state.scenarioKey)enterPage(page,{record:true});

try{
  const mod=await import(`../pages/${page}.js`);
  await mod.render(document.getElementById('pageRoot'));
}catch(e){
  console.error(e);
  document.getElementById('pageRoot').innerHTML='<div class="panel"><h2>تعذر تحميل هذه المرحلة</h2><p class="muted">حدث خطأ تقني. ارجع إلى الصفحة الرئيسية أو أعد المحاولة.</p></div>';
}
