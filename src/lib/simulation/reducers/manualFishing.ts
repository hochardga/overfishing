import type { RunState } from "@/lib/storage/saveSchema";
import { applyRegionStockPressure } from "@/lib/economy/regions";
import { selectManualUpgradeEffects } from "@/lib/economy/upgrades";
import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";

export type ManualCastZoneHit = "normal" | "perfect";
export type ManualCastOutcome = "cast" | "cooldown";

export type ManualCastArgs = {
  nowMs: number;
};

export type ManualCastResult = {
  outcome: ManualCastOutcome;
  run: RunState;
  fishCaught: number;
  cashEarned: number;
  updatedStockPercent: number;
  nextCooldownMs: number;
  feedback: string;
};

const CAST_COOLDOWN_MS = 2_200;
export const CAST_CYCLE_MS = CAST_COOLDOWN_MS;

function formatCash(cash: number) {
  return `$${cash.toFixed(0)}`;
}

function formatCooldownFeedback(cooldownMs: number) {
  const seconds = (cooldownMs / 1000).toFixed(cooldownMs >= 10_000 ? 0 : 1);
  return `The line is still settling. Try again in ${seconds}s.`;
}

function buildCastFeedback(
  zoneHit: ManualCastZoneHit,
  fishCaught: number,
  cashEarned: number,
) {
  const qualifier = zoneHit === "perfect" ? "Perfect pull" : "Clean cast";

  return `${qualifier}: +${fishCaught} fish, +${formatCash(cashEarned)}.`;
}

export function getManualCastCycleMs(run: RunState) {
  const manualEffects = selectManualUpgradeEffects(run.unlocks.upgrades);
  const catchSpeedModifier = Math.max(
    0.1,
    run.regions.pierCove.catchSpeedModifier,
  );

  return Math.round(
    (CAST_CYCLE_MS * manualEffects.castCooldownMultiplier) /
      catchSpeedModifier,
  );
}

export function resolveManualCastZoneHit(
  run: RunState,
): ManualCastZoneHit {
  const elapsedMs = Math.floor(run.elapsedSeconds * 1000);
  const cycleMs = getManualCastCycleMs(run);
  const cyclePositionMs = elapsedMs % cycleMs;
  const manualEffects = selectManualUpgradeEffects(run.unlocks.upgrades);
  const perfectZoneMs =
    run.manual.perfectZoneWidth *
    manualEffects.perfectZoneWidthMultiplier *
    cycleMs;

  return cyclePositionMs < perfectZoneMs ? "perfect" : "normal";
}

export function performManualCast(
  run: RunState,
  args: ManualCastArgs,
): ManualCastResult {
  void args.nowMs;

  if (run.manual.cooldownMs > 0) {
    return {
      outcome: "cooldown",
      run,
      fishCaught: 0,
      cashEarned: 0,
      updatedStockPercent:
        run.regions.pierCove.stockCurrent / run.regions.pierCove.stockCap,
      nextCooldownMs: run.manual.cooldownMs,
      feedback: formatCooldownFeedback(run.manual.cooldownMs),
    };
  }

  const zoneHit = resolveManualCastZoneHit(run);
  const manualEffects = selectManualUpgradeEffects(run.unlocks.upgrades);
  const fishCaught =
    zoneHit === "perfect"
      ? Math.max(run.manual.catchAmountPerfect, manualEffects.catchAmountPerfect)
      : run.manual.catchAmountNormal;

  const region = applyRegionStockPressure(run.regions.pierCove);
  const actualFishCaught = Math.min(fishCaught, region.stockCurrent);
  const nextStockCurrent = Math.max(0, region.stockCurrent - actualFishCaught);
  const nextRegion = applyRegionStockPressure({
    ...region,
    stockCurrent: nextStockCurrent,
  });
  const nextCooldownMs = Math.round(
    (CAST_CYCLE_MS * manualEffects.castCooldownMultiplier) /
      Math.max(0.1, nextRegion.catchSpeedModifier),
  );
  const cashEarned = Math.round(
    actualFishCaught *
      (region.baseFishValue + manualEffects.sellValueBonusPerFish) *
      nextRegion.scarcityPriceModifier *
      run.manual.sellValueModifier *
      manualEffects.sellValueMultiplier,
  );
  const nextRun: RunState = applyUnlockChecks({
    ...run,
    cash: run.cash + cashEarned,
    lifetimeRevenue: run.lifetimeRevenue + cashEarned,
    lifetimeFishLanded: run.lifetimeFishLanded + actualFishCaught,
    manual: {
      ...run.manual,
      cooldownMs: nextCooldownMs,
    },
    regions: {
      ...run.regions,
      pierCove: nextRegion,
    },
  });

  return {
    outcome: "cast",
    run: nextRun,
    fishCaught: actualFishCaught,
    cashEarned,
    updatedStockPercent: nextStockCurrent / region.stockCap,
    nextCooldownMs,
    feedback: buildCastFeedback(zoneHit, actualFishCaught, cashEarned),
  };
}
