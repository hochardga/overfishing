import type { RunState } from "@/lib/storage/saveSchema";
import { getPhaseDefinition } from "@/lib/economy/phases";
import { applyRegionStockPressure } from "@/lib/economy/regions";
import {
  getManualCastCycleMs,
  resolveManualCastZoneHit,
} from "@/lib/simulation/reducers/manualFishing";

export function formatElapsedSeconds(elapsedSeconds: number) {
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function formatCooldownMs(cooldownMs: number) {
  if (cooldownMs <= 0) {
    return "Ready to cast";
  }

  const seconds = cooldownMs / 1000;

  return `Ready in ${seconds.toFixed(seconds >= 10 ? 0 : 1)}s`;
}

export function selectManualCastReadout(run: RunState) {
  const zoneHit = resolveManualCastZoneHit(run);
  const cycleMs = getManualCastCycleMs(run);
  const cyclePositionMs = Math.floor(run.elapsedSeconds * 1000) % cycleMs;
  const cycleProgress = cyclePositionMs / cycleMs;

  if (run.manual.cooldownMs > 0) {
    return {
      status: formatCooldownMs(run.manual.cooldownMs),
      detail: "Cast line locked",
      cycleProgress,
      zoneHit,
    };
  }

  return {
    status: zoneHit === "perfect" ? "Perfect window" : "Cast now",
    detail:
      zoneHit === "perfect"
        ? "Sweet spot is live."
        : "Wait for the sweet spot.",
    cycleProgress,
    zoneHit,
  };
}

function selectPressureLabelFromRegion(run: RunState) {
  const pierCove = applyRegionStockPressure(run.regions.pierCove);
  const stockRatio =
    pierCove.stockCap > 0
      ? Math.max(0, Math.min(1, pierCove.stockCurrent / pierCove.stockCap))
      : 0;

  if (stockRatio > 0.7) {
    return "Stable";
  }

  if (stockRatio > 0.4) {
    return "Watch";
  }

  return "Strained";
}

function formatCash(cash: number) {
  return `$${cash.toFixed(0)}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function selectStockLabel(run: RunState) {
  const unlockedRegions = Object.values(run.regions).filter(
    (region) => region.unlocked,
  );

  if (unlockedRegions.length === 0) {
    return "Unknown";
  }

  const stockRatio =
    unlockedRegions.reduce(
      (total, region) => total + region.stockCurrent / region.stockCap,
      0,
    ) / unlockedRegions.length;

  if (stockRatio > 0.75) {
    return "Stable";
  }

  if (stockRatio > 0.45) {
    return "Watch";
  }

  return "Strained";
}

export type EarlyHudReadout = {
  label: string;
  value: string;
  detail: string;
  progress?: number;
};

export type EarlyHudState = {
  cash: EarlyHudReadout;
  nearbyFish: EarlyHudReadout;
  cooldown: EarlyHudReadout;
  stockPressure: EarlyHudReadout;
};

export function selectEarlyHudState(run: RunState): EarlyHudState {
  const pierCove = applyRegionStockPressure(run.regions.pierCove);
  const stockRatio =
    pierCove.stockCap > 0
      ? Math.max(0, Math.min(1, pierCove.stockCurrent / pierCove.stockCap))
      : 0;
  const cooldownProgress =
    run.manual.cooldownMs > 0
      ? Math.max(0, 1 - run.manual.cooldownMs / getManualCastCycleMs(run))
      : 1;
  const stockLabel = selectPressureLabelFromRegion(run);

  return {
    cash: {
      label: "Cash in hand",
      value: formatCash(run.cash),
      detail: "Immediate payout from casts.",
    },
    nearbyFish: {
      label: "Fish nearby",
      value: `${pierCove.stockCurrent.toFixed(0)} / ${pierCove.stockCap.toFixed(0)}`,
      detail: `Pier Cove is ${formatPercent(stockRatio)} stocked.`,
      progress: stockRatio,
    },
    cooldown: {
      label: "Cast cooldown",
      value: run.manual.cooldownMs > 0 ? formatCooldownMs(run.manual.cooldownMs) : "Ready to cast",
      detail:
        run.manual.cooldownMs > 0
          ? "Cast line locked."
          : "Sweet spot is live.",
      progress: cooldownProgress,
    },
    stockPressure: {
      label: "Stock pressure",
      value: stockLabel,
      detail: `Catch speed ${formatPercent(pierCove.catchSpeedModifier)}, fish value ${formatPercent(pierCove.scarcityPriceModifier)}.`,
      progress: 1 - stockRatio,
    },
  };
}

export function selectStatusRailItems(run: RunState) {
  return [
    {
      label: "Phase",
      value: getPhaseDefinition(run.phase).label,
      detail: run.uiTone === "cozy" ? "Warm shell" : "Operational shell",
    },
    {
      label: "Cash",
      value: formatCash(run.cash),
      detail: "Starter run",
    },
    {
      label: "Elapsed",
      value: formatElapsedSeconds(run.elapsedSeconds),
      detail: "Deterministic tick",
    },
    {
      label: "Stock",
      value: selectStockLabel(run),
      detail: "Unlocked waters",
    },
  ];
}
