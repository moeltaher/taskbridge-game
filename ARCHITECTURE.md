# No Boss v3.7.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and navigation

The simulation has `full-work`, `no-work`, and `contract-decline` endings. Navigation checkpoints exist across stages and at meaningful sub-screen decisions, including filing a second review. Each checkpoint carries a human-readable label.

The persistent shell listens to every `no-boss-state-change` event and refreshes status, compact metrics, detailed metrics, and Back state centrally.

## Authority, burden, and score model

`assets/js/data/authority-model.js` remains the single authority reference. Each axis stores `primary` and `secondary` actors. `SCORE_MODEL_VERSION=7` retains direct ranked scoring but changes how the participant produces the map: every axis starts at zero, moving a slider creates a draft 100-point distribution, and the participant must explicitly confirm the axis before it can count as complete.

`powerConfirmed` is the only completion marker. The previous `powerTouched` field has been removed so a superficial slider event cannot turn an untouched default into a scored answer.

The analysis score remains 40 points for evidence classification and 60 for the authority/burden map. Diagnostic questions and free-text analysis remain unscored.

Before the final result, structured authority/burden claims are checked against the participant's own confirmed map. This is a consistency guard, not an additional score and not automated semantic grading of the free-text conclusion.

## Offers and ranking

Each scenario defines an `offerHistory` baseline. At scenario start, aggregate acceptance counters are initialized from that prior history; current-round decisions are then added to the same counters. The UI also keeps baseline counters so it can distinguish prior history from decisions made during the current round.

A rejection can affect two explicitly separate mechanisms: aggregate acceptance may influence the intermediate opportunity ranking, while the count of actual rejections can remain an independent factor in the final access review. The final access model does not reuse the intermediate access score itself.

## Evidence, settlement, and diagnostics

Scored evidence dimensions are contract, price, allocation, monitoring, quality, burden, and access, with path-specific subsets. Financial settlement remains its own `settlement` dimension and `scoreable:false`.

Diagnostic questions return immediate explanatory feedback but remain outside the score.

Operating costs are deliberately modeled as fixed training participation costs for a round rather than minute-by-minute consumption. A quality-review `hold` represents funds still held at the end-of-round settlement snapshot; the model does not treat the hold as automatically forfeited or simulate a later release.

## Tasks, risk, and appeals

Premium-offer sample counts are defined once in `domain/management.js` and reused by both market preview and the actual second offer. Task records store actual stress change after clamping.

Quality review selects the lowest-scoring completed task; ties are resolved in favor of the most recently completed tied task. Non-data reviewable answers carry `reviewableGrounds`, and an appeal ground is available/successful only when a reviewable answer in that task supports that specific ground. Technical appeals remain bound to the reviewed task carrying the recorded technical event.

An accepted appeal reduces review severity only. It does not recompute the task score or replay an earlier ranking decision.

Risk events use deterministic per-round rolls against training thresholds. The UI discloses the threshold and states that it is a simulation parameter rather than an empirical probability estimate.

## State and cleanup

`STATE_SCHEMA_VERSION=8` adds historical offer baselines, explicit power confirmation, and structured conclusion claims. Migration from an older schema clears checkpoints and old power-map values rather than silently treating legacy defaults as current confirmed analysis.

Current dead/obsolete state such as `powerTouched` is removed. Previously deleted scoring files/APIs remain prohibited by structural checks. Legacy result/state migration code in storage is intentionally retained for user-data compatibility and archived-result comparison.

No obsolete route page exists in the current manifest. Current route shells are required for GitHub Pages, and the generator removes orphan generated shells.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, and syntax checks. `npm run test:e2e` runs Chromium/WebKit desktop/mobile journeys and accessibility coverage.
