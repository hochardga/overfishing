import {
  createFreshSave,
  createStarterRun,
  type RunState,
  type SaveFile,
} from "@/lib/storage/saveSchema";
import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import {
  isLicenseRenewalReady,
  renewLicenseSaveData,
} from "@/lib/simulation/reducers/prestige";

function createRenewalReadySave(): SaveFile {
  const starterRun = createStarterRun();
  const run: RunState = {
    ...starterRun,
    phase: "regionalExtraction" as const,
    uiTone: "industrial" as const,
    lifetimeFishLanded: 1_120,
    lifetimeRevenue: 6_800,
    trust: 54,
    oceanHealth: 61,
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
    boats: {
      workSkiff: {
        id: "workSkiff",
        model: "workSkiff" as const,
        automated: true,
        status: "docked" as const,
        assignedRegionId: "offshoreShelf" as const,
        holdCap: 34,
        holdCurrent: 18,
        fuelCap: 36,
        fuelCurrent: 12,
        tripSeconds: 300,
        maintenancePercent: 44,
        catchRatePerSecond: 1.15,
        crewAssigned: true,
        wagePerMinute: 10,
      },
    },
    contracts: {
      restaurant: {
        id: "restaurant",
        type: "restaurant" as const,
        product: "frozenCrate" as const,
        requiredAmount: 8,
        deliveredAmount: 8,
        rewardCash: 120,
        expiresAtSeconds: 2_000,
        status: "completed" as const,
      },
    },
    facilities: {
      ...starterRun.facilities,
      coldStorageCap: 40,
      coldStorageRawFish: 18,
      flashFreezerEnabled: true,
      canneryEnabled: true,
    },
    resources: {
      ...starterRun.resources,
      frozenCrates: 6,
      cannedCases: 4,
    },
  };

  return createFreshSave({
    meta: {
      renewals: 0,
      startingCashBonus: 0,
      manualCatchBonus: 0,
      unlockFlags: [],
    },
    run,
  });
}

describe("license renewal", () => {
  it("covers phase progression from a fresh run into regional extraction", () => {
    let run = {
      ...createStarterRun(),
      cash: 20_000,
    };

    run = {
      ...run,
      lifetimeFishLanded: 60,
      lifetimeRevenue: 250,
    };
    run = applyUnlockChecks(run);
    expect(run.phase).toBe("skiffOperator");

    run = purchaseUpgrade(run, "harborMap").run;
    run = purchaseUpgrade(run, "rustySkiff").run;
    run = {
      ...run,
      lifetimeFishLanded: 160,
      lifetimeRevenue: 800,
    };
    run = applyUnlockChecks(run);
    expect(run.phase).toBe("docksideGear");

    run = purchaseUpgrade(run, "hireCousin").run;
    run = {
      ...run,
      lifetimeFishLanded: 300,
      lifetimeRevenue: 1_500,
    };
    run = applyUnlockChecks(run);
    expect(run.phase).toBe("fleetOps");

    run = purchaseUpgrade(run, "dockLease").run;
    run = purchaseUpgrade(run, "usedWorkSkiff").run;
    run = purchaseUpgrade(run, "deckhandHire").run;
    run = {
      ...run,
      lifetimeFishLanded: 620,
      lifetimeRevenue: 4_200,
    };
    run = applyUnlockChecks(run);
    expect(run.phase).toBe("processingContracts");

    run = purchaseUpgrade(run, "processingShed").run;
    run = purchaseUpgrade(run, "flashFreezer").run;
    run = {
      ...run,
      lifetimeFishLanded: 1_120,
      lifetimeRevenue: 6_800,
      oceanHealth: 61,
    };
    run = applyUnlockChecks(run);

    expect(run.phase).toBe("regionalExtraction");
    expect(isLicenseRenewalReady(run)).toBe(true);
  });

  it("resets the run while preserving only carryover meta bonuses", () => {
    const save = createRenewalReadySave();

    expect(save.run).not.toBeNull();
    expect(isLicenseRenewalReady(save.run!)).toBe(true);

    const renewed = renewLicenseSaveData(save);

    expect(renewed.meta.renewals).toBe(1);
    expect(renewed.meta.startingCashBonus).toBeGreaterThan(0);
    expect(renewed.meta.manualCatchBonus).toBeGreaterThan(0);
    expect(renewed.meta.unlockFlags).toContain("licenseRenewed");
    expect(renewed.run).not.toBeNull();
    expect(renewed.run?.phase).toBe("quietPier");
    expect(renewed.run?.cash).toBe(renewed.meta.startingCashBonus);
    expect(renewed.run?.manual.catchAmountNormal).toBeGreaterThan(1);
    expect(renewed.run?.boats).toEqual({});
    expect(renewed.run?.contracts).toEqual({});
    expect(renewed.run?.unlocks.phasesSeen).toEqual(["quietPier"]);
  });
});
