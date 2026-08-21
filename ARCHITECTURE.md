# No Boss v3.0.2 Architecture

No Boss is a static multi-page application designed for GitHub Pages. It does not require a backend, database, framework, API, or build-time server.

## Public routes

- `/` — landing page and resume/new-session controls
- `/scenario/` — worker/scenario selection
- `/onboarding/` — service-provider agreement
- `/work/` — marketplace, task execution, first-task result
- `/management/` — ranking, second offer, monitoring
- `/risk/` — work risk and extra-work-time impact
- `/dispute/` — quality dispute and appeal
- `/payment/` — payment/value distribution
- `/access/` — warning/project restriction/account suspension
- `/investigation/` — case file, evidence sorting, relationship questions
- `/power/` — 100-point power map
- `/conclusion/` — participant conclusion and optional evidence selection
- `/result/` — analysis result and debrief
- `/rights/` — labor-rights mapping

The router accepts clean GitHub Pages paths such as `/work/` and explicit document paths such as `/work/index.html`.

## Source structure

### `assets/js/core/`

Core modules own application infrastructure rather than simulation rules.

- `config.js` — single source for application, result, scoring, and time-model versions.
- `routes.js` — single route manifest for slugs, stages, progress, titles, public-entry status, researcher mode, and stage-default routes.
- `state.js` — live state schema, migration, checkpoints, transaction-style state commits, logs, derived time buckets, and navigation-state operations.
- `storage.js` — guarded `localStorage`/`sessionStorage` access, state selection, revision metadata, legacy migration, compact archived results, and result retrieval.
- `ui.js` — shared shell, progress, summary stats, and reusable presentation helpers.
- `bootstrap.js` — route validation, safe resume/redirect behavior, shell loading, and page-controller loading.
- `html.js` — shared HTML/attribute escaping helpers.
- `power-scoring.js` — tie-aware relative power-map helpers.

### `assets/js/domain/`

Domain modules contain simulation and analysis rules that do not depend on the DOM. They are directly testable from Node.

- `work.js` — acceptance-rate calculation, bounding-box IoU, task scoring, and first-task outcome.
- `management.js` — managed-access calculation, second-offer generation/decision/completion, and monitoring-break outcome.
- `dispute.js` — dispute severity, hold/penalty rules, appeal cost, final dispute outcome, and published translation reference selection.
- `payment.js` — payment settlement and worker economic outcome.
- `access.js` — final restriction/suspension decision and factor scoring.
- `evidence.js` — normalized evidence text and accepted evidence classifications.
- `questions.js` — relationship-question definitions and accepted reference answers.
- `analysis.js` — power-map completion and final analytical score.

New simulation rules should be added here rather than embedded in page rendering code.

### `assets/js/data/`

Data is split by concern rather than being kept in one large file:

- `scenarios.js` — worker/scenario facts and a compatibility re-export surface for existing consumers.
- `parties.js` — party identifiers, Arabic labels, and the six power-map axes.
- `power-targets.js` — reference power distributions used by analytical scoring and feedback.
- `question-references.js` — accepted reference answers by scenario type.
- `evidence-templates.js` — evidence titles, default descriptions, and accepted classifications.
- `samples.js` — moderation, AI, and translation task samples.

These modules contain data only; they do not own browser persistence, navigation, rendering, or simulation side effects.

### `assets/js/pages/`

Each page module owns one logical route. Page modules should primarily:

1. read current state and scenario data;
2. render the route UI;
3. bind user interactions;
4. call pure domain functions for calculations;
5. commit the resulting state transition;
6. navigate to the next route.

They should not duplicate scoring, settlement, access, dispute, or evidence rules already owned by `domain/`.

### `assets/css/`

- `base.css` — variables and element defaults.
- `layout.css` — application shell, responsive layout, top bar, sidebar, progress, and shared shift summary.
- `components.css` — reusable panels, grids, buttons, notices, metrics, pills, receipts, and generic visual components.
- `game.css` — game-specific cards, tasks, annotation UI, investigation, power map, rights, result visuals, and route-specific responsive rules.

Static reusable visual rules belong in CSS. Inline styles are reserved for genuinely dynamic values such as power-segment widths and annotation-box geometry.

## State transactions

`state.js` exposes `commit()` as the preferred write path for a user action that changes several state concerns together. A transaction can combine:

- state-field changes;
- newly collected evidence;
- one timeline/log entry;
- acceptance-rate recalculation.

The operation persists once after all changes have been applied. `patch()`, `addEvidence()`, `addLog()`, and `recalcAcceptance()` remain small compatibility wrappers around the same commit mechanism for simple or not-yet-migrated callers.

This avoids generating several storage revisions for one logical user action and reduces partially-applied transitions. Entering a route also records its checkpoint and current page with one persistence write, and re-entering the current page is a no-op.

## Storage and multi-tab behavior

The current game state is stored under `no_boss_v3_state`; archived results use `no_boss_v3_results`.

Live-state writes target both `localStorage` and `sessionStorage`:

- `localStorage` is the durable shared copy;
- `sessionStorage` is a tab-scoped copy and fallback when durable storage is unavailable.

Every saved state carries a monotonically increasing `storageRevision` and a tab-scoped `storageWriterId`. Before a new state is persisted, state code reads the latest shared revision and advances from the highest known value. When local and session copies have equal revisions but were written by different writers, the current tab's session copy wins rather than being silently replaced by another tab's equal-revision state.

All Web Storage access is guarded because privacy/browser policies can throw before a read or write begins. When only session storage works, the UI warns the participant and `beforeunload` requests confirmation where the browser permits it.

Archived comparison results are intentionally different: they require durable `localStorage` and store only the fields needed by the comparison UI. Free-text analysis, investigation answers, and full power-map values are not retained in the archive. A tab-only result is not reported as successfully archived.

Compatible current-version state stored under the former TaskBridge v2 key can be migrated into the current slot. Incompatible sessions remain separate.

## Navigation and checkpoints

Moving between route pages does not lose the session. The in-game Back control restores a state checkpoint rather than merely loading the previous URL, so later decisions are undone when the participant intentionally goes back.

Back is disabled on landing and scenario-selection pages. Resume preserves the saved non-public route when it matches the current stage, including `/rights/`; stale or mismatched routes are repaired using the shared route manifest and saved stage.

## Power-map scoring

The power map starts at an equal 25/25/25/25 distribution for display only. A participant must edit each axis before it can be approved. Scoring compares the exact top-leader set plus a tie-aware top group, so a four-way tie does not receive leader credit merely because it contains the reference leader.

Archived results include an internal scoring version. Results created by an older scoring method remain stored but are excluded from direct comparison with results created by the current scoring method.

## Generated route shells

The physical route directories remain checked into the repository for GitHub Pages and direct linking, but their HTML shells are generated from the route manifest and application version:

```bash
node scripts/generate-pages.mjs
```

CI runs `node scripts/generate-pages.mjs --check` so a route title, slug, or version cannot silently drift from `core/routes.js` and `core/config.js`.

## Development and release checks

The project uses Node-only checks:

```bash
node scripts/generate-pages.mjs --check
node scripts/structural-check.mjs
node scripts/check.mjs
node scripts/domain-check.mjs
```

Then run `node --check` on JavaScript files. `.github/workflows/check.yml` performs route-shell, structural, regression, domain, and syntax checks automatically on pushes and pull requests.

The check layers have distinct roles:

- `generate-pages.mjs --check` — generated route shell drift;
- `structural-check.mjs` — required files and architectural guardrails;
- `check.mjs` — route/state/storage/navigation regression cases;
- `domain-check.mjs` — pure simulation and scoring rules.

For GitHub Pages deployment, publish the repository structure intact: root `index.html`, `.nojekyll`, `assets/`, and every route directory are required. See `DEPLOY_GITHUB_AR.txt`.
