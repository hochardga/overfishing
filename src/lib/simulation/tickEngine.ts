import type { RunState } from "@/lib/storage/saveSchema";
import { applyRegionsStockPressure } from "@/lib/economy/regions";
import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";

export function advanceRunBySeconds(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);

  if (safeElapsedSeconds === 0) {
    return applyUnlockChecks(run);
  }

  const nextRegions = applyRegionsStockPressure(
    Object.fromEntries(
      Object.entries(run.regions).map(([regionId, region]) => [
        regionId,
        {
          ...region,
          stockCurrent: Math.min(
            region.stockCap,
            region.stockCurrent + region.regenPerSecond * safeElapsedSeconds,
          ),
        },
      ]),
    ) as RunState["regions"],
  );
  const cooldownReductionMs = safeElapsedSeconds * 1000;
  const nextCooldownMs = Math.max(0, run.manual.cooldownMs - cooldownReductionMs);

  return applyUnlockChecks({
    ...run,
    elapsedSeconds: run.elapsedSeconds + safeElapsedSeconds,
    manual: {
      ...run.manual,
      cooldownMs: nextCooldownMs < 1 ? 0 : nextCooldownMs,
    },
    regions: nextRegions,
  });
}
