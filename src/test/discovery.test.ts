import {
  loadOrCreateSaveResult,
  SAVE_STORAGE_KEY,
} from "@/lib/storage/saveAdapter";
import { normalizeSaveFileWithMetadata } from "@/lib/storage/migrations";
import {
  createDefaultMetaProgress,
  createFreshSave,
  createStarterRun,
} from "@/lib/storage/saveSchema";
import { beforeEach, describe, expect, it } from "vitest";

const expandedShellDiscoverySteps = [
  "firstCastCompleted",
  "cashVisible",
  "nearbyFishVisible",
  "cooldownVisible",
  "stockPressureVisible",
  "shopVisible",
  "harborShellExpanded",
];

function readDiscoverySteps(run: ReturnType<typeof createStarterRun>) {
  return (
    (run.unlocks as unknown as { discoverySteps?: string[] }).discoverySteps ??
    []
  );
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
    const save = createFreshSave();
    delete (save.run?.unlocks as unknown as { discoverySteps?: string[] })
      .discoverySteps;

    const normalized = normalizeSaveFileWithMetadata(save);

    expect(readDiscoverySteps(normalized.save.run!)).toEqual(
      expandedShellDiscoverySteps,
    );
    expect(normalized.save.meta.unlockFlags).toContain("quietPierIntroSeen");
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
