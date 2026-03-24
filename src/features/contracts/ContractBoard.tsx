import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { ContractCard } from "@/features/contracts/ContractCard";
import { selectContractBoardState } from "@/lib/simulation/selectors";

type ContractBoardProps = {
  run: RunState;
};

export function ContractBoard({ run }: ContractBoardProps) {
  const contracts = selectContractBoardState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="contract-board"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Contracts
        </p>
        <h2 className="font-heading text-2xl text-text">{contracts.title}</h2>
        <p className="text-sm text-text-muted">{contracts.intro}</p>
      </div>

      {contracts.kind === "ready" ? (
        <div className="grid gap-3">
          {contracts.cards?.map((card) => (
            <ContractCard
              card={card}
              key={card.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-sm text-text-muted">{contracts.detail}</p>
        </div>
      )}
    </Card>
  );
}
