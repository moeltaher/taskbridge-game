# No Boss

**الإصدار الحالي: v3.0.2**

لعبة ومحاكاة تدريبية عربية لفهم اقتصاد المنصات، والإدارة الخوارزمية، وتوزيع المخاطر، وشروط العمل، وعلاقات السلطة في العمل الرقمي.

تضع اللعبة اللاعب داخل منصة افتراضية اسمها **No Boss**، ثم تنقله من تجربة العامل إلى دور الباحث لتحليل كيفية توزيع المهام، وتحديد المقابل، وقياس الأداء، وإدارة الوصول إلى العمل، وتسوية النزاعات.

المشروع تطبيق ثابت متعدد الصفحات يعمل على GitHub Pages، من دون backend أو API أو قاعدة بيانات أو إطار عمل مثل React/Vue.

راجع [CHANGELOG.md](CHANGELOG.md) لملخص تغييرات الإصدار الحالي و[ARCHITECTURE.md](ARCHITECTURE.md) لتفاصيل الهيكل ومسؤولية كل طبقة.

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
- بيانات السيناريوهات والأطراف والأدلة والمراجع والعينات: `assets/js/data/`
- واجهات المراحل: `assets/js/pages/`
- CSS: `assets/css/`
- اختبارات المتصفح: `tests/e2e/`

كل ملف بيانات يملك نوع البيانات الخاص به؛ لا يعيد `scenarios.js` تصدير بقية ملفات `data/`. ينبغي استيراد `samples` أو `axes` أو `powerTargets` أو غيرها مباشرة من الملف الذي يملكها.

ملفات HTML الخاصة بالمسارات مولدة من route manifest. بعد تغيير عنوان أو مسار أو إصدار، شغّل:

```bash
node scripts/generate-pages.mjs
```

ويمكن التحقق من عدم وجود اختلاف بين الملفات المولدة والـmanifest من دون تعديل الملفات عبر:

```bash
npm run check:routes
```

## التحقق قبل النشر

لتشغيل جميع الفحوص التي لا تحتاج متصفحًا:

```bash
npm run check
```

وتتوفر كل طبقة منفردة أيضًا:

```bash
npm run check:routes
npm run check:structural
npm run check:regression
npm run check:domain
npm run check:syntax
```

لاختبارات المتصفح الفعلية ثبّت الاعتمادات ومتصفح Chromium ثم شغّل Playwright:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

تعمل اختبارات E2E على Chromium في viewport مكتبي وهاتفي. تشمل smoke tests للاستئناف والرجوع وحماية الروابط، ومسارًا كاملًا من اختيار الحالة حتى النتيجة وخريطة الحقوق، إضافة إلى المسار غير البصري المكافئ لمهمة تعليم الصور في سيناريو سامر. كما تتحقق الرحلة الكاملة من عدم وجود horizontal overflow وتنتج screenshots للمراجعة البصرية.

GitHub Actions تشغل الأوامر نفسها المعرفة في `package.json`، ثم اختبارات Playwright داخل Chromium وترفع صور المراجعة البصرية كـartifact قصير العمر.

## ملاحظة قانونية

المحاكاة أداة تدريبية لتحليل الوقائع وتوزيع وظائف السيطرة، وليست حكمًا قانونيًا نهائيًا على توصيف علاقة العمل.
