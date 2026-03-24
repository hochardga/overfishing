import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FleetBoatCardState } from "@/lib/simulation/selectors";
import { useGameStore } from "@/lib/simulation/gameStore";

type BoatCardProps = {
  item: FleetBoatCardState;
};

export function BoatCard({ item }: BoatCardProps) {
  const assignBoatRoute = useGameStore((state) => state.assignBoatRoute);
  const refuelBoat = useGameStore((state) => state.refuelBoat);

  return (
    <Card
      className="space-y-4"
      data-testid={`boat-card-${item.id}`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-heading text-xl text-text">{item.label}</h3>
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            {item.crewText}
          </p>
        </div>
        <p className="text-sm text-text-muted">{item.statusText}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Route
          </p>
          <p className="mt-2 font-heading text-xl text-text">{item.routeValue}</p>
          <p className="mt-1 text-xs text-text-muted">{item.holdDetail}</p>
        </div>
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Maintenance
          </p>
          <p className="mt-2 font-heading text-xl text-text">{item.maintenanceValue}</p>
          <p className="mt-1 text-xs text-text-muted">{item.maintenanceDetail}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Fuel
          </p>
          <p className="mt-2 font-heading text-xl text-text">{item.fuelValue}</p>
          <p className="mt-1 text-xs text-text-muted">{item.fuelDetail}</p>
        </div>
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            Hold
          </p>
          <p className="mt-2 font-heading text-xl text-text">{item.holdValue}</p>
          <p className="mt-1 text-xs text-text-muted">{item.holdDetail}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={item.kelpDisabled}
          onClick={() => assignBoatRoute(item.id, "kelpBed", true, true)}
          variant="secondary"
        >
          Dispatch Kelp Bed
        </Button>
        <Button
          disabled={item.offshoreDisabled}
          onClick={() => assignBoatRoute(item.id, "offshoreShelf", true, true)}
          variant="ghost"
        >
          Dispatch Offshore Shelf
        </Button>
        <Button
          disabled={item.refuelDisabled}
          onClick={() => refuelBoat(item.id)}
          variant="ghost"
        >
          Top up fuel
        </Button>
      </div>
    </Card>
  );
}
