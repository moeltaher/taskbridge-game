from pathlib import Path
R=Path(__file__).resolve().parents[1]
routes=['index.html','scenario/index.html','onboarding/index.html','work/index.html','management/index.html','risk/index.html','dispute/index.html','payment/index.html','access/index.html','investigation/index.html','power/index.html','conclusion/index.html','result/index.html','rights/index.html']
for f in routes:
    p=R/f
    assert p.exists(), f'missing {f}'
    s=p.read_text(encoding='utf-8')
    assert 'bootstrap.js' in s
    assert 'v2.0.0' in s
required=['assets/js/data/scenarios.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/routes.js','assets/js/core/ui.js','assets/js/core/bootstrap.js','ARCHITECTURE.md']
for f in required: assert (R/f).exists(), f'missing {f}'
print('TaskBridge v2 structural checks passed')
