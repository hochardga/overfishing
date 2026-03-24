import type { RunState } from "@/lib/storage/saveSchema";

import { getUpgradeDefinition } from "@/lib/economy/upgrades";

export const DEFAULT_AUTO_HAUL_INTERVAL_SECONDS = 90;

export function getAutoHaulIntervalSeconds(run: RunState) {
  if (!run.unlocks.upgrades.includes("hireCousin")) {
    return null;
  }

  return (
    getUpgradeDefinition("hireCousin").helper?.autoHaulIntervalSeconds ??
    DEFAULT_AUTO_HAUL_INTERVAL_SECONDS
  );
}
