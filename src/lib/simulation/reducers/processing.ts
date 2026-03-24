import type { RunState } from "@/lib/storage/saveSchema";

import { syncFacilitiesState } from "@/lib/simulation/reducers/facilities";

export type SetProcessingQueueArgs = {
  queueId: string;
  active: boolean;
  product: "frozenCrate" | "cannedCase";
};

export type SetProcessingQueueResult = {
  run: RunState;
};

const DEFAULT_QUEUES = {
  "freezer-line": {
    id: "freezer-line",
    product: "frozenCrate" as const,
    inputRequired: 10,
    cycleSeconds: 90,
    progressSeconds: 0,
    active: false,
  },
  "cannery-line": {
    id: "cannery-line",
    product: "cannedCase" as const,
    inputRequired: 12,
    cycleSeconds: 120,
    progressSeconds: 0,
    active: false,
  },
} as const;

function hasUpgrade(run: RunState, upgradeId: string) {
  return run.unlocks.upgrades.includes(upgradeId);
}

export function syncProcessingState(run: RunState): RunState {
  const syncedRun = syncFacilitiesState(run);
  const nextQueueMap: Record<string, RunState["facilities"]["processingQueues"][number]> = {};

  if (hasUpgrade(syncedRun, "flashFreezer")) {
    const currentQueue = syncedRun.facilities.processingQueues.find(
      (queue) => queue.id === "freezer-line",
    );
    nextQueueMap["freezer-line"] = currentQueue ?? DEFAULT_QUEUES["freezer-line"];
  }

  if (hasUpgrade(syncedRun, "canneryLine")) {
    const currentQueue = syncedRun.facilities.processingQueues.find(
      (queue) => queue.id === "cannery-line",
    );
    nextQueueMap["cannery-line"] = currentQueue ?? DEFAULT_QUEUES["cannery-line"];
  }

  const nextQueues = Object.values(nextQueueMap);

  if (
    nextQueues.length === syncedRun.facilities.processingQueues.length &&
    nextQueues.every((queue, index) => syncedRun.facilities.processingQueues[index] === queue)
  ) {
    return syncedRun;
  }

  return {
    ...syncedRun,
    facilities: {
      ...syncedRun.facilities,
      processingQueues: nextQueues,
    },
  };
}

export function setProcessingQueue(
  run: RunState,
  args: SetProcessingQueueArgs,
): SetProcessingQueueResult {
  const syncedRun = syncProcessingState(run);

  return {
    run: {
      ...syncedRun,
      facilities: {
        ...syncedRun.facilities,
        processingQueues: syncedRun.facilities.processingQueues.map((queue) =>
          queue.id === args.queueId
            ? {
                ...queue,
                active: args.active,
                product: args.product,
              }
            : queue,
        ),
      },
    },
  };
}

export function advanceProcessing(
  run: RunState,
  elapsedSeconds: number,
): RunState {
  const syncedRun = syncProcessingState(run);
  let coldStorageRawFish = syncedRun.facilities.coldStorageRawFish;
  let frozenCrates = syncedRun.resources.frozenCrates;
  let cannedCases = syncedRun.resources.cannedCases;
  let didChange = false;
  const nextQueues = syncedRun.facilities.processingQueues.map((queue) => ({
    ...queue,
    progressSeconds: queue.active
      ? queue.progressSeconds + elapsedSeconds
      : queue.progressSeconds,
  }));

  let advancedCycle = true;

  while (advancedCycle) {
    advancedCycle = false;

    for (const queue of nextQueues) {
      if (!queue.active) {
        continue;
      }

      if (
        queue.progressSeconds < queue.cycleSeconds ||
        coldStorageRawFish < queue.inputRequired
      ) {
        continue;
      }

      queue.progressSeconds -= queue.cycleSeconds;
      coldStorageRawFish -= queue.inputRequired;
      if (queue.product === "frozenCrate") {
        frozenCrates += 1;
      } else {
        cannedCases += 1;
      }
      advancedCycle = true;
      didChange = true;
    }
  }

  if (
    nextQueues.some(
      (queue, index) =>
        queue.progressSeconds !== syncedRun.facilities.processingQueues[index]?.progressSeconds,
    )
  ) {
    didChange = true;
  }

  if (!didChange) {
    return syncedRun;
  }

  return syncFacilitiesState({
    ...syncedRun,
    facilities: {
      ...syncedRun.facilities,
      coldStorageRawFish,
      processingQueues: nextQueues,
    },
    resources: {
      ...syncedRun.resources,
      frozenCrates,
      cannedCases,
      rawFish: syncedRun.facilities.dockStorageRawFish + coldStorageRawFish,
    },
  });
}
