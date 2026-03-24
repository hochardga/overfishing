import {
  createDefaultMetaProgress,
  type MetaProgressState,
  type RunState,
} from "@/lib/storage/saveSchema";

export type PlayShellVisibilityModel = {
  shellMode: "compact" | "full";
  showOnboardingCard: boolean;
  showStatusRail: boolean;
  showProgressSummary: boolean;
  showLeftColumnCards: boolean;
  showRightColumnNotes: boolean;
  showShopRevealCue: boolean;
  showUpgradeShop: boolean;
  showReadingTheRailCard: boolean;
  earlyHudCards: {
    cash: boolean;
    nearbyFish: boolean;
    cooldown: boolean;
    stockPressure: boolean;
  };
  castButtonMode: "compact" | "full";
};

function hasDiscoveryStep(run: RunState, step: string) {
  return run.unlocks.discoverySteps.includes(step);
}

function selectShellMode(run: RunState): PlayShellVisibilityModel["shellMode"] {
  if (
    run.phase === "quietPier" &&
    hasDiscoveryStep(run, "compactIntroEnabled") &&
    !hasDiscoveryStep(run, "harborShellExpanded")
  ) {
    return "compact";
  }

  return "full";
}

export function selectPlayShellVisibility(
  run: RunState,
  meta: MetaProgressState = createDefaultMetaProgress(),
): PlayShellVisibilityModel {
  const shellMode = selectShellMode(run);
  const isCompact = shellMode === "compact";
  const introRetired = meta.unlockFlags.includes("quietPierIntroSeen");
  const showCashCard = shellMode === "full" || hasDiscoveryStep(run, "cashVisible");
  const showNearbyFishCard =
    shellMode === "full" || hasDiscoveryStep(run, "nearbyFishVisible");
  const showCooldownCard =
    shellMode === "full" || hasDiscoveryStep(run, "cooldownVisible");
  const showStockPressureCard =
    shellMode === "full" || hasDiscoveryStep(run, "stockPressureVisible");

  return {
    shellMode,
    showOnboardingCard:
      isCompact &&
      !introRetired &&
      !hasDiscoveryStep(run, "firstCastCompleted"),
    showStatusRail: shellMode === "full",
    showProgressSummary: shellMode === "full",
    showLeftColumnCards: shellMode === "full",
    showRightColumnNotes: shellMode === "full",
    showShopRevealCue: isCompact && hasDiscoveryStep(run, "shopVisible"),
    showUpgradeShop: shellMode === "full",
    showReadingTheRailCard: shellMode === "full",
    earlyHudCards: {
      cash: showCashCard,
      nearbyFish: showNearbyFishCard,
      cooldown: showCooldownCard,
      stockPressure: showStockPressureCard,
    },
    castButtonMode: shellMode,
  };
}
