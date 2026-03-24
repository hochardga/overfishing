import { createStarterRun, type RunState } from "@/lib/storage/saveSchema";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

function createRegionalExtractionRun(): RunState {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "regionalExtraction",
    uiTone: "industrial",
    elapsedSeconds: 900,
    trust: 72,
    oceanHealth: 88,
    lifetimeFishLanded: 980,
    lifetimeRevenue: 6_200,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "processing", "regions", "settings"],
      upgrades: [
        "harborMap",
        "rustySkiff",
        "hireCousin",
        "dockLease",
        "usedWorkSkiff",
        "deckhandHire",
        "processingShed",
        "flashFreezer",
        "canneryLine",
      ],
      phasesSeen: [
        "quietPier",
        "skiffOperator",
        "docksideGear",
        "fleetOps",
        "processingContracts",
        "regionalExtraction",
      ],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
    regions: {
      ...starterRun.regions,
      kelpBed: {
        ...starterRun.regions.kelpBed,
        unlocked: true,
      },
      offshoreShelf: {
        ...starterRun.regions.offshoreShelf,
        unlocked: true,
        stockCurrent: 24,
        habitatDamage: 0.22,
      },
    },
    boats: {
      workSkiff: {
        id: "workSkiff",
        model: "workSkiff",
        automated: true,
        status: "fishing",
        assignedRegionId: "offshoreShelf",
        holdCap: 34,
        holdCurrent: 8,
        fuelCap: 36,
        fuelCurrent: 28,
        tripSeconds: 240,
        maintenancePercent: 82,
        catchRatePerSecond: 1.15,
        crewAssigned: true,
        wagePerMinute: 10,
      },
    },
  };
}

describe("regional extraction consequences", () => {
  it("makes depleted waters slower and more profitable while trust and ocean health fall", () => {
    const run = createRegionalExtractionRun();

    const afterTick = advanceRunBySeconds(run, 120);

    expect(afterTick.regions.offshoreShelf.catchSpeedModifier).toBeLessThan(1);
    expect(afterTick.regions.offshoreShelf.scarcityPriceModifier).toBeGreaterThan(1);
    expect(afterTick.regions.offshoreShelf.habitatDamage).toBeGreaterThan(
      run.regions.offshoreShelf.habitatDamage,
    );
    expect(afterTick.trust).toBeLessThan(run.trust);
    expect(afterTick.oceanHealth).toBeLessThan(run.oceanHealth);
  });
});
