import type { PhaseId, RegionId } from "@/lib/storage/saveSchema";

export type UpgradeId =
  | "betterBait"
  | "handReel"
  | "tackleTin"
  | "luckyHat"
  | "saltedLunch"
  | "harborMap"
  | "rustySkiff"
  | "outboardMotor"
  | "iceChest"
  | "rodRack"
  | "crabPot"
  | "longline"
  | "hireCousin"
  | "dockLease"
  | "usedWorkSkiff"
  | "deckhandHire"
  | "processingShed"
  | "flashFreezer"
  | "canneryLine"
  | "dockForklift"
  | "coldRoomExpansion";

export type ManualUpgradeEffects = {
  perfectZoneWidthMultiplier: number;
  castCooldownMultiplier: number;
  catchAmountPerfect: number;
  sellValueBonusPerFish: number;
  sellValueMultiplier: number;
};

export type PassiveGearUpgradeEffects = {
  gearId: string;
  kind: "crabPot" | "longline";
  assignedRegionId: RegionId;
  outputPerSecond: number;
  collectionIntervalSeconds: number;
};

export type HelperUpgradeEffects = {
  autoHaulIntervalSeconds: number;
};

type UpgradeDefinition = {
  id: UpgradeId;
  label: string;
  phase: PhaseId;
  cost: number;
  description: string;
  effects: Partial<ManualUpgradeEffects>;
  passiveGear?: PassiveGearUpgradeEffects;
  helper?: HelperUpgradeEffects;
};

export const upgradeDefinitions: Record<UpgradeId, UpgradeDefinition> = {
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
  crabPot: {
    id: "crabPot",
    label: "Crab Pot",
    phase: "docksideGear",
    cost: 300,
    description: "A steady passive rig that fills a single dockside gear slot.",
    effects: {},
    passiveGear: {
      gearId: "crabPot01",
      kind: "crabPot",
      assignedRegionId: "pierCove",
      outputPerSecond: 0.18,
      collectionIntervalSeconds: 120,
    },
  },
  longline: {
    id: "longline",
    label: "Longline",
    phase: "docksideGear",
    cost: 450,
    description: "A hungrier passive line that pays back faster if you can haul it.",
    effects: {},
    passiveGear: {
      gearId: "longline01",
      kind: "longline",
      assignedRegionId: "pierCove",
      outputPerSecond: 0.3,
      collectionIntervalSeconds: 120,
    },
  },
  hireCousin: {
    id: "hireCousin",
    label: "Hire Cousin",
    phase: "docksideGear",
    cost: 550,
    description: "Auto-hauls passive gear every 90 seconds so the dock can breathe.",
    effects: {},
    helper: {
      autoHaulIntervalSeconds: 90,
    },
  },
  dockLease: {
    id: "dockLease",
    label: "Dock Lease",
    phase: "fleetOps",
    cost: 650,
    description: "Lease a wider section of the dock and chart the Offshore Shelf.",
    effects: {},
  },
  usedWorkSkiff: {
    id: "usedWorkSkiff",
    label: "Used Work Skiff",
    phase: "fleetOps",
    cost: 900,
    description: "A second hull that turns one route into fleet operations.",
    effects: {},
  },
  deckhandHire: {
    id: "deckhandHire",
    label: "Deckhand Hire",
    phase: "fleetOps",
    cost: 500,
    description: "Put a paid hand on the boats so routes can run without you.",
    effects: {},
  },
  processingShed: {
    id: "processingShed",
    label: "Processing Shed",
    phase: "processingContracts",
    cost: 950,
    description: "Bring raw fish off the dock and into the first cold-work line.",
    effects: {},
  },
  flashFreezer: {
    id: "flashFreezer",
    label: "Flash Freezer",
    phase: "processingContracts",
    cost: 1_100,
    description: "Freeze raw catch into crate-ready product at a steady cadence.",
    effects: {},
  },
  canneryLine: {
    id: "canneryLine",
    label: "Cannery Line",
    phase: "processingContracts",
    cost: 1_350,
    description: "Turn surplus fish into slower but richer canned output.",
    effects: {},
  },
  dockForklift: {
    id: "dockForklift",
    label: "Dock Forklift",
    phase: "processingContracts",
    cost: 800,
    description: "Move more fish off returning boats before the dock clogs.",
    effects: {},
  },
  coldRoomExpansion: {
    id: "coldRoomExpansion",
    label: "Cold Room Expansion",
    phase: "processingContracts",
    cost: 900,
    description: "Keep more raw fish stable once the processing shed is online.",
    effects: {},
  },
};

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
