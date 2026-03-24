import { getBoatDefinition } from "@/lib/economy/boats";
import {
  applyRegionStockPressure,
  getRegionDefinition,
} from "@/lib/economy/regions";
import type { RegionId, RunState } from "@/lib/storage/saveSchema";

const RUSTY_SKIFF_ID = "rustySkiff";
const OUTBOARD_FUEL_BONUS = 10;
const ICE_CHEST_HOLD_BONUS = 10;
const ROD_RACK_CATCH_MULTIPLIER = 1.2;

export const KELP_BED_TRIP_FUEL_COST = 6;

type RustySkiffStats = {
  fuelCap: number;
  holdCap: number;
  catchRatePerSecond: number;
};

export type StartSkiffTripArgs = {
  boatId: string;
  regionId: RegionId;
};

export type StartSkiffTripOutcome =
  | "started"
  | "missingBoat"
  | "locked"
  | "alreadyActive"
  | "insufficientFuel";

export type StartSkiffTripResult = {
  outcome: StartSkiffTripOutcome;
  run: RunState;
  feedback: string;
};

export type RefuelSkiffArgs = {
  boatId: string;
};

export type RefuelSkiffOutcome =
  | "refueled"
  | "missingBoat"
  | "busy"
  | "alreadyFull";

export type RefuelSkiffResult = {
  outcome: RefuelSkiffOutcome;
  run: RunState;
  feedback: string;
};

function hasUpgrade(run: RunState, upgradeId: string) {
  return run.unlocks.upgrades.includes(upgradeId);
}

function getRustySkiffStats(run: RunState): RustySkiffStats {
  const baseBoat = getBoatDefinition("rustySkiff");

  return {
    fuelCap:
      baseBoat.fuelCap + (hasUpgrade(run, "outboardMotor") ? OUTBOARD_FUEL_BONUS : 0),
    holdCap:
      baseBoat.holdCap + (hasUpgrade(run, "iceChest") ? ICE_CHEST_HOLD_BONUS : 0),
    catchRatePerSecond:
      baseBoat.catchRatePerSecond *
      (hasUpgrade(run, "rodRack") ? ROD_RACK_CATCH_MULTIPLIER : 1),
  };
}

export function getSkiffTripFuelCost(regionId: RegionId) {
  if (regionId === "kelpBed") {
    return KELP_BED_TRIP_FUEL_COST;
  }

  return KELP_BED_TRIP_FUEL_COST;
}

export function syncSkiffState(run: RunState): RunState {
  const shouldUnlockKelpBed =
    run.regions.kelpBed.unlocked || hasUpgrade(run, "harborMap");
  const nextRegions =
    shouldUnlockKelpBed === run.regions.kelpBed.unlocked
      ? run.regions
      : {
          ...run.regions,
          kelpBed: {
            ...run.regions.kelpBed,
            unlocked: true,
          },
        };

  if (!hasUpgrade(run, RUSTY_SKIFF_ID)) {
    if (nextRegions === run.regions) {
      return run;
    }

    return {
      ...run,
      regions: nextRegions,
    };
  }

  const stats = getRustySkiffStats(run);
  const currentBoat = run.boats[RUSTY_SKIFF_ID];
  const nextBoat =
    currentBoat === undefined
      ? {
          id: RUSTY_SKIFF_ID,
          model: "rustySkiff" as const,
          automated: false,
          status: "docked" as const,
          assignedRegionId: null,
          holdCap: stats.holdCap,
          holdCurrent: 0,
          fuelCap: stats.fuelCap,
          fuelCurrent: stats.fuelCap,
          tripSeconds: 0,
          maintenancePercent: 100,
          catchRatePerSecond: stats.catchRatePerSecond,
          crewAssigned: false,
          wagePerMinute: 0,
        }
      : {
          ...currentBoat,
          holdCap: stats.holdCap,
          holdCurrent: Math.min(currentBoat.holdCurrent, stats.holdCap),
          fuelCap: stats.fuelCap,
          fuelCurrent: Math.min(currentBoat.fuelCurrent, stats.fuelCap),
          tripSeconds: currentBoat.tripSeconds ?? 0,
          catchRatePerSecond: stats.catchRatePerSecond,
        };

  if (nextRegions === run.regions && currentBoat === nextBoat) {
    return run;
  }

  return {
    ...run,
    regions: nextRegions,
    boats: {
      ...run.boats,
      [RUSTY_SKIFF_ID]: nextBoat,
    },
  };
}

export function startSkiffTrip(
  run: RunState,
  args: StartSkiffTripArgs,
): StartSkiffTripResult {
  const syncedRun = syncSkiffState(run);
  const boat = syncedRun.boats[args.boatId];
  const region = syncedRun.regions[args.regionId];

  if (!boat) {
    return {
      outcome: "missingBoat",
      run: syncedRun,
      feedback: "Buy the Rusty Skiff before leaving the dock.",
    };
  }

  if (!region?.unlocked) {
    return {
      outcome: "locked",
      run: syncedRun,
      feedback: "Chart the Kelp Bed before setting a route.",
    };
  }

  if (boat.status === "fishing") {
    return {
      outcome: "alreadyActive",
      run: syncedRun,
      feedback: "The skiff is already working a route.",
    };
  }

  const fuelCost = getSkiffTripFuelCost(args.regionId);

  if (boat.fuelCurrent < fuelCost) {
    return {
      outcome: "insufficientFuel",
      run: syncedRun,
      feedback: "The skiff needs more fuel before the next run.",
    };
  }

  return {
    outcome: "started",
    run: {
      ...syncedRun,
      boats: {
        ...syncedRun.boats,
        [args.boatId]: {
          ...boat,
          status: "fishing",
          assignedRegionId: args.regionId,
          fuelCurrent: boat.fuelCurrent - fuelCost,
          tripSeconds: 0,
        },
      },
    },
    feedback: `${region.label} trip underway.`,
  };
}

export function refuelSkiff(
  run: RunState,
  args: RefuelSkiffArgs,
): RefuelSkiffResult {
  const syncedRun = syncSkiffState(run);
  const boat = syncedRun.boats[args.boatId];

  if (!boat) {
    return {
      outcome: "missingBoat",
      run: syncedRun,
      feedback: "No skiff is waiting at the dock.",
    };
  }

  if (boat.status === "fishing") {
    return {
      outcome: "busy",
      run: syncedRun,
      feedback: "Wait for the skiff to dock before refueling.",
    };
  }

  if (boat.fuelCurrent >= boat.fuelCap) {
    return {
      outcome: "alreadyFull",
      run: syncedRun,
      feedback: "The skiff is already topped up.",
    };
  }

  return {
    outcome: "refueled",
    run: {
      ...syncedRun,
      boats: {
        ...syncedRun.boats,
        [args.boatId]: {
          ...boat,
          fuelCurrent: boat.fuelCap,
        },
      },
    },
    feedback: "The Rusty Skiff is topped back up.",
  };
}

export function advanceSkiffTrips(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  let nextRun = syncSkiffState(run);

  for (const [boatId, boat] of Object.entries(nextRun.boats)) {
    if (boat.status !== "fishing" || boat.assignedRegionId === null) {
      continue;
    }

    const region = nextRun.regions[boat.assignedRegionId];
    const holdSpaceRemaining = Math.max(0, boat.holdCap - boat.holdCurrent);
    const effectiveCatchRate =
      boat.catchRatePerSecond * Math.max(0.1, region.catchSpeedModifier);
    const catchAmount = Math.min(
      effectiveCatchRate * elapsedSeconds,
      holdSpaceRemaining,
      region.stockCurrent,
    );
    const nextHoldCurrent = boat.holdCurrent + catchAmount;
    const nextRegion = applyRegionStockPressure({
      ...region,
      stockCurrent: Math.max(0, region.stockCurrent - catchAmount),
    });
    const shouldDock =
      nextHoldCurrent >= boat.holdCap - 0.0001 || nextRegion.stockCurrent <= 0;
    const cashEarned = shouldDock
      ? Math.round(
          nextHoldCurrent *
            getRegionDefinition(boat.assignedRegionId).baseFishValue *
            nextRegion.scarcityPriceModifier,
        )
      : 0;

    nextRun = {
      ...nextRun,
      cash: nextRun.cash + cashEarned,
      lifetimeRevenue: nextRun.lifetimeRevenue + cashEarned,
      lifetimeFishLanded: nextRun.lifetimeFishLanded + (shouldDock ? nextHoldCurrent : 0),
      boats: {
        ...nextRun.boats,
        [boatId]: {
          ...boat,
          status: shouldDock ? "docked" : boat.status,
          assignedRegionId: shouldDock ? null : boat.assignedRegionId,
          holdCurrent: shouldDock ? 0 : nextHoldCurrent,
          tripSeconds: shouldDock ? 0 : boat.tripSeconds + elapsedSeconds,
        },
      },
      regions: {
        ...nextRun.regions,
        [region.id]: nextRegion,
      },
    };
  }

  return nextRun;
}
