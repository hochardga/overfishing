import { getPhaseDefinition } from "@/lib/economy/phases";
import type { PhaseId, RunState } from "@/lib/storage/saveSchema";

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
  {
    phaseId: "fleetOps",
    requiredLifetimeFishLanded: 260,
    requiredLifetimeRevenue: 1_400,
    requiredUpgradeIds: ["hireCousin"],
    unlockTabs: ["fleet"],
  },
  {
    phaseId: "processingContracts",
    requiredLifetimeFishLanded: 520,
    requiredLifetimeRevenue: 3_200,
    requiredUpgradeIds: ["dockLease", "usedWorkSkiff", "deckhandHire"],
    unlockTabs: ["fleet", "processing"],
  },
  {
    phaseId: "regionalExtraction",
    requiredLifetimeFishLanded: 950,
    requiredLifetimeRevenue: 5_800,
    requiredUpgradeIds: ["processingShed", "flashFreezer"],
    unlockTabs: ["fleet", "processing", "regions"],
  },
];

function dedupeTabs(tabs: RunState["unlocks"]["tabs"]) {
  return Array.from(new Set(tabs));
}

function ensureUnlockModalState(run: RunState): RunState {
  return {
    ...run,
    unlocks: {
      ...run.unlocks,
      pendingPhaseModalIds: run.unlocks.pendingPhaseModalIds ?? [],
      dismissedPhaseModalIds: run.unlocks.dismissedPhaseModalIds ?? [],
    },
  };
}

function queuePhaseUnlockModal(run: RunState, phaseId: PhaseId): RunState {
  if (run.unlocks.pendingPhaseModalIds.includes(phaseId)) {
    return run;
  }

  if (run.unlocks.dismissedPhaseModalIds.includes(phaseId)) {
    return run;
  }

  return {
    ...run,
    unlocks: {
      ...run.unlocks,
      pendingPhaseModalIds: [...run.unlocks.pendingPhaseModalIds, phaseId],
    },
  };
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
  let nextRun = ensureUnlockModalState(run);

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
    nextRun = queuePhaseUnlockModal(nextRun, rule.phaseId);
  }

  return nextRun;
}

export function dismissPhaseUnlockModal(
  run: RunState,
  phaseId: PhaseId,
): RunState {
  const nextRun = ensureUnlockModalState(run);

  return {
    ...nextRun,
    unlocks: {
      ...nextRun.unlocks,
      pendingPhaseModalIds: nextRun.unlocks.pendingPhaseModalIds.filter(
        (pendingPhaseId) => pendingPhaseId !== phaseId,
      ),
      dismissedPhaseModalIds: Array.from(
        new Set([...nextRun.unlocks.dismissedPhaseModalIds, phaseId]),
      ),
    },
  };
}
