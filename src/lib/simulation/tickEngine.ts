import type { RunState } from "@/lib/storage/saveSchema";
import { applyRegionsStockPressure } from "@/lib/economy/regions";
import {
  advancePassiveGear,
  syncPassiveGearState,
} from "@/lib/simulation/reducers/passiveGear";
import {
  advanceSkiffTrips,
  syncSkiffState,
} from "@/lib/simulation/reducers/skiffTrips";
import {
  applyDockStorageDecay,
  syncStorageState,
} from "@/lib/simulation/reducers/storage";
import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";

export function advanceRunBySeconds(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const syncedRun = syncPassiveGearState(syncStorageState(syncSkiffState(run)));
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);

  if (safeElapsedSeconds === 0) {
    return syncPassiveGearState(
      syncStorageState(syncSkiffState(applyUnlockChecks(syncedRun))),
    );
  }

  const nextRegions = applyRegionsStockPressure(
    Object.fromEntries(
      Object.entries(syncedRun.regions).map(([regionId, region]) => [
        regionId,
        {
          ...region,
          stockCurrent: Math.min(
            region.stockCap,
            region.stockCurrent + region.regenPerSecond * safeElapsedSeconds,
          ),
        },
      ]),
    ) as RunState["regions"],
  );
  const cooldownReductionMs = safeElapsedSeconds * 1000;
  const nextCooldownMs = Math.max(
    0,
    syncedRun.manual.cooldownMs - cooldownReductionMs,
  );
  const advancedRun = advanceSkiffTrips(
    {
      ...syncedRun,
      elapsedSeconds: syncedRun.elapsedSeconds + safeElapsedSeconds,
      manual: {
        ...syncedRun.manual,
        cooldownMs: nextCooldownMs < 1 ? 0 : nextCooldownMs,
      },
      regions: nextRegions,
    },
    safeElapsedSeconds,
  );
  const passiveGearRun = advancePassiveGear(advancedRun, safeElapsedSeconds);
  const storageRun = applyDockStorageDecay(passiveGearRun, safeElapsedSeconds);

  return syncPassiveGearState(
    syncStorageState(
      syncSkiffState(
        applyUnlockChecks({
          ...storageRun,
          manual: {
            ...storageRun.manual,
            cooldownMs: nextCooldownMs < 1 ? 0 : nextCooldownMs,
          },
        }),
      ),
    ),
  );
}
