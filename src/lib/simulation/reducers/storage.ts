import type { RunState } from "@/lib/storage/saveSchema";

const BASE_GEAR_SLOT_CAP = 2;
const DECAY_MULTIPLIER_PER_MINUTE = 0.9;

function clampQuality(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function syncStorageState(run: RunState): RunState {
  const nextQuality =
    run.facilities.dockStorageRawFish > 0
      ? clampQuality(run.facilities.dockStorageQuality)
      : 1;
  const nextGearSlotCap = Math.max(run.facilities.gearSlotCap, BASE_GEAR_SLOT_CAP);

  if (
    nextQuality === run.facilities.dockStorageQuality &&
    nextGearSlotCap === run.facilities.gearSlotCap
  ) {
    return run;
  }

  return {
    ...run,
    facilities: {
      ...run.facilities,
      dockStorageQuality: nextQuality,
      gearSlotCap: nextGearSlotCap,
    },
  };
}

export function storeRawFishInDock(
  run: RunState,
  rawFish: number,
) {
  const syncedRun = syncStorageState(run);
  const availableCapacity = Math.max(
    0,
    syncedRun.facilities.dockStorageCap - syncedRun.facilities.dockStorageRawFish,
  );
  const storedFish = Math.min(rawFish, availableCapacity);
  const blockedFish = Math.max(0, rawFish - storedFish);

  return {
    run:
      storedFish === 0
        ? syncedRun
        : {
            ...syncedRun,
            facilities: {
              ...syncedRun.facilities,
              dockStorageRawFish:
                syncedRun.facilities.dockStorageRawFish + storedFish,
            },
          },
    storedFish,
    blockedFish,
  };
}

export function applyDockStorageDecay(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const syncedRun = syncStorageState(run);

  if (syncedRun.facilities.dockStorageRawFish <= 0) {
    return syncedRun.facilities.dockStorageQuality === 1
      ? syncedRun
      : {
          ...syncedRun,
          facilities: {
            ...syncedRun.facilities,
            dockStorageQuality: 1,
          },
        };
  }

  const nextQuality = clampQuality(
    syncedRun.facilities.dockStorageQuality *
      Math.pow(DECAY_MULTIPLIER_PER_MINUTE, elapsedSeconds / 60),
  );

  if (nextQuality === syncedRun.facilities.dockStorageQuality) {
    return syncedRun;
  }

  return {
    ...syncedRun,
    facilities: {
      ...syncedRun.facilities,
      dockStorageQuality: nextQuality,
    },
  };
}
