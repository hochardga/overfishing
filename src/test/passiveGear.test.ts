import { createStarterRun, type RunState } from "@/lib/storage/saveSchema";
import { selectGearPanelState } from "@/lib/simulation/selectors";
import { collectPassiveGear } from "@/lib/simulation/reducers/passiveGear";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

function createDocksideGearRun(): RunState {
  const starterRun = createStarterRun();

  const run: RunState = {
    ...starterRun,
    phase: "docksideGear",
    lifetimeFishLanded: 150,
    lifetimeRevenue: 750,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      phasesSeen: ["quietPier", "skiffOperator", "docksideGear"],
      upgrades: ["harborMap", "rustySkiff"],
    },
    facilities: {
      ...starterRun.facilities,
      dockStorageCap: 20,
      dockStorageRawFish: 0,
      dockStorageQuality: 1,
      gearSlotCap: 2,
    },
  };

  return run;
}

describe("storage and passive gear", () => {
  it("pauses passive output instead of overflowing dock storage", () => {
    let run: RunState = {
      ...createDocksideGearRun(),
      cash: 1_000,
      facilities: {
        ...createDocksideGearRun().facilities,
        dockStorageRawFish: 19.5,
      },
    };

    run = purchaseUpgrade(run, "crabPot").run;
    run = advanceRunBySeconds(run, 60);

    const hauled = collectPassiveGear(run, {
      gearId: "crabPot01",
    });

    expect(hauled.run.facilities.dockStorageRawFish).toBe(20);
    expect(hauled.blockedFish).toBeCloseTo(10.3);
    expect(hauled.run.gear.crabPot01.bufferedCatch).toBeCloseTo(10.3);
    expect(hauled.run.gear.crabPot01.blockedByStorage).toBe(true);
  });

  it("decays docked fish value over time while fish sit in storage", () => {
    const run: RunState = {
      ...createDocksideGearRun(),
      facilities: {
        ...createDocksideGearRun().facilities,
        dockStorageRawFish: 10,
        dockStorageQuality: 1,
      },
    };

    const afterMinute = advanceRunBySeconds(run, 60);

    expect(afterMinute.facilities.dockStorageRawFish).toBe(10);
    expect(afterMinute.facilities.dockStorageQuality).toBeCloseTo(0.9);
  });

  it("reports gear slot usage and paused rigs through the storage selector", () => {
    const run: RunState = {
      ...createDocksideGearRun(),
      facilities: {
        ...createDocksideGearRun().facilities,
        dockStorageRawFish: 20,
        dockStorageQuality: 0.9,
      },
      gear: {
        crabPot01: {
          id: "crabPot01",
          kind: "crabPot" as const,
          assignedRegionId: "pierCove" as const,
          outputPerSecond: 0.18,
          collectionIntervalSeconds: 120,
          secondsSinceCollection: 0,
          bufferedCatch: 0,
          active: true,
          blockedByStorage: true,
        },
      },
    };

    const panel = selectGearPanelState(run);

    expect(panel.storageValue).toBe("20 / 20");
    expect(panel.slotValue).toBe("1 / 2");
    expect(panel.slotDetail).toMatch(/1 gear rig paused by full storage/i);
    expect(panel.decayValue).toBe("90%");
  });

  it("deploys purchased crab pots and longlines into the available gear slots", () => {
    let run: RunState = {
      ...createDocksideGearRun(),
      cash: 2_000,
    };

    run = purchaseUpgrade(run, "crabPot").run;
    run = purchaseUpgrade(run, "longline").run;

    expect(run.gear.crabPot01.kind).toBe("crabPot");
    expect(run.gear.crabPot01.outputPerSecond).toBeCloseTo(0.18);
    expect(run.gear.longline01.kind).toBe("longline");
    expect(run.gear.longline01.outputPerSecond).toBeCloseTo(0.3);
    expect(selectGearPanelState(run).slotValue).toBe("2 / 2");
  });

  it("lets the player haul buffered crab-pot catch into storage before the window closes", () => {
    let run: RunState = {
      ...createDocksideGearRun(),
      cash: 1_000,
    };

    run = purchaseUpgrade(run, "crabPot").run;
    run = advanceRunBySeconds(run, 60);

    expect(run.gear.crabPot01.bufferedCatch).toBeCloseTo(10.8);
    expect(run.facilities.dockStorageRawFish).toBe(0);

    const hauled = collectPassiveGear(run, {
      gearId: "crabPot01",
    });

    expect(hauled.run.facilities.dockStorageRawFish).toBeCloseTo(10.8);
    expect(hauled.run.gear.crabPot01.bufferedCatch).toBe(0);
    expect(hauled.run.gear.crabPot01.secondsSinceCollection).toBe(0);
  });

  it("auto-hauls passive gear every 90 seconds when Hire Cousin is owned", () => {
    let run: RunState = {
      ...createDocksideGearRun(),
      cash: 2_000,
    };

    run = purchaseUpgrade(run, "crabPot").run;
    run = purchaseUpgrade(run, "hireCousin").run;

    const afterAutomation = advanceRunBySeconds(run, 90);

    expect(afterAutomation.facilities.dockStorageRawFish).toBeCloseTo(16.2);
    expect(afterAutomation.gear.crabPot01.bufferedCatch).toBe(0);
    expect(afterAutomation.gear.crabPot01.secondsSinceCollection).toBe(0);
    expect(afterAutomation.gear.crabPot01.blockedByStorage).toBe(false);
  });
});
