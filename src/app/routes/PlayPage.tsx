import { useEffect } from "react";

import { Link } from "react-router-dom";

import { EarlyHud } from "@/components/game/EarlyHud";
import { GameShell } from "@/components/game/GameShell";
import { Card } from "@/components/ui/Card";
import { CastButton } from "@/features/fishing/CastButton";
import { UpgradeShop } from "@/features/upgrades/UpgradeShop";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectStatusRailItems } from "@/lib/simulation/selectors";

export default function PlayPage() {
  const initialize = useGameStore((state) => state.initialize);
  const stopSimulationLoop = useGameStore((state) => state.stopSimulationLoop);
  const run = useGameStore((state) => state.run);

  useEffect(() => {
    initialize();
    return () => {
      stopSimulationLoop();
    };
  }, [initialize, stopSimulationLoop]);

  return (
    <GameShell
      leftColumn={
        <>
          <Card className="space-y-3">
            <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
              First cast
            </div>
            <h1 className="font-heading text-4xl text-text">
              Harbor operations
            </h1>
            <p className="text-lg text-text-muted">
              The early dock loop is live. Cast normally for a steady payout
              or aim for a perfect pull when you want the bigger reward.
            </p>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Why it matters</h2>
            <p className="text-sm text-text-muted">
              The game should teach money, stock, and timing without hiding the
              reward. The next systems build on that same loop.
            </p>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Quick exit</h2>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-surface-raised px-5 py-3 text-sm font-semibold text-text shadow-soft"
              to="/"
            >
              Back to landing
            </Link>
          </Card>
        </>
      }
      centerColumn={
        <>
          <EarlyHud run={run} />
          <CastButton />
        </>
      }
      rightColumn={
        <>
          <Card
            className="space-y-3"
            tone="industrial"
          >
            <h2 className="font-heading text-2xl">Dock notes</h2>
            <p className="text-sm text-surface-raised/75">
              Manual casts resolve directly into cash for now, so the reward
              lands immediately and the dock stays easy to read.
            </p>
          </Card>
          <UpgradeShop run={run} />
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Reading the rail</h2>
            <p className="text-sm text-text-muted">
              Cash lands immediately, nearby stock shows how many fish are left
              in Pier Cove, cooldown tells you when the line settles, and
              stock pressure explains why the pull gets slower or richer as the
              cove thins out.
            </p>
          </Card>
        </>
      }
      statusItems={selectStatusRailItems(run)}
    />
  );
}
