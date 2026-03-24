import { z } from "zod";

import { getPhaseDefinition } from "@/lib/economy/phases";
import {
  applyRegionsStockPressure,
  regionDefinitions,
} from "@/lib/economy/regions";

export const phaseIdSchema = z.enum([
  "quietPier",
  "skiffOperator",
  "docksideGear",
  "fleetOps",
  "processingContracts",
  "regionalExtraction",
]);

export const uiToneSchema = z.enum(["cozy", "operational", "industrial"]);
export const regionIdSchema = z.enum([
  "pierCove",
  "kelpBed",
  "offshoreShelf",
]);
export const uiScaleSchema = z.enum(["default", "large"]);

export const settingsStateSchema = z.object({
  reducedMotion: z.boolean(),
  uiScale: uiScaleSchema,
  soundEnabled: z.boolean(),
  analyticsConsent: z.boolean(),
});

export const metaProgressStateSchema = z.object({
  renewals: z.number(),
  startingCashBonus: z.number(),
  manualCatchBonus: z.number(),
  unlockFlags: z.array(z.string()),
});

export const manualFishingStateSchema = z.object({
  cooldownMs: z.number(),
  perfectZoneWidth: z.number(),
  catchAmountNormal: z.number(),
  catchAmountPerfect: z.number(),
  sellValueModifier: z.number(),
});

export const regionStateSchema = z.object({
  id: regionIdSchema,
  label: z.string(),
  stockCurrent: z.number(),
  stockCap: z.number(),
  regenPerSecond: z.number(),
  baseFishValue: z.number(),
  catchSpeedModifier: z.number(),
  scarcityPriceModifier: z.number(),
  bycatchRate: z.number(),
  habitatDamage: z.number(),
  unlocked: z.boolean(),
});

export const gearStateSchema = z.object({
  id: z.string(),
  kind: z.enum(["crabPot", "longline"]),
  assignedRegionId: regionIdSchema,
  outputPerSecond: z.number(),
  collectionIntervalSeconds: z.number(),
  secondsSinceCollection: z.number(),
  active: z.boolean(),
  blockedByStorage: z.boolean().default(false),
});

export const boatStateSchema = z.object({
  id: z.string(),
  model: z.enum(["rustySkiff", "workSkiff"]),
  automated: z.boolean(),
  status: z.enum(["docked", "fishing"]),
  assignedRegionId: regionIdSchema.nullable(),
  holdCap: z.number(),
  holdCurrent: z.number(),
  fuelCap: z.number(),
  fuelCurrent: z.number(),
  tripSeconds: z.number(),
  maintenancePercent: z.number(),
  catchRatePerSecond: z.number(),
  crewAssigned: z.boolean(),
  wagePerMinute: z.number(),
  breakdownUntilTimestamp: z.number().optional(),
});

export const processingQueueStateSchema = z.object({
  id: z.string(),
  product: z.enum(["frozenCrate", "cannedCase"]),
  inputRequired: z.number(),
  cycleSeconds: z.number(),
  progressSeconds: z.number(),
  active: z.boolean(),
});

export const facilityStateSchema = z.object({
  dockStorageCap: z.number(),
  dockStorageRawFish: z.number(),
  dockStorageQuality: z.number().default(1),
  gearSlotCap: z.number().default(2),
  coldStorageCap: z.number(),
  coldStorageRawFish: z.number(),
  unloadLanes: z.number(),
  flashFreezerEnabled: z.boolean(),
  canneryEnabled: z.boolean(),
  processingQueues: z.array(processingQueueStateSchema),
});

export const contractStateSchema = z.object({
  id: z.string(),
  type: z.enum(["restaurant", "grocer", "schoolLunch"]),
  product: z.enum(["frozenCrate", "cannedCase"]),
  requiredAmount: z.number(),
  deliveredAmount: z.number(),
  rewardCash: z.number(),
  expiresAtSeconds: z.number(),
  status: z.enum(["available", "active", "completed", "expired"]),
});

export const resourceStateSchema = z.object({
  fuel: z.number(),
  rawFish: z.number(),
  frozenCrates: z.number(),
  cannedCases: z.number(),
});

export const unlockStateSchema = z.object({
  tabs: z.array(
    z.enum(["harbor", "fleet", "processing", "regions", "settings"]),
  ),
  upgrades: z.array(z.string()),
  phasesSeen: z.array(phaseIdSchema),
});

export const notificationStateSchema = z.object({
  id: z.string(),
  kind: z.enum(["unlock", "warning", "breakdown", "contract", "renewal"]),
  message: z.string(),
  createdAtSeconds: z.number(),
});

export const runStateSchema = z.object({
  phase: phaseIdSchema,
  uiTone: uiToneSchema,
  elapsedSeconds: z.number(),
  cash: z.number(),
  lifetimeRevenue: z.number(),
  lifetimeFishLanded: z.number(),
  manual: manualFishingStateSchema,
  regions: z.record(regionIdSchema, regionStateSchema),
  gear: z.record(z.string(), gearStateSchema),
  boats: z.record(z.string(), boatStateSchema),
  facilities: facilityStateSchema,
  contracts: z.record(z.string(), contractStateSchema),
  resources: resourceStateSchema,
  trust: z.number(),
  influence: z.number(),
  oceanHealth: z.number(),
  unlocks: unlockStateSchema,
  notifications: z.array(notificationStateSchema),
});

export const saveFileSchema = z.object({
  version: z.literal(1),
  createdAt: z.string(),
  lastSavedAt: z.string(),
  meta: metaProgressStateSchema,
  settings: settingsStateSchema,
  run: runStateSchema.nullable(),
});

export type PhaseId = z.infer<typeof phaseIdSchema>;
export type RegionId = z.infer<typeof regionIdSchema>;
export type SettingsState = z.infer<typeof settingsStateSchema>;
export type RunState = z.infer<typeof runStateSchema>;
export type SaveFile = z.infer<typeof saveFileSchema>;

export function createDefaultSettings(): SettingsState {
  return {
    reducedMotion: false,
    uiScale: "default",
    soundEnabled: true,
    analyticsConsent: false,
  };
}

export function createStarterRun(): RunState {
  const quietPier = getPhaseDefinition("quietPier");
  const regions = applyRegionsStockPressure(
    Object.fromEntries(
      Object.values(regionDefinitions).map((region) => [
        region.id,
        {
          ...region,
          stockCurrent: region.stockCap,
        },
      ]),
    ) as RunState["regions"],
  );

  return {
    phase: "quietPier",
    uiTone: quietPier.uiTone,
    elapsedSeconds: 0,
    cash: 0,
    lifetimeRevenue: 0,
    lifetimeFishLanded: 0,
    manual: {
      cooldownMs: 0,
      perfectZoneWidth: 0.24,
      catchAmountNormal: 1,
      catchAmountPerfect: 2,
      sellValueModifier: 1,
    },
    regions,
    gear: {},
    boats: {},
    facilities: {
      dockStorageCap: 20,
      dockStorageRawFish: 0,
      dockStorageQuality: 1,
      gearSlotCap: 2,
      coldStorageCap: 0,
      coldStorageRawFish: 0,
      unloadLanes: 1,
      flashFreezerEnabled: false,
      canneryEnabled: false,
      processingQueues: [],
    },
    contracts: {},
    resources: {
      fuel: 0,
      rawFish: 0,
      frozenCrates: 0,
      cannedCases: 0,
    },
    trust: 0,
    influence: 0,
    oceanHealth: 100,
    unlocks: {
      tabs: ["harbor", "settings"],
      upgrades: [],
      phasesSeen: ["quietPier"],
    },
    notifications: [],
  };
}

export function createFreshSave(
  overrides: Partial<SaveFile> = {},
): SaveFile {
  const now = new Date().toISOString();

  return {
    version: 1,
    createdAt: now,
    lastSavedAt: now,
    meta: {
      renewals: 0,
      startingCashBonus: 0,
      manualCatchBonus: 0,
      unlockFlags: [],
    },
    settings: createDefaultSettings(),
    run: createStarterRun(),
    ...overrides,
  };
}
