import type { RunState } from "@/lib/storage/saveSchema";
import { getPhaseDefinition } from "@/lib/economy/phases";

export function formatElapsedSeconds(elapsedSeconds: number) {
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
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
