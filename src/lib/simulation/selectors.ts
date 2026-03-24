import type { RunState } from "@/lib/storage/saveSchema";
import { getPhaseDefinition } from "@/lib/economy/phases";
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

function formatCash(cash: number) {
  return `$${cash.toFixed(0)}`;
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
