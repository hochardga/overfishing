import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EarlyHud } from "@/components/game/EarlyHud";
import { GameShell } from "@/components/game/GameShell";
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
      {shouldRenderEarlyHud ? (
        <EarlyHud
          run={run}
          visibleCards={visibility.earlyHudCards}
        />
      ) : null}
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
  it("renders only the center column when the shell is in compact mode", () => {
    render(
      <GameShell
        centerColumn={<section>Center column</section>}
        layoutMode="compact"
        leftColumn={<section>Left column</section>}
        rightColumn={<section>Right column</section>}
        statusItems={[
          {
            label: "Cash",
            value: "$0",
          },
        ]}
      />,
    );

    expect(screen.getByText("Center column")).toBeInTheDocument();
    expect(screen.getByLabelText("active panel column")).toBeInTheDocument();
    expect(screen.queryByText("Left column")).not.toBeInTheDocument();
    expect(screen.queryByText("Right column")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("primary column")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("operations column")).not.toBeInTheDocument();
  });

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

  it("switches the selector contract to the full shell after the first upgrade or skiff operator", () => {
    const meta = createDefaultMetaProgress();
    const starterRun = createStarterRun(meta);
    const { run: upgradedRun, meta: upgradedMeta } = syncDiscoveryState(
      {
        ...starterRun,
        cash: 15,
        unlocks: {
          ...starterRun.unlocks,
          upgrades: ["betterBait"],
        },
      },
      meta,
    );

    const fullFromUpgrade = selectPlayShellVisibility(upgradedRun, upgradedMeta);
    const fullFromSkiffOperator = selectPlayShellVisibility(
      {
        ...starterRun,
        phase: "skiffOperator",
        unlocks: {
          ...starterRun.unlocks,
          phasesSeen: ["quietPier", "skiffOperator"],
        },
      },
      meta,
    );

    expect(fullFromUpgrade.shellMode).toBe("full");
    expect(fullFromUpgrade.showStatusRail).toBe(true);
    expect(fullFromUpgrade.showUpgradeShop).toBe(true);
    expect(fullFromSkiffOperator.shellMode).toBe("full");
    expect(fullFromSkiffOperator.showLeftColumnCards).toBe(true);
    expect(fullFromSkiffOperator.showReadingTheRailCard).toBe(true);
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

  it("shows all early-hud cards when no visibility override is provided", () => {
    const meta = createDefaultMetaProgress();
    const run = createStarterRun(meta);

    render(<EarlyHud run={run} />);

    expect(screen.getByTestId("early-hud")).toBeInTheDocument();
    expect(screen.getByTestId("early-cash")).toBeInTheDocument();
    expect(screen.getByTestId("early-nearby-fish")).toBeInTheDocument();
    expect(screen.getByTestId("early-cast-cooldown")).toBeInTheDocument();
    expect(screen.getByTestId("early-stock-pressure")).toBeInTheDocument();
  });
});
