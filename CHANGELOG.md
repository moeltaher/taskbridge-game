# Changelog

## Current release — v3.4.0

### State integrity and navigation
- Changed stage checkpoints so Back restores the state before the decision that caused navigation, preventing stale `no-work` endings and repeated break effects.
- Raised `STATE_SCHEMA_VERSION` to 5 and made live commits ignore unknown state keys.
- Removed obsolete fields `initialStress`, `firstTaskStress`, `secondTaskScore`, `disputeSeverity`, and `disputedTaskPay`, in addition to previously removed legacy fields.

### Research model
- Replaced hand-authored hidden authority percentages with explicit `primary`/`secondary` rank references.
- Kept the participant's 100-point map as a drawing interface, deriving normalized internal rank weights only for map scoring.
- Raised `SCORE_MODEL_VERSION` to 4.
- Made relationship questions diagnostic and unscored; evidence classification now contributes 40 points and the authority/burden map 60.
- Added a separate full-work question for financial settlement so payment mediation is not conflated with authority over work.

### Worker flow and task clarity
- Added a third choice after the first task to end the shift without rejecting the second offer or changing acceptance.
- Consolidated first- and second-task rendering into `assets/js/core/task-ui.js`.
- Made delayed monitoring disclosure explicit as an intentional opacity lesson.
- Corrected the translation sample where reducing `checkout` to payment conflicted with the visible client guide.

### Risks, appeals, and conclusions
- Made moderation wellbeing events depend on samples actually completed in the round.
- Recorded the data connection event as an actual technical display/synchronization issue that can support a technical appeal.
- Removed legacy dispute-state writes and fallbacks.
- Made conclusion prompts and minimum supporting evidence depend on `full-work`, `no-work`, or `contract-decline`.

### Economy, archive, accessibility, and cleanup
- Added `ECONOMY_MODEL_VERSION=2` and isolate archive comparisons by scenario, ending path, score model, and economy model.
- Store non-applicable contract-decline metrics and missing break choices as `null` rather than false values.
- Fixed the transition-card CSS contrast conflict and replaced fixed result/actor grids with responsive auto-fit layouts.
- Removed stale `.seg.mediator` power-map CSS while retaining mediator presentation in actual financial flows.
- Added keyboard navigation for researcher tabs and expanded axe/E2E coverage to access, researcher transitions, Back rollback, and clean shift ending.
- Regenerated all valid GitHub Pages route shells for v3.4.0. No obsolete route shell existed in the current manifest; orphan detection/removal remains enforced by the generator.

## Previous release — v3.3.0

### Learning-model integrity
- فعّل مرجع السلطة المشتركة بين المنصة والعميل عندما يكون تأثيرهما متقاربًا بدل إبقاء الخيار غير قابل للتحقق.
- فصل وسيط الدفع عن سلطة علاقة العمل، مع بقائه جزءًا من التدفق المالي.
- الإبقاء على خريطة 100 نقطة كأداة ترتيب نسبي، وحذف `distributionProximity` القديمة.
- رفع `SCORE_MODEL_VERSION` إلى 3.

### Branch and economic consistency
- إضافة `runPath` للأرشيف ومنع مقارنة `full-work` و`no-work` و`contract-decline` معًا.
- احتساب تكاليف التشغيل في مسار دخول السوق دون مهمة، مع صفر لرسوم التحويل ووسيط الدفع عند عدم وجود payout.
- الحفاظ على رفض العقد في الأدلة والسجل عند إعادة النظر.
- جعل اعتراض تعليم البيانات قائمًا على الانحراف الفعلي في الإجابة.

### Clarity, accessibility, state, and cleanup
- إضافة `task-guides.js` كمرجع واحد لمعايير المهمة الأولى والثانية.
- تعريف فئات مراجعة المحتوى قبل الاختيار وإضافة `aria-pressed` للمهمة الثانية.
- إزالة شرط «الدليل المضاد» الآلي من بوابة الاستنتاج.
- رفع `STATE_SCHEMA_VERSION` إلى 4، وحذف `marketExit`, `powerDraft`, `powerEdited`, `qualityAfterFirstTask`, `reviewTaskScore`, `realFinishedAt`.
- جعل مولد الصفحات يكتشف قواقع المسارات المولدة اليتيمة.

## Previous release — v3.2.0

- فصل السلطة/التحكم عن تحمل التكاليف والمخاطر.
- منع مسار عدم العمل من اختلاق تقييد مشروع حالي أو حادث لم يقع.
- توحيد هندسة مهمة الصور بين العرض والـground truth وإضافة مسار غير بصري.
- إظهار دليل أسلوب الترجمة قبل المهمة وفصل الجودة عن المراقبة.
- جعل سؤال تحديد الأطراف تمهيديًا غير محسوب.

## Previous release — v3.1.0

- توحيد مصدر مرجع السلطة بين الأسئلة والخريطة.
- تحويل تقييم الخريطة إلى ترتيب القوة بدل مطابقة نسب رقمية مخفية.
- فصل ترتيب فرص العمل المؤقت عن قرار الوصول النهائي.
- إضافة `marketTime` وقرار فعلي لرفض الاتفاقية ومسار أدلة داعمة/مقيدة.

## Previous release — v3.0.2

- توحيد سجل المهام المكتملة والعينات والجودة والمقابل والوقت والعبء.
- جعل العرض المميز قابلًا للوصول فعليًا وفصل مغادرة السوق عن رفض عرض بعينه.
- ربط مراجعة الجودة بالمهمة محل النزاع وتوسيع العينات والحالات الرمادية.
- إضافة نموذج السلطة المركزي، خريطة الحقوق، Dashboard النتائج، ودعم المسارين البصري وغير البصري.
