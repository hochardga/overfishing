import type { RunState } from "@/lib/storage/saveSchema";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function advanceRegionsState(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  if (
    !run.unlocks.phasesSeen.includes("regionalExtraction") &&
    run.phase !== "regionalExtraction"
  ) {
    return run;
  }

  let totalTrustLoss = 0;
  let totalOceanHealthLoss = 0;
  let didChange = false;
  const nextRegions = Object.fromEntries(
    Object.entries(run.regions).map(([regionId, region]) => {
      const stockRatio =
        region.stockCap > 0
          ? clamp(region.stockCurrent / region.stockCap, 0, 1)
          : 0;
      const activeBoatCount = Object.values(run.boats).filter(
        (boat) =>
          boat.assignedRegionId === region.id &&
          boat.automated &&
          boat.crewAssigned,
      ).length;
      const extractionPressure =
        (1 - stockRatio) * (activeBoatCount > 0 ? 1 + activeBoatCount * 0.4 : 0.35);
      const habitatDelta =
        extractionPressure * (region.bycatchRate + 0.02) * (elapsedSeconds / 300);
      const nextHabitatDamage = clamp(region.habitatDamage + habitatDelta, 0, 1);
      const damageIncrease = nextHabitatDamage - region.habitatDamage;

      if (damageIncrease > 0) {
        didChange = true;
      }

      totalTrustLoss += (extractionPressure * region.bycatchRate * 2.5 + damageIncrease * 18);
      totalOceanHealthLoss +=
        extractionPressure * (region.bycatchRate + 0.05) * 3 + damageIncrease * 24;

      return [
        regionId,
        {
          ...region,
          habitatDamage: nextHabitatDamage,
        },
      ];
    }),
  ) as RunState["regions"];

  if (!didChange) {
    return run;
  }

  return {
    ...run,
    trust: clamp(run.trust - totalTrustLoss, 0, 100),
    oceanHealth: clamp(run.oceanHealth - totalOceanHealthLoss, 0, 100),
    regions: nextRegions,
  };
}
