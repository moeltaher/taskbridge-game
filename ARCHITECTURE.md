# No Boss v3.6.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and navigation

The simulation has `full-work`, `no-work`, and `contract-decline` endings. Navigation checkpoints exist across stages and at meaningful sub-screen decisions, including filing a second review. Each checkpoint carries a human-readable label.

The persistent shell listens to every `no-boss-state-change` event and refreshes status, compact metrics, detailed metrics, and Back state centrally. Page modules no longer call a separate `refreshStats()` helper.

## Authority, burden, and score model

`assets/js/data/authority-model.js` remains the single authority reference. Each axis stores `primary` and `secondary` actors. `SCORE_MODEL_VERSION=6` keeps direct ranked power scoring and adds an explicit `burden` evidence classification so direct burden facts are not forced into the mixed/context bucket.

The analysis score remains 40 points for evidence classification and 60 for the authority/burden map.

## Evidence and settlement

Scored evidence dimensions are contract, price, allocation, monitoring, quality, burden, and access, with path-specific subsets. Financial settlement remains its own `settlement` dimension and `scoreable:false`.

## Tasks, risk, and appeals

Premium-offer sample counts are defined once in `domain/management.js` and reused by both market preview and the actual second offer. Task records store actual stress change after clamping.

Quality review selects the lowest-scoring completed task; ties are resolved in favor of the most recently completed tied task and this rule is shown to the player. Review UI summarizes the whole task and lists all non-accepted answers using their full text instead of internal A/B codes. Technical appeals remain bound to the reviewed task carrying the recorded technical event.

An accepted appeal reduces review severity only. It does not recompute the task score or replay an earlier ranking decision; UI, result, and rights copy now state that scope explicitly.

## State and cleanup

`STATE_SCHEMA_VERSION=7` adds `termsDeclinedBefore` so a rejected-then-accepted contract path can distinguish a historical rejection from the current state.

Removed current-version dead code/data includes the unused `costModel` scenario field and the manual `refreshStats()` interface/call sites. Older deleted scoring files and APIs remain prohibited by structural checks. Legacy result/state migration code in storage is intentionally retained for user-data compatibility.

No obsolete route page exists in the current manifest. Current route shells are required for GitHub Pages, and the generator removes orphan generated shells.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, and syntax checks. `npm run test:e2e` runs Chromium/WebKit desktop/mobile journeys and expanded accessibility coverage.
