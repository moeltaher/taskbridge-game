import {test,expect} from '@playwright/test';

async function startDataScenario(page){
  await page.goto('/');
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await expect(page).toHaveURL(/\/scenario\/$/);
  const samer=page.locator('article.scenario').filter({hasText:'سامر'});
  await samer.getByRole('button',{name:'اختيار هذه الحالة'}).click();
  await expect(page).toHaveURL(/\/onboarding\/$/);
}

test('landing page starts a new simulation',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle(/قبل الوردية \| No Boss v3\.0\.2/);
  await expect(page.getByRole('heading',{name:'No Boss'})).toBeVisible();
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await expect(page).toHaveURL(/\/scenario\/$/);
  await expect(page.getByText('اختر حالة العمل')).toBeVisible();
});

test('scenario selection persists and onboarding reaches work',async({page})=>{
  await startDataScenario(page);
  await expect(page.getByText('سامر · عامل تصنيف بيانات')).toBeVisible();
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.getByText('ملخص وضعك حتى الآن')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('no_boss_v3_state')));
  expect(saved.scenarioKey).toBe('data');
  expect(saved.stage).toBe(2);
  expect(saved.evidence).toEqual(expect.arrayContaining(['contract','ownTools','multiPlatform']));
});

test('data task has an equivalent nonvisual annotation path',async({page})=>{
  await startDataScenario(page);
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.getByRole('button',{name:'قبول',exact:true}).first().click();
  await expect(page.getByText('طريقتان متكافئتان لتنفيذ تعليم الصور')).toBeVisible();
  const groups=page.locator('fieldset.semantic-region');
  await expect(groups).toHaveCount(3);
  await expect(groups.nth(0).getByText('مشهد طريق أفقي بمركبة رئيسية واضحة')).toBeVisible();
  await groups.nth(0).getByLabel('بين اليسار والمنتصف').check();
  await groups.nth(1).getByLabel('بين المنتصف واليمين').check();
  await groups.nth(2).getByLabel('حول منتصف الطريق').check();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('no_boss_v3_state')));
  expect(saved.workAnswers).toHaveLength(3);
  expect(saved.workAnswers.every(answer=>answer?.source==='semantic')).toBe(true);
  await page.getByRole('button',{name:'إرسال العمل للمراجعة'}).click();
  await expect(page.getByText('نتيجة المهمة الأولى')).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
});

test('back from onboarding restores scenario selection',async({page})=>{
  await startDataScenario(page);
  await page.getByRole('button',{name:'رجوع'}).click();
  await expect(page).toHaveURL(/\/scenario\/$/);
  await expect(page.getByText('أي وردية تريد أن تعيشها؟')).toBeVisible();
});

test('home resume returns to current active stage',async({page})=>{
  await startDataScenario(page);
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'العودة إلى الصفحة الرئيسية'}).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button',{name:'متابعة الجلسة'})).toBeVisible();
  await page.getByRole('button',{name:'متابعة الجلسة'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
});

test('reload preserves current work route',async({page})=>{
  await startDataScenario(page);
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await page.reload();
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.getByText('ملخص وضعك حتى الآن')).toBeVisible();
});

test('direct protected route without state returns home',async({page})=>{
  await page.goto('/payment/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading',{name:'No Boss'})).toBeVisible();
});

test('mobile shell keeps primary controls accessible',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile-chromium','mobile-only assertion');
  await startDataScenario(page);
  await expect(page.getByRole('button',{name:'رجوع'})).toBeVisible();
  await expect(page.getByRole('button',{name:'بدء من جديد'})).toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow-x','scroll');
});
