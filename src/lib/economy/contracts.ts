export const contractDefinitions = {
  restaurant: {
    id: "restaurant",
    label: "Restaurant Route",
    product: "frozenCrate",
    requiredAmount: 8,
    rewardCash: 120,
    durationSeconds: 360,
  },
  grocer: {
    id: "grocer",
    label: "Grocer Delivery",
    product: "frozenCrate",
    requiredAmount: 14,
    rewardCash: 220,
    durationSeconds: 540,
  },
  schoolLunch: {
    id: "schoolLunch",
    label: "School Lunch Bid",
    product: "cannedCase",
    requiredAmount: 10,
    rewardCash: 260,
    durationSeconds: 720,
  },
} as const;

export function getContractDefinition(
  contractId: keyof typeof contractDefinitions,
) {
  return contractDefinitions[contractId];
}
