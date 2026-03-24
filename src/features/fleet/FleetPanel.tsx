import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { BoatCard } from "@/features/fleet/BoatCard";
import { selectFleetPanelState } from "@/lib/simulation/selectors";

type FleetPanelProps = {
  run: RunState;
};

export function FleetPanel({ run }: FleetPanelProps) {
  const fleet = selectFleetPanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="fleet-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Fleet ops
        </p>
        <h2 className="font-heading text-2xl text-text">{fleet.title}</h2>
        <p className="text-sm text-text-muted">{fleet.intro}</p>
        <p className="text-xs text-text-muted">{fleet.deckhandStatus}</p>
      </div>

      <div className="grid gap-3">
        {fleet.boats.map((boat) => (
          <BoatCard
            item={boat}
            key={boat.id}
          />
        ))}
      </div>
    </Card>
  );
}
