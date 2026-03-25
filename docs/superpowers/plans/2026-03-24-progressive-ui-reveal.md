# Progressive UI Reveal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-session compact harbor shell that teaches casting first, progressively reveals early UI through discovery milestones, and safely skips the compact intro on later or recovered runs.

**Architecture:** Keep the feature state-driven. `save.meta.unlockFlags` decides whether future runs are eligible for the compact intro, `run.unlocks.discoverySteps` stores per-run milestones, `syncDiscoveryState(run, meta)` is the one store-owned promotion path, and `selectPlayShellVisibility(run, meta)` is the one selector contract that decides what the player sees. `GameShell`, `PlayPage`, `CastButton`, `EarlyHud`, and `UpgradeShop` then become thin renderers of that visibility model.

**Tech Stack:** React, TypeScript, Zustand, Zod, Tailwind CSS, Vitest, Testing Library, ESLint

---

## File Structure

**Create:**

- `src/lib/simulation/reducers/discovery.ts`
  Purpose: promote discovery milestones and return normalized `{ run, meta }`.
- `src/lib/simulation/playShellVisibility.ts`
  Purpose: own `PlayShellVisibilityModel`, compact/full shell predicates, compact-order rules, and quiet-pier shop filtering without bloating `selectors.ts`.
- `src/test/discovery.test.ts`
  Purpose: unit coverage for discovery promotion, intro seeding, migration fail-safe behavior, and meta-flag retirement rules.
- `src/test/playShellReveal.test.tsx`
  Purpose: focused render coverage for compact-mode UI, reveal ladder progression, and recovery/full-shell edge cases.

**Modify:**

- `src/lib/storage/saveSchema.ts`
  Purpose: define discovery-step schema, extend `unlocks`, and seed `compactIntroEnabled` in `createStarterRun(meta)` when eligible.
- `src/lib/storage/migrations.ts`
  Purpose: normalize missing discovery data to the expanded shell and append `quietPierIntroSeen` on fail-safe recovery paths.
- `src/lib/storage/saveAdapter.ts`
  Purpose: route malformed-save recovery through the same expanded-shell plus `quietPierIntroSeen` fail-safe contract.
- `src/lib/simulation/gameStore.ts`
  Purpose: expose `meta` in store state, run `applyUnlockChecks` before `syncDiscoveryState`, and persist normalized `{ run, meta }`.
- `src/lib/simulation/selectors.ts`
  Purpose: stay thin by reusing `playShellVisibility.ts` for play-shell-specific logic while keeping existing selector exports stable.
- `src/components/game/GameShell.tsx`
  Purpose: add an explicit compact layout mode that renders only the center column without empty side columns.
- `src/components/game/EarlyHud.tsx`
  Purpose: render only discovered cards and keep the component declarative.
- `src/features/fishing/CastButton.tsx`
  Purpose: support compact copy and hide stock/cooldown sub-readouts until those discovery steps unlock.
- `src/features/upgrades/UpgradeShop.tsx`
  Purpose: support compact quiet-pier mode with only available quiet-pier upgrades.
- `src/app/routes/PlayPage.tsx`
  Purpose: replace ad hoc early-game visibility with the selector contract and render compact/full shell states.
- `src/test/gameStore.test.ts`
  Purpose: store-level assertions for normalized meta/run behavior.
- `src/test/renderApp.test.tsx`
  Purpose: one or two top-level regressions that prove phase progression still expands the shell and later-game surfaces still render.

## Chunk 1: Discovery State And Store Plumbing

### Task 1: Add discovery-step schema, run seeding, and recovery normalization

**Files:**
- Create: `src/test/discovery.test.ts`
- Modify: `src/lib/storage/saveSchema.ts`
- Modify: `src/lib/storage/migrations.ts`
- Modify: `src/lib/storage/saveAdapter.ts`
- Modify: `src/test/gameStore.test.ts`

- [ ] **Step 1: Write the failing discovery and migration tests**
  Cover these exact cases in `src/test/discovery.test.ts`:
  - `createStarterRun(createDefaultMetaProgress())` seeds `compactIntroEnabled`
  - a meta object with `quietPierIntroSeen`, `renewals > 0`, `startingCashBonus > 0`, or `manualCatchBonus > 0` skips `compactIntroEnabled`
  - a save missing `run.unlocks.discoverySteps` normalizes to the expanded-shell discovery set and appends `quietPierIntroSeen`
  - a recovered malformed save still produces a usable save whose current run starts in the expanded shell and whose `meta.unlockFlags` includes `quietPierIntroSeen`

- [ ] **Step 2: Run the targeted discovery tests to verify the red state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/gameStore.test.ts`
  Expected: fail because discovery-step schema, starter-run seeding, and migration fail-safe logic do not exist yet.

- [ ] **Step 3: Extend `saveSchema.ts` with explicit discovery-step support**
  Add a `discoveryStepSchema` enum with:
  ```ts
  z.enum([
    "compactIntroEnabled",
    "firstCastCompleted",
    "cashVisible",
    "nearbyFishVisible",
    "cooldownVisible",
    "stockPressureVisible",
    "shopVisible",
    "harborShellExpanded",
  ])
  ```
  Add `discoverySteps` to `unlockStateSchema`, default it to `[]`, and update `createStarterRun(meta)` so it seeds `["compactIntroEnabled"]` only when:
  ```ts
  !meta.unlockFlags.includes("quietPierIntroSeen") &&
  meta.renewals === 0 &&
  meta.startingCashBonus === 0 &&
  meta.manualCatchBonus === 0
  ```

- [ ] **Step 4: Implement migration fail-safe rules in `migrations.ts`**
  Normalize missing discovery data to:
  ```ts
  [
    "firstCastCompleted",
    "cashVisible",
    "nearbyFishVisible",
    "cooldownVisible",
    "stockPressureVisible",
    "shopVisible",
    "harborShellExpanded",
  ]
  ```
  and append `"quietPierIntroSeen"` to `save.meta.unlockFlags` during any fail-safe path so future resets and renewals do not re-trigger the compact intro. Detect missing `run.unlocks.discoverySteps` from the raw parsed save payload before schema defaults can turn “missing” into an empty array.

- [ ] **Step 5: Update `saveAdapter.ts` to preserve the fail-safe contract**
  Make sure malformed-save recovery and any path that recreates a usable save after unreadable storage routes through the same expanded-shell plus `quietPierIntroSeen` expectation instead of silently producing a brand-new compact-intro run.

- [ ] **Step 6: Add one store-level regression in `src/test/gameStore.test.ts`**
  Assert both:
  - a successful load/save round trip preserves an already-earned `run.unlocks.discoverySteps` ladder
  - reset behavior preserves the `quietPierIntroSeen` retirement flag and therefore skips the compact intro on the next run

- [ ] **Step 7: Run the targeted discovery tests to verify the green state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/gameStore.test.ts`
  Expected: pass with discovery seeding, migration fail-safe behavior, malformed-save recovery, and save/load round trips all covered.

- [ ] **Step 8: Commit the schema and migration groundwork**
  Run:
  ```bash
  git add src/lib/storage/saveSchema.ts src/lib/storage/migrations.ts src/lib/storage/saveAdapter.ts src/test/discovery.test.ts src/test/gameStore.test.ts
  git commit -m "feat: add progressive UI discovery schema"
  ```

### Task 2: Implement `syncDiscoveryState(run, meta)` and store normalization ordering

**Files:**
- Create: `src/lib/simulation/reducers/discovery.ts`
- Modify: `src/lib/simulation/gameStore.ts`
- Modify: `src/test/discovery.test.ts`
- Modify: `src/test/gameStore.test.ts`

- [ ] **Step 1: Write the failing promotion tests for `syncDiscoveryState`**
  Cover these exact promotions:
  - `lifetimeFishLanded >= 1` promotes `firstCastCompleted` and `cashVisible`
  - `lifetimeFishLanded >= 3` promotes `nearbyFishVisible` and `cooldownVisible`
  - `lifetimeFishLanded >= 8` or `pierCove.stockCurrent / stockCap <= 0.85` promotes `stockPressureVisible`
  - `cash >= cheapest available, unowned quiet-pier upgrade cost` promotes `shopVisible`
  - `run.unlocks.upgrades.length >= 1` or `run.phase !== "quietPier"` promotes `harborShellExpanded`
  - once `firstCastCompleted` is promoted, `quietPierIntroSeen` is appended to `meta.unlockFlags`
  - if a later predicate is already true, prerequisite discovery steps are promoted in the same pass
  - repeated `syncDiscoveryState(run, meta)` calls do not duplicate `run.unlocks.discoverySteps` entries or `quietPierIntroSeen`

- [ ] **Step 2: Run the targeted promotion tests to verify the red state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/gameStore.test.ts`
  Expected: fail because `syncDiscoveryState` and store-owned meta/run normalization do not exist yet.

- [ ] **Step 3: Implement `src/lib/simulation/reducers/discovery.ts`**
  Export:
  ```ts
  export function syncDiscoveryState(
    run: RunState,
    meta: MetaProgressState,
  ): { run: RunState; meta: MetaProgressState }
  ```
  Keep it pure. Use ordered promotion so later milestones backfill earlier ones in the same call.

- [ ] **Step 4: Add the shared normalize-and-persist helper to `gameStore.ts`**
  Introduce one helper that owns:
  ```ts
  const afterUnlocks = applyUnlockChecks(run);
  const normalized = syncDiscoveryState(afterUnlocks, meta);
  ```
  plus the corresponding `set({ run, meta, ... })` and save persistence for normalized gameplay state.

- [ ] **Step 5: Migrate every run-writing store path to the shared helper**
  Route `syncRunToTime`, interval-driven updates, initialization, save recovery, resets, and user actions through that helper so discovery sync cannot drift across call sites.

- [ ] **Step 6: Re-run the targeted discovery tests to verify the green state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/gameStore.test.ts`
  Expected: pass with discovery promotion, batched backfill, meta retirement behavior, and live simulation normalization stable through the store.

- [ ] **Step 7: Commit the normalization path**
  Run:
  ```bash
  git add src/lib/simulation/reducers/discovery.ts src/lib/simulation/gameStore.ts src/test/discovery.test.ts src/test/gameStore.test.ts
  git commit -m "feat: sync progressive UI discovery state"
  ```

## Chunk 2: Visibility Model And Compact Shell

### Task 3: Add `PlayShellVisibilityModel` and partial Early HUD selector support

**Files:**
- Create: `src/lib/simulation/playShellVisibility.ts`
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/components/game/EarlyHud.tsx`
- Modify: `src/test/discovery.test.ts`
- Create: `src/test/playShellReveal.test.tsx`

- [ ] **Step 1: Write the failing selector and render tests**
  In `src/test/discovery.test.ts`, assert `selectPlayShellVisibility(run, meta)` returns the expected booleans for these scenarios:
  - fresh run
  - first successful cast, which must hide onboarding
  - `lifetimeFishLanded >= 3`
  - stock-pressure milestone
  - affordable quiet-pier shop
  - expanded shell
  Also assert the selector output shape:
  ```ts
  {
    shellMode: "compact" | "full",
    showOnboardingCard: boolean,
    showStatusRail: boolean,
    showProgressSummary: boolean,
    showLeftColumnCards: boolean,
    showRightColumnNotes: boolean,
    showShopRevealCue: boolean,
    showUpgradeShop: boolean,
    showReadingTheRailCard: boolean,
    earlyHudCards: {
      cash: boolean,
      nearbyFish: boolean,
      cooldown: boolean,
      stockPressure: boolean,
    },
    castButtonMode: "compact" | "full",
  }
  ```
  In `src/test/playShellReveal.test.tsx`, assert a fresh run only renders onboarding plus the cast surface and no full-shell cards.

- [ ] **Step 2: Run the targeted selector/render tests to verify the red state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx`
  Expected: fail because the visibility model and partial HUD rendering do not exist yet.

- [ ] **Step 3: Implement `src/lib/simulation/playShellVisibility.ts` and keep `selectors.ts` thin**
  Put the new play-shell model in `playShellVisibility.ts`, then either re-export it from `selectors.ts` or have existing selector call sites delegate to it. Keep the model render-only:
  - render predicates should depend on persisted discovery steps plus `shellMode`
  - `shellMode` should be `"compact"` only when:
    ```ts
    run.phase === "quietPier" &&
    run.unlocks.discoverySteps.includes("compactIntroEnabled") &&
    !run.unlocks.discoverySteps.includes("harborShellExpanded")
    ```

- [ ] **Step 4: Update `EarlyHud.tsx` for card-level visibility**
  Replace the always-on 4-card grid with conditional card rendering driven by the selector model so the component remains presentational.

- [ ] **Step 5: Run the targeted selector/render tests to verify the green state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx`
  Expected: pass with the visibility contract and partial HUD rendering locked down.

- [ ] **Step 6: Commit the selector contract**
  Run:
  ```bash
  git add src/lib/simulation/playShellVisibility.ts src/lib/simulation/selectors.ts src/components/game/EarlyHud.tsx src/test/discovery.test.ts src/test/playShellReveal.test.tsx
  git commit -m "feat: add progressive play shell visibility selector"
  ```

### Task 4: Add compact `GameShell` mode and wire `PlayPage` to the selector contract

**Files:**
- Modify: `src/components/game/GameShell.tsx`
- Modify: `src/app/routes/PlayPage.tsx`
- Modify: `src/test/playShellReveal.test.tsx`
- Modify: `src/test/renderApp.test.tsx`

- [ ] **Step 1: Write the failing compact-shell integration tests**
  Cover:
  - compact mode renders only the center column
  - the fixed compact order is onboarding card, partial `EarlyHud`, compact reading-the-rail explainer, `CastButton`, shop reveal cue, and compact `UpgradeShop`
  - buying the first upgrade or entering `skiffOperator` switches to the full shell

- [ ] **Step 2: Run the targeted shell tests to verify the red state**
  Run: `npm run test -- --run src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx`
  Expected: fail because `GameShell` and `PlayPage` still assume the always-full three-column layout.

- [ ] **Step 3: Add explicit compact layout support to `GameShell.tsx`**
  Add a layout prop such as:
  ```ts
  layoutMode?: "full" | "compact";
  ```
  In compact mode, render only the center column inside the existing shell container and omit empty left/right columns.

- [ ] **Step 4: Update `PlayPage.tsx` to render from `selectPlayShellVisibility(run, meta)`**
  Replace the current hardcoded early-game conditionals with the selector result. Keep `PhaseUnlockModal` and `LicenseRenewalModal` mounted above both shell modes.

- [ ] **Step 5: Run the targeted shell tests to verify the green state**
  Run: `npm run test -- --run src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx`
  Expected: pass with compact/full shell transitions behaving deterministically.

- [ ] **Step 6: Commit the shell layout wiring**
  Run:
  ```bash
  git add src/components/game/GameShell.tsx src/app/routes/PlayPage.tsx src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx
  git commit -m "feat: add compact play shell layout"
  ```

### Task 5: Add compact `CastButton` and quiet-pier-only `UpgradeShop` modes

**Files:**
- Modify: `src/features/fishing/CastButton.tsx`
- Modify: `src/features/upgrades/UpgradeShop.tsx`
- Modify: `src/app/routes/PlayPage.tsx`
- Modify: `src/lib/simulation/playShellVisibility.ts`
- Modify: `src/test/playShellReveal.test.tsx`

- [ ] **Step 1: Write the failing player-facing compact-mode tests**
  Cover:
  - compact `CastButton` hides stock/cooldown detail until those discovery steps are visible
  - compact shop mode shows only available quiet-pier upgrades
  - the shop cue and compact “Reading the rail” explainer appear in the center column before full-shell expansion
  - `PlayPage` honors `showShopRevealCue` and `showReadingTheRailCard` from the visibility model

- [ ] **Step 2: Run the targeted compact-mode tests to verify the red state**
  Run: `npm run test -- --run src/test/playShellReveal.test.tsx`
  Expected: fail because `CastButton` and `UpgradeShop` do not yet support compact-mode rendering.

- [ ] **Step 3: Add compact rendering to `CastButton.tsx`**
  Gate the stock label, timing bar, and supporting detail copy behind `castButtonMode` plus the specific visibility flags from the selector contract.

- [ ] **Step 4: Add compact quiet-pier mode to `UpgradeShop.tsx`**
  In compact mode:
  - show only currently available quiet-pier upgrades
  - omit future locked phases
  - preserve the existing full shop behavior once `shellMode === "full"`

- [ ] **Step 5: Wire the cue and explainer surfaces in `PlayPage.tsx`**
  Use the play-shell visibility model explicitly for:
  - `showShopRevealCue`
  - `showReadingTheRailCard`
  - center-column compact placement before full-shell expansion
  - right-column placement after `shellMode === "full"`

- [ ] **Step 6: Re-run the targeted compact-mode tests to verify the green state**
  Run: `npm run test -- --run src/test/playShellReveal.test.tsx`
  Expected: pass with the player-facing compact-mode surfaces matching the spec.

- [ ] **Step 7: Commit the player-facing compact-mode surfaces**
  Run:
  ```bash
  git add src/features/fishing/CastButton.tsx src/features/upgrades/UpgradeShop.tsx src/app/routes/PlayPage.tsx src/lib/simulation/playShellVisibility.ts src/test/playShellReveal.test.tsx
  git commit -m "feat: add compact onboarding UI surfaces"
  ```

## Chunk 3: Recovery, Phase Fallback, And Regression Coverage

### Task 6: Lock down recovery, migration, and later-phase expansion regressions

**Files:**
- Modify: `src/test/discovery.test.ts`
- Modify: `src/test/playShellReveal.test.tsx`
- Modify: `src/test/renderApp.test.tsx`
- Modify: `src/test/gameStore.test.ts`

- [ ] **Step 1: Write the failing recovery and phase-edge-case tests**
  Cover:
  - recovered or migrated saves render the full shell immediately
  - a reset after a fail-safe recovery still skips the compact intro because `quietPierIntroSeen` was appended
  - entering `skiffOperator` without buying a quiet-pier upgrade still flips the shell to full
  - phase unlock modals still show when shell expansion and a phase transition happen in the same update

- [ ] **Step 2: Run the targeted regression tests to verify the red state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx src/test/gameStore.test.ts`
  Expected: fail because the recovery and phase fallback rules are not fully covered yet.

- [ ] **Step 3: Fill any missing normalization or selector gaps uncovered by the tests**
  Keep the fixes small and state-driven. Do not add component-local exceptions if the selector or `syncDiscoveryState` can express the rule cleanly.

- [ ] **Step 4: Run the full targeted regression suite to verify the green state**
  Run: `npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx src/test/gameStore.test.ts`
  Expected: pass with recovery, migration, and phase-edge-case behavior all stable.

- [ ] **Step 5: Run the final project checks**
  Run: `npm run lint`
  Expected: pass with no new lint errors in the modified shell, selector, store, or test files.

- [ ] **Step 6: Commit the regression coverage pass**
  Run:
  ```bash
  git add src/test/discovery.test.ts src/test/playShellReveal.test.tsx src/test/renderApp.test.tsx src/test/gameStore.test.ts
  git commit -m "test: cover progressive UI recovery and phase edges"
  ```
