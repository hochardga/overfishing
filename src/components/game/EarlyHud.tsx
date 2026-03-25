import type { RunState } from "@/lib/storage/saveSchema";

import { Card } from "@/components/ui/Card";
import { MeterCard } from "@/components/ui/MeterCard";
import {
  selectEarlyHudState,
  type PlayShellVisibilityModel,
} from "@/lib/simulation/selectors";

type EarlyHudProps = {
  density?: "compact" | "full";
  run: RunState;
  visibleCards?: PlayShellVisibilityModel["earlyHudCards"];
};

const defaultVisibleCards: PlayShellVisibilityModel["earlyHudCards"] = {
  cash: true,
  nearbyFish: true,
  cooldown: true,
  stockPressure: true,
};

export function EarlyHud({
  density = "full",
  run,
  visibleCards = defaultVisibleCards,
}: EarlyHudProps) {
  const hud = selectEarlyHudState(run);
  const visibleCardCount = Object.values(visibleCards).filter(Boolean).length;
  const effectiveDensity =
    density === "compact" || visibleCardCount < 4 ? "compact" : "full";
  const gridClassName =
    visibleCardCount <= 1
      ? "grid-cols-1"
      : visibleCardCount === 2
        ? "grid-cols-1 md:grid-cols-2"
        : visibleCardCount === 3
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

  return (
    <Card
      className={effectiveDensity === "compact" ? "space-y-3.5" : "space-y-4"}
      data-visible-card-count={visibleCardCount}
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
      <div className={`grid gap-3 ${gridClassName}`}>
        {visibleCards.cash ? (
          <MeterCard
            data-testid="early-cash"
            detail={hud.cash.detail}
            density={effectiveDensity}
            label={hud.cash.label}
            value={hud.cash.value}
          />
        ) : null}
        {visibleCards.nearbyFish ? (
          <MeterCard
            data-testid="early-nearby-fish"
            detail={hud.nearbyFish.detail}
            density={effectiveDensity}
            label={hud.nearbyFish.label}
            progress={hud.nearbyFish.progress}
            progressTestId="early-nearby-fish-meter"
            value={hud.nearbyFish.value}
          />
        ) : null}
        {visibleCards.cooldown ? (
          <MeterCard
            data-testid="early-cast-cooldown"
            detail={hud.cooldown.detail}
            density={effectiveDensity}
            label={hud.cooldown.label}
            progress={hud.cooldown.progress}
            progressTestId="early-cast-cooldown-meter"
            value={hud.cooldown.value}
          />
        ) : null}
        {visibleCards.stockPressure ? (
          <MeterCard
            data-testid="early-stock-pressure"
            detail={hud.stockPressure.detail}
            density={effectiveDensity}
            label={hud.stockPressure.label}
            progress={hud.stockPressure.progress}
            progressTestId="early-stock-pressure-meter"
            value={hud.stockPressure.value}
          />
        ) : null}
      </div>
    </Card>
  );
}
