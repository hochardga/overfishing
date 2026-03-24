# Phase 1 Cozy Dock To Dockside Gear Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable gameplay loop through Dockside Gear with manual casting, stock pressure, upgrades, skiff trips, passive gear, storage bottlenecks, unlock presentation, and regression coverage.

**Architecture:** Phase 1 extends the deterministic local command/query architecture from Phase 0. Pure reducers under `src/lib/simulation/reducers` will own gameplay mutations, feature-level action helpers will bridge UI interactions into store updates, selectors will shape UI-facing summaries, and `tickEngine.ts` will remain the single time-advancement path for cooldowns, trips, passive output, decay, and unlock checks.

**Tech Stack:** React, TypeScript, Zustand, Zod, Tailwind CSS, Vitest, Testing Library, ESLint

---

## Chunk 1: Manual Loop, Early HUD, And Quiet Pier Upgrades

### Task 1: Implement the manual cast interaction and early-game reward feedback

**Files:**
- Create: `src/features/fishing/CastButton.tsx`
- Create: `src/features/fishing/fishingActions.ts`
- Create: `src/lib/simulation/reducers/manualFishing.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/manualFishing.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing manual-fishing reducer tests**
  Cover normal cast rewards, perfect cast rewards, cooldown enforcement, and atomic cash-plus-stock updates.

- [ ] **Step 2: Run the targeted manual-fishing tests to verify the red state**
  Run: `npm run test -- --run src/test/manualFishing.test.ts`
  Expected: fail because the reducer and command flow do not exist yet.

- [ ] **Step 3: Add the manual-fishing reducer and command result handling**
  Implement cooldown validation, direct cash payout, lifetime stat updates, and stock depletion for `pierCove`.

- [ ] **Step 4: Extend the deterministic tick path for cooldown countdown**
  Decrease manual cooldown through `tickEngine.ts` instead of component-local timers.

- [ ] **Step 5: Add the `CastButton` interaction and route wiring**
  Replace placeholder copy on the play route with a live cast control, warm feedback copy, and last-result presentation.

- [ ] **Step 6: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/manualFishing.test.ts src/test/renderApp.test.tsx`
  Expected: manual cast tests pass and the play route renders the live dock loop.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-009` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 2: Build the early-game resource rail and fish-stock presentation

**Files:**
- Create: `src/components/game/EarlyHud.tsx`
- Create: `src/components/ui/MeterCard.tsx`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing UI tests for the early HUD**
  Assert that the play route surfaces cash, fish nearby, cooldown state, and stock pressure labels.

- [ ] **Step 2: Run the targeted HUD tests to verify the red state**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the HUD and meter cards do not exist yet.

- [ ] **Step 3: Implement `MeterCard` and `EarlyHud`**
  Present stock, pressure, cooldown, and cash with readable labels and non-color cues.

- [ ] **Step 4: Add selector helpers for early-phase display state**
  Expose fish-nearby labels, stock percent, modifier messaging, and cast-readiness display data.

- [ ] **Step 5: Run the targeted HUD tests to verify the green state**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass with the HUD visible and selector-backed labels rendered.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-010` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 3: Implement the upgrade shop and phase unlock thresholds for Quiet Pier

**Files:**
- Create: `src/features/upgrades/UpgradeShop.tsx`
- Create: `src/lib/simulation/reducers/upgrades.ts`
- Create: `src/lib/simulation/reducers/unlocks.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/manualFishing.test.ts`
- Test: `src/test/unlocks.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for upgrade affordability and early unlock thresholds**
  Cover insufficient funds, successful purchase effects, and the first phase progression check.

- [ ] **Step 2: Run the targeted upgrade and unlock tests to verify the red state**
  Run: `npm run test -- --run src/test/manualFishing.test.ts src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: fail because purchase reducers and unlock logic do not exist yet.

- [ ] **Step 3: Expand the upgrade catalog with the full Quiet Pier definitions needed by gameplay**
  Include costs, modifier effects, and unlock metadata used by the reducers and UI.

- [ ] **Step 4: Implement the upgrade purchase reducer and unlock checks**
  Spend cash atomically, persist purchased upgrades, and queue Skiff Operator unlock state once the threshold is met.

- [ ] **Step 5: Add the `UpgradeShop` UI and wire it into the play route**
  Show affordability, locked state, and acquired upgrades clearly in the operations rail.

- [ ] **Step 6: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/manualFishing.test.ts src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: pass for affordability, unlock thresholds, and play-route rendering.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-011` complete in `docs/product-roadmap.md` only after the verification commands pass.

## Chunk 2: Skiff Trips, Storage Pressure, Passive Gear, And Helpers

### Task 4: Add the Skiff Operator phase with fuel, hold space, and Kelp Bed trips

**Files:**
- Create: `src/features/fleet/SkiffPanel.tsx`
- Create: `src/lib/simulation/reducers/skiffTrips.ts`
- Modify: `src/lib/economy/regions.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/unlocks.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for skiff trip progression**
  Cover route assignment, fuel use, hold fill, and Kelp Bed payout behavior.

- [ ] **Step 2: Run the targeted skiff tests to verify the red state**
  Run: `npm run test -- --run src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: fail because skiff trip state and UI do not exist yet.

- [ ] **Step 3: Expand the region and upgrade balance data for Skiff Operator**
  Add the Harbor Map, Rusty Skiff, Outboard Motor, Ice Chest, and Rod Rack data needed by the reducers.

- [ ] **Step 4: Implement the skiff-trip reducer and tick advancement**
  Model route choice, fuel drain, hold accumulation, and trip payout logic through deterministic state updates.

- [ ] **Step 5: Build the `SkiffPanel` and wire it into the unlocked phase UI**
  Surface route selection, fuel/hold meters, and current skiff bottlenecks.

- [ ] **Step 6: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: pass with skiff state and UI behaving predictably.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-012` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 5: Add dock storage, decay, and passive gear slot logic

**Files:**
- Create: `src/features/gear/GearPanel.tsx`
- Create: `src/lib/simulation/reducers/storage.ts`
- Create: `src/lib/simulation/reducers/passiveGear.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/passiveGear.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for storage caps, decay, and pause-on-full behavior**
  Cover storage overflow pausing output, decay over time, and gear-slot availability.

- [ ] **Step 2: Run the targeted storage tests to verify the red state**
  Run: `npm run test -- --run src/test/passiveGear.test.ts src/test/renderApp.test.tsx`
  Expected: fail because storage and passive-gear reducers do not exist yet.

- [ ] **Step 3: Implement storage and passive-gear reducers**
  Add dock storage caps, decay rules, passive gear slot logic, and blocked-output handling.

- [ ] **Step 4: Extend tick advancement and selectors for storage pressure**
  Drive decay and passive accumulation from elapsed time, then expose bottleneck summaries for the HUD and panel.

- [ ] **Step 5: Build the `GearPanel` UI**
  Surface storage usage, decay risk, gear slots, and pause-on-full state without silent losses.

- [ ] **Step 6: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/passiveGear.test.ts src/test/renderApp.test.tsx`
  Expected: pass with storage overflow and decay behavior covered.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-013` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 6: Add Crab Pot, Longline, and helper automation flows

**Files:**
- Create: `src/features/gear/GearCard.tsx`
- Create: `src/lib/simulation/reducers/helpers.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/lib/simulation/reducers/passiveGear.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/features/gear/GearPanel.tsx`
- Test: `src/test/passiveGear.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for gear cadence and helper automation**
  Cover crab pot timing, longline timing, and helper-owned auto-haul behavior.

- [ ] **Step 2: Run the targeted passive-gear tests to verify the red state**
  Run: `npm run test -- --run src/test/passiveGear.test.ts src/test/renderApp.test.tsx`
  Expected: fail because gear cadence and helper automation are incomplete.

- [ ] **Step 3: Expand the upgrade data for passive gear and helpers**
  Encode the gear unlocks, rates, collection intervals, and helper timing used by the simulation.

- [ ] **Step 4: Implement helper automation and gear-card presentation**
  Model helper-owned collection timing and expose individual gear status cards in the UI.

- [ ] **Step 5: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/passiveGear.test.ts src/test/renderApp.test.tsx`
  Expected: pass with helper cadence and gear output behaving deterministically.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-014` complete in `docs/product-roadmap.md` only after the verification commands pass.

## Chunk 3: Unlock Presentation, Progress Summaries, And Phase Coverage

### Task 7: Implement phase unlock modals and progression summaries

**Files:**
- Create: `src/components/game/PhaseUnlockModal.tsx`
- Create: `src/components/game/ProgressSummary.tsx`
- Modify: `src/lib/simulation/reducers/unlocks.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/unlocks.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write failing tests for one-time unlock modals and dismiss flow**
  Cover Phase 2 and Phase 3 unlock ordering, one-time firing, and safe dismissal.

- [ ] **Step 2: Run the targeted unlock tests to verify the red state**
  Run: `npm run test -- --run src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: fail because modal presentation and summary UI are missing or incomplete.

- [ ] **Step 3: Implement unlock-modal state and progression selectors**
  Ensure unlocks queue in order, fire once, and persist in the run state.

- [ ] **Step 4: Build `PhaseUnlockModal` and `ProgressSummary`**
  Present the new management tension, current bottlenecks, and next-step guidance in a readable way.

- [ ] **Step 5: Run the targeted tests to verify the green state**
  Run: `npm run test -- --run src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: pass with unlock modals firing once and dismissing safely.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-015` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 8: Add reducer and selector tests for early progression

**Files:**
- Create: `src/test/manualFishing.test.ts`
- Create: `src/test/passiveGear.test.ts`
- Create: `src/test/unlocks.test.ts`
- Modify: `src/test/renderApp.test.tsx`
- Modify: `docs/product-roadmap.md`

- [ ] **Step 1: Expand regression tests for the completed Phase 1 systems**
  Cover stock pressure, passive pause-on-full behavior, overflow handling, helper cadence, and unlock ordering.

- [ ] **Step 2: Run the focused Phase 1 test suite**
  Run: `npm run test -- --run src/test/manualFishing.test.ts src/test/passiveGear.test.ts src/test/unlocks.test.ts src/test/renderApp.test.tsx`
  Expected: all targeted gameplay and UI tests pass.

- [ ] **Step 3: Run the full verification suite**
  Run: `npm run lint`
  Run: `npm run test -- --run`
  Run: `npm run build`
  Expected: all commands exit successfully.

- [ ] **Step 4: Update the roadmap checkpoint**
  Mark `TASK-016` complete in `docs/product-roadmap.md`, then update the phase status line and `Current Phase` line if all Phase 1 tasks are complete.

- [ ] **Step 5: Commit the implementation**
  Create a descriptive Phase 1 commit covering the finished gameplay systems, tests, and roadmap updates.
