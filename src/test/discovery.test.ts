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
  type RunState,
} from "@/lib/storage/saveSchema";
import { beforeEach, describe, expect, it } from "vitest";

function readDiscoverySteps(run: RunState) {
  return run.unlocks.discoverySteps;
}

function createLegacySavePayload() {
  const save = createFreshSave();
  const run = save.run!;
  const { discoverySteps: _discoverySteps, ...legacyUnlocks } = run.unlocks;

  return {
    ...save,
    run: {
      ...run,
      cash: 42,
      unlocks: legacyUnlocks,
    },
  };
}

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
