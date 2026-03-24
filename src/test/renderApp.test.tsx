import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import App from "@/App";
import { createStarterRun } from "@/lib/storage/saveSchema";
import { createGameStore, gameStore } from "@/lib/simulation/gameStore";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";

function renderAtPath(pathname: string) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

function createSkiffOperatorRun() {
  const starterRun = createStarterRun();
  let run = {
    ...starterRun,
    phase: "skiffOperator" as const,
    cash: 1_000,
    lifetimeFishLanded: 60,
    lifetimeRevenue: 250,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      upgrades: [],
      phasesSeen: ["quietPier", "skiffOperator"],
    },
  };

  run = purchaseUpgrade(run, "harborMap").run;
  run = purchaseUpgrade(run, "rustySkiff").run;

  return run;
}

describe("App bootstrap", () => {
  beforeEach(() => {
    gameStore.getState().stopSimulationLoop();
    gameStore.getState().resetRun();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the product name in the initial shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /definitely not overfishing/i }),
    ).toBeInTheDocument();
  });

  it("renders a token-backed sample surface", () => {
    render(<App />);

    expect(screen.getByTestId("token-sample")).toHaveClass(
      "bg-surface",
      "text-text",
      "shadow-soft",
    );
  });

  it("renders a distinct landing page shell at /", () => {
    renderAtPath("/");

    expect(
      screen.getByRole("heading", { name: /coastal pressure, one cast at a time/i }),
    ).toBeInTheDocument();
  });

  it("renders a distinct play page shell at /play", () => {
    renderAtPath("/play");

    expect(
      screen.getByRole("heading", { name: /harbor operations/i }),
    ).toBeInTheDocument();
  });

  it("surfaces the Quiet Pier upgrade shop on the play route", () => {
    renderAtPath("/play");

    expect(
      screen.getByRole("heading", { name: /quiet pier upgrades/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /buy better bait/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /skiff operator unlocks at 60 lifetime fish landed and \$250 lifetime revenue/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/locked until skiff operator/i).length).toBeGreaterThan(0);
  });

  it("keeps next-phase progress anchored to the slower unlock requirement", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...state.run,
        lifetimeFishLanded: 60,
        lifetimeRevenue: 100,
      });
    });

    renderAtPath("/play");

    const shop = screen.getByTestId("upgrade-shop");
    const progressFill = shop.querySelector('div[style*="width"]');

    expect(progressFill).not.toBeNull();
    expect(progressFill).toHaveStyle({ width: "40%" });
    expect(screen.getByText(/the dock is still warming up/i)).toBeInTheDocument();
  });

  it("switches the next-phase panel to a terminal message once all configured unlocks are active", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...state.run,
        phase: "docksideGear",
        lifetimeFishLanded: 200,
        lifetimeRevenue: 900,
        unlocks: {
          ...state.run.unlocks,
          phasesSeen: ["quietPier", "skiffOperator", "docksideGear"],
          upgrades: ["rustySkiff"],
          tabs: ["harbor", "fleet", "settings"],
        },
      });
    });

    renderAtPath("/play");

    expect(
      screen.getByText(/all currently configured phase unlocks are active/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no further thresholds are waiting in this slice/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/dockside gear is ready to unlock/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/all configured phase unlocks are already active/i),
    ).toBeInTheDocument();
  });

  it("buys a Quiet Pier upgrade through the live shop", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...state.run,
        cash: 100,
      });
    });

    renderAtPath("/play");

    await user.click(screen.getByRole("button", { name: /buy better bait/i }));

    expect(gameStore.getState().run.unlocks.upgrades).toContain("betterBait");
    expect(gameStore.getState().run.cash).toBe(85);
    expect(screen.getByRole("button", { name: /owned/i })).toBeInTheDocument();
  });

  it("rehydrates purchased upgrades from saved data after a refresh", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...state.run,
        cash: 100,
      });
    });

    renderAtPath("/play");
    await user.click(screen.getByRole("button", { name: /buy better bait/i }));

    const freshStore = createGameStore();
    freshStore.getState().initialize();

    expect(freshStore.getState().run.unlocks.upgrades).toContain("betterBait");
    expect(freshStore.getState().run.cash).toBe(85);
  });

  it("renders the play shell status rail and three columns at /play", () => {
    renderAtPath("/play");

    expect(screen.getByTestId("status-rail")).toBeInTheDocument();
    expect(screen.getByLabelText("primary column")).toBeInTheDocument();
    expect(screen.getByLabelText("active panel column")).toBeInTheDocument();
    expect(screen.getByLabelText("operations column")).toBeInTheDocument();
  });

  it("renders a live cast control on the play route", () => {
    renderAtPath("/play");

    expect(
      screen.getByRole("button", { name: /cast line/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/perfect window/i)).toBeInTheDocument();
  });

  it("renders the early resource rail with selector-backed labels", () => {
    renderAtPath("/play");

    const hud = screen.getByTestId("early-hud");

    expect(within(hud).getByText(/cash in hand/i)).toBeInTheDocument();
    expect(within(hud).getByText(/fish nearby/i)).toBeInTheDocument();
    expect(within(hud).getByText(/cast cooldown/i)).toBeInTheDocument();
    expect(within(hud).getByText(/stock pressure/i)).toBeInTheDocument();
    expect(screen.getByTestId("early-nearby-fish")).toHaveTextContent(
      /120 \/ 120/i,
    );
    expect(screen.getByTestId("early-cast-cooldown")).toHaveTextContent(
      /ready to cast/i,
    );
    expect(screen.getByTestId("early-stock-pressure")).toHaveTextContent(
      /stable/i,
    );
  });

  it("updates stock pressure as the pier stock falls", () => {
    renderAtPath("/play");

    expect(screen.getByTestId("early-stock-pressure")).toHaveTextContent(
      /stable/i,
    );
    expect(screen.getByTestId("early-stock-pressure")).toHaveTextContent(
      /catch speed 100%, fish value 100%/i,
    );
    expect(screen.getByTestId("early-stock-pressure-meter")).toHaveStyle({
      width: "0%",
    });

    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...state.run,
        regions: {
          ...state.run.regions,
          pierCove: {
            ...state.run.regions.pierCove,
            stockCurrent: 30,
          },
        },
      });
    });

    expect(screen.getByTestId("early-stock-pressure")).toHaveTextContent(
      /strained/i,
    );
    expect(screen.getByTestId("early-stock-pressure")).toHaveTextContent(
      /catch speed 60%, fish value 125%/i,
    );
    expect(screen.getByTestId("early-stock-pressure-meter")).toHaveStyle({
      width: "75%",
    });
  });

  it("renders live skiff trip controls and pays out a Kelp Bed run on the play route", async () => {
    const user = userEvent.setup();

    act(() => {
      gameStore.getState().replaceRun(createSkiffOperatorRun());
    });

    renderAtPath("/play");

    const panel = screen.getByTestId("skiff-panel");

    expect(
      within(panel).getByRole("heading", { name: /rusty skiff/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("skiff-fuel")).toHaveTextContent(/20 \/ 20/i);
    expect(screen.getByTestId("skiff-hold")).toHaveTextContent(/0 \/ 15/i);

    await user.click(
      within(panel).getByRole("button", { name: /run kelp bed trip/i }),
    );

    expect(gameStore.getState().run.boats.rustySkiff.assignedRegionId).toBe(
      "kelpBed",
    );
    expect(screen.getByTestId("skiff-fuel")).toHaveTextContent(/14 \/ 20/i);
    expect(
      within(panel).getByRole("button", { name: /kelp bed trip underway/i }),
    ).toBeDisabled();

    act(() => {
      gameStore.getState().tick(20);
    });

    expect(gameStore.getState().run.cash).toBe(675);
    expect(screen.getByTestId("skiff-hold")).toHaveTextContent(/0 \/ 15/i);
    expect(
      within(panel).getByRole("button", { name: /run kelp bed trip/i }),
    ).toBeInTheDocument();
  });

  it("casts through timing windows on the live play route", () => {
    vi.useFakeTimers();

    renderAtPath("/play");
    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(
      screen.getByText(/perfect pull: \+2 fish, \+\$8\./i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("early-cash")).toHaveTextContent("$8");
    expect(screen.getByTestId("early-nearby-fish")).toHaveTextContent(
      /118 \/ 120/i,
    );

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(screen.getByText(/clean cast: \+1 fish, \+\$4\./i)).toBeInTheDocument();
    expect(screen.getByTestId("early-cash")).toHaveTextContent("$12");
    expect(screen.getByTestId("early-nearby-fish")).toHaveTextContent(
      /118 \/ 120/i,
    );
    expect(screen.getByTestId("early-cast-cooldown")).toHaveTextContent(
      /ready in 2\.2s/i,
    );
  });

  it("keeps manual progress when the play route remounts in the same session", () => {
    vi.useFakeTimers();

    const firstRender = renderAtPath("/play");
    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(screen.getByTestId("early-cash")).toHaveTextContent("$8");

    firstRender.unmount();
    renderAtPath("/play");

    expect(screen.getByTestId("early-cash")).toHaveTextContent("$8");
    expect(screen.getByTestId("early-nearby-fish")).toHaveTextContent(
      /118 \/ 120/i,
    );
  });

  it("persists live play progress before the page unloads", () => {
    vi.useFakeTimers();

    renderAtPath("/play");
    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    window.dispatchEvent(new Event("beforeunload"));

    const storedSave = JSON.parse(localStorage.getItem("overfishing-save") ?? "{}");

    expect(storedSave.run.cash).toBe(8);
    expect(storedSave.run.manual.cooldownMs).toBe(1_200);
    expect(storedSave.run.regions.pierCove.stockCurrent).toBeCloseTo(118.5, 5);
  });

  it("renders a distinct settings page shell at /settings", () => {
    renderAtPath("/settings");

    expect(
      screen.getByRole("heading", { name: /session settings/i }),
    ).toBeInTheDocument();
  });

  it("bootstraps a versioned save when settings load", () => {
    renderAtPath("/settings");

    const storedSave = localStorage.getItem("overfishing-save");

    expect(storedSave).not.toBeNull();
    expect(JSON.parse(storedSave as string)).toMatchObject({
      version: 1,
      settings: {
        reducedMotion: false,
        uiScale: "default",
        soundEnabled: true,
        analyticsConsent: false,
      },
      run: {
        phase: "quietPier",
      },
    });
  });

  it("persists settings changes across remounts", async () => {
    const user = userEvent.setup();
    const { unmount } = renderAtPath("/settings");

    await user.click(screen.getByRole("checkbox", { name: /reduced motion/i }));
    await user.selectOptions(screen.getByLabelText(/ui scale/i), "large");
    await user.click(screen.getByRole("checkbox", { name: /analytics consent/i }));

    unmount();
    renderAtPath("/settings");

    expect(screen.getByRole("checkbox", { name: /reduced motion/i })).toBeChecked();
    expect(screen.getByLabelText(/ui scale/i)).toHaveValue("large");
    expect(
      screen.getByRole("checkbox", { name: /analytics consent/i }),
    ).toBeChecked();
  });
});
