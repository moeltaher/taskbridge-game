# No Boss v3.0.2 Architecture

No Boss is a static multi-page training simulation designed for GitHub Pages. It does not require a backend, database, framework, API, or build-time server.

## Experience model

The experience is split into two explicit chapters:

1. **Worker shift** — scenario selection, agreement, marketplace, task execution, algorithmic management, work-related risk, quality review, settlement, and the final access decision.
2. **Shift analysis** — case file, evidence classification, relationship questions, power mapping, participant conclusion, result, and rights discussion.

Worker progress reaches 100% at the end of `/access/`. Researcher progress then starts independently rather than pretending that the analysis section is only the last few percent of the experience.

## Public routes

- `/` — landing page and resume/new-session controls
- `/scenario/` — worker/scenario selection
- `/onboarding/` — service-provider agreement and pre-work context
- `/work/` — marketplace, task execution, first-task result, or a valid no-work ending
- `/management/` — ranking, second offer, task/monitoring decisions
- `/risk/` — work-related risk and extra-work-time impact
- `/dispute/` — first review, optional second review, and final quality outcome
- `/payment/` — payment/value distribution
- `/access/` — final access decision and worker-to-researcher transition
- `/investigation/` — case file, evidence sorting, relationship questions
- `/power/` — auto-balanced 100-point power map
- `/conclusion/` — participant conclusion and selected supporting evidence
- `/result/` — concise dashboard plus expandable analytical detail
- `/rights/` — rights discussion personalized to events in the run

The router accepts clean GitHub Pages paths such as `/work/` and explicit document paths such as `/work/index.html`.

## Source structure

### `assets/js/core/`

- `config.js` — application name and current release label.
- `routes.js` — route manifest, stages, chapter-specific progress, titles, public-entry status, researcher mode, and stage-default routes.
- `state.js` — live-state schema, checkpoints, transaction-style commits, logs, time buckets, and navigation state.
- `storage.js` — guarded local/session storage, revision-aware state selection, compact archived results, and result retrieval.
- `ui.js` — shared shell, chapter progress, desktop state summary, compact mobile summary, and reusable helpers.
- `bootstrap.js` — route validation, resume/redirect behavior, shell loading, and page-controller loading.
- `html.js` — HTML/attribute escaping helpers.
- `power-scoring.js` — tie-aware relative power-map helpers.

### `assets/js/domain/`

Domain modules contain simulation rules independent from the DOM:

- `work.js` — acceptance rate, image IoU, partial-credit task scoring, and first-task outcome.
- `management.js` — managed access, second-offer logic, second-task completion, and the break decision.
- `risk.js` — work-related risk event and time/stress transition.
- `dispute.js` — initial review severity, second-review effect, hold/penalty rules, appeal cost, and final review outcome.
- `payment.js` — settlement and worker economic outcome.
- `access.js` — final restriction/suspension decision using only independent final factors.
- `evidence.js` — normalized evidence text and accepted evidence classifications.
- `questions.js` — relationship questions, including shared platform/client authority where supported by a scenario.
- `analysis.js` — power-map completion and final analytical score.

The final access decision deliberately does **not** reuse current quality, task score, acceptance rate, or the temporary access number after those facts have already influenced earlier stages. It uses the final quality-review severity and the run's rejection record, avoiding duplicate counting of the same event.

### `assets/js/data/`

- `scenarios.js` — worker facts, explicit final-access thresholds, costs, mechanisms, and content warnings.
- `parties.js` — party identifiers, Arabic labels, and six power-map axes.
- `power-targets.js` — reference relative power distributions.
- `question-references.js` — accepted reference answers by scenario type.
- `evidence-templates.js` — evidence descriptions and accepted classifications. Contract wording is contextual evidence rather than proof of actual independence.
- `samples.js` — moderation, AI, and translation samples using preferred and defensible alternative answers.

### `assets/js/pages/`

Each page controller reads state, renders the current task/event/decision/result, binds user interactions, calls domain rules, commits the state transition, and navigates to the next route. Page modules do not duplicate settlement, access, dispute, or scoring rules owned by `domain/`.

## Simulation invariants

- Offer size and the number of samples actually completed are aligned.
- A participant can reject all visible offers and finish a valid no-work shift. The game must not fabricate a task, dispute, payment, or quality outcome for that branch.
- The temporary access score is used to determine which subsequent opportunity appears. Completing the second task no longer receives an unused synthetic access bonus.
- An appeal is a real second review: when applicable it changes the final review severity, which changes the hold/quality consequence and is the severity later consumed by the final access decision.
- Breaks affect shift time and simulated workload only; they are not silently converted into pay or access penalties.
- `dependency` remains narrative context for the economic importance of platform access and is not a hidden scoring or punishment factor.

## Interaction and visual language

Reusable presentation conventions distinguish:

- **Task** — something the participant must do.
- **Decision** — a choice with explicit consequences.
- **Event** — something that happened because of prior work or platform operation.
- **Outcome** — the recorded effect of a decision/event.

Worker, platform, client, and payment mediator retain stable visual identities across pages. On mobile, the full state summary is collapsed by default into a compact horizontal strip so the current task remains visible in the initial viewport.

## Power map

The map still represents 100 points of authority across worker, platform, client, and mediator for each axis. The participant now uses range controls; changing one party automatically redistributes the remaining points so the total remains 100. This removes manual arithmetic and the former per-axis approval step.

Scoring remains relative: it compares the exact leading set and a tie-aware top group instead of requiring numeric agreement with a hidden target.

## Result and archive

The result opens with a compact dashboard: analytical score, economic net, task time, extra work-related time, final workload, and account-access outcome. Detailed material lives in expandable sections. The participant's own conclusion and the evidence explicitly selected to support it are shown together.

Archived results contain only compact comparison fields. The home page groups them by `scenarioName`; stars are only calculated inside runs of the same scenario, and shorter time is not automatically labeled better because it may reflect skipped breaks or different extra-work events.

## Storage and navigation

The live state is stored under `no_boss_state`; compact archived results use `no_boss_results`. Durable `localStorage` and tab-scoped `sessionStorage` are guarded and reconciled by monotonic `storageRevision` plus `storageWriterId`.

Moving into a route records a checkpoint. In-game Back restores the checkpoint snapshot rather than relying on browser history. There is one current state/result schema and no legacy migration layer.

## Generated route shells and verification

Physical route directories stay committed for GitHub Pages, but their HTML shells are generated from `routes.js` and `config.js`:

```bash
node scripts/generate-pages.mjs
```

CI validates:

- generated route shells;
- structural invariants;
- state/storage regressions;
- domain rules;
- JavaScript syntax;
- desktop and mobile Playwright journeys;
- horizontal overflow and visual-review screenshots.

Use `npm run check` for non-browser checks and `npm run test:e2e` for the browser suite.
