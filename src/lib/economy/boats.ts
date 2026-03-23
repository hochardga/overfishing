export const boatDefinitions = {
  rustySkiff: {
    id: "rustySkiff",
    label: "Rusty Skiff",
    fuelCap: 12,
    holdCap: 18,
    catchRatePerSecond: 0.45,
    maintenanceDecayPerMinute: 0.2,
  },
  workSkiff: {
    id: "workSkiff",
    label: "Work Skiff",
    fuelCap: 22,
    holdCap: 30,
    catchRatePerSecond: 0.75,
    maintenanceDecayPerMinute: 0.35,
  },
} as const;

export function getBoatDefinition(boatId: keyof typeof boatDefinitions) {
  return boatDefinitions[boatId];
}
