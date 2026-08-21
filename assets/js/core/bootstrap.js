import {APP_VERSION} from './config.js';
import {pageFromPath,href,pageForStage,isPublicPage,pageTitle} from './routes.js';
import {getState,enterPage,stageForPage,persistenceStatus} from './state.js';
import {shell,bindShell} from './ui.js';
const page=document.body.dataset.page||pageFromPath();
document.title=`${pageTitle(page)} | No Boss v${APP_VERSION}`;
addEventListener('beforeunload',e=>{if(['failed','session'].includes(persistenceStatus().status)){e.preventDefault();e.returnValue=''}});
let state=getState();
const requestedStage=stageForPage(page),currentStage=Number(state.stage||0),currentRoute=pageForStage(currentStage);
if(!isPublicPage(page)&&!state.scenarioKey){location.replace(href('home'))}
else if(state.scenarioKey&&!isPublicPage(page)&&requestedStage!==currentStage){location.replace(href(currentRoute))}
else{
 if(!(state.scenarioKey&&isPublicPage(page)))enterPage(page,{record:true});
 state=getState();
 document.getElementById('app').innerHTML=shell(page);bindShell(page);
 try{const mod=await import(`../pages/${page}.js`);await mod.render(document.getElementById('pageRoot'))}catch(e){console.error(e);document.getElementById('pageRoot').innerHTML='<div class="panel"><h2>تعذر تحميل هذه المرحلة</h2><p class="muted">حدث خطأ تقني. استخدم زر «رجوع» داخل اللعبة أو ابدأ محاكاة جديدة.</p></div>'}
}
