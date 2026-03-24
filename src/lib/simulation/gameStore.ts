import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

import {
  loadOrCreateSave,
  updateSave,
} from "@/lib/storage/saveAdapter";
import {
  createStarterRun,
  type RegionId,
  type RunState,
} from "@/lib/storage/saveSchema";
import {
  performManualCast,
  type ManualCastResult,
} from "@/lib/simulation/reducers/manualFishing";
import {
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
import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

export type GameStoreState = {
  run: RunState;
  initialize: (run?: RunState | null) => void;
  replaceRun: (run: RunState) => void;
  resetRun: () => void;
  tick: (elapsedSeconds: number) => void;
  startSimulationLoop: () => void;
  stopSimulationLoop: () => void;
  castManual: (nowMs: number) => ManualCastResult;
  purchaseUpgrade: (upgradeId: string) => UpgradePurchaseResult;
  startSkiffTrip: (boatId: string, regionId: RegionId) => StartSkiffTripResult;
  refuelSkiff: (boatId: string) => RefuelSkiffResult;
};

const createState = (initialRun: RunState = createStarterRun()) =>
  createStore<GameStoreState>()((set, get) => {
    let hasHydrated = false;
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
      syncPassiveGearState(
        syncStorageState(syncSkiffState(applyUnlockChecks(run))),
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
      initialize: (run) => {
        if (run) {
          hasHydrated = true;
          simulationAnchorMs = null;
          const hydratedRun = normalizeRun(run);
          set({ run: hydratedRun });
          persistRun(hydratedRun);
          startSimulationLoop();
          return;
        }

        if (!hasHydrated) {
          const fallbackRun = normalizeRun(loadOrCreateSave().run ?? createStarterRun());
          hasHydrated = true;
          simulationAnchorMs = null;
          set({ run: fallbackRun });
          persistRun(fallbackRun);
        }

        startSimulationLoop();
      },
      replaceRun: (run) => {
        const normalizedRun = normalizeRun(run);
        set({ run: normalizedRun });
        persistRun(normalizedRun);
      },
      resetRun: () => {
        const nextRun = createStarterRun();
        simulationAnchorMs = null;
        set({ run: nextRun });
        persistRun(nextRun);
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
