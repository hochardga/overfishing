export const upgradeDefinitions = {
  betterBait: {
    id: "betterBait",
    label: "Better Bait",
    phase: "quietPier",
    cost: 25,
    description: "Improve early catch consistency without increasing click load.",
  },
  handReel: {
    id: "handReel",
    label: "Hand Reel",
    phase: "quietPier",
    cost: 50,
    description: "Increase early catch efficiency on the dock.",
  },
  tackleTin: {
    id: "tackleTin",
    label: "Tackle Tin",
    phase: "quietPier",
    cost: 80,
    description: "Small organization upgrade that smooths the first loop.",
  },
  luckyHat: {
    id: "luckyHat",
    label: "Lucky Hat",
    phase: "quietPier",
    cost: 120,
    description: "Tiny edge in the cozy phase before things harden.",
  },
  saltedLunch: {
    id: "saltedLunch",
    label: "Salted Lunch",
    phase: "quietPier",
    cost: 160,
    description: "Sustain early manual pace without changing the surface area.",
  },
} as const;

export function getUpgradeDefinition(
  upgradeId: keyof typeof upgradeDefinitions,
) {
  return upgradeDefinitions[upgradeId];
}
