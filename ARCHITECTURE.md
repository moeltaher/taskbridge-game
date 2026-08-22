# No Boss v3.5.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages.

## Experience and navigation

The simulation has `full-work`, `no-work`, and `contract-decline` endings. Navigation checkpoints exist across stages and at meaningful sub-screen decisions. Each checkpoint carries a human-readable label, so Back distinguishes navigation from undoing a decision.

## Authority and score model

`assets/js/data/authority-model.js` is the single authority reference. Each axis stores `primary` and `secondary` actors. `SCORE_MODEL_VERSION=5`: `powerAxisCredit()` compares the participant ranking directly with those tiers. `power-targets.js` and `question-references.js` were deleted.

The analysis score remains 40 points for evidence classification and 60 for the authority/burden map.

## Evidence and settlement

Scored evidence dimensions are contract, price, allocation, monitoring, quality, burden, and access, with path-specific subsets. Financial settlement has its own `settlement` dimension and `scoreable:false`.

## Tasks, risk, and appeals

Task records store actual stress change after clamping. The data technical event records `affectedTaskId` and marks only that completed task `technicalIssue:true`. A technical appeal can apply only to the reviewed task carrying that fact. Appeal grounds are generated from task type and recorded facts.

## State and legacy cleanup

`STATE_SCHEMA_VERSION=6`. Removed compatibility code includes `power-targets.js`, `question-references.js`, `scoredQuestionsForState`, score-return fields `qScore/questionCorrect/questionTotal`, the old `disputeSeverity` fallback, unused `ecosystemParties`, and duplicate `.locked-opportunity` CSS.

No obsolete route page exists in the current manifest. Current route shells are required for GitHub Pages, and the generator still removes orphan generated shells.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, and syntax checks. `npm run test:e2e` runs browser journeys and accessibility checks.
