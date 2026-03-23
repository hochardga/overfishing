# Phase 0 Foundation & Game Shell Design

**Date:** 2026-03-23
**Phase:** Phase 0 - Foundation & Game Shell
**Roadmap Source:** `docs/product-roadmap.md`

## Goal

Build a runnable static browser app for Definitely Not Overfishing with the core shell, routing, state architecture, save plumbing, and typed balance catalogs in place. The result should be demoable at the end of the phase even though deeper gameplay systems are still placeholders.

## Scope

Phase 0 covers only the roadmap tasks `TASK-001` through `TASK-008`:

- Scaffold the Vite + React + TypeScript app with linting, formatting, and testing.
- Add Tailwind and global token-driven styling.
- Provide `/`, `/play`, and `/settings` routes.
- Build the shared shell primitives and a responsive top-level play shell.
- Implement a versioned local save adapter and a persistent settings store.
- Add the deterministic game store, tick engine, and selectors.
- Seed static typed balance catalogs for phases, upgrades, regions, boats, and contracts.
- Add smoke tests for routing, save bootstrap, and tick progression.

Out of scope for this phase:

- Manual fishing interactions
- Upgrade purchasing behavior beyond static catalog availability
- Region depletion consequences beyond foundational data structures
- Analytics, deployment configuration, and public-launch concerns

## Product Constraints

The implementation must follow the PRD and vision constraints already reviewed:

- The app is fully client-side with no backend dependency.
- Progression must not depend on component-local timers.
- Save data must be versioned and validated before use.
- The visual language starts warm, layered, and tactile, with room for later operational hardening.
- The shell must privilege fast scanning and clear information hierarchy.
- Accessibility basics must be present from the start, including visible focus treatment and reduced-motion support hooks.

## Architecture

The Phase 0 architecture will mirror the PRD:

- `Vite + React + TypeScript` provide the application shell.
- `React Router` owns the three route-level surfaces.
- `Zustand + Immer` own deterministic app state for settings and the current run.
- `Zod` validates versioned save files read from `localStorage`.
- `Tailwind + CSS tokens` provide a token-driven design foundation shared by route shells and reusable primitives.
- Static economy catalogs live under `src/lib/economy` as typed lookup maps for later systems.

State advancement will be centralized in a store-level tick engine. The UI will observe selectors and store hooks rather than owning time-based logic itself.

## File Responsibilities

### Application Layer

- `src/main.tsx`: bootstraps React, router, and global styles.
- `src/App.tsx`: top-level app composition.
- `src/app/AppRouter.tsx`: client-side route registration.
- `src/app/routes/LandingPage.tsx`: landing hero and phase summary shell.
- `src/app/routes/PlayPage.tsx`: mounts the game shell and current foundational play view.
- `src/app/routes/SettingsPage.tsx`: mounts the settings panel shell.

### UI and Shell Components

- `src/components/ui/Button.tsx`: reusable button variants with token-backed classes and accessible focus states.
- `src/components/ui/Card.tsx`: shared surface wrapper for warm and industrial card treatments.
- `src/components/ui/StatusRail.tsx`: top-level summary strip for phase, elapsed time, cash, and shell status.
- `src/components/game/GameShell.tsx`: responsive three-column play layout that composes left, center, and right content areas.

### Styling

- `src/styles/tokens.css`: CSS custom properties for color, type, spacing, radius, shadow, motion, and layout limits.
- `src/styles/globals.css`: Tailwind layers, body defaults, background treatment, focus ring styling, and utility glue.
- `tailwind.config.ts`: token mapping into Tailwind theme extensions.

### Storage and State

- `src/lib/storage/saveSchema.ts`: Zod schemas and typed defaults for `SaveFile`, settings, meta progress, and run state.
- `src/lib/storage/migrations.ts`: version-aware migration entry points and corrupt-save fallback behavior.
- `src/lib/storage/saveAdapter.ts`: read/write bootstrap against `localStorage`, validation, and persistence helpers.
- `src/features/settings/settingsStore.ts`: persistent settings store backed by the save adapter.
- `src/lib/simulation/gameStore.ts`: deterministic run store for phase, elapsed time, resources, and foundational shell state.
- `src/lib/simulation/tickEngine.ts`: bounded tick advancement helpers driven by elapsed seconds.
- `src/lib/simulation/selectors.ts`: derived selectors for shell summaries and smoke-test assertions.

### Economy Catalogs

- `src/lib/economy/phases.ts`
- `src/lib/economy/upgrades.ts`
- `src/lib/economy/regions.ts`
- `src/lib/economy/boats.ts`
- `src/lib/economy/contracts.ts`

Each catalog file will export strongly typed data plus simple lookup helpers. The catalogs should model only enough approved balance scaffolding to support shell rendering and later extension.

### Tests

- `src/test/renderApp.test.tsx`: route and shell smoke tests.
- `src/test/gameStore.test.ts`: deterministic tick and selector coverage.
- `vitest.config.ts`: jsdom-based test configuration with path alias support.

## Data and Persistence Design

The save shape will implement the PRD `version: 1` model with these guarantees:

- A fresh save can be bootstrapped when no save exists.
- Settings always exist, even if the run is `null`.
- Invalid or corrupt saves preserve recoverable settings when possible and otherwise fall back to a fresh default payload.
- Migration plumbing exists even though Phase 0 supports only version `1`.

Phase 0 will create foundational defaults for:

- `meta`
- `settings`
- a starter `run` with `quietPier`, warm UI tone, starter region visibility, and zeroed inventory/resources

The save adapter will expose focused functions for loading, saving, creating a fresh save, and normalizing potentially invalid payloads. Storage keys and version handling will live in one place to avoid drift.

## Simulation Design

The deterministic store will use pure advancement helpers:

- The store holds the current run snapshot and exposes actions such as `tick(seconds)` and `resetRun()`.
- `tickEngine.ts` applies bounded elapsed-time changes to core run counters without any DOM involvement.
- Selectors derive shell-facing data like formatted elapsed time, unlocked tab labels, and starter resource summaries.

Phase 0 will keep the simulation intentionally small:

- advance `elapsedSeconds`
- keep region and resource structures stable
- support predictable selector updates under tests

No feature-specific reducers from later phases will be introduced early.

## UI Design

The initial shell will express the reviewed design direction:

- Warm, low-chrome surfaces for landing and early play areas
- Layered cards and soft shadows rather than heavy borders
- `Space Grotesk`, `Plus Jakarta Sans`, and `IBM Plex Mono` applied through CSS variables and Tailwind tokens
- A 12-column desktop shell collapsing to a single-column layout under `960px`
- A status rail that is readable first and decorative second

The `/play` route will show a credible operational shell even before gameplay depth exists:

- Left column: introductory card and starter status cues
- Center column: active panel placeholder backed by real store state
- Right column: operations and future-system placeholders

This keeps the phase demoable without inventing mechanics outside roadmap scope.

## Verification Strategy

Phase 0 verification will follow the roadmap and TDD expectations:

- Task 1 verifies `npm run dev`, `npm run lint`, and `npm run test`.
- Styling and routing changes are covered by targeted component and route smoke tests.
- Save bootstrap and settings persistence are exercised in tests and by store-level verification.
- Tick progression is covered by deterministic unit tests against the game store and selectors.
- Final phase verification includes lint, tests, and production build.

## Risks and Mitigations

- Risk: overbuilding future gameplay systems during foundation work.
  Mitigation: keep reducers, selectors, and catalogs narrow and phase-scoped.

- Risk: save schema drift between stores and UI.
  Mitigation: define defaults and Zod schemas in one storage module and import types from there.

- Risk: the play shell looks generic or too harsh too early.
  Mitigation: encode the warm token palette first and reserve industrial treatment for selective surfaces only.

- Risk: timers become component-owned as the UI expands.
  Mitigation: route all elapsed-time advancement through the store tick engine from the start.

## Implementation Readiness

This scope is focused enough for a single implementation plan and a single feature branch. The work breaks cleanly into app scaffolding, shell UI, persistence/state, catalog seeding, and smoke-test coverage without requiring backend services or multi-phase decomposition.
