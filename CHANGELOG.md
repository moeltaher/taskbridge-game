# Changelog

## Current release — v3.6.0

### Learning and causal integrity
- Raised `SCORE_MODEL_VERSION` to 6 and added an explicit burden classification for burden-dimension evidence.
- Unified premium-offer preview and execution so pay, duration, stress, and sample count describe the same offer.
- Reworked quality-review presentation to summarize the whole reviewed task and list every actual difference using readable answer text.
- Made the tie-break rule explicit: among equally low-scoring tasks, the most recently completed task is reviewed.
- Limited accepted-appeal language to what the model actually changes: review severity, not the underlying task score or prior ranking decisions.
- Replaced the no-work project question with a question that avoids attributing a client exclusion that did not occur.
- Clarified delayed wellbeing events as distinct from a voluntary pre-review break.

### State and interaction correctness
- Raised `STATE_SCHEMA_VERSION` to 7 and added `termsDeclinedBefore` for rejected-then-accepted contract histories.
- Choosing another case after declining terms now resets the abandoned run instead of carrying a stale scenario into selection.
- Filing a second review now creates an explicit undo checkpoint.
- Starting the semantic nonvisual data method clears a previously saved visual box immediately.
- Centralized shell/status/metric refreshes on `no-boss-state-change`; removed manual `refreshStats()` calls.
- Clarified that equal power-map values mean equal rank.

### Accessibility, responsive layout, and cleanup
- Fixed settlement-flow arrow direction for the vertical layout at the same breakpoint that stacks the cards.
- Expanded Axe coverage through management, risk, dispute, payment, access, investigation, power, conclusion, result, and rights.
- Added browser regressions for shell synchronization, contract-reset behavior, appeal undo, and visual-to-semantic answer replacement.
- Deleted the unused scenario `costModel` field and the obsolete manual `refreshStats()` interface.
- Regenerated every current GitHub Pages route shell for v3.6.0; no obsolete route page exists in the manifest.

## Previous release — v3.5.0

- Raised `SCORE_MODEL_VERSION` to 5 and removed numeric authority-target conversion.
- Added labeled sub-screen checkpoints, burden analysis for no-work, unscored settlement evidence, task-bound technical incidents, conditional appeal grounds, and other consistency fixes.
- Deleted `power-targets.js`, `question-references.js`, old question-score fields, the `disputeSeverity` fallback, and other obsolete scoring scaffolding.
