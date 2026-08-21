# No Boss v3.0.2 Architecture

No Boss is a static multi-page application designed for GitHub Pages. It does not require a backend, database, framework, or build-time server.

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

The router accepts both clean GitHub Pages paths such as `/work/` and explicit document paths such as `/work/index.html`.

## Source structure

### Core

`assets/js/core/config.js` is the single source for application, result, scoring, and time-model version constants.

`assets/js/core/routes.js` is the single source for route metadata: slugs, stage numbers, progress, titles, public-entry status, researcher/worker mode, and the default route for each stage.

`assets/js/core/state.js` owns the live game-state schema, checkpoints, logs, derived time buckets, and state persistence entry points. `storage.js` owns browser persistence and archived results. `ui.js` owns the shared shell, progress, stats, and presentation helpers. `bootstrap.js` resolves the current route and loads its page controller.

`power-scoring.js` owns the reusable tie-aware scoring helpers for the power map.

### Domain

`assets/js/domain/` contains pure simulation rules that can be tested without the DOM. Payment settlement and the final access decision already live here. Other simulation rules should move into this layer as they are refactored.

### Data

`assets/js/data/scenarios.js` remains the current source for scenario facts, work samples, evidence metadata, scoring references, and target power distributions. These concerns may be split into smaller data modules when that reduces duplication without changing behavior.

### Pages

Each file under `assets/js/pages/` owns one logical route and should primarily handle rendering and user interaction. New business rules should not be embedded in page controllers when they can be expressed as pure domain functions.

### CSS

CSS is split into `base.css`, `layout.css`, `components.css`, and `game.css`. Shared visual rules should stay in these layers rather than being duplicated across pages.

## State, storage and navigation

The current game state is persisted under `no_boss_v3_state`, and archived results use `no_boss_v3_results`. Compatible current-version state stored under the former TaskBridge v2 key can be migrated into the current slot; incompatible sessions remain separate.

Game-state writes target both `localStorage` and `sessionStorage`. `localStorage` is the durable store; `sessionStorage` is a tab-scoped fallback when durable storage cannot be written. Each saved state carries a monotonically increasing `storageRevision`, and reads select the newest valid copy rather than blindly preferring one backend. Access to either Web Storage API is guarded because some browser/privacy policies can throw before a storage operation begins.

Archived comparison results require durable `localStorage`. A tab-only result is not reported as successfully archived.

Moving between route pages does not lose the session. The in-game Back control restores a checkpoint rather than only displaying an old page, so later decisions are undone when the participant intentionally goes back. Back is disabled on landing and scenario-selection pages. Resume preserves a matching non-public route, including `/rights/`; stale routes are repaired using the route manifest and saved stage.

If only session-scoped persistence is available, the interface warns the participant and the `beforeunload` handler requests confirmation before leaving where the browser permits it.

## Power-map scoring

The power map starts at an equal 25/25/25/25 distribution for display only. A participant must edit each axis before it can be approved. Scoring compares the exact top-leader set plus a tie-aware top group, so a four-way tie does not receive leader credit merely because it contains the reference leader.

Archived results include an internal scoring version. Results created by an older scoring method remain stored but are excluded from direct comparison with results created by the current scoring method.

## Development and release checks

Run before release:

```bash
node scripts/structural-check.mjs
node scripts/check.mjs
node scripts/domain-check.mjs
```

Then run `node --check` on JavaScript files changed in the release. `.github/workflows/check.yml` runs the structural, regression, domain, and syntax checks automatically on pushes and pull requests.

For GitHub Pages deployment, publish the repository structure intact: the root `index.html`, `.nojekyll`, `assets/`, and every route directory are required. See `DEPLOY_GITHUB_AR.txt`.
