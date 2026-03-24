import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { MeterCard } from "@/components/ui/MeterCard";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectSkiffPanelState } from "@/lib/simulation/selectors";

type SkiffPanelProps = {
  run: RunState;
};

export function SkiffPanel({ run }: SkiffPanelProps) {
  const startSkiffTrip = useGameStore((state) => state.startSkiffTrip);
  const refuelSkiff = useGameStore((state) => state.refuelSkiff);
  const skiff = selectSkiffPanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="skiff-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Skiff operator
        </p>
        <h2 className="font-heading text-2xl text-text">{skiff.title}</h2>
        <p className="text-sm text-text-muted">{skiff.intro}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div data-testid="skiff-fuel">
          <MeterCard
            detail={skiff.fuelDetail}
            label="Fuel reserve"
            progress={skiff.fuelProgress}
            progressTestId="skiff-fuel-meter"
            value={skiff.fuelValue}
          />
        </div>
        <div data-testid="skiff-hold">
          <MeterCard
            detail={skiff.holdDetail}
            label="Hold space"
            progress={skiff.holdProgress}
            progressTestId="skiff-hold-meter"
            value={skiff.holdValue}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-surface-raised px-4 py-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Route
          </p>
          <h3 className="font-heading text-xl text-text">{skiff.routeLabel}</h3>
          <p className="text-sm text-text-muted">{skiff.status}</p>
          <p className="text-xs text-text-muted">{skiff.routeDetail}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={skiff.tripButtonDisabled}
            onClick={() => startSkiffTrip("rustySkiff", "kelpBed")}
            variant="secondary"
          >
            {skiff.tripButtonLabel}
          </Button>
          <Button
            disabled={skiff.refuelButtonDisabled}
            onClick={() => refuelSkiff("rustySkiff")}
            variant="ghost"
          >
            Top up fuel
          </Button>
        </div>
      </div>
    </Card>
  );
}
