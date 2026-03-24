import { getUpgradeDefinition } from "@/lib/economy/upgrades";
import type { RunState } from "@/lib/storage/saveSchema";

import { getAutoHaulIntervalSeconds } from "@/lib/simulation/reducers/helpers";
import {
  storeRawFishInDock,
  syncStorageState,
} from "@/lib/simulation/reducers/storage";

const PASSIVE_GEAR_UPGRADE_IDS = ["crabPot", "longline"] as const;
const EPSILON = 0.0001;

export type CollectPassiveGearArgs = {
  gearId: string;
};

export type CollectPassiveGearOutcome =
  | "collected"
  | "empty"
  | "missingGear";

export type CollectPassiveGearResult = {
  outcome: CollectPassiveGearOutcome;
  run: RunState;
  storedFish: number;
  blockedFish: number;
  feedback: string;
};

function buildFeedback(
  outcome: CollectPassiveGearOutcome,
  label: string,
) {
  if (outcome === "collected") {
    return `${label} hauled back to the dock.`;
  }

  if (outcome === "empty") {
    return `${label} has nothing ready to haul yet.`;
  }

  return `${label} is not deployed.`;
}

function syncOwnedPassiveGear(run: RunState): RunState {
  const nextRun = syncStorageState(run);
  let nextGear = nextRun.gear;

  for (const upgradeId of PASSIVE_GEAR_UPGRADE_IDS) {
    if (!nextRun.unlocks.upgrades.includes(upgradeId)) {
      continue;
    }

    const passiveGear = getUpgradeDefinition(upgradeId).passiveGear;

    if (!passiveGear) {
      continue;
    }

    const currentGear = nextGear[passiveGear.gearId];
    const syncedGear = currentGear
      ? {
          ...currentGear,
          kind: passiveGear.kind,
          assignedRegionId: passiveGear.assignedRegionId,
          outputPerSecond: passiveGear.outputPerSecond,
          collectionIntervalSeconds: passiveGear.collectionIntervalSeconds,
          bufferedCatch: currentGear.bufferedCatch ?? 0,
          active: true,
          blockedByStorage: currentGear.blockedByStorage ?? false,
        }
      : {
          id: passiveGear.gearId,
          kind: passiveGear.kind,
          assignedRegionId: passiveGear.assignedRegionId,
          outputPerSecond: passiveGear.outputPerSecond,
          collectionIntervalSeconds: passiveGear.collectionIntervalSeconds,
          secondsSinceCollection: 0,
          bufferedCatch: 0,
          active: true,
          blockedByStorage: false,
        };

    nextGear = {
      ...nextGear,
      [passiveGear.gearId]: syncedGear,
    };
  }

  if (nextGear === nextRun.gear) {
    return nextRun;
  }

  return {
    ...nextRun,
    gear: nextGear,
  };
}

function updateGear(
  run: RunState,
  gearId: string,
  updater: (gear: RunState["gear"][string]) => RunState["gear"][string],
): RunState {
  return {
    ...run,
    gear: {
      ...run.gear,
      [gearId]: updater(run.gear[gearId]),
    },
  };
}

function haulPassiveGearInternal(
  run: RunState,
  gearId: string,
  pauseSeconds: number,
): CollectPassiveGearResult {
  const syncedRun = syncOwnedPassiveGear(run);
  const gear = syncedRun.gear[gearId];
  const label = gear?.kind === "longline" ? "Longline" : "Crab Pot";

  if (!gear) {
    return {
      outcome: "missingGear",
      run: syncedRun,
      storedFish: 0,
      blockedFish: 0,
      feedback: buildFeedback("missingGear", label),
    };
  }

  if (gear.bufferedCatch <= EPSILON) {
    return {
      outcome: "empty",
      run: updateGear(syncedRun, gearId, (currentGear) => ({
        ...currentGear,
        blockedByStorage: false,
        secondsSinceCollection: 0,
      })),
      storedFish: 0,
      blockedFish: 0,
      feedback: buildFeedback("empty", label),
    };
  }

  const storageResult = storeRawFishInDock(syncedRun, gear.bufferedCatch);
  const blockedFish = gear.bufferedCatch - storageResult.storedFish;

  return {
    outcome: "collected",
    run: updateGear(storageResult.run, gearId, (currentGear) => ({
      ...currentGear,
      bufferedCatch: blockedFish,
      blockedByStorage: blockedFish > EPSILON,
      secondsSinceCollection: blockedFish > EPSILON ? pauseSeconds : 0,
    })),
    storedFish: storageResult.storedFish,
    blockedFish,
    feedback: buildFeedback("collected", label),
  };
}

export function syncPassiveGearState(run: RunState): RunState {
  const syncedRun = syncOwnedPassiveGear(run);
  const nextGear = Object.fromEntries(
    Object.entries(syncedRun.gear).map(([gearId, gear]) => [
      gearId,
      {
        ...gear,
        bufferedCatch: gear.bufferedCatch ?? 0,
        blockedByStorage: gear.blockedByStorage ?? false,
      },
    ]),
  ) as RunState["gear"];

  return {
    ...syncedRun,
    gear: nextGear,
  };
}

export function collectPassiveGear(
  run: RunState,
  args: CollectPassiveGearArgs,
): CollectPassiveGearResult {
  const syncedRun = syncPassiveGearState(run);
  const gear = syncedRun.gear[args.gearId];

  if (!gear) {
    return haulPassiveGearInternal(syncedRun, args.gearId, 0);
  }

  return haulPassiveGearInternal(
    syncedRun,
    args.gearId,
    gear.collectionIntervalSeconds,
  );
}

function bufferPassiveCatch(
  run: RunState,
  gearId: string,
  productiveSeconds: number,
): RunState {
  return updateGear(run, gearId, (gear) => ({
    ...gear,
    bufferedCatch: gear.bufferedCatch + gear.outputPerSecond * productiveSeconds,
    secondsSinceCollection: gear.secondsSinceCollection + productiveSeconds,
    blockedByStorage: false,
  }));
}

export function advancePassiveGear(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  let nextRun = syncPassiveGearState(run);
  const autoHaulIntervalSeconds = getAutoHaulIntervalSeconds(nextRun);

  for (const gearId of Object.keys(nextRun.gear)) {
    let remainingSeconds = elapsedSeconds;

    while (remainingSeconds > EPSILON) {
      const gear = nextRun.gear[gearId];

      if (!gear?.active) {
        break;
      }

      if (gear.blockedByStorage) {
        if (
          autoHaulIntervalSeconds !== null &&
          gear.secondsSinceCollection >= autoHaulIntervalSeconds - EPSILON
        ) {
          const haulResult = haulPassiveGearInternal(
            nextRun,
            gearId,
            autoHaulIntervalSeconds,
          );

          nextRun = haulResult.run;

          if (nextRun.gear[gearId].blockedByStorage) {
            break;
          }

          continue;
        }

        break;
      }

      const cadenceSeconds =
        autoHaulIntervalSeconds ?? gear.collectionIntervalSeconds;
      const secondsUntilCadence = Math.max(
        0,
        cadenceSeconds - gear.secondsSinceCollection,
      );

      if (secondsUntilCadence <= EPSILON) {
        if (autoHaulIntervalSeconds !== null) {
          const haulResult = haulPassiveGearInternal(
            nextRun,
            gearId,
            autoHaulIntervalSeconds,
          );

          nextRun = haulResult.run;

          if (nextRun.gear[gearId].blockedByStorage) {
            break;
          }

          continue;
        }

        break;
      }

      const productiveSeconds = Math.min(remainingSeconds, secondsUntilCadence);

      nextRun = bufferPassiveCatch(nextRun, gearId, productiveSeconds);
      remainingSeconds -= productiveSeconds;

      const updatedGear = nextRun.gear[gearId];

      if (
        autoHaulIntervalSeconds !== null &&
        updatedGear.secondsSinceCollection >= autoHaulIntervalSeconds - EPSILON
      ) {
        const haulResult = haulPassiveGearInternal(
          nextRun,
          gearId,
          autoHaulIntervalSeconds,
        );

        nextRun = haulResult.run;

        if (nextRun.gear[gearId].blockedByStorage) {
          break;
        }
      }

      if (
        autoHaulIntervalSeconds === null &&
        updatedGear.secondsSinceCollection >=
          updatedGear.collectionIntervalSeconds - EPSILON
      ) {
        break;
      }
    }
  }

  return nextRun;
}
