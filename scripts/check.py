from pathlib import Path
R=Path(__file__).resolve().parents[1]
routes=['index.html','scenario/index.html','onboarding/index.html','work/index.html','management/index.html','risk/index.html','dispute/index.html','payment/index.html','access/index.html','investigation/index.html','power/index.html','conclusion/index.html','result/index.html','rights/index.html']
for f in routes:
    p=R/f
    assert p.exists(), f'missing {f}'
    s=p.read_text(encoding='utf-8')
    assert 'bootstrap.js' in s
    assert 'No Boss v3.0.2' in s, f'old or missing version title in {f}'
    assert 'TaskBridge v2.0.0' not in s, f'legacy title remains in {f}'
required=['assets/js/data/scenarios.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/routes.js','assets/js/core/ui.js','assets/js/core/bootstrap.js','assets/js/core/power-scoring.js','ARCHITECTURE.md','assets/images/no-boss-logo.svg','scripts/check.mjs']
for f in required: assert (R/f).exists(), f'missing {f}'
state=(R/'assets/js/core/state.js').read_text(encoding='utf-8')
storage=(R/'assets/js/core/storage.js').read_text(encoding='utf-8')
power=(R/'assets/js/pages/power.js').read_text(encoding='utf-8')
work=(R/'assets/js/pages/work.js').read_text(encoding='utf-8')
dispute=(R/'assets/js/pages/dispute.js').read_text(encoding='utf-8')
assert "CURRENT_VERSION='3.0.2'" in state
assert "CURRENT_VERSION='3.0.2'" in storage
assert 'powerEdited' in state and 'powerEdited' in power
assert "taskHTML(sc,s.workAnswers)" in work
assert "patch({stage:6,status:'قيد التسوية'})" in dispute
print('No Boss v3.0.2 structural and regression guards passed')
