import {pageFromPath,href} from './routes.js';
import {getState,enterPage,stageForPage} from './state.js';
import {shell,bindShell,pageTitle} from './ui.js';
const page=document.body.dataset.page||pageFromPath();
document.title=`${pageTitle(page)} | No Boss v3.0.2`;
let state=getState();
const publicEntryPages=new Set(['home','scenario']);
const stageRoute={0:'scenario',1:'onboarding',2:'work',3:'management',4:'risk',5:'dispute',6:'payment',7:'access',8:'investigation',9:'power',10:'conclusion',11:'result'};
const requestedStage=stageForPage(page),currentStage=Number(state.stage||0),currentRoute=stageRoute[currentStage]||'scenario';
if(!publicEntryPages.has(page)&&!state.scenarioKey){location.replace(href('home'))}
else if(state.scenarioKey&&!publicEntryPages.has(page)&&requestedStage!==currentStage){location.replace(href(currentRoute))}
else{
 if(!(state.scenarioKey&&publicEntryPages.has(page)))enterPage(page,{record:true});
 state=getState();
 document.getElementById('app').innerHTML=shell(page);bindShell(page);
 try{const mod=await import(`../pages/${page}.js`);await mod.render(document.getElementById('pageRoot'))}catch(e){console.error(e);document.getElementById('pageRoot').innerHTML='<div class="panel"><h2>تعذر تحميل هذه المرحلة</h2><p class="muted">حدث خطأ تقني. استخدم زر «رجوع» داخل اللعبة أو ابدأ محاكاة جديدة.</p></div>'}
}
