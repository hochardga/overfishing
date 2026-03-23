import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

import { loadOrCreateSave } from "@/lib/storage/saveAdapter";
import {
  createStarterRun,
  type RunState,
} from "@/lib/storage/saveSchema";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

export type GameStoreState = {
  run: RunState;
  initialize: (run?: RunState | null) => void;
  replaceRun: (run: RunState) => void;
  resetRun: () => void;
  tick: (elapsedSeconds: number) => void;
};

const createState = (initialRun: RunState = createStarterRun()) =>
  createStore<GameStoreState>()((set) => ({
    run: initialRun,
    initialize: (run) => {
      const fallbackRun = loadOrCreateSave().run ?? createStarterRun();

      set({
        run: run ?? fallbackRun,
      });
    },
    replaceRun: (run) => {
      set({ run });
    },
    resetRun: () => {
      set({ run: createStarterRun() });
    },
    tick: (elapsedSeconds) => {
      set((state) => ({
        run: advanceRunBySeconds(state.run, elapsedSeconds),
      }));
    },
  }));

export function createGameStore(initialRun: RunState = createStarterRun()) {
  return createState(initialRun);
}

export const gameStore = createGameStore();

export function useGameStore<T>(
  selector: (state: GameStoreState) => T,
): T {
  return useStore(gameStore, selector);
}
