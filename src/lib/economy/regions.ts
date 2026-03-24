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
    stockCap: 140,
    regenPerSecond: 0.25,
    baseFishValue: 5,
    catchSpeedModifier: 1,
    scarcityPriceModifier: 1,
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

type RegionStockPressure = {
  id: keyof typeof regionDefinitions;
  stockCurrent: number;
  stockCap: number;
};

export function getRegionStockPressureModifiers(
  region: RegionStockPressure,
) {
  const baseRegion = getRegionDefinition(region.id);
  const stockRatio =
    region.stockCap > 0
      ? Math.max(0, Math.min(1, region.stockCurrent / region.stockCap))
      : 0;

  const catchSpeedPressure =
    stockRatio > 0.7 ? 1 : stockRatio > 0.4 ? 0.85 : stockRatio > 0.2 ? 0.6 : 0.3;
  const scarcityPricePressure =
    stockRatio > 0.3 ? 1 : stockRatio > 0.1 ? 1.25 : 1.6;

  return {
    catchSpeedModifier: baseRegion.catchSpeedModifier * catchSpeedPressure,
    scarcityPriceModifier:
      baseRegion.scarcityPriceModifier * scarcityPricePressure,
  };
}

export function applyRegionStockPressure<T extends RegionStockPressure>(
  region: T,
): T & ReturnType<typeof getRegionStockPressureModifiers> {
  return {
    ...region,
    ...getRegionStockPressureModifiers(region),
  };
}

export function applyRegionsStockPressure<
  T extends Record<string, RegionStockPressure>,
>(regions: T): {
  [K in keyof T]: T[K] & ReturnType<typeof getRegionStockPressureModifiers>;
} {
  return Object.fromEntries(
    Object.entries(regions).map(([regionId, region]) => [
      regionId,
      applyRegionStockPressure(region),
    ]),
  ) as {
    [K in keyof T]: T[K] & ReturnType<typeof getRegionStockPressureModifiers>;
  };
}
