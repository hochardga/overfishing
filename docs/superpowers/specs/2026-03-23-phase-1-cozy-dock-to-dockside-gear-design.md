# Phase 1 Cozy Dock To Dockside Gear Design

**Date:** 2026-03-23
**Phase:** Phase 1 - Cozy Dock To Dockside Gear
**Roadmap Source:** `docs/product-roadmap.md`

## Goal

Turn the placeholder play shell into a playable early prototype that reaches the first three phases through a readable manual loop, clear stock pressure, Quiet Pier upgrades, skiff trips, passive gear, dock bottlenecks, and one-time progression unlocks.

## Scope

Phase 1 covers roadmap tasks `TASK-009` through `TASK-016`:

- Manual casting with normal and perfect outcomes, cooldowns, and immediate cash feedback
- Early HUD presentation for cash, fish stock, cooldown, and stock pressure
- Quiet Pier upgrades and early phase-threshold checks
- Skiff Operator trips with fuel, hold capacity, and Kelp Bed routing
- Dock storage, decay, passive gear slots, and pause-on-full behavior
- Crab Pot, Longline, and helper automation cadence
- Phase unlock modals and progression summaries
- Reducer and selector tests that cover early-phase regression risks

Out of scope for this phase:

- Multi-boat fleet assignment and maintenance systems from Phase 2
- Processing, contracts, regions dashboard, and License Renewal
- Analytics, landing-page launch polish, and deployment work from Phase 3

## Product Constraints

The Phase 1 implementation must preserve these product and technical constraints from the PRD and vision docs:

- Manual interaction teaches the system; it should be satisfying early without depending on raw click spam.
- New systems must add one new tension at a time and keep bottlenecks legible.
- Catch, value, and stock pressure must be understandable from the UI without extra tutorial text.
- All gameplay mutations flow through a deterministic local command/query layer backed by pure reducers and selectors.
- Time-based systems must advance through the store tick path rather than component-local timers.
- The early shell stays warm and tactile even as later panels begin tightening toward operational density.

## Architecture

Phase 1 builds directly on the Phase 0 store foundation:

- `RunState` remains the single source of truth for gameplay.
- New mutations land in focused reducer modules under `src/lib/simulation/reducers`.
- Feature-level action helpers in `src/features/**` call reducer logic and write results back through the store.
- Selectors assemble UI-facing data so the shell stays declarative and thin.
- `tickEngine.ts` remains the central place where elapsed time advances cooldowns, stock regeneration, skiff motion, passive gear output, storage decay, and unlock checks.

The phase is best implemented in three chunks:

1. `TASK-009` to `TASK-011`: manual cast loop, early HUD, and Quiet Pier upgrades
2. `TASK-012` to `TASK-014`: skiff trips, storage/decay, passive gear, and helpers
3. `TASK-015` to `TASK-016`: unlock presentation, progression summaries, and regression coverage

## System Design

### Manual Fishing

Manual casts resolve as atomic commands:

- Validate cooldown before applying any reward
- Resolve `normal` or `perfect` outcome
- Calculate fish landed from the manual config plus earned bonuses
- Convert the catch directly into cash for the opening loop
- Reduce `pierCove` stock and update scarcity/catch-speed state
- Store the next cooldown and append any immediate feedback notification if needed

Manual casts should never write temporary state into the component tree. The component is responsible only for user interaction and brief visual feedback. Game state belongs in the run store.

### Stock Pressure

Each region already stores `stockCurrent`, `stockCap`, `catchSpeedModifier`, and `scarcityPriceModifier`. Phase 1 should make those live:

- Stock ratios determine catch-speed bands and price bands
- Lower stock should make the UI feel strained without fully blocking play
- The early HUD must show both stock level and its current pressure state
- Manual fishing and later skiff/passive systems should all consume the same stock model so depletion stays coherent

### Upgrades And Progression

Quiet Pier upgrades should be catalog-driven and command-driven:

- Affordability is checked against current cash
- Purchasing updates cash, unlock state, and any manual-fishing modifiers
- Unlock checks run after purchases and other relevant state changes
- Phase unlocks should only fire once and persist in save data

The first unlock path should keep the role-shift cadence readable:

- Quiet Pier sharpens the manual loop
- Skiff Operator introduces fuel, hold, and route choice
- Dockside Gear introduces storage pressure and passive timing

### Skiff Trips

The skiff system should feel like a new job, not just a bigger cast button:

- Trips consume fuel and add catch into hold over time
- Hold and fuel limits stop production visibly when reached
- Region assignment changes yield and payout characteristics
- Trip state advances through the deterministic tick engine

Skiff output can settle into dock storage or payout flows according to the phase task requirements, but it must surface its bottlenecks clearly.

### Storage, Gear, And Helpers

Dockside Gear should make pressure visible:

- Dock storage has a cap and a decay rule
- Full storage pauses passive gear instead of deleting output
- Gear slots limit passive expansion
- Crab Pot and Longline cadences should feel distinct
- Helper automation should own collection timing only after the relevant unlock exists

All passive behavior should derive from elapsed time and stored state, not ad hoc browser timers.

### Unlock Presentation

Unlocks must make the new management tension obvious:

- Each new phase surfaces one modal once
- Modals can be dismissed safely without losing unlock state
- Progress summaries should tell the player what changed and why the next bottleneck matters
- If multiple unlock thresholds are crossed together, ordering must remain deterministic

## File Responsibilities

### Gameplay Commands And Reducers

- `src/lib/simulation/reducers/manualFishing.ts`: cast resolution, cooldown enforcement, stock depletion, and cash reward calculation
- `src/lib/simulation/reducers/upgrades.ts`: upgrade purchase validation, affordability checks, and manual-loop modifiers
- `src/lib/simulation/reducers/skiffTrips.ts`: skiff assignment, hold, fuel, and trip-cycle progression
- `src/lib/simulation/reducers/storage.ts`: dock storage caps, decay, overflow handling, and pause rules
- `src/lib/simulation/reducers/passiveGear.ts`: gear cadence, collection windows, and passive output flow
- `src/lib/simulation/reducers/helpers.ts`: helper-owned collection timing and automation effects
- `src/lib/simulation/reducers/unlocks.ts`: phase thresholds, one-time unlock tracking, and modal queue behavior

### Feature Surfaces

- `src/features/fishing/CastButton.tsx`: manual-cast interaction and immediate reward feedback
- `src/features/fishing/fishingActions.ts`: thin command layer for cast interactions
- `src/components/game/EarlyHud.tsx`: early resource, stock, and cooldown overview
- `src/components/ui/MeterCard.tsx`: reusable meter presentation for stock, cooldown, and bottleneck states
- `src/features/upgrades/UpgradeShop.tsx`: Quiet Pier purchases and affordability state
- `src/features/fleet/SkiffPanel.tsx`: skiff operations and Kelp Bed trip controls
- `src/features/gear/GearPanel.tsx`: passive gear summary, slots, storage, and pause signals
- `src/features/gear/GearCard.tsx`: individual gear state and helper ownership presentation
- `src/components/game/PhaseUnlockModal.tsx`: one-time unlock messaging
- `src/components/game/ProgressSummary.tsx`: current bottlenecks, next unlock, and pace summary

### Shared Simulation And Data

- `src/lib/simulation/gameStore.ts`: additional command actions and deterministic state replacement points
- `src/lib/simulation/tickEngine.ts`: time advancement for cooldowns, skiff trips, passive output, storage decay, and unlock checks
- `src/lib/simulation/selectors.ts`: stock pressure, early HUD data, bottlenecks, unlock progress, and summary selectors
- `src/lib/economy/upgrades.ts`: fully encoded Quiet Pier, skiff, and gear upgrade definitions
- `src/lib/economy/regions.ts`: region balance values and stock-pressure band helpers

### Tests

- `src/test/manualFishing.test.ts`: cast outcomes, cooldown validation, stock pressure, and atomic reward updates
- `src/test/passiveGear.test.ts`: storage-blocked passive output, helper cadence, and pause behavior
- `src/test/unlocks.test.ts`: phase-threshold ordering, one-time modals, and dismissal safety
- existing render/store tests: updated to cover the live Phase 1 shell as needed

## Data And UI Flow

The main gameplay flow for the first chunk should be:

1. Player triggers `CastButton`
2. Feature action calls the manual-fishing reducer with `zoneHit` and `nowMs`
3. Reducer returns a `CommandResult` plus the next run state
4. Store writes the new run state atomically
5. Selectors derive updated cash, stock pressure, and cooldown messaging
6. HUD and summary surfaces rerender from selectors only

Later chunk systems should follow the same shape: feature action or tick event, reducer mutation, store write, selector read, UI rerender.

## Verification Strategy

Phase 1 must follow TDD task by task:

- Write the failing reducer or render test first
- Run the targeted test and confirm a real red state
- Add the minimal implementation to satisfy the requirement
- Re-run the targeted test, then the broader suite as the chunk stabilizes

Required verification themes:

- Manual fishing: normal vs perfect reward, cooldown enforcement, low-stock behavior, and atomic cash/stock updates
- HUD and selectors: stock pressure, cooldown visibility, and readable bottleneck summaries
- Upgrades: affordability, persistence, modifier application, and phase-threshold checks
- Skiff trips: fuel use, hold capacity, Kelp Bed routing, and payout behavior
- Storage and passive gear: decay, pause-on-full, helper automation cadence, and no silent fish loss
- Unlocks: one-time firing, deterministic ordering, and safe dismissal

## Risks And Mitigations

- Risk: UI state drifts from simulation state as interactivity grows.
  Mitigation: keep commands and selectors authoritative; components remain presentational.

- Risk: multiple timers emerge across components for cooldowns or passive systems.
  Mitigation: route every time-based change through `tickEngine.ts`.

- Risk: phase unlocks become noisy or fire out of order.
  Mitigation: centralize unlock checks and persist seen phases in `run.unlocks`.

- Risk: storage overflow silently destroys resources.
  Mitigation: enforce pause-on-full and cover it with dedicated regression tests.

- Risk: the opening loop feels too abstract or too punishing.
  Mitigation: keep direct cash feedback for manual casts, use warm feedback copy, and surface stock pressure as explanation rather than punishment.

## Implementation Readiness

This phase is scoped for a single feature branch and can be implemented in roadmap order without decomposing into separate projects. The highest-coupling area is the shared tick engine, so the implementation should establish reducer boundaries early and expand the tick path incrementally as each task lands.
