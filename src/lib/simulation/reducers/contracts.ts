import { contractDefinitions, getContractDefinition } from "@/lib/economy/contracts";
import type { RunState } from "@/lib/storage/saveSchema";

export type ContractCommandArgs = {
  contractId: string;
};

export type ContractCommandResult = {
  run: RunState;
};

export type ClaimContractRewardResult = ContractCommandResult & {
  outcome: "claimed" | "notReady" | "missingContract";
};

function getResourceKeyForProduct(product: "frozenCrate" | "cannedCase") {
  return product === "frozenCrate" ? "frozenCrates" : "cannedCases";
}

export function syncContractsState(run: RunState): RunState {
  if (
    !run.unlocks.phasesSeen.includes("processingContracts") &&
    run.phase !== "processingContracts" &&
    run.phase !== "regionalExtraction"
  ) {
    return run;
  }

  const nextContracts = {
    ...run.contracts,
  };
  let didChange = false;

  for (const definition of Object.values(contractDefinitions)) {
    if (nextContracts[definition.id]) {
      continue;
    }

    nextContracts[definition.id] = {
      id: definition.id,
      type: definition.id,
      product: definition.product,
      requiredAmount: definition.requiredAmount,
      deliveredAmount: 0,
      rewardCash: definition.rewardCash,
      expiresAtSeconds: 0,
      status: "available",
    };
    didChange = true;
  }

  if (!didChange) {
    return run;
  }

  return {
    ...run,
    contracts: nextContracts,
  };
}

export function acceptContract(
  run: RunState,
  args: ContractCommandArgs,
): ContractCommandResult {
  const syncedRun = syncContractsState(run);
  const contract = syncedRun.contracts[args.contractId];

  if (!contract) {
    return {
      run: syncedRun,
    };
  }

  if (contract.status !== "available") {
    return {
      run: syncedRun,
    };
  }

  return {
    run: {
      ...syncedRun,
      contracts: {
        ...syncedRun.contracts,
        [args.contractId]: {
          ...contract,
          status: "active",
          deliveredAmount: 0,
          expiresAtSeconds:
            syncedRun.elapsedSeconds +
            getContractDefinition(
              contract.id as keyof typeof contractDefinitions,
            ).durationSeconds,
        },
      },
    },
  };
}

export function deliverContract(
  run: RunState,
  args: ContractCommandArgs,
): ContractCommandResult {
  const syncedRun = syncContractsState(run);
  const contract = syncedRun.contracts[args.contractId];

  if (!contract || contract.status !== "active") {
    return {
      run: syncedRun,
    };
  }

  const resourceKey = getResourceKeyForProduct(contract.product);
  const amountNeeded = Math.max(0, contract.requiredAmount - contract.deliveredAmount);
  const amountDelivered = Math.min(syncedRun.resources[resourceKey], amountNeeded);
  const deliveredAmount = contract.deliveredAmount + amountDelivered;
  const nextStatus =
    deliveredAmount >= contract.requiredAmount ? "completed" : contract.status;

  return {
    run: {
      ...syncedRun,
      contracts: {
        ...syncedRun.contracts,
        [args.contractId]: {
          ...contract,
          deliveredAmount,
          status: nextStatus,
        },
      },
      resources: {
        ...syncedRun.resources,
        [resourceKey]: syncedRun.resources[resourceKey] - amountDelivered,
      },
    },
  };
}

export function claimContractReward(
  run: RunState,
  args: ContractCommandArgs,
): ClaimContractRewardResult {
  const syncedRun = syncContractsState(run);
  const contract = syncedRun.contracts[args.contractId];

  if (!contract) {
    return {
      outcome: "missingContract",
      run: syncedRun,
    };
  }

  if (contract.status !== "completed") {
    return {
      outcome: "notReady",
      run: syncedRun,
    };
  }

  return {
    outcome: "claimed",
    run: {
      ...syncedRun,
      cash: syncedRun.cash + contract.rewardCash,
      contracts: {
        ...syncedRun.contracts,
        [args.contractId]: {
          ...contract,
          deliveredAmount: 0,
          expiresAtSeconds: 0,
          status: "available",
        },
      },
    },
  };
}

export function advanceContracts(run: RunState): RunState {
  const syncedRun = syncContractsState(run);
  let didChange = false;
  const nextContracts = Object.fromEntries(
    Object.entries(syncedRun.contracts).map(([contractId, contract]) => {
      if (
        contract.status === "active" &&
        contract.expiresAtSeconds > 0 &&
        syncedRun.elapsedSeconds >= contract.expiresAtSeconds
      ) {
        didChange = true;
        return [
          contractId,
          {
            ...contract,
            deliveredAmount: 0,
            status: "expired" as const,
          },
        ];
      }

      return [contractId, contract];
    }),
  ) as RunState["contracts"];

  if (!didChange) {
    return syncedRun;
  }

  return {
    ...syncedRun,
    contracts: nextContracts,
  };
}
