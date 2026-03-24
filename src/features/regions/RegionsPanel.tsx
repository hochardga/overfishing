import type { RunState } from "@/lib/storage/saveSchema";

import { RegionCard } from "@/components/game/RegionCard";
import { Card } from "@/components/ui/Card";
import { selectRegionsPanelState } from "@/lib/simulation/selectors";

type RegionsPanelProps = {
  run: RunState;
};

export function RegionsPanel({ run }: RegionsPanelProps) {
  const regions = selectRegionsPanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="regions-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Regions
        </p>
        <h2 className="font-heading text-2xl text-text">{regions.title}</h2>
        <p className="text-sm text-text-muted">{regions.intro}</p>
      </div>

      {regions.kind === "ready" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface-raised px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                Trust
              </p>
              <p className="mt-2 font-heading text-xl text-text">
                {regions.trustValue}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-raised px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                Ocean health
              </p>
              <p className="mt-2 font-heading text-xl text-text">
                {regions.oceanHealthValue}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {regions.items?.map((item) => (
              <RegionCard
                item={item}
                key={item.id}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-sm text-text-muted">{regions.detail}</p>
        </div>
      )}
    </Card>
  );
}
