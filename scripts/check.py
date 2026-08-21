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
required=['assets/js/data/scenarios.js','assets/js/core/state.js','assets/js/core/storage.js','assets/js/core/routes.js','assets/js/core/ui.js','assets/js/core/bootstrap.js','assets/js/core/power-scoring.js','ARCHITECTURE.md','assets/images/no-boss-logo.svg','scripts/check.mjs','DEPLOY_GITHUB_AR.txt','.github/workflows/check.yml']
for f in required: assert (R/f).exists(), f'missing {f}'
state=(R/'assets/js/core/state.js').read_text(encoding='utf-8')
storage=(R/'assets/js/core/storage.js').read_text(encoding='utf-8')
bootstrap=(R/'assets/js/core/bootstrap.js').read_text(encoding='utf-8')
ui=(R/'assets/js/core/ui.js').read_text(encoding='utf-8')
home=(R/'assets/js/pages/home.js').read_text(encoding='utf-8')
power=(R/'assets/js/pages/power.js').read_text(encoding='utf-8')
conclusion=(R/'assets/js/pages/conclusion.js').read_text(encoding='utf-8')
work=(R/'assets/js/pages/work.js').read_text(encoding='utf-8')
dispute=(R/'assets/js/pages/dispute.js').read_text(encoding='utf-8')
investigation=(R/'assets/js/pages/investigation.js').read_text(encoding='utf-8')
rights=(R/'assets/js/pages/rights.js').read_text(encoding='utf-8')
result=(R/'assets/js/pages/result.js').read_text(encoding='utf-8')
deploy=(R/'DEPLOY_GITHUB_AR.txt').read_text(encoding='utf-8')
workflow=(R/'.github/workflows/check.yml').read_text(encoding='utf-8')
assert "CURRENT_VERSION='3.0.2'" in state
assert "CURRENT_VERSION='3.0.2'" in storage
assert "state.scenarioKey&&publicEntryPages.has(page)" in bootstrap
assert 'beforeunload' in bootstrap and 'persistenceStatus' in bootstrap
assert 'hadPowerEdited' in state and 'next.powerTouched=[]' in state
assert 'storageRevision' in state and 'revisionCounter' in state and 'resumePage' in state
assert "['home','scenario'].includes(current)" in state and "['home','scenario'].includes(next.currentPage)" not in state
assert "page==='rights'?consumeCheckpointTo('result'):undoCheckpoint()" in ui
assert 'aria-label="رجوع"' in ui and 'aria-label="بدء من جديد"' in ui
assert 'role="progressbar"' in ui and 'aria-valuenow="${pct}"' in ui
assert 'persistenceBanner' in ui and "p.status==='session'" in ui
assert 'resumePage' in home and 'outcomeLabel' in home and 'stateStorageMode' in home
assert '<caption' in home and 'scope="col"' in home and 'scope="row"' in home
assert 'consumeCheckpointTo' in rights and 'undoCheckpointTo' not in rights
assert 'summaryHTML' in rights and 'updateSummary' in rights
assert 'powerDraft' in power and 'rawValuesFor' in power and 'delete draft[axis]' in power
assert 'powerEdited' in power and 'Number.isInteger' in power and 'render(root).then' in power
assert 'powerComplete' in conclusion and 'powerEdited' in conclusion and 'label for="analysis"' in conclusion
assert "taskHTML(sc,s.workAnswers)" in work and 'ResizeObserver' in work
assert "patch({stage:6,status:'قيد التسوية'})" in dispute
assert 'role="tabpanel"' in investigation and 'aria-controls' in investigation and 'data-v="${v}"' in investigation
assert 'writePersistent' in storage and 'stateStorageMode' in storage and 'newestCurrentState' in storage
assert "function local(){try" in storage and "function session(){try" in storage
assert "const ok=archiveResult" in result and "تعذر حفظ النتيجة" in result
assert 'محتويات المشروع كاملة' in deploy and 'مجلد assets/ كاملًا' in deploy and 'خلف الشاشة' not in deploy
assert 'python scripts/check.py' in workflow and 'node scripts/check.mjs' in workflow and 'node --check' in workflow
print('No Boss v3.0.2 structural and regression guards passed')
