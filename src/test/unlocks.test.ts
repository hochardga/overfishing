import { createStarterRun } from "@/lib/storage/saveSchema";
import { performManualCast } from "@/lib/simulation/reducers/manualFishing";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";

describe("upgrade purchases and unlock checks", () => {
  it("rejects an upgrade purchase when cash is below the cost", () => {
    const run = {
      ...createStarterRun(),
      cash: 14,
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("insufficientCash");
    expect(result.run).toEqual(run);
    expect(result.cashSpent).toBe(0);
  });

  it("spends cash and records a purchased upgrade exactly once", () => {
    const run = {
      ...createStarterRun(),
      cash: 100,
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("purchased");
    expect(result.cashSpent).toBe(15);
    expect(result.run.cash).toBe(85);
    expect(result.run.unlocks.upgrades).toContain("betterBait");
    expect(result.run.unlocks.upgrades).toHaveLength(1);
  });

  it("advances to Skiff Operator once the Quiet Pier threshold is crossed", () => {
    const run = {
      ...createStarterRun(),
      elapsedSeconds: 1,
      lifetimeFishLanded: 59,
      lifetimeRevenue: 246,
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.outcome).toBe("cast");
    expect(result.run.lifetimeFishLanded).toBe(60);
    expect(result.run.lifetimeRevenue).toBe(250);
    expect(result.run.phase).toBe("skiffOperator");
    expect(result.run.unlocks.phasesSeen).toEqual([
      "quietPier",
      "skiffOperator",
    ]);
  });

  it("keeps Quiet Pier upgrades purchasable after Skiff Operator unlocks", () => {
    const run = {
      ...createStarterRun(),
      phase: "skiffOperator" as const,
      cash: 100,
      unlocks: {
        ...createStarterRun().unlocks,
        phasesSeen: ["quietPier", "skiffOperator"],
      },
    };

    const result = purchaseUpgrade(run, "betterBait");

    expect(result.outcome).toBe("purchased");
    expect(result.run.unlocks.upgrades).toContain("betterBait");
    expect(result.run.cash).toBe(85);
  });
});
