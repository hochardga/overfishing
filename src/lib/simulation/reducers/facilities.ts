import type { RunState } from "@/lib/storage/saveSchema";

const UNLOAD_RATE_PER_LANE_PER_SECOND = 0.2;

function hasUpgrade(run: RunState, upgradeId: string) {
  return run.unlocks.upgrades.includes(upgradeId);
}

function recalculateRawFish(run: RunState) {
  return run.facilities.dockStorageRawFish + run.facilities.coldStorageRawFish;
}

export function syncFacilitiesState(run: RunState): RunState {
  const unloadLanes = hasUpgrade(run, "dockForklift") ? 2 : 1;
  const coldStorageCap = hasUpgrade(run, "processingShed")
    ? 40 + (hasUpgrade(run, "coldRoomExpansion") ? 40 : 0)
    : 0;
  const nextColdStorageRawFish = Math.min(run.facilities.coldStorageRawFish, coldStorageCap);
  const flashFreezerEnabled = hasUpgrade(run, "flashFreezer");
  const canneryEnabled = hasUpgrade(run, "canneryLine");

  if (
    unloadLanes === run.facilities.unloadLanes &&
    coldStorageCap === run.facilities.coldStorageCap &&
    nextColdStorageRawFish === run.facilities.coldStorageRawFish &&
    flashFreezerEnabled === run.facilities.flashFreezerEnabled &&
    canneryEnabled === run.facilities.canneryEnabled &&
    run.resources.rawFish === recalculateRawFish(run)
  ) {
    return run;
  }

  return {
    ...run,
    facilities: {
      ...run.facilities,
      unloadLanes,
      coldStorageCap,
      coldStorageRawFish: nextColdStorageRawFish,
      flashFreezerEnabled,
      canneryEnabled,
    },
    resources: {
      ...run.resources,
      rawFish: run.facilities.dockStorageRawFish + nextColdStorageRawFish,
    },
  };
}

export function advanceFacilities(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const syncedRun = syncFacilitiesState(run);
  let remainingUnloadCapacity =
    syncedRun.facilities.unloadLanes * UNLOAD_RATE_PER_LANE_PER_SECOND * elapsedSeconds;
  let nextRun = syncedRun;

  for (const [boatId, boat] of Object.entries(nextRun.boats)) {
    if (remainingUnloadCapacity <= 0 || boat.status !== "docked" || boat.holdCurrent <= 0) {
      continue;
    }

    const availableDockCapacity = Math.max(
      0,
      nextRun.facilities.dockStorageCap - nextRun.facilities.dockStorageRawFish,
    );
    const availableColdCapacity = Math.max(
      0,
      nextRun.facilities.coldStorageCap - nextRun.facilities.coldStorageRawFish,
    );
    const unloadAmount = Math.min(
      boat.holdCurrent,
      remainingUnloadCapacity,
      availableDockCapacity + availableColdCapacity,
    );

    if (unloadAmount <= 0) {
      continue;
    }

    const movedToDock = Math.min(unloadAmount, availableDockCapacity);
    const movedToCold = Math.min(
      unloadAmount - movedToDock,
      availableColdCapacity,
    );
    const nextHoldCurrent = boat.holdCurrent - movedToDock - movedToCold;

    nextRun = {
      ...nextRun,
      boats: {
        ...nextRun.boats,
        [boatId]: {
          ...boat,
          holdCurrent: nextHoldCurrent,
          status:
            nextHoldCurrent <= 0 &&
            boat.automated &&
            boat.crewAssigned &&
            boat.assignedRegionId &&
            !boat.breakdownUntilTimestamp
              ? "fishing"
              : boat.status,
        },
      },
      facilities: {
        ...nextRun.facilities,
        dockStorageRawFish: nextRun.facilities.dockStorageRawFish + movedToDock,
        coldStorageRawFish: nextRun.facilities.coldStorageRawFish + movedToCold,
      },
    };
    remainingUnloadCapacity -= unloadAmount;
  }

  return syncFacilitiesState({
    ...nextRun,
    resources: {
      ...nextRun.resources,
      rawFish:
        nextRun.facilities.dockStorageRawFish +
        nextRun.facilities.coldStorageRawFish,
    },
  });
}
