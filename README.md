# No Boss

**الإصدار الحالي: v3.0.2**

لعبة ومحاكاة تدريبية عربية لفهم اقتصاد المنصات، والإدارة الخوارزمية، وتوزيع المخاطر، وشروط العمل، وعلاقات السلطة في العمل الرقمي.

تضع اللعبة اللاعب داخل منصة افتراضية اسمها **No Boss**، ثم تنقله من تجربة العامل إلى دور الباحث لتحليل كيفية توزيع المهام، وتحديد المقابل، وقياس الأداء، وإدارة الوصول إلى العمل، وتسوية النزاعات.

المشروع تطبيق ثابت متعدد الصفحات يعمل على GitHub Pages، من دون backend أو API أو قاعدة بيانات أو إطار عمل مثل React/Vue.

راجع [CHANGELOG.md](CHANGELOG.md) لتاريخ الإصدارات و[ARCHITECTURE.md](ARCHITECTURE.md) لتفاصيل الهيكل ومسؤولية كل طبقة.

## الروابط المنطقية

`/scenario/`, `/onboarding/`, `/work/`, `/management/`, `/risk/`, `/dispute/`, `/payment/`, `/access/`, `/investigation/`, `/power/`, `/conclusion/`, `/result/`, `/rights/`.

## التشغيل

افتح المشروع عبر خادم ملفات ثابت أو GitHub Pages. بسبب استخدام JavaScript ES modules، لا يفضل تشغيله مباشرة ببروتوكول `file://`.

## بنية الصيانة

- إعدادات الإصدار العامة: `assets/js/core/config.js`
- تعريف المسارات والمراحل والتقدم: `assets/js/core/routes.js`
- حالة اللعبة والتراجع: `assets/js/core/state.js`
- التخزين المحلي: `assets/js/core/storage.js`
- الواجهة المشتركة: `assets/js/core/ui.js`
- قواعد المحاكاة القابلة للاختبار: `assets/js/domain/`
- السيناريوهات والبيانات: `assets/js/data/`
- واجهات المراحل: `assets/js/pages/`
- CSS: `assets/css/`
- اختبارات المتصفح: `tests/e2e/`

ملفات HTML الخاصة بالمسارات مولدة من route manifest. بعد تغيير عنوان أو مسار أو إصدار، شغّل:

```bash
node scripts/generate-pages.mjs
```

ويمكن التحقق من عدم وجود اختلاف بين الملفات المولدة والـmanifest من دون تعديل الملفات عبر:

```bash
node scripts/generate-pages.mjs --check
```

## التحقق قبل النشر

الفحوص السريعة التي لا تحتاج متصفحًا:

```bash
node scripts/generate-pages.mjs --check
node scripts/structural-check.mjs
node scripts/check.mjs
node scripts/domain-check.mjs
```

لاختبارات المتصفح الفعلية ثبّت الاعتمادات ومتصفح Chromium ثم شغّل Playwright:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

تعمل اختبارات E2E على Chromium في viewport مكتبي وهاتفي، وتشمل بدء الجولة، اختيار الحالة، الانتقال من onboarding إلى work، الرجوع واستعادة checkpoint، حفظ الجولة واستئنافها من الرئيسية، استمرار المسار بعد reload، وحماية الروابط المباشرة للمراحل الداخلية دون جلسة.

GitHub Actions تشغل تلقائيًا فحوص route shells والبنية وregression وقواعد المحاكاة وصياغة JavaScript، ثم اختبارات Playwright داخل Chromium.

## ملاحظة قانونية

المحاكاة أداة تدريبية لتحليل الوقائع وتوزيع وظائف السيطرة، وليست حكمًا قانونيًا نهائيًا على توصيف علاقة العمل.
