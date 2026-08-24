# No Boss v3.8.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and routes

The simulation supports `full-work`, `no-work`, and `contract-decline` paths. Route shells are generated from `assets/js/core/routes.js`; the route generator rejects drift and removes orphan generated shells. The current route directories are deployment artifacts required by GitHub Pages, not legacy pages.

## State compatibility

`STATE_SCHEMA_VERSION=10`. There is no migration layer for earlier schemas. A stored state is usable only when it matches schema 10; older rounds start fresh rather than being transformed into the current learning model. Unknown keys remain rejected because `normalizeState()` only admits fields defined by `freshState()`.

Archived results are likewise shown only when they match the current score and economy models. Historical compatibility fallbacks and migration helpers have been removed. Reopening a completed result to edit the conclusion invalidates that round's archived result until the result is produced again, so the archive cannot retain a stale completed analysis.

## Opportunity ranking

Each scenario has a historical offer baseline. `computeManagedAccess()` compares the current raw aggregate acceptance rate with that account-specific raw baseline and combines that delta with the account's current cumulative `quality`. The raw task score updates quality first; it is not then counted a second time as an independent ranking input. Acceptance-rate effects use symmetric rounding so equal positive and negative changes have equal magnitude. Actual rejections remain separately available to the final access review.

Every decision on the second offer consumes two minutes of market/search time, whether the worker accepts, rejects, or ends the shift without registering a rejection.

The researcher shell keeps the interim opportunity-ranking value separate from the final access outcome. A final suspension therefore does not overwrite the historical ranking value used earlier in the shift.

## Task scoring and review

Any answer listed as `acceptable` receives full task credit. Reviewable alternatives remain distinct from accepted answers. Data-task technical incidents store the exact affected sample index on `technicalIssueSampleIndexes`; there is no task-wide technical-issue flag in the current runtime model.

The review policy is disclosed in the UI: 85% or above means no material disagreement, 60–84% means limited disagreement, and below 60% means major disagreement. Appeal cost is disclosed before the worker acts: two minutes of extra work-related time and up to four stress points.

An appeal is counterfactual rather than an automatic one-step mitigation. The simulation corrects only samples supported by the selected appeal ground, recalculates the task score, then applies the same 85/60 thresholds to that counterfactual score. A supported appeal ground therefore does not change the decision unless the recomputed score crosses a severity threshold.

## Authority and analysis

`SCORE_MODEL_VERSION=9` uses ordinal roles rather than percentage allocations. For each active axis, the learner assigns each party `primary`, `secondary`, or `no role`; ties are allowed. The interface does not auto-fill untouched parties and does not imply quantitative precision that the score does not use.

The burden axis answers who actually bore costs, risks, and unpaid participation time in the simulated facts. It does not award platform/client rank merely because they helped cause or design a risk. General account/market access is a separate axis controlled by the platform; client power to select or remove a worker inside a project remains part of project allocation rather than account termination.

For `no-work` rounds, the researcher labels price and allocation as rules displayed in the market rather than implying that an accepted-project decision occurred. Structured conclusion tie keys are canonicalized to one party order so equivalent ties cannot be rejected because their internal strings use different ordering.

Diagnostic questions are mandatory for progression but explicitly unscored. The structured conclusion must be internally consistent with the learner's map and must cite evidence from the relevant claim dimension: access/contract evidence for the access claim and burden evidence for the burden claim. Free analytical text is optional and has no arbitrary character threshold. The final result also provides evidence-by-evidence feedback showing the learner's classification, the strongest reference reading, acceptable partial readings, and the credit received.

## Risk modes

Normal mode uses disclosed training probabilities and a deterministic roll within a round. Facilitator mode can force an eligible event or suppress an additional event so workshops can compare paths or guarantee exposure to a teaching case. Forced mode never creates an event whose eligibility conditions are absent.

## Economy model

`ECONOMY_MODEL_VERSION=4` uses `availableNet` as the single current field for available cash and keeps it separate from `heldBalance`. The removed `payment.net` alias is not written or read by the current runtime. A quality-review hold is not described as a final loss. The UI explicitly states that the processing percentage in this simulation is calculated on the full contracted worker amount before the held balance is separated. Operating costs remain fixed training participation costs for the round.

## Legacy and dead-code policy

Current route shells, `.nojekyll`, the static Playwright server, and storage itself are live deployment/runtime components. Legacy state migrations, archive fallbacks, task-wide `technicalIssue`, and the `payment.net` alias have been removed. `scripts/dead-code-check.mjs` walks the current runtime import graph from the route/page entry points and fails verification if an orphan JavaScript runtime module remains.

No current route page is retained merely for backwards compatibility. Route directories correspond to live entries in the current manifest; historical implementation remains in Git history and the changelog rather than parallel runtime pages.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, dead-code, and syntax checks. `npm run test:e2e` covers representative Chromium/WebKit journeys and accessibility checks. Domain and semantic guards also cover counterfactual appeals, symmetric acceptance effects, canonical tie keys, sample-data invariants, stale-archive invalidation, no-work boundary wording, and the absence of removed runtime aliases.
