import { useEffect } from "react";

import { Link } from "react-router-dom";

import { GameShell } from "@/components/game/GameShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useGameStore } from "@/lib/simulation/gameStore";
import { selectStatusRailItems } from "@/lib/simulation/selectors";

export default function PlayPage() {
  const initialize = useGameStore((state) => state.initialize);
  const run = useGameStore((state) => state.run);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GameShell
      centerColumn={
        <>
          <Card className="space-y-3">
            <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
              Play route
            </div>
            <h1 className="font-heading text-4xl text-text">
              Harbor operations
            </h1>
            <p className="text-lg text-text-muted">
              The play route now uses the shared shell that later systems will
              inhabit, while staying deliberately light until the store and save
              layers are wired in.
            </p>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Active panel</h2>
            <p className="text-sm text-text-muted">
              Manual casting, upgrade purchasing, and first-stock pressure will
              take over this space in the next phase.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Awaiting simulation state</Button>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-surface-raised px-5 py-3 text-sm font-semibold text-text shadow-soft"
                to="/"
              >
                Back to landing
              </Link>
            </div>
          </Card>
        </>
      }
      leftColumn={
        <>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Primary action</h2>
            <p className="text-sm text-text-muted">
              The left column is reserved for the player’s immediate loop and
              early explanation copy.
            </p>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">Run overview</h2>
            <p className="font-mono text-sm text-text-muted">
              {selectStatusRailItems(run)[0]?.value} is active. Starter
              resources and first actions now read from the deterministic run
              state.
            </p>
          </Card>
        </>
      }
      rightColumn={
        <>
          <Card
            className="space-y-3"
            tone="industrial"
          >
            <h2 className="font-heading text-2xl">Operations rail</h2>
            <p className="text-sm text-surface-raised/75">
              Future tabs for harbor, fleet, processing, and regions will stack
              here as the player’s role hardens.
            </p>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-heading text-2xl">System notes</h2>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>Status rail is live.</li>
              <li>Three-column desktop shell is in place.</li>
              <li>Responsive collapse is handled by the grid.</li>
            </ul>
          </Card>
        </>
      }
      statusItems={selectStatusRailItems(run)}
    />
  );
}
