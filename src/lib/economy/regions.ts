export const regionDefinitions = {
  pierCove: {
    id: "pierCove",
    label: "Pier Cove",
    stockCap: 120,
    regenPerSecond: 0.5,
    baseFishValue: 4,
    catchSpeedModifier: 1,
    scarcityPriceModifier: 1,
    bycatchRate: 0,
    habitatDamage: 0,
    unlocked: true,
  },
  kelpBed: {
    id: "kelpBed",
    label: "Kelp Bed",
    stockCap: 180,
    regenPerSecond: 0.75,
    baseFishValue: 6,
    catchSpeedModifier: 0.9,
    scarcityPriceModifier: 1.05,
    bycatchRate: 0.02,
    habitatDamage: 0,
    unlocked: false,
  },
  offshoreShelf: {
    id: "offshoreShelf",
    label: "Offshore Shelf",
    stockCap: 260,
    regenPerSecond: 1,
    baseFishValue: 9,
    catchSpeedModifier: 0.8,
    scarcityPriceModifier: 1.1,
    bycatchRate: 0.05,
    habitatDamage: 0,
    unlocked: false,
  },
} as const;

export function getRegionDefinition(regionId: keyof typeof regionDefinitions) {
  return regionDefinitions[regionId];
}
