export const boatDefinitions = {
  rustySkiff: {
    id: "rustySkiff",
    label: "Rusty Skiff",
    fuelCap: 20,
    holdCap: 15,
    catchRatePerSecond: 0.8,
    maintenanceDecayPerMinute: 0.2,
    fuelDrainPerMinute: 2,
    wagePerMinute: 6,
  },
  workSkiff: {
    id: "workSkiff",
    label: "Used Work Skiff",
    fuelCap: 36,
    holdCap: 34,
    catchRatePerSecond: 1.15,
    maintenanceDecayPerMinute: 0.35,
    fuelDrainPerMinute: 2.8,
    wagePerMinute: 10,
  },
} as const;

export function getBoatDefinition(boatId: keyof typeof boatDefinitions) {
  return boatDefinitions[boatId];
}
