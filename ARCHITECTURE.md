# No Boss v3.9.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and routes

The simulation supports `full-work`, `no-work`, and `contract-decline` paths. Route shells are generated from `assets/js/core/routes.js`; the route generator rejects drift and removes orphan generated shells. The current route directories are deployment artifacts required by GitHub Pages, not legacy pages.

The structural check also constructs a JavaScript dependency graph rooted at `core/bootstrap.js` and every live route-page module. Any unreachable module under `assets/js` fails CI, so cleanup is not limited to a hard-coded obsolete-file list.

## State and migration

`STATE_SCHEMA_VERSION=10`. Old analysis/results cannot be silently reused after score-model changes: legacy states at stage 9 or later are reset to the power-map stage, old result data and structured conclusions are cleared, and the user rebuilds the analysis under the current model.

Current task records no longer store the obsolete task-wide `technicalIssue` flag; migration strips it and retains `technicalIssueSampleIndexes`. Current payment settlements no longer write the legacy `net` alias; migration reads old `net` values into `availableNet` and then removes the alias. Storage compatibility remains live functionality for old saved runs and archives.

If a completed result is reopened for editing through the Back checkpoint, its archived row is invalidated until the user completes the result again. This prevents a stale archived result from representing a still-open analysis.

## Opportunity ranking

Each scenario has a historical offer baseline. `computeManagedAccess()` compares raw current and baseline acceptance rates rather than rounded display percentages, then uses symmetric rounding for the ranking delta. Equal positive and negative acceptance changes therefore receive equal-magnitude effects. Actual rejection count remains a separate final-access factor.

The first market decision costs four simulated minutes and subsequent market decisions cost two. The second offer is also a market decision and now consistently costs two simulated minutes whether accepted, rejected, or used as the point where the worker ends the shift.

## Task scoring and causal review

Any answer listed as `acceptable` receives full task credit. Reviewable alternatives remain distinct from accepted answers. Data-task technical incidents store exact affected sample indexes.

`SCORE_MODEL_VERSION=9` replaces the old appeal shortcut with counterfactual recalculation. A review ground identifies only the samples it can justify reopening. Those samples are corrected in a counterfactual copy of the task, unaffected samples retain their actual credit, and the same score-to-severity thresholds are applied to the recalculated score. The appeal changes the decision only if the counterfactual score actually crosses a threshold. The original task score remains the historical score of the submitted work.

Sample-data invariants require every preferred answer to be acceptable, prohibit overlap between acceptable and reviewable answers, and require every reviewable answer to name a known appeal ground.

## Authority and analysis

`authorityReferenceForState()` overlays path-specific references on the scenario reference. Contract-decline analysis assigns the contract gate to the platform only. In `no-work`, price and allocation axes are explicitly framed as structural rules exposed in the market; the UI separately explains that these rules do not prove the client exercised a project decision in a round where no project was accepted.

Structured conclusion claims use canonical party-set keys, so tied leaders are order-independent. The conclusion still checks only explicit access/contract-entry authority and burden claims; it does not create a synthetic overall-authority index.

The result page provides evidence-level learning feedback in addition to the numeric evidence score: participant classification, preferred reference classification, partial-valid alternatives, and full/half/zero credit.

## Economy model

`ECONOMY_MODEL_VERSION=4` keeps `availableNet`, `heldBalance`, and conditional `economicPosition` as distinct meanings and adds second-offer decision time to total round time. A quality-review hold is not described as a final loss. Operating costs remain fixed training participation costs for the round.

## Verification

`npm run check` runs route, structural/orphan-module, regression, domain, semantic-invariant and syntax checks. `npm run test:e2e` covers Chromium/WebKit desktop/mobile journeys and accessibility checks.
