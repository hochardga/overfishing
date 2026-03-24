import { getPhaseDefinition, type PhaseId } from "@/lib/economy/phases";
import type { RunState } from "@/lib/storage/saveSchema";

type PhaseUnlockRule = {
  phaseId: PhaseId;
  requiredLifetimeFishLanded: number;
  requiredLifetimeRevenue: number;
  requiredUpgradeIds: string[];
  unlockTabs: RunState["unlocks"]["tabs"];
};

export const phaseUnlockRules: PhaseUnlockRule[] = [
  {
    phaseId: "skiffOperator",
    requiredLifetimeFishLanded: 60,
    requiredLifetimeRevenue: 250,
    requiredUpgradeIds: [],
    unlockTabs: ["fleet"],
  },
  {
    phaseId: "docksideGear",
    requiredLifetimeFishLanded: 150,
    requiredLifetimeRevenue: 750,
    requiredUpgradeIds: ["rustySkiff"],
    unlockTabs: ["fleet"],
  },
];

function dedupeTabs(tabs: RunState["unlocks"]["tabs"]) {
  return Array.from(new Set(tabs));
}

function meetsRequirements(run: RunState, rule: PhaseUnlockRule) {
  return (
    run.lifetimeFishLanded >= rule.requiredLifetimeFishLanded &&
    run.lifetimeRevenue >= rule.requiredLifetimeRevenue &&
    rule.requiredUpgradeIds.every((upgradeId) =>
      run.unlocks.upgrades.includes(upgradeId),
    )
  );
}

export function applyUnlockChecks(run: RunState): RunState {
  let nextRun = run;

  for (const rule of phaseUnlockRules) {
    if (nextRun.unlocks.phasesSeen.includes(rule.phaseId)) {
      continue;
    }

    if (!meetsRequirements(nextRun, rule)) {
      continue;
    }

    const phaseDefinition = getPhaseDefinition(rule.phaseId);
    nextRun = {
      ...nextRun,
      phase: rule.phaseId,
      uiTone: phaseDefinition.uiTone,
      unlocks: {
        ...nextRun.unlocks,
        phasesSeen: [...nextRun.unlocks.phasesSeen, rule.phaseId],
        tabs: dedupeTabs([...nextRun.unlocks.tabs, ...rule.unlockTabs]),
      },
    };
  }

  return nextRun;
}
