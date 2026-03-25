# Early Session Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the early-session play shell so the compact intro feels visually focused, the stock-pressure lesson appears at the right time, and the first upgrade purchase expands into a cleaner, less cluttered harbor shell.

**Architecture:** Keep the work selector-driven. `selectPlayShellVisibility` should remain the source of truth for what the shell may reveal, while `selectUpgradeShopState` should own any new grouping needed to separate immediate upgrade decisions from future catalog preview. `GameShell`, `EarlyHud`, `MeterCard`, `CastButton`, and `UpgradeShop` should stay presentational and render whatever the selectors describe.

**Tech Stack:** React 19, TypeScript, Zustand, Tailwind CSS, Vitest, Testing Library, Playwright CLI

---

## File Structure

**Modify:**

- `src/lib/simulation/playShellVisibility.ts`
  Purpose: correct the compact-shell reveal contract so `showReadingTheRailCard` turns on with `stockPressureVisible`, not `shopVisible`.
- `src/lib/simulation/selectors.ts`
  Purpose: keep play-shell and upgrade-shop state centralized, add any new shop grouping/preview state, and avoid JSX-level business logic.
- `src/components/game/GameShell.tsx`
  Purpose: constrain compact mode to a centered, narrower play lane and preserve the current full-shell layout.
- `src/components/game/EarlyHud.tsx`
  Purpose: make partial reveal states render with deliberate card counts and compact density.
- `src/components/ui/MeterCard.tsx`
  Purpose: support a denser compact presentation for early-session meter cards without affecting full-shell cards.
- `src/features/fishing/CastButton.tsx`
  Purpose: tighten compact-mode copy and status presentation so the action card does less repeated explaining.
- `src/features/upgrades/UpgradeShop.tsx`
  Purpose: render grouped “available now / owned / on deck” sections instead of one long flat list in full mode while keeping compact mode focused.
- `src/test/discovery.test.ts`
  Purpose: selector-level assertions for corrected reveal timing.
- `src/test/playShellReveal.test.tsx`
  Purpose: render coverage for compact shell presentation and first-upgrade shell expansion.
- `src/test/unlocks.test.ts`
  Purpose: upgrade-shop selector coverage for grouped output and future-phase summary behavior.

## Chunk 1: Compact Shell Focus And Reveal Timing

### Task 1: Lock the reveal-order and compact-presentation behavior with tests

**Files:**
- Modify: `src/test/discovery.test.ts`
- Modify: `src/test/playShellReveal.test.tsx`

- [ ] **Step 1: Add the failing visibility assertion for stock pressure**

  In `src/test/discovery.test.ts`, update the compact stock-pressure scenario so `selectPlayShellVisibility(run, meta)` expects:

  ```ts
  {
    showReadingTheRailCard: true,
    earlyHudCards: {
      cash: true,
      nearbyFish: true,
      cooldown: true,
      stockPressure: true,
    },
  }
  ```

  while still keeping:

  ```ts
  showShopRevealCue: false
  showUpgradeShop: false
  ```

- [ ] **Step 2: Add render assertions for compact HUD density and compact shell framing**

  In `src/test/playShellReveal.test.tsx`:

  - render a compact shell with one visible HUD card and assert the HUD still renders without the full-shell columns
  - render a compact shell with three visible HUD cards and assert the compact stack still shows `Reading the rail` once stock pressure is unlocked
  - add a `data-testid` hook or stable label assertion for the compact shell container if needed so layout intent is testable without brittle class snapshots

- [ ] **Step 3: Run the targeted tests to verify the red state**

  Run:

  ```bash
  npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx
  ```

  Expected: FAIL because the selector still ties `showReadingTheRailCard` to `shopVisible`, and the compact presentation hooks do not exist yet.

- [ ] **Step 4: Implement the compact-shell polish**

  Update:

  - `src/lib/simulation/playShellVisibility.ts`
  - `src/components/game/GameShell.tsx`
  - `src/components/game/EarlyHud.tsx`
  - `src/components/ui/MeterCard.tsx`
  - `src/features/fishing/CastButton.tsx`

  Make these exact changes:

  - `showReadingTheRailCard` in compact mode keys off `stockPressureVisible`
  - compact `GameShell` wraps the center column in a narrower centered container
  - `EarlyHud` computes visible-card count and uses responsive grid classes that do not leave a phantom fourth slot when only one to three cards are visible
  - `MeterCard` supports a compact density variant with tighter spacing and slightly smaller type where appropriate
  - `CastButton` shortens compact explanatory copy and makes the current cast state more prominent than the evergreen description

- [ ] **Step 5: Re-run the targeted tests to verify the green state**

  Run:

  ```bash
  npm run test -- --run src/test/discovery.test.ts src/test/playShellReveal.test.tsx
  ```

  Expected: PASS with the corrected reveal timing and compact-shell render contract covered.

- [ ] **Step 6: Commit the compact-shell chunk**

  Run:

  ```bash
  git add src/lib/simulation/playShellVisibility.ts src/components/game/GameShell.tsx src/components/game/EarlyHud.tsx src/components/ui/MeterCard.tsx src/features/fishing/CastButton.tsx src/test/discovery.test.ts src/test/playShellReveal.test.tsx
  git commit -m "feat: polish compact play shell pacing"
  ```

## Chunk 2: Upgrade Shop Information Pressure

### Task 2: Define the grouped shop state in tests first

**Files:**
- Modify: `src/test/unlocks.test.ts`
- Modify: `src/test/playShellReveal.test.tsx`

- [ ] **Step 1: Add the failing selector test for grouped shop output**

  In `src/test/unlocks.test.ts`, add a scenario where the run is in `quietPier` or `skiffOperator` with:

  - at least one owned upgrade
  - at least one affordable available upgrade
  - several future-phase upgrades still locked

  Assert that `selectUpgradeShopState(run)` returns grouped output with distinct sections, for example:

  ```ts
  expect(shop.sections.map((section) => section.id)).toEqual([
    "availableNow",
    "owned",
    "onDeck",
  ]);
  ```

  Also assert:

  - `availableNow` contains only available, unowned upgrades
  - `owned` contains purchased upgrades
  - `onDeck` summarizes locked future phases instead of returning every locked upgrade as a card-ready item list

- [ ] **Step 2: Add a render test for the first purchased upgrade state**

  In `src/test/playShellReveal.test.tsx`, render the first-upgrade full shell and assert:

  - available upgrades are still visible
  - owned upgrade copy remains visible but de-emphasized
  - a future-phase summary such as `On deck` renders
  - individual locked future items like `Harbor Map` are no longer dumped into the same long list immediately after the first purchase

- [ ] **Step 3: Run the targeted shop tests to verify the red state**

  Run:

  ```bash
  npm run test -- --run src/test/unlocks.test.ts src/test/playShellReveal.test.tsx
  ```

  Expected: FAIL because the selector only returns one flat `items` list and the component still renders every locked upgrade card.

### Task 3: Implement grouped shop state and full-shell rendering

**Files:**
- Modify: `src/lib/simulation/selectors.ts`
- Modify: `src/features/upgrades/UpgradeShop.tsx`
- Modify: `src/test/unlocks.test.ts`
- Modify: `src/test/playShellReveal.test.tsx`

- [ ] **Step 1: Add grouped shop state to `selectUpgradeShopState`**

  Extend the selector with a section model such as:

  ```ts
  export type UpgradeShopSection =
    | { id: "availableNow"; title: string; items: UpgradeShopItem[] }
    | { id: "owned"; title: string; items: UpgradeShopItem[] }
    | {
        id: "onDeck";
        title: string;
        items: {
          phaseLabel: string;
          lockedCount: number;
          teaser: string;
        }[];
      };
  ```

  Rules:

  - `availableNow`: available and unowned upgrades
  - `owned`: owned upgrades from unlocked phases
  - `onDeck`: one summary row per future locked phase, derived from currently locked upgrades
  - compact mode should keep using just the currently available upgrade items

- [ ] **Step 2: Update `UpgradeShop.tsx` to render sections intentionally**

  Full mode should render:

  - phase progress card
  - `availableNow` section as the primary action area
  - `owned` section with muted treatment and disabled buttons
  - `onDeck` summary cards without purchase buttons

  Compact mode should still show only currently available upgrades and should not render the future-phase summary.

- [ ] **Step 3: Re-run the targeted shop tests to verify the green state**

  Run:

  ```bash
  npm run test -- --run src/test/unlocks.test.ts src/test/playShellReveal.test.tsx
  ```

  Expected: PASS with grouped selector output and less cluttered full-shell rendering covered.

- [ ] **Step 4: Commit the shop chunk**

  Run:

  ```bash
  git add src/lib/simulation/selectors.ts src/features/upgrades/UpgradeShop.tsx src/test/unlocks.test.ts src/test/playShellReveal.test.tsx
  git commit -m "feat: simplify upgrade shop expansion"
  ```

## Chunk 3: Verification And Browser QA

### Task 4: Verify the finished pass and re-check the live feel

**Files:**
- No new files expected unless QA notes expose a concrete issue worth covering

- [ ] **Step 1: Run the full verification suite**

  Run:

  ```bash
  npm run verify
  ```

  Expected: PASS with lint, all tests, and production build succeeding.

- [ ] **Step 2: Re-open the live game in the worktree and replay the early beats**

  Use Playwright CLI against the local dev server and manually check:

  - fresh run compact shell
  - first cast cash reveal
  - third-cast HUD density
  - stock-pressure reveal plus `Reading the rail`
  - first affordable upgrade reveal
  - first purchased upgrade full-shell transition

- [ ] **Step 3: If browser QA exposes a concrete regression, add the narrowest missing test and fix it**

  Keep this scoped to early-session polish only. Do not expand into unrelated balancing work.

- [ ] **Step 4: Capture the final diff and commit any last QA-driven edits**

  Run:

  ```bash
  git status --short
  git add <changed-files>
  git commit -m "test: cover early session polish regressions"
  ```

## Notes For Execution

- Prefer selector and render changes over ad hoc JSX conditionals.
- Do not rebalance costs or unlock thresholds unless a bug forces it.
- If the compact shell still feels too airy after the first implementation, tighten spacing before changing economy.
- If the grouped shop state can be expressed without breaking existing component call sites, prefer extending the existing selector type rather than creating a second parallel shop selector.
