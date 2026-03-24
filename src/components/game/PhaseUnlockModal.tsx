import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameStore } from "@/lib/simulation/gameStore";
import type { PhaseUnlockModalState } from "@/lib/simulation/selectors";

type PhaseUnlockModalProps = {
  modal: PhaseUnlockModalState;
};

export function PhaseUnlockModal({ modal }: PhaseUnlockModalProps) {
  const dismissPhaseUnlockModal = useGameStore(
    (state) => state.dismissPhaseUnlockModal,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-industrial/60 px-6 py-8"
      data-testid="phase-unlock-modal"
    >
      <Card className="w-full max-w-2xl space-y-4 border border-accent/20 bg-surface">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">
            New phase
          </p>
          <h2 className="font-heading text-3xl text-text">{modal.title}</h2>
          <p className="text-sm text-text-muted">{modal.body}</p>
        </div>
        <p className="rounded-2xl bg-surface-raised px-4 py-4 text-sm text-text-muted">
          {modal.detail}
        </p>
        <div className="flex justify-end">
          <Button
            onClick={() => dismissPhaseUnlockModal(modal.phaseId)}
            variant="secondary"
          >
            {modal.actionLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
