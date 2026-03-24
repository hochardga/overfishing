import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ContractCardState } from "@/lib/simulation/selectors";
import { useGameStore } from "@/lib/simulation/gameStore";

type ContractCardProps = {
  card: ContractCardState;
};

export function ContractCard({ card }: ContractCardProps) {
  const acceptContract = useGameStore((state) => state.acceptContract);
  const deliverContract = useGameStore((state) => state.deliverContract);
  const claimContractReward = useGameStore((state) => state.claimContractReward);

  return (
    <Card className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl text-text">{card.label}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            {card.statusText}
          </p>
        </div>
        <p className="text-sm text-text-muted">{card.productText}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <p className="text-xs text-text-muted">{card.progressText}</p>
        <p className="text-xs text-text-muted">{card.timerText}</p>
        <p className="text-xs text-text-muted">{card.rewardText}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {card.canAccept ? (
          <Button
            onClick={() => acceptContract(card.id)}
            variant="secondary"
          >
            {`Accept ${card.label}`}
          </Button>
        ) : null}
        {card.canDeliver ? (
          <Button
            onClick={() => deliverContract(card.id)}
            variant="ghost"
          >
            {`Deliver ${card.label}`}
          </Button>
        ) : null}
        {card.canClaim ? (
          <Button onClick={() => claimContractReward(card.id)}>
            {`Claim ${card.label}`}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
