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
  type MetaProgressState,
  type RunState,
} from "@/lib/storage/saveSchema";
import { createGameStore } from "@/lib/simulation/gameStore";
import {
  selectPlayShellVisibility,
  selectStatusRailItems,
} from "@/lib/simulation/selectors";
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

function createCarryoverMeta(): MetaProgressState {
  return {
    renewals: 2,
    startingCashBonus: 75,
    manualCatchBonus: 1,
    unlockFlags: ["quietPierIntroSeen", "licenseRenewed"],
  };
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
        initialStore.getState().meta,
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

    initialStore
      .getState()
      .replaceRun(createRunForDiscoveryBackfill(), initialStore.getState().meta);

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

  it("keeps the compact intro retired after resetting from a fail-safe recovery", () => {
    localStorage.setItem("overfishing-save", "{ definitely broken json");

    const store = createGameStore();
    store.getState().initialize();

    expect(store.getState().recoveryMessage).toMatch(/fresh run/i);
    expect(readDiscoverySteps(store.getState().run)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(store.getState().meta.unlockFlags).toContain("quietPierIntroSeen");

    store.getState().resetRun();

    expect(store.getState().recoveryMessage).toBeNull();
    expect(store.getState().meta.unlockFlags).toContain("quietPierIntroSeen");
    expect(readDiscoverySteps(store.getState().run)).toEqual([]);
    expect(
      selectPlayShellVisibility(store.getState().run, store.getState().meta)
        .shellMode,
    ).toBe("full");
    expect(loadOrCreateSave().meta.unlockFlags).toContain("quietPierIntroSeen");

    store.getState().stopSimulationLoop();
  });

  it("keeps provided carryover meta when external replacement and initialization pass run and meta together", () => {
    const carryoverMeta = createCarryoverMeta();
    const carryoverRun = createStarterRun(carryoverMeta);
    const replacementStore = createGameStore();

    replacementStore.getState().replaceRun(carryoverRun, carryoverMeta);

    expect(replacementStore.getState().meta).toEqual(carryoverMeta);
    expect(loadOrCreateSave().meta).toEqual(carryoverMeta);

    const initializedStore = createGameStore();
    initializedStore.getState().initialize(carryoverRun, carryoverMeta);

    expect(initializedStore.getState().meta).toEqual(carryoverMeta);
    expect(loadOrCreateSave().meta).toEqual(carryoverMeta);

    initializedStore.getState().stopSimulationLoop();
  });
});
