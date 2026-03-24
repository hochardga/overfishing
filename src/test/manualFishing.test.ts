import { applyRegionStockPressure } from "@/lib/economy/regions";
import { createStarterRun } from "@/lib/storage/saveSchema";
import {
  getManualCastCycleMs,
  performManualCast,
  resolveManualCastZoneHit,
} from "@/lib/simulation/reducers/manualFishing";
import { advanceRunBySeconds } from "@/lib/simulation/tickEngine";

describe("manual fishing", () => {
  it("awards a normal cast as immediate cash and stock loss", () => {
    const run = {
      ...createStarterRun(),
      elapsedSeconds: 1,
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.outcome).toBe("cast");
    expect(result.fishCaught).toBe(1);
    expect(result.cashEarned).toBe(4);
    expect(result.updatedStockPercent).toBeCloseTo(119 / 120, 5);
    expect(result.nextCooldownMs).toBe(2_200);
    expect(result.run.cash).toBe(4);
    expect(result.run.lifetimeRevenue).toBe(4);
    expect(result.run.lifetimeFishLanded).toBe(1);
    expect(result.run.regions.pierCove.stockCurrent).toBe(119);
  });

  it("awards a perfect cast with a larger reward", () => {
    const run = createStarterRun();

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.outcome).toBe("cast");
    expect(result.fishCaught).toBe(2);
    expect(result.cashEarned).toBe(8);
    expect(result.run.cash).toBe(8);
    expect(result.run.lifetimeRevenue).toBe(8);
    expect(result.run.lifetimeFishLanded).toBe(2);
    expect(result.run.regions.pierCove.stockCurrent).toBe(118);
  });

  it("caps payout and landed fish to the stock that is actually available", () => {
    const run = createStarterRun();
    const scarceRun = {
      ...run,
      regions: {
        ...run.regions,
        pierCove: {
          ...run.regions.pierCove,
          stockCurrent: 1,
        },
      },
    };

    const result = performManualCast(scarceRun, {
      nowMs: 1_000,
    });

    expect(result.fishCaught).toBe(1);
    expect(result.cashEarned).toBe(6);
    expect(result.updatedStockPercent).toBe(0);
    expect(result.run.cash).toBe(6);
    expect(result.run.lifetimeRevenue).toBe(6);
    expect(result.run.lifetimeFishLanded).toBe(1);
    expect(result.run.regions.pierCove.stockCurrent).toBe(0);
  });

  it("updates catch pressure modifiers when a cast drops stock across a band", () => {
    const run = createStarterRun();
    const pressuredRun = {
      ...run,
      elapsedSeconds: 1,
      regions: {
        ...run.regions,
        pierCove: {
          ...run.regions.pierCove,
          stockCurrent: 85,
        },
      },
    };

    const result = performManualCast(pressuredRun, {
      nowMs: 1_000,
    });

    expect(result.run.regions.pierCove.stockCurrent).toBe(84);
    expect(result.run.regions.pierCove.catchSpeedModifier).toBe(0.85);
    expect(result.run.regions.pierCove.scarcityPriceModifier).toBe(1);
  });

  it("updates scarcity modifiers when regeneration raises stock across a band", () => {
    const run = createStarterRun();
    const pressuredRun = {
      ...run,
      regions: {
        ...run.regions,
        pierCove: {
          ...run.regions.pierCove,
          stockCurrent: 36.6,
          regenPerSecond: 1,
        },
      },
    };

    const result = advanceRunBySeconds(pressuredRun, 1);

    expect(result.regions.pierCove.stockCurrent).toBeCloseTo(37.6, 5);
    expect(result.regions.pierCove.catchSpeedModifier).toBe(0.6);
    expect(result.regions.pierCove.scarcityPriceModifier).toBe(1);
  });

  it("applies scarcity pricing and slower cooldown when stock is depleted", () => {
    const run = createStarterRun();
    const pressuredRun = {
      ...run,
      regions: {
        ...run.regions,
        pierCove: applyRegionStockPressure({
          ...run.regions.pierCove,
          stockCurrent: 30,
        }),
      },
    };

    const result = performManualCast(pressuredRun, {
      nowMs: 1_000,
    });

    expect(result.fishCaught).toBe(2);
    expect(result.cashEarned).toBe(10);
    expect(result.nextCooldownMs).toBe(3_667);
    expect(result.run.regions.pierCove.catchSpeedModifier).toBe(0.6);
    expect(result.run.regions.pierCove.scarcityPriceModifier).toBe(1.25);
  });

  it("shifts the cast window when stock pressure slows the cycle", () => {
    const healthyRun = {
      ...createStarterRun(),
      elapsedSeconds: 0.7,
    };
    const pressuredRun = {
      ...createStarterRun(),
      elapsedSeconds: 0.7,
      regions: {
        ...createStarterRun().regions,
        pierCove: applyRegionStockPressure({
          ...createStarterRun().regions.pierCove,
          stockCurrent: 30,
        }),
      },
    };

    expect(resolveManualCastZoneHit(healthyRun)).toBe("normal");
    expect(resolveManualCastZoneHit(pressuredRun)).toBe("perfect");
  });

  it("resolves cast timing from deterministic elapsed time", () => {
    const perfectRun = {
      ...createStarterRun(),
      elapsedSeconds: 0,
    };
    const normalRun = {
      ...createStarterRun(),
      elapsedSeconds: 1,
    };

    expect(resolveManualCastZoneHit(perfectRun)).toBe("perfect");
    expect(resolveManualCastZoneHit(normalRun)).toBe("normal");
  });

  it("rejects casts during cooldown without changing the run", () => {
    const run = createStarterRun();
    const coolingRun = {
      ...run,
      manual: {
        ...run.manual,
        cooldownMs: 1_250,
      },
    };

    const result = performManualCast(coolingRun, {
      nowMs: 2_000,
    });

    expect(result.outcome).toBe("cooldown");
    expect(result.nextCooldownMs).toBe(1_250);
    expect(result.run).toEqual(coolingRun);
  });

  it("counts manual cooldown down through the tick engine", () => {
    const run = createStarterRun();
    const coolingRun = {
      ...run,
      manual: {
        ...run.manual,
        cooldownMs: 2_200,
      },
    };

    const afterOneSecond = advanceRunBySeconds(coolingRun, 1);
    const afterThreeMoreSeconds = advanceRunBySeconds(afterOneSecond, 3);

    expect(afterOneSecond.manual.cooldownMs).toBe(1_200);
    expect(afterThreeMoreSeconds.manual.cooldownMs).toBe(0);
  });

  it("widens the perfect window when Better Bait is owned", () => {
    const baseRun = {
      ...createStarterRun(),
      elapsedSeconds: 0.54,
    };
    const upgradedRun = {
      ...baseRun,
      unlocks: {
        ...baseRun.unlocks,
        upgrades: ["betterBait"],
      },
    };

    expect(resolveManualCastZoneHit(baseRun)).toBe("normal");
    expect(resolveManualCastZoneHit(upgradedRun)).toBe("perfect");
  });

  it("shortens the cast cycle when Hand Reel is owned", () => {
    const run = {
      ...createStarterRun(),
      unlocks: {
        ...createStarterRun().unlocks,
        upgrades: ["handReel"],
      },
    };

    expect(getManualCastCycleMs(run)).toBe(1_900);

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.nextCooldownMs).toBe(1_900);
    expect(result.run.manual.cooldownMs).toBe(1_900);
  });

  it("raises the perfect catch amount when Lucky Hat is owned", () => {
    const run = {
      ...createStarterRun(),
      unlocks: {
        ...createStarterRun().unlocks,
        upgrades: ["luckyHat"],
      },
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.fishCaught).toBe(3);
    expect(result.cashEarned).toBe(12);
    expect(result.run.lifetimeFishLanded).toBe(3);
  });

  it("adds one coin per fish when Tackle Tin is owned", () => {
    const run = {
      ...createStarterRun(),
      unlocks: {
        ...createStarterRun().unlocks,
        upgrades: ["tackleTin"],
      },
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.fishCaught).toBe(2);
    expect(result.cashEarned).toBe(10);
    expect(result.run.cash).toBe(10);
  });

  it("boosts manual catch value when Salted Lunch is owned", () => {
    const run = {
      ...createStarterRun(),
      unlocks: {
        ...createStarterRun().unlocks,
        upgrades: ["saltedLunch"],
      },
    };

    const result = performManualCast(run, {
      nowMs: 1_000,
    });

    expect(result.fishCaught).toBe(2);
    expect(result.cashEarned).toBe(9);
    expect(result.run.cash).toBe(9);
  });
});
