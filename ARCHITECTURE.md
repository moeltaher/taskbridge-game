# No Boss v3.2.0 Architecture

No Boss is a static multi-page training simulation for GitHub Pages. It has no backend, API, database, or application framework.

## Experience model

The simulation has two chapters:

1. **Worker experience** — choose a scenario, review the standardized agreement, enter or refuse the market, make offer decisions, perform tasks, experience algorithmic management, risk, review, settlement, and access outcomes.
2. **Researcher analysis** — review only the facts that actually occurred, classify evidence, answer relationship questions, map control and burden, write a conclusion, compare with the training reference, and connect the run to rights questions.

A contract refusal is a valid short branch: the participant may analyze the platform's gatekeeping power without fabricating tasks, monitoring, payment, or quality review.

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

`data-scenes.js` owns both the rendered road-scene geometry and `dataTargetForScene()`. The visual bounding-box target can therefore not drift independently from the SVG the participant sees.

The nonvisual route does not receive hidden target dimensions. It asks for both horizontal location and approximate size, and `semanticDataAnswer()` converts those participant choices into the same scoring space used by the visual route.

### Translation reference

The translation scenario exposes its client style guide before scoring. Preferred answers are therefore recoverable from visible instructions rather than a hidden preference table alone.

## State and storage

`STATE_SCHEMA_VERSION=3` adds, among other fields:

- `contractDeclineEnding`
- `riskSeed`
- `conclusionDualEvidence`

Old stored states are normalized against `freshState()` and old incompatible checkpoints are discarded. Storage still reconciles local/session candidates by monotonic revision before writes.

Archived results include `appVersion` and `scoreModelVersion`. Historical runs are compared only within the same scenario and score model.

## Risk model

Risk occurrence is reproducible per run. The deterministic roll is derived from a stable `riskSeed` created when the scenario starts plus scenario identity. Unrelated later choices such as taking a break, rejecting an offer, or obtaining a different task score do not silently alter whether an independent connection failure or revision request occurs.

A no-event result never creates incident evidence. Structural risk remains discussable through costs, workload, monitoring, and context, but an incident is evidence only when `occurred === true`.

## Access model

The final access decision uses final review severity and actual offer rejections. It does not reuse task score, current quality, temporary ranking, or acceptance rate after those factors have already affected earlier stages.

For `noWorkEnding`, rejection history may produce a warning, but it can never produce a restriction of a "current project" because no project was accepted.

## Appeals and remedy

An appeal requires a stated ground and changes the final review only when the ground matches a reviewable issue. If a successful appeal occurs after the disputed task was already used in an earlier opportunity-ranking event, the interface explicitly distinguishes:

- correcting the later review decision; and
- restoring an earlier lost opportunity.

The simulation does not silently pretend that successful late review automatically repairs every prior effect.

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

Scenario operating costs currently use `costModel: 'fixedShiftEstimate'`. The interface states that these are fixed training estimates, not minute-by-minute consumption calculations.

## Accessibility and browser verification

The visual annotation surface no longer claims `role="application"` because it does not implement a full keyboard drawing interface. An equivalent semantic form remains keyboard and screen-reader accessible.

Playwright runs desktop and mobile projects for Chromium and WebKit. `@axe-core/playwright` checks WCAG A/AA rules on key pages and the data task.

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
