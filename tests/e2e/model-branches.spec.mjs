import {test,expect} from '@playwright/test';

async function route(page,name){await expect(page).toHaveURL(new RegExp(`/${name}/$`))}
async function enterWork(page,name='سامر'){
 await page.goto('/');
 await page.getByRole('button',{name:/ابدأ المحاكاة|بدء جولة جديدة/}).click();
 await page.locator('article.scenario').filter({hasText:name}).getByRole('button',{name:'اختيار هذه الحالة'}).click();
 await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
 await route(page,'work');
}
async function forceRanking(page,score){
 await page.evaluate(score=>{
  const state=JSON.parse(localStorage.getItem('no_boss_state'));
  state.stage=3;
  state.currentPage='management';
  state.managementStep='ranking';
  state.workScore=score;
  state.completedTasks=[{id:'task-1',score,pay:2.1,duration:12,stressDelta:10,qualityBefore:91,qualityAfter:91,sampleIndexes:[0],answers:[null],technicalIssueSampleIndexes:[]}];
  state.rankingBeforeAccess=null;
  state.opportunityRankingDecision=null;
  state.secondOffer=null;
  state.storageRevision=Number(state.storageRevision||0)+1;
  const raw=JSON.stringify(state);
  localStorage.setItem('no_boss_state',raw);
  sessionStorage.setItem('no_boss_state',raw);
 },score);
 await page.goto('/management/');
 await route(page,'management');
}

test('standard second offer is described as newly generated',async({page})=>{
 await enterWork(page,'سامر');
 await forceRanking(page,0);
 await page.getByRole('button',{name:'رؤية العرض الناتج عن هذا التحديث'}).click();
 await expect(page.getByText(/عرض عادي جديد نتج عن الترتيب/)).toBeVisible();
 await expect(page.getByText(/لم تعرض معاينة السوق الأولى هذه المواصفات بالتحديد/)).toBeVisible();
});

test('premium second offer is identified as the previewed opportunity',async({page})=>{
 await enterWork(page,'سامر');
 await forceRanking(page,100);
 await page.getByRole('button',{name:'رؤية العرض الناتج عن هذا التحديث'}).click();
 await expect(page.getByText(/هذا هو العرض المميز الذي عاينت مواصفاته في سوق المهام/)).toBeVisible();
});

test('market-time assumption is disclosed and progresses 4 then 2 minutes',async({page})=>{
 await enterWork(page,'سامر');
 await expect(page.getByText(/أول قرار تتخذه في السوق يضيف 4 دقائق/)).toBeVisible();
 await page.getByRole('button',{name:'رفض هذا العرض'}).first().click();
 let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('no_boss_state')));
 expect(state.marketTime).toBe(4);
 await page.getByRole('button',{name:'رفض هذا العرض'}).first().click();
 state=await page.evaluate(()=>JSON.parse(localStorage.getItem('no_boss_state')));
 expect(state.marketTime).toBe(6);
});
