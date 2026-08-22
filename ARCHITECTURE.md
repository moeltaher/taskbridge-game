# No Boss v3.3.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages. It has no backend, API, database, or application framework.

## Experience model

The simulation has two chapters: a worker experience that produces facts, then a researcher analysis that may use only facts that actually occurred. Valid endings are `full-work`, `no-work`, and `contract-decline`; these paths are deliberately not treated as comparable scoring populations in the archive.

## Actors and authority

The ecosystem contains worker, platform, client, and payment mediator. The authority map contains only worker, platform, and client because the mediator's modeled role is payment execution rather than control over work conditions.

`assets/js/data/authority-model.js` is the single numeric authority reference. `power-targets.js` derives map targets from it. `question-references.js` derives accepted question answers from the same model and uses `significantAuthorities()` to represent shared platform/client authority when both fall within the configured significance band.

The risk axis is a burden axis, not a control axis. A high worker value on risk means the worker bears more cost/risk; it does not mean greater authority.

The 100-point sliders are a relative sketch. Scoring compares the primary authority and strongest group; no hidden exact percentage is required. The obsolete full-distribution proximity score was removed in v3.3.

## Work tasks and visible criteria

`assets/js/data/task-guides.js` provides criteria shared by first and second tasks. Moderation categories are defined before scoring, data annotation explains visual bounding-box rules and the equivalent nonvisual alternative, AI evaluation names its comparison criteria, and translation combines a generic criterion with each scenario's visible client style guide.

The data visual and semantic routes share the same scoring space. A participant uses one route per sample; the semantic route replaces a drawn answer rather than adding a second required task.

## State and migration

`STATE_SCHEMA_VERSION=4`. `normalizeState()` whitelists fields that exist in `freshState()` rather than spreading arbitrary historical keys into the current state. Legacy four-party power distributions are migrated to the current three-party authority map and renormalized.

Removed legacy fields include `marketExit`, `powerDraft`, `powerEdited`, `qualityAfterFirstTask`, `reviewTaskScore`, and `realFinishedAt`.

## Economics

Operating cost equals the scenario's fixed estimates for internet, electricity, and device use once the participant enters the task market. A `no-work` run therefore may have zero task income and a negative net economic result. Transfer and processor fees require an actual payout and remain zero when no task was accepted. A `contract-decline` run does not enter the market and does not incur those operating costs.

Archived results store `runPath`, `appVersion`, and `scoreModelVersion`. Comparisons and stars are calculated only inside the same scenario, run path, and score model.

## Appeals

Non-data scenarios use sample-level acceptable/reviewable answers. Data appeals use the actual stored box/semantic answer and its overlap-equivalent credit. A borderline annotation may support a guideline appeal; a technical appeal requires a recorded technical issue and cannot be inferred from a low aggregate task score.

## Contract history

Rejecting standardized terms is an event. If the participant reconsiders, the prior rejection evidence and log remain; a reconsideration event is appended. This preserves a coherent event history rather than retroactively deleting an action that occurred.

## Conclusion

The written conclusion is not automatically graded. The gate requires a minimally substantive text and supporting evidence, but no longer forces a counter-evidence item merely because several pieces of evidence exist. Evidence may be support, complication, or dual-role when the facts justify that classification.

## Routes and stale-page cleanup

`assets/js/core/routes.js` is the route source of truth. `scripts/generate-pages.mjs --check` verifies every generated shell and also scans for generated-looking top-level route shells that are no longer in the manifest. Generation removes such orphan shells safely. Current route HTML files are deployment shells and are not duplicate game logic.

## Verification

`npm run check` runs route, structural, regression, domain, semantic-invariant, and syntax checks. The semantic layer is intentionally limited to cross-module guarantees to avoid duplicating domain assertions. `npm run test:e2e` runs browser journeys and accessibility checks, including second-task pressed state.
