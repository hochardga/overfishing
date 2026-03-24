import { getUpgradeDefinition, type UpgradeId } from "@/lib/economy/upgrades";
import type { PhaseId, RunState } from "@/lib/storage/saveSchema";

import { applyUnlockChecks } from "@/lib/simulation/reducers/unlocks";

export type UpgradePurchaseOutcome =
  | "purchased"
  | "insufficientCash"
  | "locked"
  | "owned"
  | "unknown";

export type UpgradePurchaseResult = {
  outcome: UpgradePurchaseOutcome;
  run: RunState;
  cashSpent: number;
  newCashBalance: number;
  unlockedPhase?: PhaseId;
  feedback: string;
};

function formatCash(value: number) {
  return `$${value.toFixed(0)}`;
}

function buildOutcomeFeedback(
  outcome: UpgradePurchaseOutcome,
  label: string,
  cashSpent: number,
) {
  if (outcome === "purchased") {
    return `${label} purchased for ${formatCash(cashSpent)}.`;
  }

  if (outcome === "insufficientCash") {
    return `Need more cash for ${label}.`;
  }

  if (outcome === "owned") {
    return `${label} is already owned.`;
  }

  if (outcome === "locked") {
    return `${label} is not available yet.`;
  }

  return `Could not resolve ${label}.`;
}

export function purchaseUpgrade(
  run: RunState,
  upgradeId: string,
): UpgradePurchaseResult {
  const definition = getUpgradeDefinition(upgradeId as UpgradeId);

  if (!definition) {
    return {
      outcome: "unknown",
      run,
      cashSpent: 0,
      newCashBalance: run.cash,
      feedback: "Unknown upgrade.",
    };
  }

  if (run.unlocks.upgrades.includes(upgradeId)) {
    return {
      outcome: "owned",
      run,
      cashSpent: 0,
      newCashBalance: run.cash,
      feedback: buildOutcomeFeedback("owned", definition.label, 0),
    };
  }

  if (!run.unlocks.phasesSeen.includes(definition.phase)) {
    return {
      outcome: "locked",
      run,
      cashSpent: 0,
      newCashBalance: run.cash,
      feedback: buildOutcomeFeedback("locked", definition.label, 0),
    };
  }

  if (run.cash < definition.cost) {
    return {
      outcome: "insufficientCash",
      run,
      cashSpent: 0,
      newCashBalance: run.cash,
      feedback: buildOutcomeFeedback("insufficientCash", definition.label, 0),
    };
  }

  const purchasedRun: RunState = applyUnlockChecks({
    ...run,
    cash: run.cash - definition.cost,
    unlocks: {
      ...run.unlocks,
      upgrades: [...run.unlocks.upgrades, upgradeId],
    },
  });

  return {
    outcome: "purchased",
    run: purchasedRun,
    cashSpent: definition.cost,
    newCashBalance: purchasedRun.cash,
    unlockedPhase:
      purchasedRun.phase !== run.phase ? purchasedRun.phase : undefined,
    feedback: buildOutcomeFeedback(
      "purchased",
      definition.label,
      definition.cost,
      purchasedRun.cash,
    ),
  };
}
