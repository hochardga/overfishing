import type { RunState } from "@/lib/storage/saveSchema";

import {
  storeRawFishInDock,
  syncStorageState,
} from "@/lib/simulation/reducers/storage";

export function syncPassiveGearState(run: RunState): RunState {
  const nextGear = Object.fromEntries(
    Object.entries(run.gear).map(([gearId, gear]) => [
      gearId,
      {
        ...gear,
        blockedByStorage: gear.blockedByStorage ?? false,
      },
    ]),
  ) as RunState["gear"];

  return {
    ...syncStorageState(run),
    gear: nextGear,
  };
}

export function advancePassiveGear(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  let nextRun = syncPassiveGearState(run);

  for (const [gearId, gear] of Object.entries(nextRun.gear)) {
    if (!gear.active) {
      continue;
    }

    const producedFish = gear.outputPerSecond * elapsedSeconds;
    const storageResult = storeRawFishInDock(nextRun, producedFish);

    nextRun = {
      ...storageResult.run,
      gear: {
        ...storageResult.run.gear,
        [gearId]: {
          ...storageResult.run.gear[gearId],
          blockedByStorage: storageResult.blockedFish > 0,
        },
      },
    };
  }

  return nextRun;
}
