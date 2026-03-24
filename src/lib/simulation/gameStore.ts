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
  createDefaultMetaProgress,
  createStarterRun,
  type MetaProgressState,
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
import { syncDiscoveryState } from "@/lib/simulation/reducers/discovery";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

export type GameStoreState = {
  run: RunState;
  meta: MetaProgressState;
  hydrated: boolean;
  recoveryMessage: string | null;
  initialize: (run?: RunState | null, meta?: MetaProgressState) => void;
  replaceRun: (run: RunState, meta?: MetaProgressState) => void;
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

type ApplyGameplayStateOptions = {
  hydrated?: boolean;
  persist?: boolean;
  recoveryMessage?: string | null;
};

const createState = (
  initialRun: RunState = createStarterRun(),
  initialMeta: MetaProgressState = createDefaultMetaProgress(),
) =>
  createStore<GameStoreState>()((set, get) => {
    let simulationLoopId: ReturnType<typeof globalThis.setInterval> | null =
      null;
    let simulationAnchorMs: number | null = null;

    const persistGameplayState = ({
      run,
      meta,
    }: {
      run: RunState;
      meta: MetaProgressState;
    }) => {
      updateSave((save) => ({
        ...save,
        run,
        meta,
      }));
    };

    const normalizeGameplayState = (
      run: RunState,
      meta: MetaProgressState,
    ) => {
      const afterUnlocks = applyUnlockChecks(run);
      const normalized = syncDiscoveryState(afterUnlocks, meta);

      return {
        run: syncFleetState(
          syncProcessingState(
            syncContractsState(
              syncFacilitiesState(
                syncPassiveGearState(
                  syncStorageState(syncSkiffState(normalized.run)),
                ),
              ),
            ),
          ),
        ),
        meta: normalized.meta,
      };
    };

    const applyGameplayState = (
      run: RunState,
      meta: MetaProgressState,
      options: ApplyGameplayStateOptions = {},
    ) => {
      const normalizedState = normalizeGameplayState(run, meta);

      set({
        run: normalizedState.run,
        meta: normalizedState.meta,
        hydrated: options.hydrated ?? get().hydrated,
        recoveryMessage:
          options.recoveryMessage === undefined
            ? get().recoveryMessage
            : options.recoveryMessage,
      });

      if (options.persist !== false) {
        persistGameplayState(normalizedState);
      }

      return normalizedState;
    };

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
        return {
          run: get().run,
          meta: get().meta,
        };
      }

      const nextRun = advanceRunBySeconds(get().run, deltaSeconds);
      return applyGameplayState(nextRun, get().meta, {
        persist: false,
      });
    };

    const persistLiveRun = () => {
      const nowMs = Date.now();
      const syncedState = syncRunToTime(nowMs);
      persistGameplayState(syncedState);
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
      meta: initialMeta,
      hydrated: false,
      recoveryMessage: null,
      initialize: (run, meta) => {
        if (run) {
          simulationAnchorMs = null;
          applyGameplayState(run, meta ?? get().meta, {
            hydrated: true,
            recoveryMessage: null,
          });
          startSimulationLoop();
          return;
        }

        if (!get().hydrated) {
          const loadResult = loadOrCreateSaveResult();
          const fallbackMeta = loadResult.save.meta;
          const fallbackRun =
            loadResult.save.run ?? createStarterRun(fallbackMeta);
          simulationAnchorMs = null;
          applyGameplayState(fallbackRun, fallbackMeta, {
            hydrated: true,
            recoveryMessage:
              loadResult.status === "recovered"
                ? loadResult.message ?? null
                : null,
          });
        }

        startSimulationLoop();
      },
      replaceRun: (run, meta) => {
        applyGameplayState(run, meta ?? get().meta, {
          hydrated: true,
          recoveryMessage: null,
        });
      },
      resetRun: () => {
        const save = loadOrCreateSave();
        const nextMeta = save.meta;
        const nextRun = createStarterRun(nextMeta);
        simulationAnchorMs = null;
        applyGameplayState(nextRun, nextMeta, {
          hydrated: true,
          recoveryMessage: null,
        });
      },
      dismissRecoveryMessage: () => {
        set({ recoveryMessage: null });
      },
      tick: (elapsedSeconds) => {
        const nextRun = advanceRunBySeconds(get().run, elapsedSeconds);
        applyGameplayState(nextRun, get().meta);
      },
      startSimulationLoop,
      stopSimulationLoop,
      castManual: (nowMs) => {
        const syncedState = syncRunToTime(nowMs);
        const result = performManualCast(syncedState.run, {
          nowMs,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      purchaseUpgrade: (upgradeId) => {
        const previousRun = get().run;
        const result = purchaseUpgradeReducer(previousRun, upgradeId);
        const normalizedState = applyGameplayState(result.run, get().meta);

        return {
          ...result,
          run: normalizedState.run,
          newCashBalance: normalizedState.run.cash,
          unlockedPhase:
            normalizedState.run.phase !== previousRun.phase
              ? normalizedState.run.phase
              : undefined,
        };
      },
      startSkiffTrip: (boatId, regionId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = startSkiffTripReducer(syncedState.run, {
          boatId,
          regionId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      refuelSkiff: (boatId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = refuelSkiffReducer(syncedState.run, {
          boatId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      refuelBoat: (boatId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = refuelBoatReducer(syncedState.run, {
          boatId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      assignBoatRoute: (boatId, regionId, automated, crewAssigned) => {
        const syncedState = syncRunToTime(Date.now());
        const result = assignBoatRouteReducer(syncedState.run, {
          boatId,
          regionId,
          automated,
          crewAssigned,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      repairBoat: (boatId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = repairBoatReducer(syncedState.run, {
          boatId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      setProcessingQueue: (queueId, active, product) => {
        const syncedState = syncRunToTime(Date.now());
        const result = setProcessingQueueReducer(syncedState.run, {
          queueId,
          active,
          product,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      acceptContract: (contractId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = acceptContractReducer(syncedState.run, {
          contractId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      deliverContract: (contractId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = deliverContractReducer(syncedState.run, {
          contractId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      claimContractReward: (contractId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = claimContractRewardReducer(syncedState.run, {
          contractId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      renewLicense: () => {
        const syncedState = syncRunToTime(Date.now());

        if (!isLicenseRenewalReady(syncedState.run)) {
          return syncedState.run;
        }

        persistGameplayState(syncedState);
        const currentSave = loadOrCreateSave();
        const renewedSave = renewLicenseSave();
        const didRenew = renewedSave.meta.renewals > currentSave.meta.renewals;
        const nextState = applyGameplayState(
          renewedSave.run ?? createStarterRun(renewedSave.meta),
          renewedSave.meta,
        );
        simulationAnchorMs = null;

        if (didRenew) {
          globalThis.dispatchEvent?.(new Event("overfishing:license-renewed"));
        }

        return nextState.run;
      },
      isLicenseRenewalReady: () => isLicenseRenewalReady(get().run),
      collectPassiveGear: (gearId) => {
        const syncedState = syncRunToTime(Date.now());
        const result = collectPassiveGearReducer(syncedState.run, {
          gearId,
        });
        const normalizedState = applyGameplayState(result.run, syncedState.meta);

        return {
          ...result,
          run: normalizedState.run,
        };
      },
      dismissPhaseUnlockModal: (phaseId) => {
        const nextState = applyGameplayState(
          dismissPhaseUnlockModalReducer(get().run, phaseId),
          get().meta,
        );

        return nextState.run;
      },
    };
  });

export function createGameStore(
  initialRun: RunState = createStarterRun(),
  initialMeta: MetaProgressState = createDefaultMetaProgress(),
) {
  return createState(initialRun, initialMeta);
}

export const gameStore = createGameStore();

export function useGameStore<T>(
  selector: (state: GameStoreState) => T,
): T {
  return useStore(gameStore, selector);
}
