import {
  upgradeDefinitions,
} from "@/lib/economy/upgrades";
import {
  syncDiscoveryState,
} from "@/lib/simulation/reducers/discovery";
import {
  loadOrCreateSaveResult,
  SAVE_STORAGE_KEY,
} from "@/lib/storage/saveAdapter";
import { normalizeSaveFileWithMetadata } from "@/lib/storage/migrations";
import {
  createDefaultMetaProgress,
  createFreshSave,
  createStarterRun,
  expandedShellDiscoverySteps,
  type MetaProgressState,
  type RunState,
} from "@/lib/storage/saveSchema";
import { beforeEach, describe, expect, it } from "vitest";

function readDiscoverySteps(run: RunState) {
  return run.unlocks.discoverySteps;
}

function createLegacySavePayload() {
  const save = createFreshSave();
  const run = save.run!;
  const legacyUnlocks = Object.fromEntries(
    Object.entries(run.unlocks).filter(([key]) => key !== "discoverySteps"),
  );

  return {
    ...save,
    run: {
      ...run,
      cash: 42,
      unlocks: legacyUnlocks,
    },
  };
}

function createDiscoveryTestState(
  metaOverrides: Partial<MetaProgressState> = {},
) {
  const meta = {
    ...createDefaultMetaProgress(),
    ...metaOverrides,
  };

  return {
    meta,
    run: createStarterRun(meta),
  };
}

const quietPierUpgradeCosts = Object.values(upgradeDefinitions)
  .filter((upgrade) => upgrade.phase === "quietPier")
  .map((upgrade) => upgrade.cost)
  .sort((left, right) => left - right);

const cheapestQuietPierUpgradeCost = quietPierUpgradeCosts[0];

describe("syncDiscoveryState", () => {
  it("promotes firstCastCompleted and cashVisible after the first fish and retires the intro flag", () => {
    const { meta, run } = createDiscoveryTestState();

    const synced = syncDiscoveryState(
      {
        ...run,
        lifetimeFishLanded: 1,
      },
      meta,
    );

    expect(readDiscoverySteps(synced.run)).toEqual([
      "compactIntroEnabled",
      "firstCastCompleted",
      "cashVisible",
    ]);
    expect(synced.meta.unlockFlags).toContain("quietPierIntroSeen");
  });

  it("promotes nearbyFishVisible and cooldownVisible once three fish have been landed", () => {
    const { meta, run } = createDiscoveryTestState();

    const synced = syncDiscoveryState(
      {
        ...run,
        lifetimeFishLanded: 3,
      },
      meta,
    );

    expect(readDiscoverySteps(synced.run)).toEqual([
      "compactIntroEnabled",
      "firstCastCompleted",
      "cashVisible",
      "nearbyFishVisible",
      "cooldownVisible",
    ]);
  });

  it.each([
    [
      "lifetime fish landed reaches eight",
      (run: RunState) => ({
        ...run,
        lifetimeFishLanded: 8,
      }),
    ],
    [
      "pier cove stock falls to 85% capacity or lower",
      (run: RunState) => ({
        ...run,
        regions: {
          ...run.regions,
          pierCove: {
            ...run.regions.pierCove,
            stockCurrent: run.regions.pierCove.stockCap * 0.85,
          },
        },
      }),
    ],
  ])("promotes stockPressureVisible when %s", (_, buildRun) => {
    const { meta, run } = createDiscoveryTestState();

    const synced = syncDiscoveryState(buildRun(run), meta);

    expect(readDiscoverySteps(synced.run)).toEqual([
      "compactIntroEnabled",
      "firstCastCompleted",
      "cashVisible",
      "nearbyFishVisible",
      "cooldownVisible",
      "stockPressureVisible",
    ]);
  });

  it("promotes shopVisible from the cheapest available unowned quiet-pier upgrade cost", () => {
    const { meta, run } = createDiscoveryTestState();

    const synced = syncDiscoveryState(
      {
        ...run,
        cash: cheapestQuietPierUpgradeCost,
      },
      meta,
    );

    expect(readDiscoverySteps(synced.run)).toEqual([
      "compactIntroEnabled",
      "firstCastCompleted",
      "cashVisible",
      "nearbyFishVisible",
      "cooldownVisible",
      "stockPressureVisible",
      "shopVisible",
    ]);
  });

  it.each([
    [
      "an upgrade is already unlocked",
      (run: RunState) => ({
        ...run,
        unlocks: {
          ...run.unlocks,
          upgrades: ["betterBait"],
        },
      }),
    ],
    [
      "the run has already left the quiet pier",
      (run: RunState) => ({
        ...run,
        phase: "skiffOperator",
      }),
    ],
  ])(
    "promotes harborShellExpanded and backfills prerequisite discovery steps when %s",
    (_, buildRun) => {
      const { meta, run } = createDiscoveryTestState();

      const synced = syncDiscoveryState(buildRun(run), meta);

      expect(readDiscoverySteps(synced.run)).toEqual([
        "compactIntroEnabled",
        ...expandedShellDiscoverySteps,
      ]);
      expect(synced.meta.unlockFlags).toContain("quietPierIntroSeen");
    },
  );

  it("does not duplicate promoted discovery steps or quietPierIntroSeen across repeated syncs", () => {
    const { meta, run } = createDiscoveryTestState();

    const firstPass = syncDiscoveryState(
      {
        ...run,
        phase: "skiffOperator",
        unlocks: {
          ...run.unlocks,
          upgrades: ["betterBait"],
        },
      },
      meta,
    );
    const secondPass = syncDiscoveryState(firstPass.run, firstPass.meta);

    expect(readDiscoverySteps(secondPass.run)).toEqual([
      "compactIntroEnabled",
      ...expandedShellDiscoverySteps,
    ]);
    expect(secondPass.meta.unlockFlags).toEqual(["quietPierIntroSeen"]);
  });
});

describe("discovery persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("seeds compactIntroEnabled for a default starter run", () => {
    const run = createStarterRun(createDefaultMetaProgress());

    expect(readDiscoverySteps(run)).toEqual(["compactIntroEnabled"]);
  });

  it.each([
    [
      "quietPierIntroSeen is already retired",
      {
        unlockFlags: ["quietPierIntroSeen"],
      },
    ],
    [
      "the save comes from a renewal",
      {
        renewals: 1,
      },
    ],
    [
      "the run starts with bonus cash",
      {
        startingCashBonus: 25,
      },
    ],
    [
      "the run starts with manual catch carryover",
      {
        manualCatchBonus: 1,
      },
    ],
  ])("skips compactIntroEnabled when %s", (_, overrides) => {
    const meta = {
      ...createDefaultMetaProgress(),
      ...overrides,
    };

    expect(readDiscoverySteps(createStarterRun(meta))).toEqual([]);
  });

  it("normalizes legacy saves without discovery steps into the expanded shell", () => {
    const normalized = normalizeSaveFileWithMetadata(createLegacySavePayload());

    expect(readDiscoverySteps(normalized.save.run!)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(normalized.recovered).toBe(false);
    expect(normalized.save.meta.unlockFlags).toContain("quietPierIntroSeen");
  });

  it("loads a valid legacy save through the adapter as a migrated save, not recovery", () => {
    localStorage.setItem(
      SAVE_STORAGE_KEY,
      JSON.stringify(createLegacySavePayload()),
    );

    const result = loadOrCreateSaveResult();

    expect(result.status).toBe("loaded");
    expect(result.message).toBeUndefined();
    expect(result.save.run).not.toBeNull();
    expect(result.save.run?.cash).toBe(42);
    expect(readDiscoverySteps(result.save.run!)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(result.save.meta.unlockFlags).toContain("quietPierIntroSeen");
  });

  it("recovers malformed saves into an expanded-shell run with the intro retired", () => {
    localStorage.setItem(SAVE_STORAGE_KEY, "{ definitely broken json");

    const result = loadOrCreateSaveResult();

    expect(result.status).toBe("recovered");
    expect(result.save.run).not.toBeNull();
    expect(readDiscoverySteps(result.save.run!)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(result.save.meta.unlockFlags).toContain("quietPierIntroSeen");
  });
});
