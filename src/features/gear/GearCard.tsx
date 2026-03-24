import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameStore } from "@/lib/simulation/gameStore";
import type { GearCardState } from "@/lib/simulation/selectors";

type GearCardProps = {
  item: GearCardState;
};

export function GearCard({ item }: GearCardProps) {
  const collectPassiveGear = useGameStore((state) => state.collectPassiveGear);

  return (
    <Card className="space-y-3">
      <div className="space-y-1">
        <h3 className="font-heading text-2xl text-text">{item.label}</h3>
        <p className="text-sm text-text-muted">{item.detail}</p>
      </div>
      <div className="rounded-2xl bg-surface-raised px-4 py-3">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Buffered catch
        </p>
        <p className="mt-2 font-heading text-xl text-text">
          {item.bufferedCatchText}
        </p>
        <p className="mt-1 text-sm text-text-muted">{item.statusText}</p>
      </div>
      <Button
        disabled={item.actionDisabled}
        onClick={() => collectPassiveGear(item.id)}
        variant="secondary"
      >
        {item.actionLabel}
      </Button>
    </Card>
  );
}
