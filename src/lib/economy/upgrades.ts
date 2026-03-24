import type { PhaseId } from "@/lib/storage/saveSchema";

export type UpgradeId = keyof typeof upgradeDefinitions;

export type ManualUpgradeEffects = {
  perfectZoneWidthMultiplier: number;
  castCooldownMultiplier: number;
  catchAmountPerfect: number;
  sellValueBonusPerFish: number;
  sellValueMultiplier: number;
};

type UpgradeDefinition = {
  id: UpgradeId;
  label: string;
  phase: PhaseId;
  cost: number;
  description: string;
  effects: Partial<ManualUpgradeEffects>;
};

export const upgradeDefinitions = {
  betterBait: {
    id: "betterBait",
    label: "Better Bait",
    phase: "quietPier",
    cost: 15,
    description: "Perfect timing gets a little wider without changing the feel.",
    effects: {
      perfectZoneWidthMultiplier: 1.1,
    },
  },
  handReel: {
    id: "handReel",
    label: "Hand Reel",
    phase: "quietPier",
    cost: 35,
    description: "Shave the manual cycle down from 2.2s to 1.9s.",
    effects: {
      castCooldownMultiplier: 1_900 / 2_200,
    },
  },
  tackleTin: {
    id: "tackleTin",
    label: "Tackle Tin",
    phase: "quietPier",
    cost: 60,
    description: "Add $1 to every fish you pull from the pier.",
    effects: {
      sellValueBonusPerFish: 1,
    },
  },
  luckyHat: {
    id: "luckyHat",
    label: "Lucky Hat",
    phase: "quietPier",
    cost: 90,
    description: "Perfect pulls land 3 fish instead of 2.",
    effects: {
      catchAmountPerfect: 3,
    },
  },
  saltedLunch: {
    id: "saltedLunch",
    label: "Salted Lunch",
    phase: "quietPier",
    cost: 140,
    description: "Manual catch value rises by 15%.",
    effects: {
      sellValueMultiplier: 1.15,
    },
  },
  harborMap: {
    id: "harborMap",
    label: "Harbor Map",
    phase: "skiffOperator",
    cost: 100,
    description: "Unlock the Kelp Bed once the dock graduates beyond the pier.",
    effects: {},
  },
  rustySkiff: {
    id: "rustySkiff",
    label: "Rusty Skiff",
    phase: "skiffOperator",
    cost: 300,
    description: "A first workboat that turns the run from casting into routing.",
    effects: {},
  },
  outboardMotor: {
    id: "outboardMotor",
    label: "Outboard Motor",
    phase: "skiffOperator",
    cost: 180,
    description: "Improve the skiff's fuel ceiling for longer dockside trips.",
    effects: {},
  },
  iceChest: {
    id: "iceChest",
    label: "Ice Chest",
    phase: "skiffOperator",
    cost: 150,
    description: "Make room for a larger catch before the skiff returns.",
    effects: {},
  },
  rodRack: {
    id: "rodRack",
    label: "Rod Rack",
    phase: "skiffOperator",
    cost: 220,
    description: "Prep the skiff for faster on-water hauling once Phase 2 opens.",
    effects: {},
  },
} as const satisfies Record<string, UpgradeDefinition>;

export function getUpgradeDefinition(upgradeId: UpgradeId) {
  return upgradeDefinitions[upgradeId];
}

export function selectManualUpgradeEffects(
  purchasedUpgradeIds: readonly string[],
): ManualUpgradeEffects {
  return purchasedUpgradeIds.reduce<ManualUpgradeEffects>(
    (effects, upgradeId) => {
      const definition = upgradeDefinitions[upgradeId as UpgradeId];

      if (!definition) {
        return effects;
      }

      const manualEffects = definition.effects;

      return {
        perfectZoneWidthMultiplier:
          effects.perfectZoneWidthMultiplier *
          (manualEffects.perfectZoneWidthMultiplier ?? 1),
        castCooldownMultiplier:
          effects.castCooldownMultiplier *
          (manualEffects.castCooldownMultiplier ?? 1),
        catchAmountPerfect: Math.max(
          effects.catchAmountPerfect,
          manualEffects.catchAmountPerfect ?? effects.catchAmountPerfect,
        ),
        sellValueBonusPerFish:
          effects.sellValueBonusPerFish +
          (manualEffects.sellValueBonusPerFish ?? 0),
        sellValueMultiplier:
          effects.sellValueMultiplier *
          (manualEffects.sellValueMultiplier ?? 1),
      };
    },
    {
      perfectZoneWidthMultiplier: 1,
      castCooldownMultiplier: 1,
      catchAmountPerfect: 2,
      sellValueBonusPerFish: 0,
      sellValueMultiplier: 1,
    },
  );
}
