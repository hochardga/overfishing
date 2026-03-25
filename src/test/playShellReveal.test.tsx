import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import PlayPage from "@/app/routes/PlayPage";
import { EarlyHud } from "@/components/game/EarlyHud";
import { GameShell } from "@/components/game/GameShell";
import { gameStore } from "@/lib/simulation/gameStore";
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

const baseGameStoreState = gameStore.getState();

function createVisibilityScenario(
  buildRun: (starterRun: RunState) => RunState,
): {
  meta: MetaProgressState;
  run: RunState;
} {
  const meta = createDefaultMetaProgress();

  return syncDiscoveryState(buildRun(createStarterRun(meta)), meta);
}

function renderPlayPage(run: RunState, meta: MetaProgressState) {
  act(() => {
    gameStore.setState({
      run,
      meta,
      hydrated: true,
      recoveryMessage: null,
      startSimulationLoop: () => {},
      stopSimulationLoop: () => {},
    });
  });

  return render(
    <MemoryRouter>
      <PlayPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  act(() => {
    gameStore.setState({
      run: baseGameStoreState.run,
      meta: baseGameStoreState.meta,
      hydrated: baseGameStoreState.hydrated,
      recoveryMessage: baseGameStoreState.recoveryMessage,
      startSimulationLoop: baseGameStoreState.startSimulationLoop,
      stopSimulationLoop: baseGameStoreState.stopSimulationLoop,
    });
  });
});

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

  it("hides compact cast-button stock and cooldown detail until those discovery steps are visible", () => {
    const firstCastState = createVisibilityScenario((starterRun) => ({
      ...starterRun,
      lifetimeFishLanded: 1,
    }));

    renderPlayPage(firstCastState.run, firstCastState.meta);

    const castButton = within(screen.getByTestId("play-shell-cast-button"));

    expect(
      castButton.getByText(/cast now|perfect window/i),
    ).toBeInTheDocument();
    expect(
      castButton.queryByText(/fish nearby/i),
    ).not.toBeInTheDocument();
    expect(
      castButton.queryByText(/wait for the sweet spot|sweet spot is live/i),
    ).not.toBeInTheDocument();
    expect(
      castButton.queryByTestId("cast-button-cycle-bar"),
    ).not.toBeInTheDocument();
  });

  it("shows compact shop cues in the center column and limits the compact shop to quiet-pier upgrades", () => {
    const compactShopState = createVisibilityScenario((starterRun) => ({
      ...starterRun,
      cash: 100,
      lifetimeFishLanded: 8,
      lifetimeRevenue: 32,
    }));

    expect(
      selectPlayShellVisibility(compactShopState.run, compactShopState.meta),
    ).toMatchObject({
      shellMode: "compact",
      showShopRevealCue: true,
      showReadingTheRailCard: true,
    });

    renderPlayPage(compactShopState.run, compactShopState.meta);

    expect(screen.getByTestId("play-shell-compact-reading-the-rail")).toBeInTheDocument();
    expect(screen.getByTestId("shop-reveal-cue")).toBeInTheDocument();
    expect(screen.getByTestId("play-shell-compact-upgrade-shop")).toBeInTheDocument();
    expect(
      Array.from(
        screen.getByTestId("play-shell-compact-stack").children,
        (child) => child.getAttribute("data-testid"),
      ),
    ).toEqual([
      "play-shell-compact-early-hud",
      "play-shell-compact-reading-the-rail",
      "play-shell-cast-button",
      "shop-reveal-cue",
      "play-shell-compact-upgrade-shop",
    ]);

    const shop = within(screen.getByTestId("upgrade-shop"));
    expect(
      shop.getByRole("button", { name: /buy better bait/i }),
    ).toBeInTheDocument();
    expect(
      shop.getByRole("button", { name: /buy salted lunch/i }),
    ).toBeInTheDocument();
    expect(
      shop.queryByText(/locked until skiff operator/i),
    ).not.toBeInTheDocument();
    expect(shop.queryByText(/next phase/i)).not.toBeInTheDocument();
  });

  it("keeps the compact reading-the-rail explainer hidden until the visibility model enables it", () => {
    const preShopState = createVisibilityScenario((starterRun) => ({
      ...starterRun,
      lifetimeFishLanded: 3,
      lifetimeRevenue: 12,
    }));

    expect(
      selectPlayShellVisibility(preShopState.run, preShopState.meta),
    ).toMatchObject({
      shellMode: "compact",
      showShopRevealCue: false,
      showReadingTheRailCard: false,
    });

    renderPlayPage(preShopState.run, preShopState.meta);

    expect(screen.queryByTestId("shop-reveal-cue")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("play-shell-compact-reading-the-rail"),
    ).not.toBeInTheDocument();
  });
});
