# TaskBridge v2.0.0 — Multi-page modular architecture

v2.0.0 هو إعادة هيكلة معمارية كاملة للمشروع بهدف جعل الصيانة والتطوير طويل الأجل أكثر أمانًا وأسرع.

أصبحت المراحل الرئيسية متاحة عبر روابط مستقلة، وأصبح منطق كل مرحلة في ملف مستقل، مع طبقة مشتركة للحالة والتخزين والتوجيه والواجهة.

لا يتطلب الإصدار Backend أو React/Vue؛ يظل مشروعًا ثابتًا مناسبًا لـ GitHub Pages.

أبرز مسارات الصيانة:
- تعديل السيناريوهات: `assets/js/data/scenarios.js`
- تعديل المخاطر: `assets/js/pages/risk.js`
- تعديل الدفع: `assets/js/pages/payment.js`
- تعديل التحقيق: `assets/js/pages/investigation.js`
- تعديل خريطة السلطة: `assets/js/pages/power.js`
- تعديل النتيجة: `assets/js/pages/result.js`
