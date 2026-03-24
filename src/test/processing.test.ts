import { createStarterRun, type RunState } from "@/lib/storage/saveSchema";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";
import { syncFleetState } from "@/lib/simulation/reducers/fleet";
import { syncFacilitiesState } from "@/lib/simulation/reducers/facilities";
import { setProcessingQueue } from "@/lib/simulation/reducers/processing";

function createProcessingRun(): RunState {
  const starterRun = createStarterRun();

  let run: RunState = {
    ...starterRun,
    phase: "processingContracts",
    uiTone: "industrial",
    cash: 14_000,
    lifetimeFishLanded: 620,
    lifetimeRevenue: 4_200,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "processing", "settings"],
      upgrades: ["harborMap", "rustySkiff", "hireCousin", "dockLease", "usedWorkSkiff", "deckhandHire"],
      phasesSeen: [
        "quietPier",
        "skiffOperator",
        "docksideGear",
        "fleetOps",
        "processingContracts",
      ],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
  };

  run = syncFleetState(run);

  return run;
}

describe("processing facilities and queues", () => {
  it("creates unload backlog when returning boats outrun cold storage capacity", () => {
    let run = createProcessingRun();

    run = purchaseUpgrade(run, "processingShed").run;
    run = purchaseUpgrade(run, "dockForklift").run;
    run = purchaseUpgrade(run, "coldRoomExpansion").run;
    run = syncFacilitiesState({
      ...run,
      facilities: {
        ...run.facilities,
        dockStorageCap: 8,
        dockStorageRawFish: 6,
        coldStorageRawFish: 10,
      },
      boats: {
        ...run.boats,
        workSkiff: {
          ...run.boats.workSkiff,
          automated: true,
          crewAssigned: true,
          status: "docked",
          assignedRegionId: "offshoreShelf",
          holdCurrent: 28,
        },
      },
    });

    const afterTick = advanceRunBySeconds(run, 60);

    expect(afterTick.boats.workSkiff.holdCurrent).toBeLessThan(28);
    expect(afterTick.boats.workSkiff.holdCurrent).toBeGreaterThan(0);
    expect(afterTick.facilities.coldStorageRawFish).toBeGreaterThan(
      run.facilities.coldStorageRawFish,
    );
  });

  it("runs active queues into frozen crates and canned cases", () => {
    let run = createProcessingRun();

    run = purchaseUpgrade(run, "processingShed").run;
    run = purchaseUpgrade(run, "flashFreezer").run;
    run = purchaseUpgrade(run, "canneryLine").run;
    run = syncFacilitiesState({
      ...run,
      facilities: {
        ...run.facilities,
        coldStorageRawFish: 64,
      },
    });
    run = setProcessingQueue(run, {
      queueId: "freezer-line",
      active: true,
      product: "frozenCrate",
    }).run;
    run = setProcessingQueue(run, {
      queueId: "cannery-line",
      active: true,
      product: "cannedCase",
    }).run;

    const afterTick = advanceRunBySeconds(run, 360);

    expect(afterTick.resources.frozenCrates).toBeGreaterThan(0);
    expect(afterTick.resources.cannedCases).toBeGreaterThan(0);
    expect(afterTick.facilities.coldStorageRawFish).toBeLessThan(64);
  });
});
