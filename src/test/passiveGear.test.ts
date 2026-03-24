import { createStarterRun } from "@/lib/storage/saveSchema";
import { selectGearPanelState } from "@/lib/simulation/selectors";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

function createDocksideGearRun() {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "docksideGear" as const,
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
}

describe("storage and passive gear", () => {
  it("pauses passive output instead of overflowing dock storage", () => {
    const run = {
      ...createDocksideGearRun(),
      facilities: {
        ...createDocksideGearRun().facilities,
        dockStorageRawFish: 19.5,
      },
      gear: {
        crabPot01: {
          id: "crabPot01",
          kind: "crabPot" as const,
          assignedRegionId: "pierCove" as const,
          outputPerSecond: 0.25,
          collectionIntervalSeconds: 120,
          secondsSinceCollection: 0,
          active: true,
          blockedByStorage: false,
        },
      },
    };

    const afterTick = advanceRunBySeconds(run, 10);

    expect(afterTick.facilities.dockStorageRawFish).toBe(20);
    expect(afterTick.gear.crabPot01.blockedByStorage).toBe(true);
  });

  it("decays docked fish value over time while fish sit in storage", () => {
    const run = {
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
    const run = {
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
});
