import type { RunState } from "@/lib/storage/saveSchema";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectProcessingPanelState } from "@/lib/simulation/selectors";

type ProcessingPanelProps = {
  run: RunState;
};

export function ProcessingPanel({ run }: ProcessingPanelProps) {
  const setProcessingQueue = useGameStore((state) => state.setProcessingQueue);
  const processing = selectProcessingPanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="processing-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Processing
        </p>
        <h2 className="font-heading text-2xl text-text">{processing.title}</h2>
        <p className="text-sm text-text-muted">{processing.intro}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Dock backlog
          </p>
          <p className="mt-2 font-heading text-xl text-text">
            {processing.dockBacklogValue}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {processing.dockBacklogDetail}
          </p>
        </div>
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Cold storage
          </p>
          <p className="mt-2 font-heading text-xl text-text">
            {processing.coldStorageValue}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {processing.coldStorageDetail}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {processing.queues.map((queue) => (
          <div
            className="rounded-2xl bg-surface-raised px-4 py-4"
            key={queue.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-heading text-xl text-text">{queue.label}</h3>
                <p className="text-sm text-text-muted">{queue.statusText}</p>
              </div>
              <Button
                onClick={() =>
                  setProcessingQueue(queue.id, !queue.active, queue.product)
                }
                variant="secondary"
              >
                {queue.active ? `Pause ${queue.label}` : `Run ${queue.label}`}
              </Button>
            </div>
            <p className="mt-3 text-xs text-text-muted">{queue.progressText}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
