import { getBoatDefinition } from "@/lib/economy/boats";
import type { RunState } from "@/lib/storage/saveSchema";

const BREAKDOWN_THRESHOLD = 5;
const BREAKDOWN_SECONDS = 180;

export type RepairBoatArgs = {
  boatId: string;
};

export type RepairBoatOutcome =
  | "repaired"
  | "insufficientCash"
  | "missingBoat";

export type RepairBoatResult = {
  outcome: RepairBoatOutcome;
  run: RunState;
  cashSpent: number;
  feedback: string;
};

export function getMaintenanceCatchMultiplier(maintenancePercent: number) {
  if (maintenancePercent > 60) {
    return 1;
  }

  if (maintenancePercent > 35) {
    return 0.88;
  }

  if (maintenancePercent > 15) {
    return 0.68;
  }

  if (maintenancePercent > BREAKDOWN_THRESHOLD) {
    return 0.4;
  }

  return 0;
}

function buildRepairCost(maintenancePercent: number) {
  return Math.max(40, Math.ceil((100 - maintenancePercent) * 4));
}

function pushNotification(
  notifications: RunState["notifications"],
  notification: RunState["notifications"][number],
) {
  return [...notifications, notification].slice(-12);
}

export function advanceMaintenance(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  let nextCash = run.cash;
  let nextBoats = run.boats;
  let nextNotifications = run.notifications;
  let didChange = false;

  for (const [boatId, boat] of Object.entries(run.boats)) {
    if (!boat.automated || !boat.crewAssigned || boat.assignedRegionId === null) {
      continue;
    }

    const definition = getBoatDefinition(boat.model);
    const maintenanceLoss =
      (definition.maintenanceDecayPerMinute / 60) * elapsedSeconds;
    const wageCost = (boat.wagePerMinute / 60) * elapsedSeconds;
    const nextMaintenancePercent = Math.max(
      0,
      boat.maintenancePercent - maintenanceLoss,
    );
    const hasBrokenDown =
      nextMaintenancePercent <= BREAKDOWN_THRESHOLD &&
      (boat.breakdownUntilTimestamp ?? 0) <= run.elapsedSeconds;
    const nextBoat = {
      ...boat,
      maintenancePercent: nextMaintenancePercent,
      status: hasBrokenDown ? ("docked" as const) : boat.status,
      breakdownUntilTimestamp: hasBrokenDown
        ? run.elapsedSeconds + elapsedSeconds + BREAKDOWN_SECONDS
        : boat.breakdownUntilTimestamp,
    };

    nextCash = Math.max(0, nextCash - wageCost);
    nextBoats = {
      ...nextBoats,
      [boatId]: nextBoat,
    };
    didChange = true;

    if (hasBrokenDown) {
      nextNotifications = pushNotification(nextNotifications, {
        id: `breakdown-${boatId}-${Math.floor(run.elapsedSeconds + elapsedSeconds)}`,
        kind: "breakdown",
        message: `${definition.label} is sidelined until repairs clear the route.`,
        createdAtSeconds: run.elapsedSeconds + elapsedSeconds,
      });
    }
  }

  if (!didChange) {
    return run;
  }

  return {
    ...run,
    cash: nextCash,
    boats: nextBoats,
    notifications: nextNotifications,
  };
}

export function repairBoat(
  run: RunState,
  args: RepairBoatArgs,
): RepairBoatResult {
  const boat = run.boats[args.boatId];

  if (!boat) {
    return {
      outcome: "missingBoat",
      run,
      cashSpent: 0,
      feedback: "That boat is not in service.",
    };
  }

  const repairCost = buildRepairCost(boat.maintenancePercent);

  if (run.cash < repairCost) {
    return {
      outcome: "insufficientCash",
      run,
      cashSpent: 0,
      feedback: "Not enough cash to clear the repair order.",
    };
  }

  return {
    outcome: "repaired",
    run: {
      ...run,
      cash: run.cash - repairCost,
      boats: {
        ...run.boats,
        [args.boatId]: {
          ...boat,
          maintenancePercent: 100,
          breakdownUntilTimestamp: undefined,
          status:
            boat.automated && boat.crewAssigned && boat.assignedRegionId
              ? "fishing"
              : "docked",
        },
      },
    },
    cashSpent: repairCost,
    feedback: "Repair crew cleared the boat for service.",
  };
}
