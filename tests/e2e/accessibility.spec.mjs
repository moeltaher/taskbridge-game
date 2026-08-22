import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function assertAccessible(page,label){
  const results=await new AxeBuilder({page})
    .withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa'])
    .analyze();
  expect(results.violations,`${label}: ${results.violations.map(v=>`${v.id}(${v.nodes.length})`).join(', ')}`).toEqual([]);
}
async function chooseFirstAnswers(page){const samples=page.locator('.sample');for(let i=0;i<await samples.count();i++)await samples.nth(i).locator('button.choice').first().click()}
async function classifyEvidence(page){const docs=page.locator('.doc').filter({has:page.locator('.sort')});for(let i=0;i<await docs.count();i++)await docs.nth(i).locator('.sort').first().click()}
async function answerQuestions(page){const selects=page.locator('select[data-q]');for(let i=0;i<await selects.count();i++)await selects.nth(i).selectOption({index:1})}
async function completePower(page){for(;;){const slider=page.locator('fieldset.power-card input[type="range"]').first();await slider.evaluate(el=>{el.value='40';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});const next=page.getByRole('button',{name:'المحور التالي'});if(await next.count())await next.click();else break}}

test('landing and scenario selection have no WCAG A/AA axe violations',async({page})=>{
  await page.goto('/');
  await assertAccessible(page,'home');
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await assertAccessible(page,'scenario');
});

test('data work market and accessible semantic task have no WCAG A/AA axe violations',async({page},testInfo)=>{
  await page.goto('/');
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await page.locator('article.scenario').filter({hasText:'سامر'}).getByRole('button',{name:'اختيار هذه الحالة'}).click();
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await assertAccessible(page,'work market');
  await page.getByRole('button',{name:'قبول',exact:true}).first().click();
  await assertAccessible(page,'data task');
  const semanticRegion=page.locator('[data-semantic-region="0"]');
  await expect(semanticRegion).toBeVisible();
  await expect(semanticRegion).toBeEnabled();
  if(!testInfo.project.name.startsWith('mobile-')){
    await semanticRegion.focus();
    await expect(semanticRegion).toBeFocused();
  }
});

test('all worker and researcher routes remain WCAG A/AA clean',async({page})=>{
  await page.goto('/');
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await page.locator('article.scenario').filter({hasText:'ليان'}).getByRole('button',{name:'اختيار هذه الحالة'}).click();
  await expect(page).toHaveURL(/\/onboarding\/$/);
  await assertAccessible(page,'onboarding');
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expect(page).toHaveURL(/\/work\/$/);
  await assertAccessible(page,'work market');
  await page.getByRole('button',{name:'قبول',exact:true}).first().click();
  await assertAccessible(page,'work task');
  await chooseFirstAnswers(page);
  await page.getByRole('button',{name:'إرسال العمل للمراجعة'}).click();
  await assertAccessible(page,'work result');
  await page.getByRole('button',{name:'رؤية أثر الأداء على فرص العمل'}).click();
  await expect(page).toHaveURL(/\/management\/$/);
  await assertAccessible(page,'management ranking');
  await page.getByRole('button',{name:'رؤية العرض الناتج عن هذا التحديث'}).click();
  await assertAccessible(page,'management offer');
  await page.getByRole('button',{name:'أرفض هذا العرض'}).click();
  await assertAccessible(page,'management offer result');
  await page.getByRole('button',{name:'متابعة الوردية'}).click();
  await assertAccessible(page,'management monitoring');
  await page.getByRole('button',{name:/استراحة 3 د/}).click();
  await assertAccessible(page,'management monitoring result');
  await page.getByRole('button',{name:'متابعة إلى مراجعة جودة العمل'}).click();
  await expect(page).toHaveURL(/\/risk\/$/);
  await assertAccessible(page,'risk');
  await page.getByRole('button',{name:'متابعة إلى مراجعة جودة العمل'}).click();
  await expect(page).toHaveURL(/\/dispute\/$/);
  await assertAccessible(page,'dispute');
  const skip=page.getByRole('button',{name:/متابعة إلى التسوية|المتابعة دون اعتراض/});
  await skip.first().click();
  await expect(page).toHaveURL(/\/payment\/$/);
  await assertAccessible(page,'payment');
  await page.getByRole('button',{name:'إنهاء التسوية ومراجعة الوصول'}).click();
  await expect(page).toHaveURL(/\/access\/$/);
  await assertAccessible(page,'access');
  await page.getByRole('button',{name:'ابدأ تحليل الوردية'}).click();
  await expect(page).toHaveURL(/\/investigation\/$/);
  await assertAccessible(page,'investigation case');
  await page.getByRole('button',{name:'ابدأ تصنيف الأدلة'}).click();
  await assertAccessible(page,'investigation evidence');
  await classifyEvidence(page);
  await page.getByRole('button',{name:'انتقل إلى أسئلة العلاقة'}).click();
  await assertAccessible(page,'investigation questions');
  await answerQuestions(page);
  await page.getByRole('button',{name:/ابن خريطة/}).click();
  await expect(page).toHaveURL(/\/power\/$/);
  await assertAccessible(page,'power');
  await completePower(page);
  await page.getByRole('button',{name:'اكتب استنتاجك'}).click();
  await expect(page).toHaveURL(/\/conclusion\/$/);
  await assertAccessible(page,'conclusion');
  await page.locator('#analysis').fill('توضح الوقائع أن السلطة موزعة بصورة غير متساوية، بينما يتحمل العامل أعباء لا تعني امتلاكه سلطة أكبر.');
  const roles=page.locator('select[data-evidence-role]');
  await roles.nth(0).selectOption('support');
  await roles.nth(1).selectOption('support');
  if(await roles.count()>=3)await roles.nth(2).selectOption('counter');
  await page.getByRole('button',{name:'إظهار النتيجة'}).click();
  await expect(page).toHaveURL(/\/result\/$/);
  await assertAccessible(page,'result');
  await page.getByRole('button',{name:'اربط التجربة بالحقوق'}).click();
  await expect(page).toHaveURL(/\/rights\/$/);
  await assertAccessible(page,'rights');
});
