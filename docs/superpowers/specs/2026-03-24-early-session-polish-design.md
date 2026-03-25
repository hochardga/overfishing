# Early Session Polish Design

**Date:** 2026-03-24
**Topic:** Overnight playtest-driven polish pass
**Approval Model:** User explicitly requested autonomous decisions while offline, so this design records inferred requirements and proceeds without an interactive approval loop.

## Goal

Improve the first several minutes of `Definitely Not Overfishing` by tightening the visual focus of the compact harbor shell, correcting one mistimed teaching reveal, and reducing the amount of upgrade clutter that appears the moment the player buys the first dock upgrade.

The target is not a full rebalance. The prototype already communicates its premise well and the recent progressive reveal work is directionally correct. The issue is that the current build still has a few moments where the presentation gets looser or noisier than the underlying game state deserves.

## Observed Problems

The overnight review combined code inspection with a live browser play pass. Three issues stood out:

1. The compact shell loses focus on wide screens.
   After the first few reveals, `EarlyHud` stretches into large, airy panels with empty-feeling negative space, and the compact stack grows wide enough that the screen feels sparse instead of intentional.

2. One of the early teaching beats lands later than intended.
   The stock-pressure meter appears before the explanatory “Reading the rail” card, but the current selector waits until the shop unlock to show that card. This makes the resource lesson feel slightly out of order.

3. The first upgrade purchase causes an abrupt information spike.
   Buying a single Quiet Pier upgrade expands the full shell and immediately reveals a long multi-phase shop list full of locked items. The player gets a lot more catalog than decision value, which muddies the reward of the first real purchase.

## Inferred Constraints

These constraints come from the repo, existing docs, and the user request:

- Keep the current economy broadly intact unless a concrete issue forces a rebalance.
- Preserve the existing progressive reveal architecture instead of replacing it with a bespoke tutorial system.
- Favor improvements that make the game feel better in-browser tonight: pacing readability, visual hierarchy, and decision clarity.
- Avoid unrelated refactors. Changes should stay near the play shell, early HUD, upgrade shop, and supporting selectors/tests.
- Maintain deterministic coverage through unit and render tests.

## Approaches Considered

### 1. Balance-first pass

Retune cast payouts, cooldowns, or early upgrade costs so the first purchase and phase unlocks arrive faster.

Pros:
- Directly affects early pacing.
- Could reduce repetition before the first meaningful choice.

Cons:
- Highest risk to the current balance targets and full-run tests.
- Hard to validate from one overnight pass without broader telemetry.
- Would not solve the visual looseness or catalog overload by itself.

### 2. Visual-only polish

Keep all logic intact and only improve spacing, sizing, and copy presentation in the play shell.

Pros:
- Safe and quick.
- Strong chance of improving first impressions.

Cons:
- Leaves the reveal-order mismatch in place.
- Leaves the upgrade shop overload intact once the full shell appears.

### 3. Experience-first polish pass

Keep the economy stable, then polish the places where the first session currently feels least intentional: compact-shell layout density, reveal ordering, and upgrade-shop information pressure.

Pros:
- High player-facing impact with lower systemic risk.
- Aligns with the user request to evaluate pace, look, and feel together.
- Works with the existing selector-driven architecture.

Cons:
- Slightly larger than a pure styling pass.
- Requires selector, component, and test updates together.

## Recommended Direction

Proceed with approach 3.

This pass should treat the game’s early economy as “good enough unless proven otherwise” and instead improve how that economy is presented and learned. The goal is a cleaner progression from first cast to first upgrade, then a gentler expansion into the full harbor shell.

## Design

## 1. Tighten The Compact Shell

The compact shell should feel like a focused play lane, not a stretched version of the full desktop shell.

Changes:

- `GameShell` compact mode should constrain the center column to a smaller max width and center it within the page.
- Compact-mode stacks should use slightly tighter vertical spacing than the full shell.
- The compact stack should keep one strong visual lane from onboarding to cast button to first upgrade choice.

This keeps the first minutes readable on large displays and makes the progression feel authored instead of merely hidden.

## 2. Make The Early HUD Adapt To Reveal Count

`EarlyHud` should stop using a static “up to four cards” desktop grid when only one, two, or three cards are visible.

Changes:

- The card grid should adapt to the number of visible meters.
- Compact reveal states should avoid large empty columns or oversized dead zones.
- Meter cards should support a slightly denser compact presentation so they read as tactical snapshots rather than oversized dashboard tiles.

The intent is to preserve the existing component while making partial-reveal states look deliberate.

## 3. Align “Reading The Rail” With Stock Pressure

The stock-pressure explainer should appear when the player first sees stock pressure, not later when the shop becomes available.

Changes:

- `selectPlayShellVisibility` should unlock `showReadingTheRailCard` in compact mode from `stockPressureVisible`.
- The compact explainer should remain absent before that step.
- Full shell behavior can remain always-on, since once the shell expands the player has already graduated from the minimal intro.

This restores the intended teach-what-you-just-saw rhythm.

## 4. Reduce The Post-Upgrade Shop Clutter

The first upgrade purchase should feel like expansion, not like opening a giant spreadsheet.

Changes:

- The upgrade shop should separate immediate decisions from future catalog.
- Full mode should emphasize currently available purchases first.
- Owned upgrades should remain visible but visually de-emphasized.
- Locked future-phase upgrades should move into a lighter-weight preview section instead of rendering the full list at once.

Recommended full-mode structure:

- Phase progress card
- Available now
- Owned already
- On deck: a compact preview of future phases or locked counts

Compact mode should remain focused on Quiet Pier purchases only.

This keeps the first reward punchy and lowers cognitive load without hiding long-term ambition.

## 5. Keep Copy Shorter And More Action-Led

The early shell currently repeats similar explanatory text across onboarding, the cast card, and helper cards.

Changes:

- Tighten compact copy so each card has one job.
- Let the cast card emphasize action and current state.
- Let explainer cards teach one system at a time.
- Avoid repeating the same “cash lands immediately” explanation across multiple surfaces when the HUD already proves it.

The goal is less reading between the first cast and first upgrade, without becoming cryptic.

## Architecture Impact

The implementation should stay inside the current architecture:

- Visibility decisions stay selector-driven.
- `GameShell`, `EarlyHud`, `CastButton`, and `UpgradeShop` stay declarative renderers.
- Shop grouping logic should live in selectors, not in JSX conditionals spread across the page.
- Existing progression thresholds and unlock rules remain unchanged unless a concrete bug is found while implementing.

Likely touch points:

- `src/components/game/GameShell.tsx`
- `src/components/game/EarlyHud.tsx`
- `src/components/ui/MeterCard.tsx`
- `src/features/fishing/CastButton.tsx`
- `src/features/upgrades/UpgradeShop.tsx`
- `src/lib/simulation/playShellVisibility.ts`
- `src/lib/simulation/selectors.ts`
- play-shell and upgrade-shop tests

## Out Of Scope

- Broad catch-rate, cooldown, or upgrade-cost rebalance
- New tutorial scripting, forced guidance, or modal walkthroughs
- New late-game systems
- A full visual redesign of the landing page or non-play routes

## Verification Strategy

Verification should prove both logic and feel-sensitive regressions:

- selector tests for the corrected `Reading the rail` reveal timing
- render tests for compact layout states with one, two, three, and four visible HUD cards
- shop tests that confirm available upgrades are prioritized and future upgrades are summarized instead of dumped
- manual browser QA on `/play` for:
  - fresh run
  - first cast
  - third cast
  - stock-pressure reveal
  - first affordable upgrade
  - first purchased upgrade

## Success Criteria

This pass is successful if:

- the compact shell feels intentionally narrow and readable on desktop
- partial HUD reveal states no longer look visually underfilled
- the stock-pressure explainer appears when that concept first appears
- the first purchased upgrade expands the shell without flooding the player with locked future content
- the app still passes lint, tests, and production build verification
