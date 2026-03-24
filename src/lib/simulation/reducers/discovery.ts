import { upgradeDefinitions } from "@/lib/economy/upgrades";
import type {
  DiscoveryStep,
  MetaProgressState,
  RunState,
} from "@/lib/storage/saveSchema";

const QUIET_PIER_INTRO_SEEN_FLAG = "quietPierIntroSeen";

type DiscoveryMilestone = {
  steps: readonly DiscoveryStep[];
  isUnlocked: (run: RunState) => boolean;
};

const orderedDiscoveryMilestones: readonly DiscoveryMilestone[] = [
  {
    steps: ["firstCastCompleted", "cashVisible"],
    isUnlocked: (run) => run.lifetimeFishLanded >= 1,
  },
  {
    steps: ["nearbyFishVisible", "cooldownVisible"],
    isUnlocked: (run) => run.lifetimeFishLanded >= 3,
  },
  {
    steps: ["stockPressureVisible"],
    isUnlocked: (run) =>
      run.lifetimeFishLanded >= 8 ||
      run.regions.pierCove.stockCurrent / run.regions.pierCove.stockCap <= 0.85,
  },
  {
    steps: ["shopVisible"],
    isUnlocked: (run) => {
      const cheapestAvailableUpgradeCost = Object.values(upgradeDefinitions)
        .filter(
          (upgrade) =>
            upgrade.phase === "quietPier" &&
            !run.unlocks.upgrades.includes(upgrade.id),
        )
        .reduce<number | null>(
          (lowestCost, upgrade) =>
            lowestCost === null ? upgrade.cost : Math.min(lowestCost, upgrade.cost),
          null,
        );

      return (
        cheapestAvailableUpgradeCost !== null &&
        run.cash >= cheapestAvailableUpgradeCost
      );
    },
  },
  {
    steps: ["harborShellExpanded"],
    isUnlocked: (run) =>
      run.unlocks.upgrades.length >= 1 || run.phase !== "quietPier",
  },
] as const;

function appendUniqueDiscoverySteps(
  existingSteps: readonly DiscoveryStep[],
  promotedSteps: readonly DiscoveryStep[],
) {
  return promotedSteps.reduce<DiscoveryStep[]>(
    (steps, step) => (steps.includes(step) ? steps : [...steps, step]),
    [...existingSteps],
  );
}

export function syncDiscoveryState(
  run: RunState,
  meta: MetaProgressState,
): { run: RunState; meta: MetaProgressState } {
  let highestUnlockedMilestoneIndex = -1;

  orderedDiscoveryMilestones.forEach((milestone, index) => {
    if (milestone.isUnlocked(run)) {
      highestUnlockedMilestoneIndex = index;
    }
  });

  if (highestUnlockedMilestoneIndex < 0) {
    return { run, meta };
  }

  const promotedSteps = orderedDiscoveryMilestones
    .slice(0, highestUnlockedMilestoneIndex + 1)
    .flatMap((milestone) => milestone.steps);
  const nextDiscoverySteps = appendUniqueDiscoverySteps(
    run.unlocks.discoverySteps,
    promotedSteps,
  );
  const firstCastPromotedThisPass =
    !run.unlocks.discoverySteps.includes("firstCastCompleted") &&
    promotedSteps.includes("firstCastCompleted");
  const nextUnlockFlags = firstCastPromotedThisPass
    ? Array.from(new Set([...meta.unlockFlags, QUIET_PIER_INTRO_SEEN_FLAG]))
    : meta.unlockFlags;
  const didRunChange = nextDiscoverySteps.length !== run.unlocks.discoverySteps.length;
  const didMetaChange = nextUnlockFlags.length !== meta.unlockFlags.length;

  return {
    run: didRunChange
      ? {
          ...run,
          unlocks: {
            ...run.unlocks,
            discoverySteps: nextDiscoverySteps,
          },
        }
      : run,
    meta: didMetaChange
      ? {
          ...meta,
          unlockFlags: nextUnlockFlags,
        }
      : meta,
  };
}
