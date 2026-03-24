import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

import {
  loadOrCreateSave,
  updateSave,
} from "@/lib/storage/saveAdapter";
import {
  createStarterRun,
  type RunState,
} from "@/lib/storage/saveSchema";
import {
  performManualCast,
  type ManualCastResult,
} from "@/lib/simulation/reducers/manualFishing";
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
          set({ run });
          startSimulationLoop();
          return;
        }

        if (!hasHydrated) {
          const fallbackRun = loadOrCreateSave().run ?? createStarterRun();
          hasHydrated = true;
          simulationAnchorMs = null;
          set({ run: fallbackRun });
        }

        startSimulationLoop();
      },
      replaceRun: (run) => {
        set({ run });
        persistRun(run);
      },
      resetRun: () => {
        const nextRun = createStarterRun();
        simulationAnchorMs = null;
        set({ run: nextRun });
        persistRun(nextRun);
      },
      tick: (elapsedSeconds) => {
        set((state) => ({
          run: advanceRunBySeconds(state.run, elapsedSeconds),
        }));
      },
      startSimulationLoop,
      stopSimulationLoop,
      castManual: (nowMs) => {
        const syncedRun = syncRunToTime(nowMs);
        const result = performManualCast(syncedRun, {
          nowMs,
        });

        set({
          run: result.run,
        });
        persistRun(result.run);

        return result;
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
