# No Boss v3.3.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages. It has no backend, API, database, or application framework.

## Experience model

The simulation has two chapters:

1. **Worker experience** — choose a scenario, review the standardized agreement, enter or refuse the market, make offer decisions, perform tasks, experience algorithmic management, risk, review, settlement, and access outcomes.
2. **Researcher analysis** — review only the facts that actually occurred, classify evidence, answer relationship questions, map control and burden, write a conclusion, compare with the training reference, and connect the run to rights questions.

A contract refusal is a valid short branch: the participant may analyze the platform's gatekeeping power without fabricating tasks, monitoring, payment, or quality review.

Country and city names provide narrative and socio-economic context only. The simulation does not implement national labor law or infer legal status from the named jurisdiction.

## Model boundaries

### Control is not burden

`assets/js/data/parties.js` assigns every analytical axis a `metricType`.

- `control`: price, allocation, monitoring, quality, termination/access.
- `burden`: costs and risks.

The same 100-point interaction is used visually, but the meaning changes by axis. A high worker value on the risk axis means the worker bears more burden; it does **not** mean the worker has more authority.

### One source for reference logic

- `authority-model.js` stores relative reference distributions.
- `question-references.js` derives accepted leaders from that model.
- `power-targets.js` derives power-map targets from the same model.
- `authority-rationales.js` explains why each scenario/axis reference is structured that way.

The result page shows those rationales rather than presenting an unexplained answer key.

### Data-task geometry

`data-scenes.js` owns both the rendered road-scene geometry and `dataTargetForScene()`. The visual bounding-box target cannot drift independently from the SVG the participant sees.

The nonvisual route receives an accessible geometric description of the same scene and asks for horizontal start region and approximate width. The description does not repeat the answer-option labels verbatim. `semanticDataAnswer()` converts those choices into the same scoring space used by the visual route.

### Translation reference

The translation scenario exposes its client style guide before scoring. Preferred answers are therefore recoverable from visible instructions rather than a hidden preference table alone.

## State and storage

`STATE_SCHEMA_VERSION=4` treats a live simulation session as versioned application state. Live-state compatibility is determined by:

- `schemaVersion`, which represents the structure and runtime semantics of the saved session; and
- `scoreModelVersion`, which prevents a saved analytical result from crossing incompatible scoring semantics.

`appVersion` is still stored on live state for provenance and diagnostics, but a patch/release-number change alone does not destroy an otherwise compatible session.

Before loading or synchronizing state, incompatible localStorage/sessionStorage candidates are pruned **individually**. A stale candidate in one storage area therefore cannot force deletion of a compatible candidate in the other. Incompatible state is never partially merged into a current run, preventing old payment, access, review, or result fields from leaking into current semantics.

Every persisted live state also records:

- `storageRevision`;
- `storageUpdatedAt`;
- `storageWriterId`.

When local and session candidates compete, they are ordered deterministically by revision, timestamp, then writer ID. Tabs synchronize against that ordering before committed writes.

High-frequency editing uses transient in-memory state. Power sliders and conclusion text do not serialize the full session on every pointer movement or keystroke; they flush on change/blur, navigation, explicit completion, page hide, or unload.

The current model intentionally removes obsolete live-state fields that no longer have consumers, including `powerDraft` and `reviewTaskScore`.

Archived results are separate from the live session and include `appVersion` and `scoreModelVersion`. Historical runs are compared only within the same scenario and score model. The archive is stored locally in the browser and can be deleted in full from the home page.

## Risk model

Risk occurrence is reproducible per run. The deterministic roll is derived from a stable `riskSeed` created when the scenario starts plus scenario identity. Unrelated later choices such as taking a break, rejecting an offer, or obtaining a different task score do not silently alter whether an independent connection failure or revision request occurs.

A no-event result never creates incident evidence. Structural risk remains discussable through costs, workload, monitoring, and context, but an incident is evidence only when `occurred === true`.

The moderation wellbeing event has an additional eligibility condition: at least one completed sample must actually contain or be reviewably classifiable as harassment/abuse or a threat. The simulation therefore does not claim harmful-content exposure that was absent from the completed sample set.

## Access model

The final access decision uses final review severity and actual offer rejections. It does not reuse task score, current quality, temporary ranking, or acceptance rate after those factors have already affected earlier stages.

For `noWorkEnding`, rejection history may produce a warning, but it can never produce a restriction of a "current project" because no project was accepted.

## Appeals and remedy

An appeal requires a stated ground and changes the final review only when the ground matches a reviewable issue. If a successful appeal occurs after the disputed task was already used in an earlier opportunity-ranking event, the interface explicitly distinguishes correcting the later review decision from restoring an earlier lost opportunity.

## Evidence and analysis

Quality is a distinct evidence dimension rather than part of monitoring.

The party-identification question is orientation-only and excluded from the analytical score. The numerical result is named **reference-alignment score** and contains:

- 30 points: scored relationship questions;
- 30 points: evidence classification by analytical dimension;
- 40 points: relative map alignment.

The written conclusion itself is not automatically graded. Evidence may be marked as supporting, complicating, or both supporting and complicating the conclusion, avoiding forced false balance.

## Economics and time

`marketTime`, task time, extra work time, and break time are all displayed wherever total shift time is explained.

A no-work run records zero task income and can show a zero hourly income over the search/decision time rather than treating the economic outcome as nonexistent.

Scenario operating costs use `costModel: 'fixedShiftEstimate'`. The interface states that these are fixed training estimates, not minute-by-minute consumption calculations.

## Accessibility and browser verification

The visual annotation surface does not claim `role="application"` because it does not implement a full keyboard drawing interface. An equivalent semantic form remains keyboard and screen-reader accessible.

Playwright runs desktop and mobile projects for Chromium and WebKit. `@axe-core/playwright` checks WCAG A/AA rules across the complete worker/researcher route journey: onboarding, work, management, risk, dispute, payment, access, investigation, power, conclusion, result, and rights, in addition to home/scenario and the data-task semantic controls.

## Route and legacy cleanup policy

HTML route shells are generated from `assets/js/core/routes.js`. The current repository should contain one runtime page module and one route shell for each manifest route, rather than parallel historical page implementations. Historical behavior belongs in Git history and the changelog, not in duplicate runtime pages or dead state fields.

## Verification layers

`npm run check` runs:

- route-shell drift checks;
- structural guards;
- state/storage regressions;
- domain rules;
- behavioral semantic invariants;
- JavaScript syntax checks.

`npm run test:e2e` runs browser journeys and accessibility checks.

CI installs dependencies from `package-lock.json` with `npm ci`, installs Chromium and WebKit, and runs the same verification layers.
