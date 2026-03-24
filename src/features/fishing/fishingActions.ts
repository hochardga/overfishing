import { gameStore } from "@/lib/simulation/gameStore";

export function performCast() {
  return gameStore.getState().castManual(Date.now());
}
