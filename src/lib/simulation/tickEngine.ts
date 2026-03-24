import type { RunState } from "@/lib/storage/saveSchema";

export function advanceRunBySeconds(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const safeElapsedSeconds = Math.max(0, elapsedSeconds);

  if (safeElapsedSeconds === 0) {
    return run;
  }

  const nextRegions = Object.fromEntries(
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
  ) as RunState["regions"];

  return {
    ...run,
    elapsedSeconds: run.elapsedSeconds + safeElapsedSeconds,
    regions: nextRegions,
  };
}
