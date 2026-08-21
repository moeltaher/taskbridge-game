# No Boss v3.1.0 Architecture

No Boss is a static multi-page training simulation designed for GitHub Pages. It does not require a backend, database, framework, API, or build-time server.

## Experience model

The experience is split into two explicit chapters:

1. **Worker shift** — scenario selection, agreement, marketplace, task execution, algorithmic management, work-related risk, quality review, settlement, and the final access decision.
2. **Shift analysis** — case file, evidence classification, relationship questions, power mapping, participant conclusion, result, and rights discussion.

Worker progress reaches 100% at the end of `/access/`. Researcher progress then starts independently rather than pretending that the analysis section is only the last few percent of the experience.

## Public routes

- `/` — landing page and resume/new-session controls
- `/scenario/` — worker/scenario selection
- `/onboarding/` — service-provider agreement and pre-work context, including a real decline path
- `/work/` — marketplace, unpaid market/search time, task execution, first-task result, or a valid no-work ending
- `/management/` — ranking, second offer, task/monitoring decisions
- `/risk/` — contingent work-related risk and extra-work-time impact
- `/dispute/` — first review, reasoned optional second review, and final quality outcome
- `/payment/` — payment/value distribution
- `/access/` — final access decision and worker-to-researcher transition
- `/investigation/` — case file, evidence sorting, relationship questions
- `/power/` — auto-balanced 100-point power map
- `/conclusion/` — participant conclusion with supporting and counter-evidence
- `/result/` — concise dashboard plus expandable analytical detail
- `/rights/` — rights discussion personalized to events in the run

The router accepts clean GitHub Pages paths such as `/work/` and explicit document paths such as `/work/index.html`.

## Source structure

### `assets/js/core/`

- `config.js` — application name and current release label.
- `routes.js` — route manifest, stages, chapter-specific progress, titles, public-entry status, researcher mode, and stage-default routes.
- `state.js` — versioned live-state schema, normalization/migration, stale-tab synchronization, checkpoints, transaction-style commits, logs, time buckets, and navigation state.
- `storage.js` — guarded local/session storage, revision-aware state selection, latest-state snapshot access, compact archived results, and result retrieval.
- `ui.js` — shared shell, chapter progress, desktop state summary, compact mobile summary, and reusable helpers.
- `bootstrap.js` — route validation, resume/redirect behavior, shell loading, and page-controller loading.
- `html.js` — HTML/attribute escaping helpers.
- `power-scoring.js` — tie-aware qualitative power-map helpers based on leaders and strongest groups rather than hidden exact percentages.

### `assets/js/domain/`

Domain modules contain simulation rules independent from the DOM:

- `work.js` — acceptance rate, image IoU, partial-credit task scoring, and first-task outcome.
- `management.js` — managed access, second-offer logic, second-task completion, and the break decision.
- `risk.js` — reproducible contingent risk selection and time/stress transition; structural risk is not treated as an inevitable incident.
- `dispute.js` — initial review severity, explicit appeal grounds, second-review effect, hold/penalty rules, appeal cost, and final review outcome.
- `payment.js` — settlement and worker economic outcome.
- `access.js` — final restriction/suspension decision using only independent final factors.
- `evidence.js` — normalized evidence text and accepted evidence classifications.
- `questions.js` — relationship questions derived against the same authority model used by the power map.
- `analysis.js` — power-map completion and final analytical score.

The final access decision deliberately does **not** reuse current quality, task score, acceptance rate, or the temporary access number after those facts have already influenced earlier stages. It uses the final quality-review severity and the run's rejection record, avoiding duplicate counting of the same event. The earlier opportunity-ranking event is recorded separately as `opportunityRankingDecision`, so rights explanations can distinguish it from the final access decision.

### `assets/js/data/`

- `scenarios.js` — worker facts, explicit final-access thresholds, costs, mechanisms, and content warnings.
- `parties.js` — party identifiers, Arabic labels, and six power-map axes.
- `authority-model.js` — the single distribution source from which primary authority is derived.
- `power-targets.js` — reference relative power distributions derived from the authority model.
- `question-references.js` — accepted primary-authority answers derived from the same model.
- `evidence-templates.js` — evidence descriptions and accepted classifications. Contract wording is contextual evidence rather than proof of actual independence.
- `samples.js` — moderation, AI, and translation samples using preferred and defensible alternative answers.

### `assets/js/pages/`

Each page controller reads state, renders the current task/event/decision/result, binds user interactions, calls domain rules, commits the state transition, and navigates to the next route. Page modules do not duplicate settlement, access, dispute, or scoring rules owned by `domain/`.

## Simulation invariants

- Offer size and the number of samples actually completed are aligned.
- A participant can reject all visible offers and finish a valid no-work shift. The game must not fabricate a task, dispute, payment, or quality outcome for that branch.
- Time spent browsing and deciding in the marketplace is recorded as `marketTime` even when the shift ends without paid work.
- The temporary access score is used to determine which subsequent opportunity appears and is stored as a distinct event. Completing the second task no longer receives an unused synthetic access bonus.
- The two data-labeling tasks preserve the same visual bounding-box and nonvisual semantic modes.
- An appeal is a real second review: it requires a stated ground and changes the result only when that ground is relevant to a reviewable error.
- Risk is structural but incidents are contingent. A run may validly reach the risk stage without adding an incident, extra minutes, or extra stress.
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

The map represents 100 points of authority across worker, platform, client, and mediator for each axis. The participant uses range controls; changing one party automatically redistributes the remaining points so the total remains 100. The numeric values are an interaction aid, not hidden answer keys.

Scoring is qualitative and relative: 65% of each axis credit compares the leading party/set, and 35% compares the strongest two-level group. Exact percentage proximity is not graded.

## Result and archive

The result opens with a compact dashboard: analytical score, economic net, task time, market/search time, extra work-related time, final workload, and account-access outcome. Detailed material lives in expandable sections. The participant's conclusion is shown with evidence explicitly selected to support it and evidence selected to limit or complicate it.

Archived results contain only compact comparison fields. The home page groups them by `scenarioName`; stars are only calculated inside runs of the same scenario, and shorter time is not automatically labeled better because it may reflect skipped breaks or different extra-work events.

## Storage and navigation

The live state is stored under `no_boss_state`; compact archived results use `no_boss_results`. Durable `localStorage` and tab-scoped `sessionStorage` are guarded and reconciled by monotonic `storageRevision` plus `storageWriterId`.

The current schema is versioned by `STATE_SCHEMA_VERSION`. Saved states are normalized against `freshState()` so newly added arrays, objects, time buckets, and fields exist after upgrades; checkpoints from an older schema are discarded because their snapshots cannot be assumed compatible. Before writes/navigation, a tab adopts a newer persisted state written by another tab instead of overwriting it from a stale revision.

Moving into a route records a checkpoint. In-game Back restores the checkpoint snapshot rather than relying on browser history.

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
- cross-component semantic invariants;
- JavaScript syntax;
- desktop and mobile Playwright journeys;
- horizontal overflow and visual-review screenshots.

Use `npm run check` for non-browser checks and `npm run test:e2e` for the browser suite.
