# Progressive UI Reveal Design

**Date:** 2026-03-24
**Phase:** Onboarding and first-session readability
**Roadmap Source:** `docs/product-roadmap.md`

## Goal

Reduce the intimidation of the opening play screen by hiding most of the current harbor UI at the start of a brand-new run, then progressively revealing the existing information density through small player-driven milestones and larger phase-driven unlocks.

## Scope

This design covers the first-session presentation layer for the play screen:

- A compact opening shell for brand-new runs in `quietPier`
- A milestone ladder that reveals small UI surfaces after meaningful player actions
- Full-shell expansion once the player has demonstrated the core loop
- Interactions between the reveal ladder, existing phase unlocks, save recovery, and later runs
- Selector-driven visibility rules and regression coverage for the reveal behavior

Out of scope:

- Rebalancing catch rates, prices, or upgrade costs
- Rewriting the current three-column game shell structure beyond adding an explicit compact layout mode to `GameShell`
- Adding bespoke tutorial flows, cutscenes, or mandatory step-by-step scripting
- Changing the existing phase unlock thresholds or modal copy beyond what is needed to coexist with the reveal ladder

## Product Constraints

The reveal system must preserve the current product direction:

- The first thing a new player understands is how to cast.
- Early guidance should feel loose and earned, not scripted or mandatory.
- Hidden UI should be completely absent, not disabled, blurred, or teaser-sized.
- The game should still reach the current information density; it just should not lead with all of it.
- Small presentation reveals should come from player actions, while larger systems should still arrive at phase unlock beats.
- The compact intro should be a first-session aid, not a permanent restriction on repeat runs.

## Architecture

The feature should extend the existing simulation and selector architecture instead of introducing a parallel onboarding system.

The source of truth should be an explicit hybrid:

- `RunState` remains the source of truth for all reveal progress.
- `save.meta.unlockFlags` stores one cross-run flag, `quietPierIntroSeen`, that determines whether future runs should skip the compact intro.
- `run.unlocks.discoverySteps` stores per-run reveal milestones as an enum-backed array of IDs: `compactIntroEnabled`, `firstCastCompleted`, `cashVisible`, `nearbyFishVisible`, `cooldownVisible`, `stockPressureVisible`, `shopVisible`, and `harborShellExpanded`.
- Phase unlocks continue to answer whether a system exists in the run.
- Discovery milestones answer whether a piece of UI is allowed to render yet.
- A single store-owned synchronization step, `syncDiscoveryState(run, meta): { run, meta }`, should derive and persist missing discovery milestones from current run state after every gameplay mutation, tick update, initialization, and save recovery.
- UI visibility should read from the persisted discovery steps, not re-derive the whole ladder ad hoc in components.
- `PlayPage` consumes a selector-produced layout model rather than hardcoding early-screen visibility inline.
- Existing components such as `EarlyHud`, `ProgressSummary`, `UpgradeShop`, and the supporting explainer cards stay in place, but they render only when the selector says they are visible.

This keeps the reveal logic deterministic, saveable, and testable while preserving the current component tree.

## Reveal Ladder

The recommended opening flow is a milestone ladder.

### Opening State

On a brand-new `quietPier` run, the play screen should start with only:

- the existing first-cast guidance card
- the `CastButton`

The following surfaces should be absent:

- `StatusRail`
- `ProgressSummary`
- `EarlyHud`
- left-column explainer cards
- `UpgradeShop`
- right-column notes cards

### Small Action-Driven Reveals

The opening shell should expand through player actions rather than timers.

1. After the first successful cast, reveal immediate cash feedback and a short explanation that fish sell automatically.
2. After `lifetimeFishLanded >= 3`, reveal the early dock readouts for `Fish nearby` and `Cast cooldown` so the player learns the rhythm and the local resource.
3. After `lifetimeFishLanded >= 8` or `pierCove.stockCurrent / pierCove.stockCap <= 0.85`, reveal `Stock pressure` and its explanation so the player understands that the water reacts to pressure.
4. Once `cash >= cheapestAvailableQuietPierUpgradeCost`, reveal `UpgradeShop` with a short “dockside shop is open” cue.
5. After the first upgrade purchase, or immediately when the run leaves `quietPier`, expand into the normal harbor shell for the rest of the run, including `StatusRail`, `ProgressSummary`, and the supporting explanatory cards.

The thresholds should be milestone-based and forgiving. If multiple prerequisites are already satisfied when a run is evaluated, the system should unlock all earlier reveal steps in one pass.

### Phase-Driven Reveals

Large system surfaces should continue to arrive through the existing phase progression:

- `SkiffPanel` from `skiffOperator`
- `GearPanel` from `docksideGear`
- fleet operations surfaces from `fleetOps`
- processing and contract surfaces from `processingContracts`
- regions and renewal surfaces from `regionalExtraction`

The reveal ladder should not replace the existing phase model. It only governs how much of the early shell is shown before the player has settled into the manual loop.

## State Model

The reveal progress should live inside `run.unlocks` as a small first-session discovery model, with one cross-run completion flag in `save.meta.unlockFlags`.

The per-run discovery state should be an enum-backed array of IDs with these values:

- compact intro enabled for this run
- first successful cast completed
- cash readout visible
- nearby-fish readout visible
- cooldown readout visible
- stock-pressure readout visible
- upgrade shop visible
- full harbor shell expanded

The distinction between the two progression layers is important:

- phase unlocks say the system exists
- discovery unlocks say the UI may render it yet

This state should persist in saves and travel with normal store updates so refreshes and save recovery restore the same UI footprint the player last earned.

Run creation should decide whether the compact intro applies:

- `createStarterRun(meta)` and later run resets should seed `compactIntroEnabled` only when `quietPierIntroSeen` is absent from `meta.unlockFlags`, `meta.renewals === 0`, `meta.startingCashBonus === 0`, and `meta.manualCatchBonus === 0`.
- Once a run starts with `compactIntroEnabled`, that current run should continue using the milestone ladder until `harborShellExpanded` or a later phase ends it.
- When `firstCastCompleted` is reached for the first time, the save meta layer should append `quietPierIntroSeen` to `meta.unlockFlags` so future runs skip the compact intro even if the current run is still progressing through the ladder.

## Reveal Matrix

The plan should treat the following mapping as authoritative.

| Surface | Concrete component or area | Unlock type | Promotion predicate | Render predicate | Persisted state | Required test |
| --- | --- | --- | --- | --- | --- | --- |
| Opening guidance | onboarding card in the center column using the existing `play-shell-onboarding` content | Discovery-driven | `firstCastCompleted` is promoted when `lifetimeFishLanded >= 1` | `shellMode === "compact"` and `compactIntroEnabled` is set and `firstCastCompleted` is not set | `compactIntroEnabled`, `firstCastCompleted` | Fresh run shows onboarding card; first successful cast hides it |
| Core action | `CastButton` base card and primary button | Always visible | None | Always rendered on `/play` | None | Fresh run still allows immediate play |
| Compact cast details | detail copy inside `CastButton` excluding stock/cooldown sub-readouts | Discovery-driven | None | `shellMode === "compact"` | None | Fresh run shows only the simplified cast explanation |
| Cash readout | `EarlyHud` cash meter card | Discovery-driven | `cashVisible` is promoted when `lifetimeFishLanded >= 1` | `cashVisible` is set | `cashVisible` | First cast reveals cash card |
| Nearby fish readout | `EarlyHud` nearby-fish meter card | Discovery-driven | `nearbyFishVisible` is promoted when `lifetimeFishLanded >= 3` | `nearbyFishVisible` is set | `nearbyFishVisible` | Third landed fish reveals nearby-fish card |
| Cooldown readout | `EarlyHud` cooldown meter card and expanded timing details in `CastButton` | Discovery-driven | `cooldownVisible` is promoted when `lifetimeFishLanded >= 3` | `cooldownVisible` is set | `cooldownVisible` | Third landed fish reveals cooldown information |
| Stock pressure readout | `EarlyHud` stock-pressure meter card plus a compact “Reading the rail” explainer rendered in the center column while `shellMode === "compact"` and in the right column once `shellMode === "full"` | Discovery-driven | `stockPressureVisible` is promoted when `lifetimeFishLanded >= 8` or `pierCove.stockCurrent / pierCove.stockCap <= 0.85` | `stockPressureVisible` is set | `stockPressureVisible` | Stock-pressure milestone reveals both the meter and its explainer |
| Shop reveal cue | small helper copy rendered directly above `UpgradeShop` in the center column while `shellMode === "compact"` and in the right column once `shellMode === "full"` | Discovery-driven | `shopVisible` is promoted when `cash >= cheapest cost among available, unowned quiet-pier upgrades` | `shopVisible` is set | `shopVisible` | Shop reveal also shows the helper cue once visible |
| Upgrade shop | `UpgradeShop`, rendered in the center column while `shellMode === "compact"` and in the normal right column once `shellMode === "full"` | Discovery-driven | `shopVisible` is promoted when `cash >= cheapest cost among available, unowned quiet-pier upgrades` | `shopVisible` is set | `shopVisible` | Affordable first upgrade reveals a quiet-pier-only shop in compact mode and the normal shop in full mode |
| Expanded harbor shell | `StatusRail`, `ProgressSummary`, left-column hero/why/quick-exit cards, right-column operations notes, and normal full `CastButton`/`EarlyHud` context | Discovery-driven with phase fallback | `harborShellExpanded` is promoted when `run.unlocks.upgrades.length >= 1` or `run.phase !== "quietPier"` | `shellMode === "full"` | `harborShellExpanded`; cross-run `quietPierIntroSeen` | First upgrade purchase expands shell; entering `skiffOperator` without a purchase also expands shell |
| Later system panels | `SkiffPanel`, `GearPanel`, fleet, processing, contracts, regions, renewal surfaces | Phase-driven | Existing phase and unlock rules | Existing phase and unlock rules | Existing phase state | Existing phase unlock coverage still passes |

## Play Shell Visibility Contract

`PlayPage` should consume one selector contract, `selectPlayShellVisibility(run, meta)`, where:

- `run` is the current `RunState`
- `meta` is the current `MetaProgressState`, exposed on `GameStoreState` alongside `run`

The selector output should include at least:

- `shellMode`: `"compact"` or `"full"`
- `showOnboardingCard`
- `showStatusRail`
- `showProgressSummary`
- `showLeftColumnCards`
- `showRightColumnNotes`
- `showShopRevealCue`
- `showUpgradeShop`
- `showReadingTheRailCard`
- `earlyHudCards`: `{ cash: boolean; nearbyFish: boolean; cooldown: boolean; stockPressure: boolean }`
- `castButtonMode`: `"compact"` or `"full"`

The compact intro should use `GameShell` in an explicit compact layout mode owned by `GameShell`, not by ad hoc branching around it in `PlayPage`. In compact mode it collapses to a single center-column presentation until `shellMode === "full"`. It should not render empty left or right columns. The fixed center-column order is: onboarding card, partial `EarlyHud`, compact reading-the-rail explainer, `CastButton`, shop reveal cue, and compact `UpgradeShop`.

## Selector And Component Responsibilities

Visibility rules should be centralized in selectors instead of spread across component JSX.

### Selectors

- Add the `selectPlayShellVisibility(run, meta)` selector that returns the play-screen visibility model, including whether to show the compact intro, the expanded harbor shell, and each gated sub-surface.
- Add selector support for partial `EarlyHud` rendering so individual meter cards can appear independently.
- Add the dedicated store-owned `syncDiscoveryState` step that promotes discovery milestones when their exact predicates are met, including batched promotion of prerequisite steps if the run has already advanced past them.
- Keep reveal thresholds based on existing state such as `lifetimeFishLanded`, `cash`, owned upgrades, `phase`, and local region stock rather than introducing extra timers.

### Components

- `PlayPage` should switch from ad hoc early-game conditionals to a single layout-state selector.
- `CastButton` should support a compact mode that hides stock and cooldown sub-readouts until the corresponding discovery steps are visible.
- `EarlyHud` should support rendering only the cards that have been discovered.
- Existing informational cards should render only when their associated reveal step is active.
- The “dockside shop is open” cue should be implemented as a concrete helper line rendered immediately above `UpgradeShop`, not as an unspecified future tutorial surface.
- `UpgradeShop` should support a compact quiet-pier mode that shows only available quiet-pier upgrades until `shellMode === "full"`, then return to the normal multi-phase shop presentation.
- `PhaseUnlockModal` and `LicenseRenewalModal` should continue to layer on top of whatever shell is currently visible.

This keeps the UI declarative and makes the reveal system easy to exercise in render tests.

## First-Session Guardrails

The compact intro should apply only when it improves comprehension.

- It should be active only when all of the following are true:
  - the run is still in `quietPier`
  - `compactIntroEnabled` is set in `run.unlocks.discoverySteps`
  - `harborShellExpanded` is not set in `run.unlocks.discoverySteps`
- Once the player reaches the full-shell milestone, the normal harbor screen should remain available for the rest of that run.
- Recovered or migrated saves that fail any of the compact-intro checks should skip the ultra-minimal opening and start in the expanded shell.
- If the app cannot confidently determine first-session status because of old or partial save data, it should fail safe toward showing more UI, not less.

This avoids turning a welcoming first-run experience into friction for experienced players.

## Data And UI Flow

The intended reveal flow is:

1. Player performs gameplay action or store state changes through normal simulation paths.
2. Store reducers update the run state.
3. Store normalization runs `applyUnlockChecks(run)`.
4. Store normalization then runs `syncDiscoveryState(run, meta)` and returns normalized `{ run, meta }`.
5. The store persists normalized `{ run, meta }`.
6. `PlayPage` reads the current reveal model from selectors.
7. Only the allowed surfaces render.
8. Existing phase checks and modals continue to operate on top of the same normalized run state.

The reveal system should not depend on component-local timers, wizard state, or ephemeral view-only flags that can drift from the save.

## Error Handling

The design should be resilient to save-version drift and unusual progression order:

- Missing `run.unlocks.discoverySteps` in older saves should normalize to the full expanded set of reveal steps, including `harborShellExpanded`, without forcing a save reset.
- Any recovery or migration path that fails safe to the expanded shell should also append `quietPierIntroSeen` to `meta.unlockFlags` so future resets and renewals skip the compact intro.
- If carryover bonuses or imported state satisfy later reveal milestones early, prerequisite reveals should become visible automatically in a single synchronization pass.
- Save recovery should restore the same reveal progress without replaying the entire intro.
- Phase modals should continue to appear deterministically even if a reveal step and a phase threshold trigger close together.

## Verification Strategy

The implementation should rely on selector and render coverage rather than manual-only QA.

Required verification themes:

- Fresh run renders only first-cast guidance plus the cast action.
- First cast reveals cash feedback.
- Early catch milestones reveal nearby-fish and cooldown readouts.
- Stock pressure appears only when the cove state is meaningful enough to explain.
- The upgrade shop appears when the player can actually use it.
- First upgrade purchase expands the full harbor shell for the remainder of the run.
- Entering a later phase before any quiet-pier upgrade still expands the full harbor shell.
- Save/load and refresh preserve discovery progress.
- Repeat runs with meta progression skip the compact intro.
- Older or partial save shapes fail safe toward a fully usable shell.
- Batched milestone promotion unlocks all prerequisite reveal steps in one pass.
- Reveal-step changes and phase unlock modal triggers remain deterministic when they happen in the same update.

## Follow-Up Notes

The design can support lightweight evaluation without making analytics a dependency. If the team wants to measure whether the softer opening improves first-session comprehension, these are the most relevant non-blocking events:

- `first_cast_completed`
- `ui_reveal_step_reached`
- `first_upgrade_shop_revealed`
- `harbor_shell_expanded`

These events should be advisory only and should not gate the feature.

## Risks And Mitigations

- Risk: the reveal ladder becomes a second unlock system with duplicated rules.
  Mitigation: keep phase progression authoritative for gameplay systems and use discovery state only for presentation gating.

- Risk: reveal rules end up scattered across JSX and become hard to reason about.
  Mitigation: centralize visibility in selectors and feed components a single layout model.

- Risk: repeat runs feel artificially constrained.
  Mitigation: scope the compact intro to first-session conditions and fail safe toward the expanded shell when uncertain.

- Risk: players miss important systems because the UI stays too sparse for too long.
  Mitigation: tie reveals to meaningful actions, unlock prerequisites in batches when milestones are already met, and expand the full shell after the first upgrade.

## Implementation Readiness

This feature is tightly scoped to the existing play screen and does not need to be decomposed into multiple independent projects. The key implementation boundary is between durable reveal state, selector-derived layout decisions, and presentational components that remain otherwise unchanged.
