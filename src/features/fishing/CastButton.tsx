import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectManualCastReadout } from "@/lib/simulation/selectors";
import { performCast } from "@/features/fishing/fishingActions";

function formatCash(cash: number) {
  return `$${cash.toFixed(0)}`;
}

type CastButtonProps = {
  mode?: "compact" | "full";
  showCooldownDetails?: boolean;
  showNearbyFish?: boolean;
};

export function CastButton({
  mode = "full",
  showCooldownDetails = true,
  showNearbyFish = true,
}: CastButtonProps) {
  const run = useGameStore((state) => state.run);
  const cash = run.cash;
  const stockCurrent = useGameStore(
    (state) => state.run.regions.pierCove.stockCurrent,
  );
  const stockCap = useGameStore((state) => state.run.regions.pierCove.stockCap);
  const [feedback, setFeedback] = useState("Ready to cast.");
  const readout = selectManualCastReadout(run);

  const handleCast = () => {
    const result = performCast();

    setFeedback(result.feedback);
  };

  const stockLabel = `${stockCurrent.toFixed(0)} / ${stockCap.toFixed(0)} fish nearby`;
  const shouldShowStockLabel = mode === "full" || showNearbyFish;
  const shouldShowCooldownDetails = mode === "full" || showCooldownDetails;

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.16em] text-accent">
          Quiet Pier
        </p>
        <h2 className="font-heading text-2xl">Cast line</h2>
        <p className="text-sm text-text-muted">
          Cash lands immediately for now. Choose a steady cast or aim for a
          perfect pull.
        </p>
      </div>
      <div className="space-y-2 rounded-2xl bg-surface-raised/50 px-4 py-3">
        <p className="font-heading text-xl text-text">{readout.status}</p>
        {shouldShowStockLabel ? (
          <p className="text-sm text-text-muted">{stockLabel}</p>
        ) : null}
        {shouldShowCooldownDetails ? (
          <p className="text-xs uppercase tracking-[0.16em] text-secondary">
            {readout.detail}
          </p>
        ) : null}
        {shouldShowCooldownDetails ? (
          <div
            className="h-2 rounded-full bg-surface"
            data-testid="cast-button-cycle-bar"
          >
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.max(8, readout.cycleProgress * 100)}%` }}
            />
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCast}>Cast line</Button>
      </div>
      <p className="rounded-2xl bg-surface-raised px-4 py-3 text-sm text-text-muted">
        {feedback === "Ready to cast."
          ? `Start with a steady pull. Pier cash is ${formatCash(cash)}.`
          : feedback}
      </p>
    </Card>
  );
}
