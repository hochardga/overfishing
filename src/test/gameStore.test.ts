import { getBoatDefinition } from "@/lib/economy/boats";
import { getContractDefinition } from "@/lib/economy/contracts";
import { getPhaseDefinition } from "@/lib/economy/phases";
import { getRegionDefinition } from "@/lib/economy/regions";
import { getUpgradeDefinition } from "@/lib/economy/upgrades";
import { createStarterRun } from "@/lib/storage/saveSchema";
import { createGameStore } from "@/lib/simulation/gameStore";
import { selectStatusRailItems } from "@/lib/simulation/selectors";
import { vi } from "vitest";

describe("game store", () => {
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
});
