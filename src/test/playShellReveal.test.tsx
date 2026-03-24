import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EarlyHud } from "@/components/game/EarlyHud";
import { syncDiscoveryState } from "@/lib/simulation/reducers/discovery";
import { selectPlayShellVisibility } from "@/lib/simulation/selectors";
import {
  createDefaultMetaProgress,
  createStarterRun,
  type MetaProgressState,
  type RunState,
} from "@/lib/storage/saveSchema";

function PlayShellVisibilityHarness({
  meta,
  run,
}: {
  meta: MetaProgressState;
  run: RunState;
}) {
  const visibility = selectPlayShellVisibility(run, meta);
  const shouldRenderEarlyHud = Object.values(visibility.earlyHudCards).some(
    Boolean,
  );

  return (
    <div>
      {visibility.showOnboardingCard ? (
        <section data-testid="play-shell-onboarding">
          First cast guidance
        </section>
      ) : null}
      {visibility.showStatusRail ? (
        <aside data-testid="status-rail">Status rail</aside>
      ) : null}
      {visibility.showProgressSummary ? (
        <section data-testid="progress-summary">Progress summary</section>
      ) : null}
      {visibility.showLeftColumnCards ? (
        <section>Harbor operations</section>
      ) : null}
      <button type="button">Cast line</button>
      {shouldRenderEarlyHud ? <EarlyHud run={run} /> : null}
      {visibility.showRightColumnNotes ? <section>Dock notes</section> : null}
      {visibility.showShopRevealCue ? (
        <section data-testid="shop-reveal-cue">Shop reveal cue</section>
      ) : null}
      {visibility.showUpgradeShop ? (
        <section>Quiet Pier Upgrades</section>
      ) : null}
      {visibility.showReadingTheRailCard ? (
        <section>Reading the rail</section>
      ) : null}
    </div>
  );
}

describe("play shell compact reveal", () => {
  it("renders only onboarding plus the cast surface for a fresh run", () => {
    const meta = createDefaultMetaProgress();
    const run = createStarterRun(meta);

    render(
      <PlayShellVisibilityHarness
        meta={meta}
        run={run}
      />,
    );

    expect(screen.getByTestId("play-shell-onboarding")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cast line/i }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("status-rail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("progress-summary")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /quiet pier upgrades/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/harbor operations/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/dock notes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reading the rail/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("shop-reveal-cue")).not.toBeInTheDocument();
    expect(screen.queryByTestId("early-hud")).not.toBeInTheDocument();
  });

  it("renders only the discovered early-hud cards after the first successful cast", () => {
    const meta = createDefaultMetaProgress();
    const { meta: syncedMeta, run } = syncDiscoveryState(
      {
        ...createStarterRun(meta),
        lifetimeFishLanded: 1,
      },
      meta,
    );

    render(
      <PlayShellVisibilityHarness
        meta={syncedMeta}
        run={run}
      />,
    );

    expect(screen.queryByTestId("play-shell-onboarding")).not.toBeInTheDocument();
    expect(screen.getByTestId("early-hud")).toBeInTheDocument();
    expect(screen.getByTestId("early-cash")).toBeInTheDocument();
    expect(screen.queryByTestId("early-nearby-fish")).not.toBeInTheDocument();
    expect(screen.queryByTestId("early-cast-cooldown")).not.toBeInTheDocument();
    expect(screen.queryByTestId("early-stock-pressure")).not.toBeInTheDocument();
  });
});
