import { getBoatDefinition } from "@/lib/economy/boats";
import {
  applyRegionStockPressure,
  getRegionDefinition,
} from "@/lib/economy/regions";
import type { RegionId, RunState } from "@/lib/storage/saveSchema";

import { getMaintenanceCatchMultiplier } from "@/lib/simulation/reducers/maintenance";
import { syncSkiffState } from "@/lib/simulation/reducers/skiffTrips";

const WORK_SKIFF_ID = "workSkiff";

export type AssignBoatRouteArgs = {
  boatId: string;
  regionId: RegionId;
  automated: boolean;
  crewAssigned: boolean;
};

export type AssignBoatRouteOutcome =
  | "assigned"
  | "missingBoat"
  | "locked"
  | "needsCrew"
  | "broken";

export type AssignBoatRouteResult = {
  outcome: AssignBoatRouteOutcome;
  run: RunState;
  feedback: string;
};

function hasUpgrade(run: RunState, upgradeId: string) {
  return run.unlocks.upgrades.includes(upgradeId);
}

function syncBoatFromDefinition(
  run: RunState,
  boatId: string,
  model: keyof typeof import("@/lib/economy/boats").boatDefinitions,
) {
  const definition = getBoatDefinition(model);
  const currentBoat = run.boats[boatId];

  if (!currentBoat) {
    return {
      id: boatId,
      model,
      automated: false,
      status: "docked" as const,
      assignedRegionId: null,
      holdCap: definition.holdCap,
      holdCurrent: 0,
      fuelCap: definition.fuelCap,
      fuelCurrent: definition.fuelCap,
      tripSeconds: 0,
      maintenancePercent: 100,
      catchRatePerSecond: definition.catchRatePerSecond,
      crewAssigned: false,
      wagePerMinute: definition.wagePerMinute,
    };
  }

  return {
    ...currentBoat,
    holdCap: definition.holdCap,
    holdCurrent: Math.min(currentBoat.holdCurrent, definition.holdCap),
    fuelCap: definition.fuelCap,
    fuelCurrent: Math.min(currentBoat.fuelCurrent, definition.fuelCap),
    catchRatePerSecond: definition.catchRatePerSecond,
    wagePerMinute: definition.wagePerMinute,
  };
}

export function syncFleetState(run: RunState): RunState {
  const skiffSyncedRun = syncSkiffState(run);
  const shouldUnlockOffshoreShelf =
    skiffSyncedRun.regions.offshoreShelf.unlocked || hasUpgrade(skiffSyncedRun, "dockLease");
  const nextRegions =
    shouldUnlockOffshoreShelf === skiffSyncedRun.regions.offshoreShelf.unlocked
      ? skiffSyncedRun.regions
      : {
          ...skiffSyncedRun.regions,
          offshoreShelf: {
            ...skiffSyncedRun.regions.offshoreShelf,
            unlocked: true,
          },
        };
  let nextBoats = skiffSyncedRun.boats;

  if (hasUpgrade(skiffSyncedRun, "rustySkiff") && skiffSyncedRun.boats.rustySkiff) {
    nextBoats = {
      ...nextBoats,
      rustySkiff: {
        ...skiffSyncedRun.boats.rustySkiff,
        wagePerMinute: getBoatDefinition("rustySkiff").wagePerMinute,
      },
    };
  }

  if (hasUpgrade(skiffSyncedRun, "usedWorkSkiff")) {
    nextBoats = {
      ...nextBoats,
      [WORK_SKIFF_ID]: syncBoatFromDefinition(skiffSyncedRun, WORK_SKIFF_ID, "workSkiff"),
    };
  }

  if (nextBoats === skiffSyncedRun.boats && nextRegions === skiffSyncedRun.regions) {
    return skiffSyncedRun;
  }

  return {
    ...skiffSyncedRun,
    boats: nextBoats,
    regions: nextRegions,
  };
}

export function assignBoatRoute(
  run: RunState,
  args: AssignBoatRouteArgs,
): AssignBoatRouteResult {
  const syncedRun = syncFleetState(run);
  const boat = syncedRun.boats[args.boatId];
  const region = syncedRun.regions[args.regionId];

  if (!boat) {
    return {
      outcome: "missingBoat",
      run: syncedRun,
      feedback: "That hull is not in service yet.",
    };
  }

  if (!region?.unlocked) {
    return {
      outcome: "locked",
      run: syncedRun,
      feedback: "Chart that water before assigning the route.",
    };
  }

  if (boat.breakdownUntilTimestamp && boat.breakdownUntilTimestamp > syncedRun.elapsedSeconds) {
    return {
      outcome: "broken",
      run: syncedRun,
      feedback: "Repair the boat before sending it back out.",
    };
  }

  if (args.automated && (!args.crewAssigned || !hasUpgrade(syncedRun, "deckhandHire"))) {
    return {
      outcome: "needsCrew",
      run: syncedRun,
      feedback: "Hire a deckhand before automating routes.",
    };
  }

  return {
    outcome: "assigned",
    run: {
      ...syncedRun,
      boats: {
        ...syncedRun.boats,
        [args.boatId]: {
          ...boat,
          assignedRegionId: args.regionId,
          automated: args.automated,
          crewAssigned: args.crewAssigned,
          status: args.automated ? "fishing" : "docked",
        },
      },
    },
    feedback: `${getRegionDefinition(args.regionId).label} route assigned.`,
  };
}

export function advanceFleetAutomation(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  let nextRun = syncFleetState(run);

  for (const [boatId, boat] of Object.entries(nextRun.boats)) {
    if (!boat.automated || !boat.crewAssigned || boat.assignedRegionId === null) {
      continue;
    }

    if (boat.breakdownUntilTimestamp && boat.breakdownUntilTimestamp > nextRun.elapsedSeconds) {
      nextRun = {
        ...nextRun,
        boats: {
          ...nextRun.boats,
          [boatId]: {
            ...boat,
            status: "docked",
          },
        },
      };
      continue;
    }

    if (boat.status !== "fishing") {
      continue;
    }

    const definition = getBoatDefinition(boat.model);
    const region = nextRun.regions[boat.assignedRegionId];
    const maintenanceMultiplier = getMaintenanceCatchMultiplier(boat.maintenancePercent);
    const fuelDrain = (definition.fuelDrainPerMinute / 60) * elapsedSeconds;
    const availableFuelRatio =
      fuelDrain <= 0 ? 1 : Math.max(0, Math.min(1, boat.fuelCurrent / fuelDrain));
    const effectiveCatchRate =
      boat.catchRatePerSecond *
      Math.max(0.1, region.catchSpeedModifier) *
      maintenanceMultiplier *
      availableFuelRatio;
    const holdSpaceRemaining = Math.max(0, boat.holdCap - boat.holdCurrent);
    const catchAmount = Math.min(
      effectiveCatchRate * elapsedSeconds,
      holdSpaceRemaining,
      region.stockCurrent,
    );
    const nextRegion = applyRegionStockPressure({
      ...region,
      stockCurrent: Math.max(0, region.stockCurrent - catchAmount),
    });
    const nextFuelCurrent = Math.max(0, boat.fuelCurrent - fuelDrain);
    const nextHoldCurrent = boat.holdCurrent + catchAmount;
    const shouldDock =
      nextHoldCurrent >= boat.holdCap - 0.0001 ||
      nextFuelCurrent <= 0.0001 ||
      nextRegion.stockCurrent <= 0;

    nextRun = {
      ...nextRun,
      boats: {
        ...nextRun.boats,
        [boatId]: {
          ...boat,
          fuelCurrent: nextFuelCurrent,
          holdCurrent: nextHoldCurrent,
          tripSeconds: boat.tripSeconds + elapsedSeconds,
          status: shouldDock ? "docked" : "fishing",
        },
      },
      regions: {
        ...nextRun.regions,
        [nextRegion.id]: nextRegion,
      },
    };
  }

  return nextRun;
}
