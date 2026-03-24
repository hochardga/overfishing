import { getBoatDefinition } from "@/lib/economy/boats";
import { getContractDefinition } from "@/lib/economy/contracts";
import { getPhaseDefinition } from "@/lib/economy/phases";
import { getRegionDefinition } from "@/lib/economy/regions";
import { getUpgradeDefinition } from "@/lib/economy/upgrades";
import { loadOrCreateSave, updateSave } from "@/lib/storage/saveAdapter";
import {
  createDefaultMetaProgress,
  createStarterRun,
  expandedShellDiscoverySteps,
  type RunState,
} from "@/lib/storage/saveSchema";
import { createGameStore } from "@/lib/simulation/gameStore";
import { selectStatusRailItems } from "@/lib/simulation/selectors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function withDiscoverySteps(
  run: ReturnType<typeof createStarterRun>,
  discoverySteps: string[],
) {
  return {
    ...run,
    unlocks: {
      ...run.unlocks,
      discoverySteps,
    },
  } as typeof run;
}

function readDiscoverySteps(run: ReturnType<typeof createStarterRun>) {
  return (
    (run.unlocks as unknown as { discoverySteps?: string[] }).discoverySteps ??
    []
  );
}

function createRunForDiscoveryBackfill() {
  const run = createStarterRun(createDefaultMetaProgress());

  return {
    ...run,
    lifetimeFishLanded: 8,
    cash: 35,
    phase: "skiffOperator",
    unlocks: {
      ...run.unlocks,
      upgrades: ["betterBait"],
      discoverySteps: [],
    },
  } satisfies RunState;
}

describe("game store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("advances elapsed time and updates shell selectors predictably", () => {
    const store = createGameStore();

    expect(store.getState().run.elapsedSeconds).toBe(0);
    expect(selectStatusRailItems(store.getState().run)[2]?.value).toBe("00:00");

    store.getState().tick(75);

    expect(store.getState().run.elapsedSeconds).toBe(75);
    expect(selectStatusRailItems(store.getState().run)[2]?.value).toBe("01:15");
  });

  it("loads typed catalog lookups without runtime errors", () => {
    expect(getPhaseDefinition("quietPier").label).toBe("Quiet Pier");
    expect(getUpgradeDefinition("betterBait").cost).toBeGreaterThan(0);
    expect(getRegionDefinition("pierCove").label).toBe("Pier Cove");
    expect(getBoatDefinition("rustySkiff").fuelCap).toBeGreaterThan(0);
    expect(getContractDefinition("restaurant").product).toBe("frozenCrate");
  });

  it("advances the store-owned manual loop so a second cast can resolve", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const run = createStarterRun();
    run.elapsedSeconds = 1;

    const store = createGameStore(run);

    store.getState().startSimulationLoop();

    const firstCast = store.getState().castManual(Date.now());

    expect(firstCast.outcome).toBe("cast");
    expect(store.getState().run.manual.cooldownMs).toBe(2_200);

    vi.advanceTimersByTime(2_200);

    expect(store.getState().run.manual.cooldownMs).toBeCloseTo(0, 10);

    const secondCast = store.getState().castManual(Date.now());

    expect(secondCast.outcome).toBe("cast");
    expect(secondCast.feedback).toMatch(/clean cast/i);
    expect(store.getState().run.cash).toBe(8);
    expect(store.getState().run.regions.pierCove.stockCurrent).toBe(119);

    store.getState().stopSimulationLoop();
  });

  it("preserves authored region tuning when pressure is recomputed", () => {
    const store = createGameStore(createStarterRun());

    store.getState().tick(1);
    const nextRun = store.getState().run;

    expect(nextRun.regions.kelpBed.catchSpeedModifier).toBe(1);
    expect(nextRun.regions.kelpBed.scarcityPriceModifier).toBe(1);
    expect(nextRun.regions.offshoreShelf.catchSpeedModifier).toBe(0.8);
    expect(nextRun.regions.offshoreShelf.scarcityPriceModifier).toBe(1.1);
  });

  it("preserves earned discovery progress across persistence and skips the compact intro after reset", () => {
    const earnedDiscoverySteps = [
      "compactIntroEnabled",
      "firstCastCompleted",
      "cashVisible",
      "nearbyFishVisible",
    ];
    const initialStore = createGameStore(createStarterRun());

    initialStore
      .getState()
      .replaceRun(
        withDiscoverySteps(initialStore.getState().run, earnedDiscoverySteps),
      );

    const reloadedStore = createGameStore();
    reloadedStore.getState().initialize();

    expect(readDiscoverySteps(reloadedStore.getState().run)).toEqual(
      earnedDiscoverySteps,
    );

    updateSave((save) => ({
      ...save,
      meta: {
        ...save.meta,
        unlockFlags: Array.from(
          new Set([...save.meta.unlockFlags, "quietPierIntroSeen"]),
        ),
      },
    }));

    reloadedStore.getState().resetRun();

    expect(loadOrCreateSave().meta.unlockFlags).toContain("quietPierIntroSeen");
    expect(readDiscoverySteps(reloadedStore.getState().run)).not.toContain(
      "compactIntroEnabled",
    );

    reloadedStore.getState().stopSimulationLoop();
  });

  it("normalizes and persists discovery backfill through store-owned run updates", () => {
    const store = createGameStore(createRunForDiscoveryBackfill());

    store.getState().tick(0);

    expect(readDiscoverySteps(store.getState().run)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(store.getState().meta.unlockFlags).toContain("quietPierIntroSeen");
    expect(loadOrCreateSave().run?.unlocks.discoverySteps).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(loadOrCreateSave().meta.unlockFlags).toContain("quietPierIntroSeen");
  });

  it("normalizes discovery state during replaceRun and initialize without duplicating retired intro state", () => {
    const initialStore = createGameStore(createStarterRun());

    initialStore.getState().replaceRun(createRunForDiscoveryBackfill());

    expect(readDiscoverySteps(initialStore.getState().run)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(initialStore.getState().meta.unlockFlags).toEqual([
      "quietPierIntroSeen",
    ]);

    const reloadedStore = createGameStore();
    reloadedStore.getState().initialize();

    expect(readDiscoverySteps(reloadedStore.getState().run)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(reloadedStore.getState().meta.unlockFlags).toEqual([
      "quietPierIntroSeen",
    ]);

    reloadedStore.getState().stopSimulationLoop();
  });
});
