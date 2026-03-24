import { createStarterRun, type RunState } from "@/lib/storage/saveSchema";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";
import {
  acceptContract,
  claimContractReward,
  deliverContract,
  syncContractsState,
} from "@/lib/simulation/reducers/contracts";

function createContractsRun(): RunState {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "processingContracts",
    uiTone: "industrial",
    cash: 5_000,
    elapsedSeconds: 120,
    resources: {
      ...starterRun.resources,
      frozenCrates: 18,
      cannedCases: 12,
    },
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "processing", "settings"],
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
      ],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
  };
}

describe("contracts", () => {
  it("requires explicit accept and delivery before a reward can be claimed", () => {
    let run = syncContractsState(createContractsRun());

    expect(run.contracts.restaurant.status).toBe("available");

    run = acceptContract(run, {
      contractId: "restaurant",
    }).run;

    expect(run.contracts.restaurant.status).toBe("active");
    expect(run.contracts.restaurant.deliveredAmount).toBe(0);

    run = deliverContract(run, {
      contractId: "restaurant",
    }).run;

    expect(run.contracts.restaurant.deliveredAmount).toBe(8);
    expect(run.contracts.restaurant.status).toBe("completed");
    expect(run.resources.frozenCrates).toBe(10);

    const claimed = claimContractReward(run, {
      contractId: "restaurant",
    });

    expect(claimed.outcome).toBe("claimed");
    expect(claimed.run.cash).toBe(5_120);
    expect(claimed.run.contracts.restaurant.status).toBe("available");
    expect(claimed.run.contracts.restaurant.deliveredAmount).toBe(0);
  });

  it("expires an active contract cleanly when the timer runs out", () => {
    let run = syncContractsState(createContractsRun());

    run = acceptContract(run, {
      contractId: "grocer",
    }).run;

    const afterExpiry = advanceRunBySeconds(run, 600);

    expect(afterExpiry.contracts.grocer.status).toBe("expired");
    expect(afterExpiry.contracts.grocer.deliveredAmount).toBe(0);
  });
});
