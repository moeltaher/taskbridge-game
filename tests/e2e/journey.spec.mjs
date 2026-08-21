import {test,expect} from '@playwright/test';

async function expectRoute(page,route){
  await expect(page).toHaveURL(new RegExp(`/${route}/$`));
}

async function startModerationScenario(page){
  await page.goto('/');
  await page.getByRole('button',{name:'ابدأ المحاكاة'}).click();
  await expectRoute(page,'scenario');
  const layan=page.locator('article.scenario').filter({hasText:'ليان'});
  await expect(layan).toBeVisible();
  await layan.getByRole('button',{name:'اختيار هذه الحالة'}).click();
  await expectRoute(page,'onboarding');
  await page.getByRole('button',{name:'أوافق وأدخل No Boss'}).click();
  await expectRoute(page,'work');
}

test('complete worker-to-researcher journey reaches result and rights',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium','the complete journey runs once on desktop Chromium; mobile behavior is covered by smoke tests');
  test.slow();

  await startModerationScenario(page);

  await expect(page.getByText('اختر أول مهمة')).toBeVisible();
  await page.getByRole('button',{name:'قبول',exact:true}).first().click();
  await expect(page.getByText('نفذ المهمة')).toBeVisible();

  const samples=page.locator('.sample');
  await expect(samples).toHaveCount(3);
  for(let i=0;i<3;i++){
    await samples.nth(i).getByRole('button',{name:'مسموح',exact:true}).click();
  }
  await page.getByRole('button',{name:'إرسال العمل للمراجعة'}).click();
  await expect(page.getByText('نتيجة المهمة الأولى')).toBeVisible();
  await page.getByRole('button',{name:'متابعة إلى الإدارة الخوارزمية'}).click();
  await expectRoute(page,'management');

  await expect(page.getByText('تم تحديث ترتيب حسابك')).toBeVisible();
  await page.getByRole('button',{name:'عرض مهمة ثانية'}).click();
  await page.getByRole('button',{name:'أرفض وأستمر'}).click();
  await expect(page.getByText('رفضت المهمة الثانية')).toBeVisible();
  await page.getByRole('button',{name:'متابعة الوردية'}).click();
  await expect(page.getByText('No Boss تتابع بعض مؤشرات العمل')).toBeVisible();
  await page.getByRole('button',{name:'استراحة دقيقة · عبء -10'}).click();
  await expect(page.getByText('أخذت استراحة قبل متابعة الوردية')).toBeVisible();
  await page.getByRole('button',{name:'متابعة الوردية'}).click();
  await expectRoute(page,'risk');

  await expect(page.getByText('ظهر موقف جديد بعد العمل المنجز')).toBeVisible();
  await page.getByRole('button',{name:'متابعة إلى مراجعة جودة العمل'}).click();
  await expectRoute(page,'dispute');

  const appeal=page.getByRole('button',{name:'طلب مراجعة بهذه التكلفة'});
  if(await appeal.isVisible()){
    await appeal.click();
    await expect(page.getByText('طلب المراجعة مسجل')).toBeVisible();
    await page.getByRole('button',{name:'إغلاق المراجعة ومتابعة التسوية'}).click();
  }else{
    await page.getByRole('button',{name:'متابعة إلى التسوية'}).click();
  }
  await expectRoute(page,'payment');

  await expect(page.getByText('كيف تحولت قيمة المشروع إلى ما بقي لك؟')).toBeVisible();
  await page.getByRole('button',{name:'إنهاء التسوية ومراجعة الوصول'}).click();
  await expectRoute(page,'access');

  await expect(page.getByText('No Boss تراجع الوصول بعد التسوية')).toBeVisible();
  await page.getByRole('button',{name:'انتقل من العامل إلى الباحث'}).click();
  await expectRoute(page,'investigation');

  await expect(page.getByText('أنت الآن الباحث')).toBeVisible();
  await page.getByRole('button',{name:'صنف الأدلة'}).click();
  await expect(page.getByText('صنف جميع الأدلة')).toBeVisible();

  const evidenceCards=page.locator('.evidence-grid .doc');
  const evidenceCount=await evidenceCards.count();
  expect(evidenceCount).toBeGreaterThan(0);
  for(let i=0;i<evidenceCount;i++){
    await evidenceCards.nth(i).getByRole('button',{name:'يعتمد على السياق'}).click();
  }
  await page.getByRole('button',{name:'انتقل إلى أسئلة العلاقة'}).click();
  await expect(page.getByText('حلل علاقة العمل')).toBeVisible();

  const questions=page.locator('select[data-q]');
  await expect(questions).toHaveCount(6);
  for(let i=0;i<6;i++)await questions.nth(i).selectOption({index:1});
  await page.getByRole('button',{name:'ابن خريطة السلطة'}).click();
  await expectRoute(page,'power');

  await expect(page.getByText('وزع 100 نقطة من السلطة في كل محور')).toBeVisible();
  const powerCards=page.locator('fieldset.power-card');
  await expect(powerCards).toHaveCount(6);
  for(let i=0;i<6;i++){
    const card=powerCards.nth(i);
    const inputs=card.locator('input[data-axis]');
    await expect(inputs).toHaveCount(4);
    await inputs.nth(0).fill('40');
    await inputs.nth(1).fill('20');
    await inputs.nth(2).fill('20');
    await inputs.nth(3).fill('20');
    await card.getByRole('button',{name:'اعتماد هذا المحور'}).click();
  }
  await expect(page.getByText('أكملت 6 من 6 محاور')).toBeVisible();
  await page.getByRole('button',{name:'اكتب استنتاجك'}).click();
  await expectRoute(page,'conclusion');

  await expect(page.getByText('اكتب استنتاجك')).toBeVisible();
  const analysis='تتركز سلطة مؤثرة لدى المنصة والعميل لأنهما يحددان قواعد الوصول والتقييم وتوزيع العمل.';
  await page.locator('#analysis').fill(analysis);
  await page.getByRole('button',{name:'إظهار النتيجة'}).click();
  await expectRoute(page,'result');

  await expect(page.getByText('درجة التمرين التحليلي')).toBeVisible();
  await expect(page.locator('.score')).toContainText('/100');
  await expect(page.getByText('ليان',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'اربط التجربة بالحقوق'}).click();
  await expectRoute(page,'rights');

  await expect(page.getByText('من السلطة إلى الحقوق')).toBeVisible();
  await page.getByRole('button',{name:/الخصوصية وبيانات العامل/}).click();
  await page.getByRole('button',{name:/الشفافية والمراجعة البشرية/}).click();
  await page.getByRole('button',{name:'إظهار خريطة الحماية'}).click();
  await expect(page.getByText('خريطة حماية مقترحة للنقاش')).toBeVisible();
  await expect(page.getByText('الخصوصية وبيانات العامل',{exact:true})).toBeVisible();
  await expect(page.getByText('الشفافية والمراجعة البشرية',{exact:true})).toBeVisible();

  await page.getByRole('button',{name:'العودة للنتيجة'}).click();
  await expectRoute(page,'result');
  await expect(page.getByText('درجة التمرين التحليلي')).toBeVisible();

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('no_boss_v3_state')));
  expect(saved.scenarioKey).toBe('moderation');
  expect(saved.stage).toBe(11);
  expect(saved.workScore).toBeGreaterThanOrEqual(0);
  expect(Object.keys(saved.evidenceSort)).toHaveLength(saved.evidence.length);
  expect(saved.powerTouched).toHaveLength(6);
  expect(saved.powerEdited).toHaveLength(6);
  expect(saved.analysisText).toBe(analysis);
  expect(saved.selectedRights).toEqual(expect.arrayContaining(['privacy','automation']));
});
