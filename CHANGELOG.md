# Changelog

## Current release — v3.7.0

### Learning and causal integrity
- Raised `SCORE_MODEL_VERSION` to 7 and removed default authority-map anchoring: power/burden axes now start unanswered and require explicit confirmation.
- Added a historical offer-decision baseline per scenario so a single current-round decision cannot manufacture a 0% or 100% acceptance rate.
- Made the two consequences of rejection explicit: the aggregate acceptance rate can affect the next ranking, while the rejection count remains a separate final-access factor.
- Bound appeal grounds to the specific reviewable answer that supports them; generic grounds no longer succeed merely because some reviewable error exists.
- Added immediate explanatory feedback to diagnostic questions before the player builds the authority map.
- Added structured conclusion claims that must be consistent with the player's own confirmed authority/burden map without scoring the free-text conclusion.
- Disclosed training risk-event probabilities and clarified that they are simulation parameters, not empirical sector estimates.
- Clarified fixed participation-cost semantics and that a quality-review hold remains held at the end-of-round snapshot rather than being assumed permanently forfeited.

### State and cleanup
- Raised `STATE_SCHEMA_VERSION` to 8.
- Replaced the obsolete `powerTouched` state field with `powerConfirmed` and removed legacy `powerTouched` acceptance from current state.
- Added `baselineAcceptedOffers`, `baselineOfferDecisions`, `conclusionAuthority`, and `conclusionBurden`.
- Schema migration clears unconfirmed old authority-map values rather than treating legacy defaults as a current analytical answer.
- Regenerated all live GitHub Pages route shells for v3.7.0. No obsolete route page exists in the route manifest.
- Previously removed files `power-targets.js` and `question-references.js` remain prohibited by structural checks.

### Verification
- Expanded domain checks for offer-history stability, evidence-specific appeal grounds, diagnostic feedback, risk probability, and explicit authority-map confirmation.
- Updated Chromium/WebKit journeys and accessibility coverage for the new confirmation and conclusion steps.

## Previous release — v3.6.0

- Raised `SCORE_MODEL_VERSION` to 6 and added explicit burden evidence classification.
- Unified premium-offer preview and execution, corrected appeal causality, exposed whole-task review differences, added appeal undo, fixed state/shell synchronization, and expanded accessibility coverage.
- Deleted unused `costModel` and `refreshStats()` scaffolding while retaining live generated route shells and intentional legacy-storage compatibility.

## Previous release — v3.5.0

- Raised `SCORE_MODEL_VERSION` to 5 and removed numeric authority-target conversion.
- Added labeled sub-screen checkpoints, burden analysis for no-work, unscored settlement evidence, task-bound technical incidents, conditional appeal grounds, and other consistency fixes.
- Deleted `power-targets.js`, `question-references.js`, old question-score fields, the `disputeSeverity` fallback, and other obsolete scoring scaffolding.
