import type { RunState } from "@/lib/storage/saveSchema";
import { getPhaseDefinition } from "@/lib/economy/phases";
import { upgradeDefinitions } from "@/lib/economy/upgrades";
import {
  applyRegionStockPressure,
  getRegionDefinition,
} from "@/lib/economy/regions";
import {
  getManualCastCycleMs,
  resolveManualCastZoneHit,
} from "@/lib/simulation/reducers/manualFishing";
import { getAutoHaulIntervalSeconds } from "@/lib/simulation/reducers/helpers";
import { getSkiffTripFuelCost } from "@/lib/simulation/reducers/skiffTrips";
import { phaseUnlockRules } from "@/lib/simulation/reducers/unlocks";

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

function formatUpgradeList(upgradeIds: readonly string[]) {
  const labels = upgradeIds.map(
    (upgradeId) =>
      upgradeDefinitions[upgradeId as keyof typeof upgradeDefinitions]?.label ??
      upgradeId,
  );

  if (labels.length === 0) {
    return "";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
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

export type UpgradeShopItem = {
  id: string;
  label: string;
  cost: number;
  description: string;
  phaseLabel: string;
  owned: boolean;
  affordable: boolean;
  available: boolean;
};

export type UpgradeShopState = {
  title: string;
  intro: string;
  phasePanelLabel: string;
  hasNextPhase: boolean;
  nextPhaseLabel: string;
  phaseRequirementText: string;
  phaseProgressText: string;
  phaseStatusText: string;
  phaseReady: boolean;
  phaseProgress: number;
  fishProgress: number;
  revenueProgress: number;
  items: UpgradeShopItem[];
};

export function selectUpgradeShopState(run: RunState): UpgradeShopState {
  const nextPhaseRule = phaseUnlockRules.find(
    (rule) => !run.unlocks.phasesSeen.includes(rule.phaseId),
  );
  const ownedUpgrades = new Set(run.unlocks.upgrades);
  const items = Object.values(upgradeDefinitions)
    .map((upgrade) => ({
      id: upgrade.id,
      label: upgrade.label,
      cost: upgrade.cost,
      description: upgrade.description,
      phaseLabel: getPhaseDefinition(upgrade.phase).label,
      owned: ownedUpgrades.has(upgrade.id),
      affordable: run.cash >= upgrade.cost,
      available: run.unlocks.phasesSeen.includes(upgrade.phase),
    }))
    .sort((left, right) => {
      if (left.available !== right.available) {
        return left.available ? -1 : 1;
      }

      if (left.owned !== right.owned) {
        return left.owned ? 1 : -1;
      }

      return left.cost - right.cost;
    });

  if (!nextPhaseRule) {
    return {
      title: `${getPhaseDefinition(run.phase).label} upgrades`,
      intro:
        "Small dockside upgrades that sharpen the first loop without clutter.",
      phasePanelLabel: "Phase progress",
      hasNextPhase: false,
      nextPhaseLabel: "Current slice complete",
      phaseRequirementText: "All currently configured phase unlocks are active.",
      phaseProgressText: "No further thresholds are waiting in this slice.",
      phaseStatusText: "All configured phase unlocks are already active.",
      phaseReady: false,
      phaseProgress: 1,
      fishProgress: 1,
      revenueProgress: 1,
      items,
    };
  }

  const fishProgress = Math.min(
    1,
    run.lifetimeFishLanded / nextPhaseRule.requiredLifetimeFishLanded,
  );
  const revenueProgress = Math.min(
    1,
    run.lifetimeRevenue / nextPhaseRule.requiredLifetimeRevenue,
  );
  const nextPhaseLabel = getPhaseDefinition(nextPhaseRule.phaseId).label;
  const thresholdsMet =
    run.lifetimeFishLanded >= nextPhaseRule.requiredLifetimeFishLanded &&
    run.lifetimeRevenue >= nextPhaseRule.requiredLifetimeRevenue;
  const missingUpgradeIds = nextPhaseRule.requiredUpgradeIds.filter(
    (upgradeId) => !ownedUpgrades.has(upgradeId),
  );
  const requiredUpgradeText =
    nextPhaseRule.requiredUpgradeIds.length > 0
      ? ` Also requires ${formatUpgradeList(nextPhaseRule.requiredUpgradeIds)}.`
      : "";
  const phaseReady = thresholdsMet && missingUpgradeIds.length === 0;
  const phaseStatusText = phaseReady
    ? `${nextPhaseLabel} is ready to unlock.`
    : thresholdsMet && missingUpgradeIds.length > 0
      ? `Buy ${formatUpgradeList(missingUpgradeIds)} to unlock ${nextPhaseLabel}.`
      : "The dock is still warming up.";

  return {
    title: `${getPhaseDefinition(run.phase).label} upgrades`,
    intro: "Small dockside upgrades that sharpen the first loop without clutter.",
    phasePanelLabel: "Next phase",
    hasNextPhase: true,
    nextPhaseLabel,
    phaseRequirementText: `${nextPhaseLabel} unlocks at ${nextPhaseRule.requiredLifetimeFishLanded} lifetime fish landed and $${nextPhaseRule.requiredLifetimeRevenue} lifetime revenue.${requiredUpgradeText}`,
    phaseProgressText: `${run.lifetimeFishLanded.toFixed(0)} / ${nextPhaseRule.requiredLifetimeFishLanded} fish landed, $${run.lifetimeRevenue.toFixed(0)} / $${nextPhaseRule.requiredLifetimeRevenue} revenue.`,
    phaseStatusText,
    phaseReady,
    phaseProgress: Math.min(fishProgress, revenueProgress),
    fishProgress,
    revenueProgress,
    items,
  };
}

export type SkiffPanelState = {
  title: string;
  intro: string;
  routeLabel: string;
  routeDetail: string;
  status: string;
  tripButtonLabel: string;
  tripButtonDisabled: boolean;
  refuelButtonDisabled: boolean;
  fuelValue: string;
  fuelDetail: string;
  fuelProgress?: number;
  holdValue: string;
  holdDetail: string;
  holdProgress?: number;
};

export function selectSkiffPanelState(run: RunState): SkiffPanelState {
  const kelpBed = applyRegionStockPressure(run.regions.kelpBed);
  const fuelCost = getSkiffTripFuelCost("kelpBed");
  const boat = run.boats.rustySkiff;
  const hasHarborMap = run.unlocks.upgrades.includes("harborMap");
  const activeCatchRate = boat
    ? boat.catchRatePerSecond * Math.max(0.1, kelpBed.catchSpeedModifier)
    : 0;
  const fuelProgress =
    boat && boat.fuelCap > 0 ? boat.fuelCurrent / boat.fuelCap : undefined;
  const holdProgress =
    boat && boat.holdCap > 0 ? boat.holdCurrent / boat.holdCap : undefined;
  const status = !hasHarborMap
    ? "Buy Harbor Map to chart the Kelp Bed."
    : !boat
      ? "Buy the Rusty Skiff to start short fishing runs."
      : boat.status === "fishing"
        ? "Kelp Bed trip underway. The hold is filling on the line."
        : boat.fuelCurrent < fuelCost
          ? "The skiff needs more fuel before the next Kelp Bed run."
          : boat.fuelCurrent < boat.fuelCap
            ? "Trip complete. Top up fuel before heading back out."
            : "Route is charted and the skiff is ready.";

  return {
    title: "Rusty Skiff",
    intro: "Short Kelp Bed runs turn the dock from casting into routing.",
    routeLabel: getRegionDefinition("kelpBed").label,
    routeDetail: hasHarborMap
      ? `Trip fuel ${fuelCost}. Catch rate ${activeCatchRate.toFixed(2)} fish/sec. Fish are worth $${kelpBed.baseFishValue.toFixed(0)} each before pressure.`
      : "Harbor Map unlocks the first route beyond Pier Cove.",
    status,
    tripButtonLabel:
      boat?.status === "fishing"
        ? "Kelp Bed trip underway"
        : `Run ${getRegionDefinition("kelpBed").label} trip`,
    tripButtonDisabled:
      !hasHarborMap ||
      !boat ||
      boat.status === "fishing" ||
      boat.fuelCurrent < fuelCost,
    refuelButtonDisabled:
      !boat || boat.status === "fishing" || boat.fuelCurrent >= boat.fuelCap,
    fuelValue: boat
      ? `${boat.fuelCurrent.toFixed(0)} / ${boat.fuelCap.toFixed(0)}`
      : "Locked",
    fuelDetail: boat
      ? `${Math.max(0, Math.floor(boat.fuelCurrent / fuelCost))} more Kelp Bed runs before refueling.`
      : "Rusty Skiff fuel tank is not in service yet.",
    fuelProgress,
    holdValue: boat
      ? `${boat.holdCurrent.toFixed(0)} / ${boat.holdCap.toFixed(0)}`
      : "Locked",
    holdDetail: boat
      ? boat.status === "fishing"
        ? `Fishing ${kelpBed.label}.`
        : "Hold clears automatically when the skiff docks and sells."
      : "Buy the skiff to start filling a hold.",
    holdProgress,
  };
}

export type GearPanelState = {
  title: string;
  intro: string;
  storageValue: string;
  storageDetail: string;
  storageProgress: number;
  decayValue: string;
  decayDetail: string;
  decayProgress: number;
  slotValue: string;
  slotDetail: string;
  slotProgress: number;
  items: GearCardState[];
};

export type PhaseUnlockModalState = {
  phaseId: RunState["phase"];
  title: string;
  body: string;
  detail: string;
  actionLabel: string;
};

export type ProgressSummaryState = {
  title: string;
  phaseLabel: string;
  focusLabel: string;
  focusText: string;
  nextLabel: string;
  nextText: string;
};

function formatPlural(value: number, singular: string, plural: string) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export type GearCardState = {
  id: string;
  label: string;
  detail: string;
  bufferedCatchText: string;
  statusText: string;
  actionLabel: string;
  actionDisabled: boolean;
};

function getGearLabel(kind: RunState["gear"][string]["kind"]) {
  return kind === "longline" ? "Longline" : "Crab Pot";
}

export function selectActivePhaseUnlockModalState(
  run: RunState,
): PhaseUnlockModalState | null {
  const phaseId = run.unlocks.pendingPhaseModalIds?.[0];

  if (!phaseId) {
    return null;
  }

  if (phaseId === "skiffOperator") {
    return {
      phaseId,
      title: "Skiff Operator unlocked",
      body: "Fuel, hold space, and short Kelp Bed runs now matter.",
      detail: "Buy Harbor Map and Rusty Skiff to turn the dock into short trips instead of pure casting.",
      actionLabel: "Keep the dock moving",
    };
  }

  if (phaseId === "docksideGear") {
    return {
      phaseId,
      title: "Dockside Gear unlocked",
      body: "Storage, decay, and passive rigs can jam the dock if you ignore them.",
      detail: "Deploy gear, haul it on time, and keep raw fish moving before the dock loses value.",
      actionLabel: "Keep the dock moving",
    };
  }

  return {
    phaseId,
    title: `${getPhaseDefinition(phaseId).label} unlocked`,
    body: getPhaseDefinition(phaseId).description,
    detail: "A new management tension is now active.",
    actionLabel: "Keep the dock moving",
  };
}

export function selectProgressSummaryState(run: RunState): ProgressSummaryState {
  const nextPhaseRule = phaseUnlockRules.find(
    (rule) => !run.unlocks.phasesSeen.includes(rule.phaseId),
  );
  const blockedGearCount = Object.values(run.gear).filter(
    (gear) => gear.active && gear.blockedByStorage,
  ).length;
  const currentPhaseLabel = getPhaseDefinition(run.phase).label;
  const focusText =
    run.phase === "quietPier"
      ? "Cash, timing, and Pier Cove stock still define the run."
      : run.phase === "skiffOperator"
        ? run.unlocks.upgrades.includes("rustySkiff")
          ? "Fuel and hold space now pace your Kelp Bed trips."
          : "Buy Harbor Map and Rusty Skiff to start leaving the dock."
        : blockedGearCount > 0 || run.facilities.dockStorageRawFish >= run.facilities.dockStorageCap
          ? "Dock storage is the bottleneck. Haul gear and clear space before value slips."
          : "Passive gear, haul timing, and storage quality now pace the dock.";
  const nextText = nextPhaseRule
    ? `${getPhaseDefinition(nextPhaseRule.phaseId).label} unlocks at ${nextPhaseRule.requiredLifetimeFishLanded} fish and $${nextPhaseRule.requiredLifetimeRevenue} revenue.`
    : "Current slice complete. Phase 1 systems are active.";

  return {
    title: "Progress summary",
    phaseLabel: currentPhaseLabel,
    focusLabel: "Current bottleneck",
    focusText,
    nextLabel: "Next unlock",
    nextText,
  };
}

export function selectGearPanelState(run: RunState): GearPanelState {
  const slotsUsed = Object.values(run.gear).filter((gear) => gear.active).length;
  const blockedGearCount = Object.values(run.gear).filter(
    (gear) => gear.active && gear.blockedByStorage,
  ).length;
  const openSlots = Math.max(0, run.facilities.gearSlotCap - slotsUsed);
  const autoHaulIntervalSeconds = getAutoHaulIntervalSeconds(run);
  const storageProgress =
    run.facilities.dockStorageCap > 0
      ? run.facilities.dockStorageRawFish / run.facilities.dockStorageCap
      : 0;
  const items = Object.values(run.gear)
    .filter((gear) => gear.active)
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((gear) => {
      const gearLabel = getGearLabel(gear.kind);
      const secondsUntilStall = Math.max(
        0,
        gear.collectionIntervalSeconds - gear.secondsSinceCollection,
      );

      return {
        id: gear.id,
        label: gearLabel,
        detail: `${gear.outputPerSecond.toFixed(2)} fish/sec into dock storage after haul.`,
        bufferedCatchText: `${gear.bufferedCatch.toFixed(1)} fish buffered`,
        statusText: gear.blockedByStorage
          ? "Dock storage is full, so this rig is paused."
          : autoHaulIntervalSeconds !== null
            ? `Hire Cousin auto-hauls every ${autoHaulIntervalSeconds}s.`
            : `Next stall in ${secondsUntilStall.toFixed(0)}s if you do not haul it.`,
        actionLabel: `Haul ${gearLabel}`,
        actionDisabled:
          autoHaulIntervalSeconds !== null || gear.bufferedCatch <= 0,
      };
    });

  return {
    title: "Dock storage",
    intro: "Passive rigs feed raw fish into the dock, so storage becomes the next bottleneck.",
    storageValue: `${run.facilities.dockStorageRawFish.toFixed(0)} / ${run.facilities.dockStorageCap.toFixed(0)}`,
    storageDetail:
      run.facilities.dockStorageRawFish >= run.facilities.dockStorageCap
        ? "Dock crates are packed. Passive rigs pause instead of losing fish."
        : "Passive catch routes straight into dock crates for now.",
    storageProgress,
    decayValue: `${Math.round(run.facilities.dockStorageQuality * 100)}%`,
    decayDetail:
      run.facilities.dockStorageRawFish > 0
        ? "Raw fish loses 10% of its value every 60 seconds at the dock."
        : "No raw fish is waiting in dock storage right now.",
    decayProgress: 1 - run.facilities.dockStorageQuality,
    slotValue: `${slotsUsed} / ${run.facilities.gearSlotCap}`,
    slotDetail:
      blockedGearCount > 0
        ? `${formatPlural(blockedGearCount, "gear rig", "gear rigs")} paused by full storage.`
        : `${formatPlural(openSlots, "slot", "slots")} open for passive gear.`,
    slotProgress:
      run.facilities.gearSlotCap > 0
        ? slotsUsed / run.facilities.gearSlotCap
        : 0,
    items,
  };
}
