# Changelog

## Current release — v3.5.0

### Learning and scoring integrity
- Raised `SCORE_MODEL_VERSION` to 5 and removed numeric authority-target conversion.
- Corrected moderation and AI price references.
- Added burden to the `no-work` analysis path.
- Split financial settlement into an unscored `settlement` dimension.
- Replaced axis-duplicating diagnostic questions with conceptual distinction questions.

### State, flow, and task correctness
- Raised `STATE_SCHEMA_VERSION` to 6.
- Added labeled sub-screen checkpoints.
- Fixed actual stress deltas for second tasks and appeal costs.
- Clarified projected versus earned pay and completed the 1–2–3 instructional sequence.

### Risk, appeal, accessibility, and cleanup
- Bound technical events to the affected completed task and limited technical appeals accordingly.
- Made appeal grounds conditional on task type and recorded facts.
- Restored keyboard focus after semantic nonvisual data answers.
- Preserved actor color coding and consolidated `.locked-opportunity`.
- Deleted `power-targets.js`, `question-references.js`, `scoredQuestionsForState`, old question score fields, the `disputeSeverity` fallback, and unused `ecosystemParties`.
- Expanded domain, E2E, and accessibility coverage.
- Regenerated all valid GitHub Pages shells. No obsolete route page existed to delete.

## Previous release — v3.4.0

- Added reversible stage checkpoints and state-key whitelisting.
- Replaced hidden authority percentages with primary/secondary references.
- Made relationship questions diagnostic and unscored.
- Added clean shift ending, shared task UI, economy model versioning, and broader accessibility coverage.
