import {
  createStarterRun,
  type RunState,
  type SaveFile,
} from "@/lib/storage/saveSchema";

const LICENSE_RENEWAL_REVENUE_TARGET = 6_800;
const LICENSE_RENEWAL_FISH_TARGET = 1_120;
const LICENSE_RENEWAL_OCEAN_HEALTH_THRESHOLD = 70;

export function getLicenseRenewalCarryover(run: RunState) {
  return {
    startingCashBonusGain: 75 + Math.floor(run.lifetimeRevenue / 2_000) * 25,
    manualCatchBonusGain: 1,
  };
}

export function isLicenseRenewalReady(run: RunState) {
  return (
    run.phase === "regionalExtraction" &&
    run.lifetimeRevenue >= LICENSE_RENEWAL_REVENUE_TARGET &&
    run.lifetimeFishLanded >= LICENSE_RENEWAL_FISH_TARGET &&
    run.oceanHealth <= LICENSE_RENEWAL_OCEAN_HEALTH_THRESHOLD
  );
}

export function renewLicenseSaveData(save: SaveFile): SaveFile {
  if (!save.run || !isLicenseRenewalReady(save.run)) {
    return save;
  }

  const carryoverMeta = {
    renewals: save.meta.renewals + 1,
    startingCashBonus:
      save.meta.startingCashBonus +
      getLicenseRenewalCarryover(save.run).startingCashBonusGain,
    manualCatchBonus:
      save.meta.manualCatchBonus +
      getLicenseRenewalCarryover(save.run).manualCatchBonusGain,
    unlockFlags: Array.from(
      new Set([...save.meta.unlockFlags, "licenseRenewed"]),
    ),
  };

  return {
    ...save,
    meta: carryoverMeta,
    run: createStarterRun(carryoverMeta),
  };
}
