import type { RunState } from "@/lib/storage/saveSchema";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectMaintenancePanelState } from "@/lib/simulation/selectors";

type MaintenancePanelProps = {
  run: RunState;
};

export function MaintenancePanel({ run }: MaintenancePanelProps) {
  const repairBoat = useGameStore((state) => state.repairBoat);
  const maintenance = selectMaintenancePanelState(run);

  return (
    <Card
      className="space-y-4"
      data-testid="maintenance-panel"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Maintenance
        </p>
        <h2 className="font-heading text-2xl text-text">{maintenance.title}</h2>
        <p className="text-sm text-text-muted">{maintenance.intro}</p>
      </div>

      <div className="grid gap-3">
        {maintenance.items.map((item) => (
          <div
            className="rounded-2xl bg-surface-raised px-4 py-4"
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-heading text-xl text-text">{item.label}</h3>
                <p className="text-sm text-text-muted">{item.statusText}</p>
              </div>
              <Button
                disabled={item.repairDisabled}
                onClick={() => repairBoat(item.id)}
                variant="secondary"
              >
                Repair
              </Button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                  Hull health
                </p>
                <p className="mt-2 font-heading text-xl text-text">
                  {item.maintenanceValue}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {item.maintenanceDetail}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-secondary">
                  Crew wages
                </p>
                <p className="mt-2 font-heading text-xl text-text">{item.wageValue}</p>
                <p className="mt-1 text-xs text-text-muted">
                  Active crew spend lands continuously.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
