import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { MeterCard } from "@/components/ui/MeterCard";
import { selectEarlyHudState } from "@/lib/simulation/selectors";

type EarlyHudProps = {
  run: RunState;
};

export function EarlyHud({ run }: EarlyHudProps) {
  const hud = selectEarlyHudState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="early-hud"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-accent">
            Early dock rail
          </p>
          <h2 className="font-heading text-2xl text-text">
            Resource readout
          </h2>
        </div>
        <p className="rounded-full bg-surface-raised px-3 py-1 text-xs uppercase tracking-[0.16em] text-secondary">
          Warm shell
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MeterCard
          data-testid="early-cash"
          detail={hud.cash.detail}
          label={hud.cash.label}
          value={hud.cash.value}
        />
        <MeterCard
          data-testid="early-nearby-fish"
          detail={hud.nearbyFish.detail}
          label={hud.nearbyFish.label}
          progress={hud.nearbyFish.progress}
          progressTestId="early-nearby-fish-meter"
          value={hud.nearbyFish.value}
        />
        <MeterCard
          data-testid="early-cast-cooldown"
          detail={hud.cooldown.detail}
          label={hud.cooldown.label}
          progress={hud.cooldown.progress}
          progressTestId="early-cast-cooldown-meter"
          value={hud.cooldown.value}
        />
        <MeterCard
          data-testid="early-stock-pressure"
          detail={hud.stockPressure.detail}
          label={hud.stockPressure.label}
          progress={hud.stockPressure.progress}
          progressTestId="early-stock-pressure-meter"
          value={hud.stockPressure.value}
        />
      </div>
    </Card>
  );
}
