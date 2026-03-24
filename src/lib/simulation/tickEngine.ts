import type { RunState } from "@/lib/storage/saveSchema";
import { applyRegionsStockPressure } from "@/lib/economy/regions";
import {
  advanceFleetAutomation,
  syncFleetState,
} from "@/lib/simulation/reducers/fleet";
import { advanceFacilities, syncFacilitiesState } from "@/lib/simulation/reducers/facilities";
import { advanceMaintenance } from "@/lib/simulation/reducers/maintenance";
import {
  advancePassiveGear,
  syncPassiveGearState,
} from "@/lib/simulation/reducers/passiveGear";
import { advanceProcessing, syncProcessingState } from "@/lib/simulation/reducers/processing";
import { advanceContracts, syncContractsState } from "@/lib/simulation/reducers/contracts";
import { advanceRegionsState } from "@/lib/simulation/reducers/regions";
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
  const syncedRun = syncFleetState(
    syncProcessingState(
      syncContractsState(
        syncFacilitiesState(
          syncPassiveGearState(syncStorageState(syncSkiffState(run))),
        ),
      ),
    ),
  );
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);

  if (safeElapsedSeconds === 0) {
    return syncFleetState(
      syncProcessingState(
        syncContractsState(
          syncFacilitiesState(
            syncPassiveGearState(
              syncStorageState(syncSkiffState(applyUnlockChecks(syncedRun))),
            ),
          ),
        ),
      ),
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
  const fleetRun = advanceFleetAutomation(advancedRun, safeElapsedSeconds);
  const passiveGearRun = advancePassiveGear(fleetRun, safeElapsedSeconds);
  const storageRun = applyDockStorageDecay(passiveGearRun, safeElapsedSeconds);
  const facilitiesRun = advanceFacilities(storageRun, safeElapsedSeconds);
  const processingRun = advanceProcessing(facilitiesRun, safeElapsedSeconds);
  const maintainedRun = advanceMaintenance(processingRun, safeElapsedSeconds);
  const regionalRun = advanceRegionsState(maintainedRun, safeElapsedSeconds);
  const contractedRun = advanceContracts(regionalRun);

  return syncFleetState(
    syncProcessingState(
      syncContractsState(
        syncFacilitiesState(
          syncPassiveGearState(
            syncStorageState(
              syncSkiffState(
                applyUnlockChecks({
                  ...contractedRun,
                  manual: {
                    ...contractedRun.manual,
                    cooldownMs: nextCooldownMs < 1 ? 0 : nextCooldownMs,
                  },
                }),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
