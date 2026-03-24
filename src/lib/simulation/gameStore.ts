import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

import {
  assignBoatRoute as assignBoatRouteReducer,
  type AssignBoatRouteResult,
  refuelBoat as refuelBoatReducer,
  type RefuelBoatResult,
  syncFleetState,
} from "@/lib/simulation/reducers/fleet";
import { syncFacilitiesState } from "@/lib/simulation/reducers/facilities";
import {
  repairBoat as repairBoatReducer,
  type RepairBoatResult,
} from "@/lib/simulation/reducers/maintenance";
import {
  acceptContract as acceptContractReducer,
  claimContractReward as claimContractRewardReducer,
  deliverContract as deliverContractReducer,
  type ClaimContractRewardResult,
  syncContractsState,
} from "@/lib/simulation/reducers/contracts";
import {
  isLicenseRenewalReady,
} from "@/lib/simulation/reducers/prestige";
import {
  setProcessingQueue as setProcessingQueueReducer,
  type SetProcessingQueueResult,
  syncProcessingState,
} from "@/lib/simulation/reducers/processing";
import {
  loadOrCreateSaveResult,
  loadOrCreateSave,
  renewLicenseSave,
  updateSave,
} from "@/lib/storage/saveAdapter";
import {
  createStarterRun,
  type PhaseId,
  type RegionId,
  type RunState,
} from "@/lib/storage/saveSchema";
import {
  performManualCast,
  type ManualCastResult,
} from "@/lib/simulation/reducers/manualFishing";
import {
  collectPassiveGear as collectPassiveGearReducer,
  type CollectPassiveGearResult,
  syncPassiveGearState,
} from "@/lib/simulation/reducers/passiveGear";
import {
  refuelSkiff as refuelSkiffReducer,
  startSkiffTrip as startSkiffTripReducer,
  syncSkiffState,
  type RefuelSkiffResult,
  type StartSkiffTripResult,
} from "@/lib/simulation/reducers/skiffTrips";
import { syncStorageState } from "@/lib/simulation/reducers/storage";
import {
  purchaseUpgrade as purchaseUpgradeReducer,
  type UpgradePurchaseResult,
} from "@/lib/simulation/reducers/upgrades";
import {
  applyUnlockChecks,
  dismissPhaseUnlockModal as dismissPhaseUnlockModalReducer,
} from "@/lib/simulation/reducers/unlocks";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

export type GameStoreState = {
  run: RunState;
  hydrated: boolean;
  recoveryMessage: string | null;
  initialize: (run?: RunState | null) => void;
  replaceRun: (run: RunState) => void;
  resetRun: () => void;
  dismissRecoveryMessage: () => void;
  tick: (elapsedSeconds: number) => void;
  startSimulationLoop: () => void;
  stopSimulationLoop: () => void;
  castManual: (nowMs: number) => ManualCastResult;
  purchaseUpgrade: (upgradeId: string) => UpgradePurchaseResult;
  startSkiffTrip: (boatId: string, regionId: RegionId) => StartSkiffTripResult;
  refuelSkiff: (boatId: string) => RefuelSkiffResult;
  refuelBoat: (boatId: string) => RefuelBoatResult;
  assignBoatRoute: (
    boatId: string,
    regionId: RegionId,
    automated: boolean,
    crewAssigned: boolean,
  ) => AssignBoatRouteResult;
  repairBoat: (boatId: string) => RepairBoatResult;
  setProcessingQueue: (
    queueId: string,
    active: boolean,
    product: "frozenCrate" | "cannedCase",
  ) => SetProcessingQueueResult;
  acceptContract: (contractId: string) => { run: RunState };
  deliverContract: (contractId: string) => { run: RunState };
  claimContractReward: (contractId: string) => ClaimContractRewardResult;
  renewLicense: () => RunState;
  isLicenseRenewalReady: () => boolean;
  collectPassiveGear: (gearId: string) => CollectPassiveGearResult;
  dismissPhaseUnlockModal: (phaseId: PhaseId) => RunState;
};

const createState = (initialRun: RunState = createStarterRun()) =>
  createStore<GameStoreState>()((set, get) => {
    let simulationLoopId: ReturnType<typeof globalThis.setInterval> | null =
      null;
    let simulationAnchorMs: number | null = null;

    const persistRun = (run: RunState) => {
      updateSave((save) => ({
        ...save,
        run,
      }));
    };

    const normalizeRun = (run: RunState) =>
      syncFleetState(
        syncProcessingState(
          syncContractsState(
            syncFacilitiesState(
              syncPassiveGearState(
                syncStorageState(syncSkiffState(applyUnlockChecks(run))),
              ),
            ),
          ),
        ),
      );

    const syncRunToTime = (nowMs: number) => {
      if (simulationAnchorMs === null) {
        simulationAnchorMs = nowMs - get().run.elapsedSeconds * 1000;
      }

      const targetElapsedSeconds = Math.max(
        0,
        (nowMs - simulationAnchorMs) / 1000,
      );
      const deltaSeconds = targetElapsedSeconds - get().run.elapsedSeconds;

      if (deltaSeconds <= 0) {
        return get().run;
      }

      const nextRun = advanceRunBySeconds(get().run, deltaSeconds);
      set({ run: nextRun });

      return nextRun;
    };

    const persistLiveRun = () => {
      const nowMs = Date.now();
      const syncedRun = syncRunToTime(nowMs);
      persistRun(syncedRun);
    };

    const stopSimulationLoop = () => {
      if (simulationLoopId === null) {
        return;
      }

      globalThis.clearInterval(simulationLoopId);
      simulationLoopId = null;
      globalThis.removeEventListener?.("beforeunload", persistLiveRun);
      persistLiveRun();
    };

    const startSimulationLoop = () => {
      if (simulationLoopId !== null) {
        return;
      }

      simulationAnchorMs = Date.now() - get().run.elapsedSeconds * 1000;
      globalThis.addEventListener?.("beforeunload", persistLiveRun);
      simulationLoopId = globalThis.setInterval(() => {
        syncRunToTime(Date.now());
      }, 100);
    };

    return {
      run: initialRun,
      hydrated: false,
      recoveryMessage: null,
      initialize: (run) => {
        if (run) {
          simulationAnchorMs = null;
          const hydratedRun = normalizeRun(run);
          set({
            run: hydratedRun,
            hydrated: true,
            recoveryMessage: null,
          });
          persistRun(hydratedRun);
          startSimulationLoop();
          return;
        }

        if (!get().hydrated) {
          const loadResult = loadOrCreateSaveResult();
          const fallbackRun = normalizeRun(
            loadResult.save.run ?? createStarterRun(loadResult.save.meta),
          );
          simulationAnchorMs = null;
          set({
            run: fallbackRun,
            hydrated: true,
            recoveryMessage:
              loadResult.status === "recovered"
                ? loadResult.message ?? null
                : null,
          });
          persistRun(fallbackRun);
        }

        startSimulationLoop();
      },
      replaceRun: (run) => {
        const normalizedRun = normalizeRun(run);
        set({
          run: normalizedRun,
          hydrated: true,
          recoveryMessage: null,
        });
        persistRun(normalizedRun);
      },
      resetRun: () => {
        const save = loadOrCreateSave();
        const nextRun = createStarterRun(save.meta);
        simulationAnchorMs = null;
        set({
          run: nextRun,
          hydrated: true,
          recoveryMessage: null,
        });
        persistRun(nextRun);
      },
      dismissRecoveryMessage: () => {
        set({ recoveryMessage: null });
      },
      tick: (elapsedSeconds) => {
        const nextRun = advanceRunBySeconds(get().run, elapsedSeconds);
        set({ run: nextRun });
        persistRun(nextRun);
      },
      startSimulationLoop,
      stopSimulationLoop,
      castManual: (nowMs) => {
        const syncedRun = syncRunToTime(nowMs);
        const result = performManualCast(syncedRun, {
          nowMs,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      purchaseUpgrade: (upgradeId) => {
        const previousRun = get().run;
        const result = purchaseUpgradeReducer(previousRun, upgradeId);
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
          newCashBalance: normalizedRun.cash,
          unlockedPhase:
            normalizedRun.phase !== previousRun.phase
              ? normalizedRun.phase
              : undefined,
        };
      },
      startSkiffTrip: (boatId, regionId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = startSkiffTripReducer(syncedRun, {
          boatId,
          regionId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      refuelSkiff: (boatId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = refuelSkiffReducer(syncedRun, {
          boatId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      refuelBoat: (boatId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = refuelBoatReducer(syncedRun, {
          boatId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      assignBoatRoute: (boatId, regionId, automated, crewAssigned) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = assignBoatRouteReducer(syncedRun, {
          boatId,
          regionId,
          automated,
          crewAssigned,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      repairBoat: (boatId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = repairBoatReducer(syncedRun, {
          boatId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      setProcessingQueue: (queueId, active, product) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = setProcessingQueueReducer(syncedRun, {
          queueId,
          active,
          product,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      acceptContract: (contractId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = acceptContractReducer(syncedRun, {
          contractId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      deliverContract: (contractId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = deliverContractReducer(syncedRun, {
          contractId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      claimContractReward: (contractId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = claimContractRewardReducer(syncedRun, {
          contractId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      renewLicense: () => {
        const syncedRun = syncRunToTime(Date.now());

        if (!isLicenseRenewalReady(syncedRun)) {
          return syncedRun;
        }

        persistRun(syncedRun);
        const currentSave = loadOrCreateSave();
        const renewedSave = renewLicenseSave();
        const didRenew = renewedSave.meta.renewals > currentSave.meta.renewals;
        const nextRun = normalizeRun(
          renewedSave.run ?? createStarterRun(renewedSave.meta),
        );
        simulationAnchorMs = null;
        set({
          run: nextRun,
        });
        persistRun(nextRun);

        if (didRenew) {
          globalThis.dispatchEvent?.(new Event("overfishing:license-renewed"));
        }

        return nextRun;
      },
      isLicenseRenewalReady: () => isLicenseRenewalReady(get().run),
      collectPassiveGear: (gearId) => {
        const syncedRun = syncRunToTime(Date.now());
        const result = collectPassiveGearReducer(syncedRun, {
          gearId,
        });
        const normalizedRun = normalizeRun(result.run);

        set({
          run: normalizedRun,
        });
        persistRun(normalizedRun);

        return {
          ...result,
          run: normalizedRun,
        };
      },
      dismissPhaseUnlockModal: (phaseId) => {
        const nextRun = normalizeRun(
          dismissPhaseUnlockModalReducer(get().run, phaseId),
        );

        set({
          run: nextRun,
        });
        persistRun(nextRun);

        return nextRun;
      },
    };
  });

export function createGameStore(initialRun: RunState = createStarterRun()) {
  return createState(initialRun);
}

export const gameStore = createGameStore();

export function useGameStore<T>(
  selector: (state: GameStoreState) => T,
): T {
  return useStore(gameStore, selector);
}
