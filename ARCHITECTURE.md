# No Boss v3.8.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and routes

The simulation supports `full-work`, `no-work`, and `contract-decline` paths. Route shells are generated from `assets/js/core/routes.js`; the route generator rejects drift and removes orphan generated shells. The current route directories are deployment artifacts required by GitHub Pages, not legacy pages.

## State and migration

`STATE_SCHEMA_VERSION=9`. Old analysis/results cannot be silently reused after score-model changes: legacy states at stage 9 or later are reset to the power-map stage, old result data and structured conclusions are cleared, and the user rebuilds the analysis under the current model. Older pre-history states receive the scenario's historical offer baseline before current-round counters are combined.

Legacy keys that are not part of `freshState()` remain rejected. `powerTouched` and prior scoring-state fields remain removed. Storage compatibility for archived runs is intentionally retained because it is live functionality.

## Opportunity ranking

Each scenario has a historical offer baseline. `computeManagedAccess()` compares the current aggregate acceptance rate with that account-specific baseline, not with 100%. A neutral task score and unchanged historical acceptance therefore leave initial access neutral. Actual rejections remain separately available to the final access review.

## Task scoring and review

Any answer listed as `acceptable` receives full task credit. Reviewable alternatives remain distinct from accepted answers. Data-task technical incidents store the exact affected sample index; technical appeal grounds are available only when that affected sample is itself erroneous, and unrelated hard errors can still prevent an appeal from changing the decision.

A review UI with no supported grounds does not render a nonfunctional appeal action.

## Authority and analysis

`authorityReferenceForState()` overlays path-specific references on the scenario reference. Contract-decline analysis assigns the contract gate to the platform only; no-work analysis does not invent client project power or project burden that never occurred. `SCORE_MODEL_VERSION=8` uses these path-aware ranked references.

The structured conclusion checks only two explicit claims: authority over general access/contract entry and the burden leader when applicable. It does not collapse price, allocation, monitoring and quality authority into a fake global authority score.

## Market time and risk

Market time is a disclosed training assumption: 4 minutes for the first market decision and 2 minutes for each subsequent market decision. Risk probabilities remain disclosed training parameters and technical events are sample-bound.

## Economy model

`ECONOMY_MODEL_VERSION=3` separates `availableNet` from `heldBalance`. A quality-review hold is not described as a final loss. `economicPosition` is shown only as the conditional sum of available cash and held funds if the entire hold were later released. Operating costs remain fixed training participation costs for the round.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant and syntax checks. `npm run test:e2e` covers Chromium/WebKit desktop/mobile journeys and accessibility checks.
