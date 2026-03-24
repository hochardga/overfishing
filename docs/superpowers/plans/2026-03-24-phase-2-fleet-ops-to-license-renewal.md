# Phase 2 Fleet Ops To License Renewal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first full role-shift arc through Fleet Ops, processing, contracts, regional extraction, and the first License Renewal reset.

**Architecture:** Phase 2 keeps the deterministic local command/query flow from earlier phases, but extends it from single-boat actions into persistent operational systems. Pure reducers under `src/lib/simulation/reducers` remain responsible for time-based state mutation, selectors keep shaping UI-facing summaries, and `tickEngine.ts` stays the one path that advances routing, maintenance, unloading, processing, contracts, depletion pressure, and reset readiness.

**Tech Stack:** React, TypeScript, Zustand, Zod, Tailwind CSS, Vitest, Testing Library, Playwright, ESLint

---

## Chunk 1: Fleet Ops Foundation

### Task 1: Implement multi-boat ownership, crew assignment, and automated routing

**Files:**
- Create: `src/features/fleet/FleetPanel.tsx`
- Create: `src/features/fleet/BoatCard.tsx`
- Create: `src/lib/simulation/reducers/fleet.ts`
- Modify: `src/lib/economy/boats.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/fleet.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing fleet reducer and UI tests**
  Cover syncing owned boats from upgrades, assigning regions, toggling crew, and passive route yield over time.

- [ ] **Step 2: Run the targeted fleet tests to verify the red state**
  Run: `npm run test -- --run src/test/fleet.test.ts src/test/renderApp.test.tsx`
  Expected: fail because Fleet Ops routing and UI do not exist yet.

- [ ] **Step 3: Expand boat and upgrade balance data for Fleet Ops**
  Add Dock Lease, Used Work Skiff, crew-related upgrades, and any boat metadata required for route automation.

- [ ] **Step 4: Implement `reducers/fleet.ts` and wire it into store/tick flow**
  Sync boat ownership, crew state, automation state, and per-region route production through deterministic tick advancement.

- [ ] **Step 5: Build `FleetPanel` and `BoatCard`**
  Surface route choice, crew assignment, automation state, and per-boat status in a layout that reads as operations rather than manual play.

- [ ] **Step 6: Run the targeted fleet tests to verify the green state**
  Run: `npm run test -- --run src/test/fleet.test.ts src/test/renderApp.test.tsx`
  Expected: pass with multiple boats and automated routing behaving predictably.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-017` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 2: Add maintenance decay, repairs, wages, and breakdown handling

**Files:**
- Create: `src/features/fleet/MaintenancePanel.tsx`
- Create: `src/lib/simulation/reducers/maintenance.ts`
- Create: `src/components/ui/AlertBanner.tsx`
- Modify: `src/lib/economy/boats.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/fleet.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing maintenance tests**
  Cover wage drain, maintenance thresholds, repairs, and deterministic breakdown alerts when maintenance is ignored.

- [ ] **Step 2: Run the targeted maintenance tests to verify the red state**
  Run: `npm run test -- --run src/test/fleet.test.ts src/test/renderApp.test.tsx`
  Expected: fail because maintenance and alert behavior are incomplete.

- [ ] **Step 3: Implement the maintenance reducer and repair command path**
  Advance maintenance loss with time, apply threshold penalties, trigger breakdown windows, and restore boats through repairs.

- [ ] **Step 4: Add maintenance UI and alert presentation**
  Build `MaintenancePanel` and `AlertBanner` so degraded boats and breakdowns are obvious without overwhelming the player.

- [ ] **Step 5: Run the targeted maintenance tests to verify the green state**
  Run: `npm run test -- --run src/test/fleet.test.ts src/test/renderApp.test.tsx`
  Expected: pass with penalties, repairs, and breakdown warnings covered.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-018` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 3: Surface the role shift with updated UI copy and operational layout changes

**Files:**
- Modify: `src/components/game/GameShell.tsx`
- Modify: `src/components/ui/StatusRail.tsx`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing play-shell tests for Fleet Ops presentation**
  Assert the copy, shell density, and status rail details shift once Fleet Ops is unlocked.

- [ ] **Step 2: Run the targeted Fleet Ops shell tests to verify the red state**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: fail because the late-mid-game shell still uses earlier dock copy and layout.

- [ ] **Step 3: Tighten shell copy, layout, and selector-backed operations readouts**
  Keep the interface readable while making the player feel that their job is now routes, crews, and bottlenecks.

- [ ] **Step 4: Run the targeted Fleet Ops shell tests to verify the green state**
  Run: `npm run test -- --run src/test/renderApp.test.tsx`
  Expected: pass with the UI shift visible and still legible.

- [ ] **Step 5: Update the roadmap checkpoint**
  Mark `TASK-019` complete in `docs/product-roadmap.md` only after the verification commands pass.

## Chunk 2: Processing And Contracts

### Task 4: Implement unload lanes, cold storage, and processing queues

**Files:**
- Create: `src/features/processing/ProcessingPanel.tsx`
- Create: `src/lib/simulation/reducers/processing.ts`
- Create: `src/lib/simulation/reducers/facilities.ts`
- Modify: `src/lib/economy/upgrades.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/processing.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing processing tests**
  Cover unload throughput, cold-storage buffering, queue activation, and processed output creation.

- [ ] **Step 2: Run the targeted processing tests to verify the red state**
  Run: `npm run test -- --run src/test/processing.test.ts src/test/renderApp.test.tsx`
  Expected: fail because facilities and processing reducers do not exist yet.

- [ ] **Step 3: Expand upgrades and facility synchronization for Processing & Contracts**
  Add Processing Shed, Flash Freezer, Cannery Line, Dock Forklift, and Cold Room Expansion with the facility state they enable.

- [ ] **Step 4: Implement facility and processing reducers**
  Move raw fish through unload lanes into storage, consume cold inventory on active queues, and produce processed goods deterministically.

- [ ] **Step 5: Build `ProcessingPanel`**
  Show backlog, throughput, active lines, and the current bottleneck clearly.

- [ ] **Step 6: Run the targeted processing tests to verify the green state**
  Run: `npm run test -- --run src/test/processing.test.ts src/test/renderApp.test.tsx`
  Expected: pass with storage and queue bottlenecks behaving correctly.

- [ ] **Step 7: Update the roadmap checkpoint**
  Mark `TASK-020` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 5: Build the contract board, contract timers, and reward claims

**Files:**
- Create: `src/features/contracts/ContractBoard.tsx`
- Create: `src/features/contracts/ContractCard.tsx`
- Create: `src/lib/simulation/reducers/contracts.ts`
- Modify: `src/lib/economy/contracts.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/contracts.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing contract tests**
  Cover accept, explicit delivery, completion, expiry, and reward claim behavior.

- [ ] **Step 2: Run the targeted contract tests to verify the red state**
  Run: `npm run test -- --run src/test/contracts.test.ts src/test/renderApp.test.tsx`
  Expected: fail because contract state and UI flows do not exist yet.

- [ ] **Step 3: Implement the contract reducer set and timer advancement**
  Seed the board, start timers on accept, require explicit deliveries, expire cleanly, and grant rewards on claim.

- [ ] **Step 4: Build `ContractBoard` and `ContractCard`**
  Present available and active contracts, clear timer pressure, and readable reward summaries.

- [ ] **Step 5: Run the targeted contract tests to verify the green state**
  Run: `npm run test -- --run src/test/contracts.test.ts src/test/renderApp.test.tsx`
  Expected: pass with full contract lifecycle coverage.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-021` complete in `docs/product-roadmap.md` only after the verification commands pass.

## Chunk 3: Regions, Renewal, And Full-Run Coverage

### Task 6: Add the Regions tab with depletion, scarcity, bycatch, trust, and ocean health

**Files:**
- Create: `src/features/regions/RegionsPanel.tsx`
- Create: `src/components/game/RegionCard.tsx`
- Create: `src/lib/simulation/reducers/regions.ts`
- Modify: `src/lib/economy/regions.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/tickEngine.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/regions.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing regions tests**
  Cover depletion-driven slowdowns, scarcity pricing, bycatch/habitat pressure, and trust/ocean-health changes.

- [ ] **Step 2: Run the targeted regions tests to verify the red state**
  Run: `npm run test -- --run src/test/regions.test.ts src/test/renderApp.test.tsx`
  Expected: fail because the regions dashboard and consequence reducer do not exist yet.

- [ ] **Step 3: Implement regional consequence advancement**
  Apply extraction pressure to stock, value, bycatch, habitat damage, trust, and ocean health while keeping the current bottleneck legible.

- [ ] **Step 4: Build `RegionsPanel` and `RegionCard`**
  Show stock, scarcity, travel profile, and consequence signals together in a scan-friendly layout.

- [ ] **Step 5: Run the targeted regions tests to verify the green state**
  Run: `npm run test -- --run src/test/regions.test.ts src/test/renderApp.test.tsx`
  Expected: pass with region signals and consequence metrics staying in sync.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-022` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 7: Implement License Renewal progression and reset carryover

**Files:**
- Create: `src/features/prestige/LicenseRenewalModal.tsx`
- Create: `src/lib/simulation/reducers/prestige.ts`
- Modify: `src/lib/storage/saveAdapter.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/app/routes/PlayPage.tsx`
- Test: `src/test/fullRunReducer.test.ts`
- Test: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing renewal tests**
  Cover unlock readiness, modal summary content, cancel safety, confirm reset, and meta-only carryover.

- [ ] **Step 2: Run the targeted renewal tests to verify the red state**
  Run: `npm run test -- --run src/test/fullRunReducer.test.ts src/test/renderApp.test.tsx`
  Expected: fail because renewal logic and modal flow do not exist yet.

- [ ] **Step 3: Implement prestige state transitions and save carryover**
  Derive carryover bonuses from the completed run, persist meta progression, and recreate the next run without preserving run-only systems.

- [ ] **Step 4: Build the License Renewal modal**
  Present closure, damage summary, carryover preview, and confirm/cancel actions with calm but polished copy.

- [ ] **Step 5: Run the targeted renewal tests to verify the green state**
  Run: `npm run test -- --run src/test/fullRunReducer.test.ts src/test/renderApp.test.tsx`
  Expected: pass with renewal resetting the run and preserving only meta bonuses.

- [ ] **Step 6: Update the roadmap checkpoint**
  Mark `TASK-023` complete in `docs/product-roadmap.md` only after the verification commands pass.

### Task 8: Add end-to-end coverage for a full run through the first reset

**Files:**
- Create: `src/test/fullRunReducer.test.ts`
- Create: `src/test/contracts.test.ts`
- Create: `src/test/fleet.test.ts`
- Create: `src/test/processing.test.ts`
- Create: `src/test/regions.test.ts`
- Create: `e2e/license-renewal.spec.ts`
- Modify: `src/test/renderApp.test.tsx`
- Modify: `package.json`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Write the remaining failing reducer and end-to-end tests**
  Cover fresh-start progression through Fleet Ops, processing, contracts, regions, and License Renewal.

- [ ] **Step 2: Run the targeted reducer and e2e specs to verify the red state**
  Run: `npm run test -- --run src/test/fullRunReducer.test.ts src/test/contracts.test.ts src/test/fleet.test.ts src/test/processing.test.ts src/test/regions.test.ts`
  Expected: fail until the missing systems and flows are implemented.

- [ ] **Step 3: Fill any remaining gaps in selectors, route wiring, and test harness support**
  Keep fixes focused on requirements the new tests expose; do not add unrelated systems.

- [ ] **Step 4: Run the Phase 2 regression suite to verify the green state**
  Run: `npm run test -- --run`
  Expected: all Vitest coverage for the full first-run arc passes.

- [ ] **Step 5: Run lint, build, and the renewal e2e flow**
  Run: `npm run lint`
  Run: `npm run build`
  Run: `npx playwright test e2e/license-renewal.spec.ts`
  Expected: lint clean, build succeeds, and the e2e flow reaches renewal and completes the reset.

- [ ] **Step 6: Update the roadmap checkpoint and status lines**
  Mark `TASK-024` complete in `docs/product-roadmap.md`, update `**Status:**` to `24/31 tasks complete`, and move `**Current Phase:**` to `Phase 3 — Polish & Public Prototype Launch` only after the verification commands pass.
