import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { MeterCard } from "@/components/ui/MeterCard";
import { GearCard } from "@/features/gear/GearCard";
import { selectGearPanelState } from "@/lib/simulation/selectors";

type GearPanelProps = {
  run: RunState;
};

export function GearPanel({ run }: GearPanelProps) {
  const gear = selectGearPanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="gear-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Dockside gear
        </p>
        <h2 className="font-heading text-2xl text-text">{gear.title}</h2>
        <p className="text-sm text-text-muted">{gear.intro}</p>
      </div>

      <div
        className="grid gap-3 md:grid-cols-3"
      >
        <div data-testid="gear-storage">
          <MeterCard
            detail={gear.storageDetail}
            label="Stored fish"
            progress={gear.storageProgress}
            progressTestId="gear-storage-meter"
            value={gear.storageValue}
          />
        </div>
        <div data-testid="gear-decay">
          <MeterCard
            detail={gear.decayDetail}
            label="Value held"
            progress={gear.decayProgress}
            progressTestId="gear-decay-meter"
            value={gear.decayValue}
          />
        </div>
        <div data-testid="gear-slots">
          <MeterCard
            detail={gear.slotDetail}
            label="Gear slots"
            progress={gear.slotProgress}
            progressTestId="gear-slot-meter"
            value={gear.slotValue}
          />
        </div>
      </div>

      {gear.items.length > 0 ? (
        <div className="grid gap-3">
          {gear.items.map((item) => (
            <GearCard
              item={item}
              key={item.id}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-raised px-4 py-3 text-sm text-text-muted">
          No passive gear is deployed yet. The dock is ready when you are.
        </p>
      )}
    </Card>
  );
}
