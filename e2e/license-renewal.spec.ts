import { expect, test } from "@playwright/test";

const renewalReadySave = {
  version: 1 as const,
  createdAt: "2026-03-24T12:00:00.000Z",
  lastSavedAt: "2026-03-24T12:00:00.000Z",
  meta: {
    renewals: 0,
    startingCashBonus: 0,
    manualCatchBonus: 0,
    unlockFlags: [],
  },
  settings: {
    reducedMotion: false,
    uiScale: "default" as const,
    soundEnabled: true,
    analyticsConsent: false,
  },
  run: {
    phase: "regionalExtraction" as const,
    uiTone: "industrial" as const,
    elapsedSeconds: 900,
    cash: 6_000,
    lifetimeRevenue: 6_800,
    lifetimeFishLanded: 1_120,
    manual: {
      cooldownMs: 0,
      perfectZoneWidth: 0.24,
      catchAmountNormal: 1,
      catchAmountPerfect: 2,
      sellValueModifier: 1,
    },
    regions: {
      pierCove: {
        id: "pierCove" as const,
        label: "Pier Cove",
        stockCurrent: 80,
        stockCap: 120,
        regenPerSecond: 0.5,
        baseFishValue: 4,
        catchSpeedModifier: 0.85,
        scarcityPriceModifier: 1,
        bycatchRate: 0,
        habitatDamage: 0.08,
        unlocked: true,
      },
      kelpBed: {
        id: "kelpBed" as const,
        label: "Kelp Bed",
        stockCurrent: 62,
        stockCap: 140,
        regenPerSecond: 0.25,
        baseFishValue: 5,
        catchSpeedModifier: 0.85,
        scarcityPriceModifier: 1,
        bycatchRate: 0.02,
        habitatDamage: 0.12,
        unlocked: true,
      },
      offshoreShelf: {
        id: "offshoreShelf" as const,
        label: "Offshore Shelf",
        stockCurrent: 24,
        stockCap: 260,
        regenPerSecond: 1,
        baseFishValue: 9,
        catchSpeedModifier: 0.24,
        scarcityPriceModifier: 1.76,
        bycatchRate: 0.05,
        habitatDamage: 0.22,
        unlocked: true,
      },
    },
    gear: {},
    boats: {},
    facilities: {
      dockStorageCap: 20,
      dockStorageRawFish: 0,
      dockStorageQuality: 1,
      gearSlotCap: 2,
      coldStorageCap: 40,
      coldStorageRawFish: 18,
      unloadLanes: 2,
      flashFreezerEnabled: true,
      canneryEnabled: true,
      processingQueues: [],
    },
    contracts: {},
    resources: {
      fuel: 0,
      rawFish: 18,
      frozenCrates: 6,
      cannedCases: 4,
    },
    trust: 54,
    influence: 0,
    oceanHealth: 61,
    unlocks: {
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
    notifications: [],
  },
};

test("completes a license renewal reset from the play shell", async ({ page }) => {
  await page.addInitScript((save) => {
    window.localStorage.setItem("overfishing-save", JSON.stringify(save));
  }, renewalReadySave);

  await page.goto("/play");

  await expect(page.getByTestId("license-renewal-modal")).toBeVisible();
  await page.getByRole("button", { name: /renew license/i }).click();

  await expect(page.getByRole("heading", { name: /harbor operations/i })).toBeVisible();
  await expect(page.getByTestId("status-rail")).toContainText("Quiet Pier");
  await expect(page.getByTestId("early-cash")).toContainText("$150");
});
