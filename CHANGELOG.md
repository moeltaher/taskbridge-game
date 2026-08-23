# Changelog

## v3.9.0

- Replaced approximate appeal severity reduction with sample-scoped counterfactual task recalculation.
- Canonicalized structured-conclusion tie keys so equivalent tied leaders cannot fail because of party ordering.
- Clarified structural authority versus authority actually exercised on `no-work` paths.
- Added two minutes of disclosed market-decision time to every second-offer decision, including ending the shift at that offer.
- Made acceptance-ranking deltas use raw rates with symmetric rounding.
- Added evidence-by-evidence learning feedback to the result page.
- Separated interim opportunity ranking from the final access decision in the researcher shell.
- Invalidated an archived result when a completed analysis is reopened for editing.
- Removed the task-wide `technicalIssue` state alias; technical incidents remain sample-scoped.
- Stopped writing the legacy `payment.net` alias while retaining migration from old saved states.
- Added sample-data invariants for acceptable, preferred and reviewable answers.
- Added a general orphan-JavaScript-module structural guard.
- Raised state schema to 10, score model to 9, economy model to 4, and regenerated all live GitHub Pages route shells.

## v3.8.0

- Anchored acceptance effects to each account's historical baseline rather than 100%.
- Added path-aware authority references for full-work, no-work and contract-decline analysis.
- Added safe schema-9 migration that invalidates legacy analysis/results and returns old advanced runs to the power-map stage.
- Made all accepted task alternatives receive full task credit.
- Bound data technical incidents and appeals to exact samples rather than whole tasks.
- Removed nonfunctional appeal actions when no evidence-supported appeal ground exists.
- Clarified premium preview versus newly generated standard second offers.
- Disclosed market-time simulation assumptions.
- Split settlement into available cash and held balance; bumped Economy Model to 3.
- Clarified structured conclusion semantics and exposed structured claims in the result.
- Fixed stale aggregate-acceptance and contract-decline shell copy.
- Regenerated all live GitHub Pages route shells and expanded regression/domain/E2E guards.

## v3.7.0

- Added explicit power-map confirmation and removed `powerTouched`.
- Added historical offer baselines, evidence-specific appeal grounds, immediate diagnostic feedback, structured conclusion consistency checks, risk-probability disclosure, clearer hold/cost semantics, and expanded CI coverage.

## v3.6.0 and earlier

See repository history for earlier releases. Historical implementation files that are no longer part of the current architecture are not retained as live runtime code.
