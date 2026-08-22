# No Boss v3.4.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages. It has no backend, API, database, or application framework.

## Experience model

The simulation has two chapters: a worker experience that produces facts, then a researcher analysis that may use only facts that actually occurred. Valid endings are `full-work`, `no-work`, and `contract-decline`.

Stage-changing decisions are reversible. Before a commit changes `stage`, state saves a checkpoint of the pre-decision snapshot. Entering the destination page does not create a duplicate snapshot. Back therefore restores the actual prior decision state instead of merely changing the URL/stage.

## Actors and authority

The ecosystem contains worker, platform, client, and payment mediator. Work-authority analysis contains worker, platform, and client. Payment mediation is analyzed separately in the full-work diagnostic questions.

`assets/js/data/authority-model.js` stores a rank reference for every work axis: `primary` and `secondary` actors. It does not contain hand-authored hidden percentages. `authorityDistribution()` derives normalized 100-point weights from the rank solely to interoperate with the participant's drawing UI and rank-scoring functions.

`SCORE_MODEL_VERSION=4`. Relationship questions are diagnostic and unscored. The analysis score is:

- 40 points: evidence classification by analytical dimension.
- 60 points: relative authority/burden map.

The risk axis remains a burden axis, not a control axis.

## Task UI

`assets/js/core/task-ui.js` is the shared renderer/controller for first and second tasks. It owns choice buttons, `aria-pressed`, data drawing, the nonvisual semantic alternative, and task/style guides. Page modules supply state fields and completion behavior rather than maintaining duplicate task implementations.

The data visual and semantic routes share the same scoring space. A participant uses one route per sample.

## State and migration

`STATE_SCHEMA_VERSION=5`. `normalizeState()` whitelists fields present in `freshState()`, and live `commit/patch` calls also ignore unknown keys.

Legacy fields no longer in the model include:

`marketExit`, `powerDraft`, `powerEdited`, `qualityAfterFirstTask`, `reviewTaskScore`, `realFinishedAt`, `initialStress`, `firstTaskStress`, `secondTaskScore`, `disputeSeverity`, `disputedTaskPay`.

Legacy four-party power distributions are migrated to the current three-party work-authority map and normalized.

## Worker decisions

Rejecting an offer and ending a shift are distinct actions. This distinction exists both in the first market and after the first task. Ending the shift after the second offer appears does not increment rejections, offer decisions, or change acceptance.

Monitoring details are deliberately disclosed after task execution in the simulation, and the UI states that the delayed disclosure is intentional so it can be analyzed as an opacity issue rather than mistaken for missing instructions.

## Risks and appeals

Risk events may only assert facts supported by the completed work. The moderation wellbeing event requires completed samples that actually contained harassment or threats. The data connection event records a technical display/synchronization issue; a technical appeal succeeds only when such an issue was recorded.

Non-data appeals still depend on sample-level acceptable/reviewable answers. Data guideline appeals depend on actual annotation credit.

## Economics and archive

Operating cost remains the fixed shift estimate after entering the market. Transfer/processor fees require a payout.

`ECONOMY_MODEL_VERSION=2`. Archived comparisons are grouped by stable scenario identity, run path, score model, and economy model. Contract-decline runs store `null` for shift duration, final stress, access outcome, and break choice where those concepts did not occur.

## Conclusion

Conclusion requirements follow the run path:

- `contract-decline`: contract gate and bargaining/access implications; one supporting evidence item is sufficient.
- `no-work`: market participation, search time, costs, pricing/allocation/access; one supporting item is sufficient.
- `full-work`: broader authority and burden conclusion; normally two supporting items.

Counter/dual evidence remains optional and fact-dependent.

## Routes and stale-page cleanup

`assets/js/core/routes.js` is the route source of truth. Current route HTML files are deployment shells required by GitHub Pages, not legacy application copies. `scripts/generate-pages.mjs --check` verifies expected shells and detects generated-looking orphan route directories; generation removes those orphans.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, and syntax checks. `npm run test:e2e` runs Chromium/WebKit desktop/mobile journeys and accessibility checks, including reversible transitions, clean shift ending, no-work access, and keyboard navigation of researcher tabs.
