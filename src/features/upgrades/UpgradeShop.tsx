import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectUpgradeShopState } from "@/lib/simulation/selectors";

type UpgradeShopProps = {
  mode?: "compact" | "full";
  run: RunState;
};

export function UpgradeShop({
  mode = "full",
  run,
}: UpgradeShopProps) {
  const purchaseUpgrade = useGameStore((state) => state.purchaseUpgrade);
  const shop = selectUpgradeShopState(run);
  const items =
    mode === "compact"
      ? shop.items.filter((item) => item.available)
      : shop.items;

  return (
    <Card
      className="space-y-4"
      data-testid="upgrade-shop"
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Dockside shop
        </p>
        <h2 className="font-heading text-2xl text-text">{shop.title}</h2>
        <p className="text-sm text-text-muted">{shop.intro}</p>
      </div>

      {mode === "full" ? (
        <div className="rounded-2xl bg-surface-raised px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            {shop.phasePanelLabel}
          </p>
          <h3 className="mt-2 font-heading text-xl text-text">
            {shop.nextPhaseLabel}
          </h3>
          <p className="mt-2 text-sm text-text-muted">
            {shop.phaseRequirementText}
          </p>
          <p className="mt-1 text-xs text-text-muted">{shop.phaseProgressText}</p>
          <div className="mt-3 h-2 rounded-full bg-surface/60">
            <div
              className="h-2 rounded-full bg-primary transition-[width] duration-300 ease-settled"
              style={{
                width: `${shop.phaseProgress * 100}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-secondary">
            {shop.phaseStatusText}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-surface-raised px-4 py-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-heading text-xl text-text">{item.label}</h3>
                <p className="text-sm text-text-muted">{item.description}</p>
                {mode === "full" && !item.available ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-text-muted">
                    Locked until {item.phaseLabel}
                  </p>
                ) : null}
              </div>
              <p className="rounded-full bg-surface px-3 py-1 text-xs uppercase tracking-[0.16em] text-secondary">
                ${item.cost}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-accent">
                {item.owned
                  ? "Owned"
                  : !item.available
                    ? "Locked"
                    : item.affordable
                      ? "Ready"
                      : "Need cash"}
              </p>
              <Button
                disabled={item.owned || !item.affordable || !item.available}
                onClick={() => purchaseUpgrade(item.id)}
                variant={item.owned ? "ghost" : "secondary"}
              >
                {item.owned
                  ? "Owned"
                  : !item.available
                    ? "Locked"
                    : `Buy ${item.label}`}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
