import { createStarterRun, type RunState } from "@/lib/storage/saveSchema";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";
import {
  assignBoatRoute,
  syncFleetState,
} from "@/lib/simulation/reducers/fleet";
import { repairBoat } from "@/lib/simulation/reducers/maintenance";

function createFleetOpsRun(): RunState {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "fleetOps",
    uiTone: "operational",
    cash: 8_000,
    lifetimeFishLanded: 320,
    lifetimeRevenue: 1_900,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      upgrades: ["harborMap", "rustySkiff", "hireCousin"],
      phasesSeen: ["quietPier", "skiffOperator", "docksideGear", "fleetOps"],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
  };
}

describe("fleet routing and maintenance", () => {
  it("syncs owned boats and lets a crewed route build passive hold yield over time", () => {
    let run = createFleetOpsRun();

    run = purchaseUpgrade(run, "dockLease").run;
    run = purchaseUpgrade(run, "usedWorkSkiff").run;
    run = purchaseUpgrade(run, "deckhandHire").run;
    run = syncFleetState(run);

    expect(run.boats.workSkiff).toMatchObject({
      model: "workSkiff",
      automated: false,
      crewAssigned: false,
      assignedRegionId: null,
      holdCurrent: 0,
    });

    const assigned = assignBoatRoute(run, {
      boatId: "workSkiff",
      regionId: "offshoreShelf",
      automated: true,
      crewAssigned: true,
    });

    expect(assigned.outcome).toBe("assigned");
    expect(assigned.run.boats.workSkiff.assignedRegionId).toBe("offshoreShelf");

    const afterTick = advanceRunBySeconds(assigned.run, 60);

    expect(afterTick.boats.workSkiff.holdCurrent).toBeGreaterThan(0);
    expect(afterTick.regions.offshoreShelf.stockCurrent).toBeLessThan(
      assigned.run.regions.offshoreShelf.stockCurrent,
    );
  });

  it("drains wages and maintenance from an automated crewed boat", () => {
    let run = createFleetOpsRun();

    run = purchaseUpgrade(run, "dockLease").run;
    run = purchaseUpgrade(run, "deckhandHire").run;
    run = syncFleetState(run);

    const assigned = assignBoatRoute(run, {
      boatId: "rustySkiff",
      regionId: "kelpBed",
      automated: true,
      crewAssigned: true,
    });

    const afterTick = advanceRunBySeconds(assigned.run, 180);

    expect(afterTick.cash).toBeLessThan(assigned.run.cash);
    expect(afterTick.boats.rustySkiff.maintenancePercent).toBeLessThan(
      assigned.run.boats.rustySkiff.maintenancePercent,
    );
  });

  it("raises a breakdown alert for neglected boats and lets repairs restore them", () => {
    let run = createFleetOpsRun();

    run = purchaseUpgrade(run, "dockLease").run;
    run = purchaseUpgrade(run, "deckhandHire").run;
    run = syncFleetState(run);

    const assigned = assignBoatRoute(run, {
      boatId: "rustySkiff",
      regionId: "kelpBed",
      automated: true,
      crewAssigned: true,
    });

    const neglectedRun: RunState = {
      ...assigned.run,
      boats: {
        ...assigned.run.boats,
        rustySkiff: {
          ...assigned.run.boats.rustySkiff,
          maintenancePercent: 4,
        },
      },
    };

    const afterBreakdown = advanceRunBySeconds(neglectedRun, 120);

    expect(afterBreakdown.boats.rustySkiff.breakdownUntilTimestamp).toBeGreaterThan(
      afterBreakdown.elapsedSeconds,
    );
    expect(
      afterBreakdown.notifications.some(
        (notification) => notification.kind === "breakdown",
      ),
    ).toBe(true);

    const repaired = repairBoat(afterBreakdown, {
      boatId: "rustySkiff",
    });

    expect(repaired.outcome).toBe("repaired");
    expect(repaired.run.boats.rustySkiff.maintenancePercent).toBe(100);
    expect(repaired.run.boats.rustySkiff.breakdownUntilTimestamp).toBeUndefined();
    expect(repaired.run.cash).toBeLessThan(afterBreakdown.cash);
  });
});
