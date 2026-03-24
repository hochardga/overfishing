import { createStarterRun } from "@/lib/storage/saveSchema";
import { performManualCast } from "@/lib/simulation/reducers/manualFishing";
import {
  refuelSkiff,
  startSkiffTrip,
} from "@/lib/simulation/reducers/skiffTrips";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

function createSkiffOperatorRun(cash: number) {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "skiffOperator" as const,
    cash,
    lifetimeFishLanded: 60,
    lifetimeRevenue: 250,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      upgrades: [],
      phasesSeen: ["quietPier", "skiffOperator"],
    },
  };
}

describe("upgrade purchases and unlock checks", () => {
  it("rejects an upgrade purchase when cash is below the cost", () => {
    const run = {
      ...createStarterRun(),
      cash: 14,
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("insufficientCash");
    expect(result.run).toEqual(run);
    expect(result.cashSpent).toBe(0);
  });

  it("spends cash and records a purchased upgrade exactly once", () => {
    const run = {
      ...createStarterRun(),
      cash: 100,
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("purchased");
    expect(result.cashSpent).toBe(15);
    expect(result.run.cash).toBe(85);
    expect(result.run.unlocks.upgrades).toContain("betterBait");
    expect(result.run.unlocks.upgrades).toHaveLength(1);
  });

  it("advances to Skiff Operator once the Quiet Pier threshold is crossed", () => {
    const run = {
      ...createStarterRun(),
      elapsedSeconds: 1,
      lifetimeFishLanded: 59,
      lifetimeRevenue: 246,
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.outcome).toBe("cast");
    expect(result.run.lifetimeFishLanded).toBe(60);
    expect(result.run.lifetimeRevenue).toBe(250);
    expect(result.run.phase).toBe("skiffOperator");
    expect(result.run.unlocks.phasesSeen).toEqual([
      "quietPier",
      "skiffOperator",
    ]);
  });

  it("keeps Quiet Pier upgrades purchasable after Skiff Operator unlocks", () => {
    const run = {
      ...createStarterRun(),
      phase: "skiffOperator" as const,
      cash: 100,
      unlocks: {
        ...createStarterRun().unlocks,
        phasesSeen: ["quietPier", "skiffOperator"],
      },
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("purchased");
    expect(result.run.unlocks.upgrades).toContain("betterBait");
    expect(result.run.cash).toBe(85);
  });

  it("unlocks the Kelp Bed and tunes the Rusty Skiff from Skiff Operator upgrades", () => {
    let run = createSkiffOperatorRun(2_000);

    run = purchaseUpgrade(run, "harborMap").run;

    expect(run.regions.kelpBed.unlocked).toBe(true);

    run = purchaseUpgrade(run, "rustySkiff").run;

    expect(run.boats.rustySkiff).toMatchObject({
      fuelCap: 20,
      fuelCurrent: 20,
      holdCap: 15,
      holdCurrent: 0,
    });
    expect(run.boats.rustySkiff.catchRatePerSecond).toBeCloseTo(0.8);

    run = purchaseUpgrade(run, "outboardMotor").run;
    run = purchaseUpgrade(run, "iceChest").run;
    run = purchaseUpgrade(run, "rodRack").run;

    expect(run.boats.rustySkiff.fuelCap).toBe(30);
    expect(run.boats.rustySkiff.holdCap).toBe(25);
    expect(run.boats.rustySkiff.catchRatePerSecond).toBeCloseTo(0.96);
  });

  it("assigns the skiff to the Kelp Bed, spends trip fuel, and pays out when the hold fills", () => {
    let run = createSkiffOperatorRun(1_000);

    run = purchaseUpgrade(run, "harborMap").run;
    run = purchaseUpgrade(run, "rustySkiff").run;

    const tripStart = startSkiffTrip(run, {
      boatId: "rustySkiff",
      regionId: "kelpBed",
    });

    expect(tripStart.outcome).toBe("started");
    expect(tripStart.run.boats.rustySkiff.assignedRegionId).toBe("kelpBed");
    expect(tripStart.run.boats.rustySkiff.fuelCurrent).toBe(14);

    const afterTrip = advanceRunBySeconds(tripStart.run, 20);

    expect(afterTrip.boats.rustySkiff.status).toBe("docked");
    expect(afterTrip.boats.rustySkiff.assignedRegionId).toBeNull();
    expect(afterTrip.boats.rustySkiff.holdCurrent).toBe(0);
    expect(afterTrip.cash).toBe(675);
    expect(afterTrip.lifetimeFishLanded).toBe(75);
    expect(afterTrip.lifetimeRevenue).toBe(325);
    expect(afterTrip.regions.kelpBed.stockCurrent).toBeCloseTo(125);
  });

  it("tops the skiff back up to its full fuel cap between trips", () => {
    let run = createSkiffOperatorRun(1_000);

    run = purchaseUpgrade(run, "harborMap").run;
    run = purchaseUpgrade(run, "rustySkiff").run;
    run = startSkiffTrip(run, {
      boatId: "rustySkiff",
      regionId: "kelpBed",
    }).run;
    run = advanceRunBySeconds(run, 20);

    const refueled = refuelSkiff(run, {
      boatId: "rustySkiff",
    });

    expect(refueled.outcome).toBe("refueled");
    expect(refueled.run.boats.rustySkiff.fuelCurrent).toBe(20);
  });
});
