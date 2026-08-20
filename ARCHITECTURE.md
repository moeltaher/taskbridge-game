# TaskBridge v2 Architecture

TaskBridge v2 is a static multi-page application designed for GitHub Pages. It does not require a backend, database, framework, or build-time server.

## Public routes

- `/` — landing page and resume/new-session controls
- `/scenario/` — worker/scenario selection
- `/onboarding/` — service-provider agreement
- `/work/` — marketplace, task execution, first-task result
- `/management/` — ranking, second offer, monitoring
- `/risk/` — work risk and unpaid-time impact
- `/dispute/` — quality dispute and appeal
- `/payment/` — payment/value distribution
- `/access/` — warning/project restriction/account suspension
- `/investigation/` — case file, evidence sorting, relationship questions
- `/power/` — 100-point power map
- `/conclusion/` — participant conclusion and evidence selection
- `/result/` — analysis result and debrief
- `/rights/` — labor-rights mapping

## Source structure

`assets/js/data/scenarios.js` is the source of scenario facts, work samples, evidence metadata, scoring references, and target power distributions.

`assets/js/core/state.js` owns the game-state schema, checkpoints, logs, and shared numeric helpers. `storage.js` owns localStorage. `routes.js` owns URL mapping. `ui.js` owns the shared header, progress, stats, and reusable presentation helpers. `bootstrap.js` loads the controller for the current route.

Each file under `assets/js/pages/` owns one logical route. This is the primary maintenance boundary: editing the payment experience should normally require changes only in `pages/payment.js`; editing risks should normally require changes only in `pages/risk.js`; adding or changing a scenario should normally start in `data/scenarios.js`.

CSS is split into `base.css`, `layout.css`, `components.css`, and `game.css`.

## State and navigation

The game state is persisted in the browser under a v2-specific localStorage key. Moving between route pages does not lose the session. The in-game Back control restores a checkpoint rather than only displaying an old page, so later decisions are undone when the participant intentionally goes back.

The TaskBridge logo returns to the landing page without deleting the saved session. “Start over” clears the current v2 session.

## Development rules

1. Keep scenario facts in `assets/js/data/scenarios.js`; do not duplicate scenario data in page controllers.
2. Keep route-specific behavior in its matching `assets/js/pages/<route>.js` file.
3. Keep generic storage/state/navigation behavior in `assets/js/core/`.
4. Do not duplicate shared visual rules inside route modules; use the CSS layers.
5. Any new public logical phase should receive a route and a page controller.
6. Run `node --check` on all JavaScript files before release.
