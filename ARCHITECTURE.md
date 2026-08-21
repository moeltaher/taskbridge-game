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

`assets/js/data/scenarios.js` is the source of scenario facts, work samples, evidence metadata, scoring references, and target power distributions.

`assets/js/core/state.js` owns the game-state schema, checkpoints, logs, and shared numeric helpers. `storage.js` owns browser persistence. `routes.js` owns URL mapping. `ui.js` owns the shared header, progress, stats, and reusable presentation helpers. `power-scoring.js` owns tie-aware relative scoring for the power map. `bootstrap.js` loads the controller for the current route.

Each file under `assets/js/pages/` owns one logical route. This is the primary maintenance boundary: editing the payment experience should normally require changes only in `pages/payment.js`; editing risks should normally require changes only in `pages/risk.js`; adding or changing a scenario should normally start in `data/scenarios.js`.

CSS is split into `base.css`, `layout.css`, `components.css`, and `game.css`.

## State, storage and navigation

The current game state is persisted under `no_boss_v3_state`. Settings use `no_boss_v3_settings`, and archived results use `no_boss_v3_results`. Compatible v3 state stored under the former TaskBridge v2 key can be migrated into the current slot; incompatible sessions remain separate.

Game-state writes target both `localStorage` and `sessionStorage`. `localStorage` is the durable store; `sessionStorage` is a tab-scoped fallback when durable storage cannot be written. Each saved state carries a monotonically increasing `storageRevision`, and reads select the newest valid v3.0.2 copy rather than blindly preferring one backend. Access to either Web Storage API is guarded because some browser/privacy policies can throw before a storage operation begins.

Archived comparison results are different from live game state: they require durable `localStorage`. A tab-only result is not reported as successfully archived.

Moving between route pages does not lose the session. The in-game Back control restores a checkpoint rather than only displaying an old page, so later decisions are undone when the participant intentionally goes back. Back is disabled on the landing and scenario-selection pages to avoid mutating a saved run from a public entry page. Resume preserves the current non-public route when it matches the saved stage, including `/rights/`; if a saved route is stale or points to a public entry page during an active run, the stage determines the safe resume route.

The No Boss logo returns to the landing page without deleting the saved session. “Start over” clears the current v3 session.

## Power-map scoring

The power map starts at an equal 25/25/25/25 distribution for display only. A participant must edit each axis before it can be approved. Scoring compares the exact top-leader set plus a tie-aware top group, so a four-way tie does not receive leader credit merely because it contains the reference leader.

Archived results include an internal scoring version. Results created by an older scoring method remain stored but are excluded from direct comparison with results created by the current scoring method.

## Development and release checks

1. Keep scenario facts in `assets/js/data/scenarios.js`; do not duplicate scenario data in page controllers.
2. Keep route-specific behavior in its matching `assets/js/pages/<route>.js` file.
3. Keep generic storage/state/navigation behavior in `assets/js/core/`.
4. Keep reusable scoring logic in a core module with direct tests.
5. Do not duplicate shared visual rules inside route modules; use the CSS layers.
6. Any new public logical phase should receive a route and a page controller.
7. Run `python scripts/check.py` and `node scripts/check.mjs` before release, then run `node --check` on changed JavaScript files.
8. `.github/workflows/check.yml` runs those structural, regression, and syntax checks automatically on pushes and pull requests; a failing regression check should block release until resolved.

For GitHub Pages deployment, publish the repository structure intact: the root `index.html`, `.nojekyll`, `assets/`, and every route directory are required. See `DEPLOY_GITHUB_AR.txt`.
