import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import App from "@/App";
import {
  createFreshSave,
  createStarterRun,
  type RunState,
} from "@/lib/storage/saveSchema";
import { createGameStore, gameStore } from "@/lib/simulation/gameStore";
import {
  assignBoatRoute,
  syncFleetState,
} from "@/lib/simulation/reducers/fleet";
import { syncContractsState } from "@/lib/simulation/reducers/contracts";
import { syncFacilitiesState } from "@/lib/simulation/reducers/facilities";
import { syncProcessingState } from "@/lib/simulation/reducers/processing";
import { purchaseUpgrade } from "@/lib/simulation/reducers/upgrades";
import { SAVE_STORAGE_KEY } from "@/lib/storage/saveAdapter";

function renderAtPath(pathname: string) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

function createSkiffOperatorRun(): RunState {
  const starterRun = createStarterRun();
  let run: RunState = {
    ...starterRun,
    phase: "skiffOperator",
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

function createDocksideGearRun(): RunState {
  const starterRun = createStarterRun();

  const run: RunState = {
    ...starterRun,
    phase: "docksideGear",
    lifetimeFishLanded: 150,
    lifetimeRevenue: 750,
    facilities: {
      ...starterRun.facilities,
      dockStorageCap: 20,
      dockStorageRawFish: 20,
      dockStorageQuality: 0.9,
      gearSlotCap: 2,
    },
    gear: {
      crabPot01: {
        id: "crabPot01",
        kind: "crabPot" as const,
        assignedRegionId: "pierCove" as const,
        outputPerSecond: 0.18,
        collectionIntervalSeconds: 120,
        secondsSinceCollection: 0,
        bufferedCatch: 0,
        active: true,
        blockedByStorage: true,
      },
    },
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      upgrades: ["harborMap", "rustySkiff"],
      phasesSeen: ["quietPier", "skiffOperator", "docksideGear"],
    },
  };

  return run;
}

function createPassiveGearRun(): RunState {
  let run: RunState = {
    ...createDocksideGearRun(),
    cash: 2_000,
    facilities: {
      ...createDocksideGearRun().facilities,
      dockStorageRawFish: 0,
      dockStorageQuality: 1,
    },
    gear: {},
  };

  run = purchaseUpgrade(run, "crabPot").run;

  return run;
}

function createUnlockModalRun(): RunState {
  const starterRun = createStarterRun();

  const run: RunState = {
    ...starterRun,
    phase: "skiffOperator",
    lifetimeFishLanded: 60,
    lifetimeRevenue: 250,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      phasesSeen: ["quietPier", "skiffOperator"],
      pendingPhaseModalIds: ["skiffOperator"],
      dismissedPhaseModalIds: [],
    },
  };

  return run;
}

function createFleetOpsRun(): RunState {
  const starterRun = createStarterRun();

  let run: RunState = {
    ...starterRun,
    phase: "fleetOps",
    uiTone: "operational",
    cash: 8_000,
    lifetimeFishLanded: 320,
    lifetimeRevenue: 1_900,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      upgrades: ["harborMap", "rustySkiff", "hireCousin"],
      phasesSeen: ["quietPier", "skiffOperator", "docksideGear", "fleetOps"],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
  };

  run = purchaseUpgrade(run, "dockLease").run;
  run = purchaseUpgrade(run, "usedWorkSkiff").run;
  run = purchaseUpgrade(run, "deckhandHire").run;
  run = syncFleetState(run);
  run = assignBoatRoute(run, {
    boatId: "workSkiff",
    regionId: "offshoreShelf",
    automated: true,
    crewAssigned: true,
  }).run;

  return run;
}

function createProcessingContractsRun(): RunState {
  const starterRun = createStarterRun();

  let run: RunState = {
    ...starterRun,
    phase: "processingContracts",
    uiTone: "industrial",
    cash: 14_000,
    lifetimeFishLanded: 620,
    lifetimeRevenue: 4_200,
    facilities: {
      ...starterRun.facilities,
      dockStorageRawFish: 8,
      dockStorageCap: 20,
    },
    resources: {
      ...starterRun.resources,
      frozenCrates: 10,
      cannedCases: 6,
    },
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "processing", "settings"],
      upgrades: [
        "harborMap",
        "rustySkiff",
        "hireCousin",
        "dockLease",
        "usedWorkSkiff",
        "deckhandHire",
      ],
      phasesSeen: [
        "quietPier",
        "skiffOperator",
        "docksideGear",
        "fleetOps",
        "processingContracts",
      ],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
  };

  run = purchaseUpgrade(run, "processingShed").run;
  run = purchaseUpgrade(run, "flashFreezer").run;
  run = purchaseUpgrade(run, "canneryLine").run;

  return syncContractsState(syncProcessingState(syncFacilitiesState(run)));
}

function createRenewalReadyRun(): RunState {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "regionalExtraction",
    uiTone: "industrial",
    cash: 6_000,
    trust: 54,
    oceanHealth: 61,
    lifetimeFishLanded: 1_120,
    lifetimeRevenue: 6_800,
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "processing", "regions", "settings"],
      upgrades: [
        "harborMap",
        "rustySkiff",
        "hireCousin",
        "dockLease",
        "usedWorkSkiff",
        "deckhandHire",
        "processingShed",
        "flashFreezer",
        "canneryLine",
      ],
      phasesSeen: [
        "quietPier",
        "skiffOperator",
        "docksideGear",
        "fleetOps",
        "processingContracts",
        "regionalExtraction",
      ],
      pendingPhaseModalIds: [],
      dismissedPhaseModalIds: [],
    },
    regions: {
      ...starterRun.regions,
      kelpBed: {
        ...starterRun.regions.kelpBed,
        unlocked: true,
      },
      offshoreShelf: {
        ...starterRun.regions.offshoreShelf,
        unlocked: true,
        stockCurrent: 24,
        habitatDamage: 0.22,
      },
    },
  };
}

describe("App bootstrap", () => {
  beforeEach(() => {
    gameStore.getState().stopSimulationLoop();
    localStorage.clear();
    gameStore.getState().resetRun();
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

  it("renders the launch feature strip on the landing page", () => {
    render(<App />);

    expect(screen.getByTestId("feature-strip")).toBeInTheDocument();
  });

  it("renders a distinct landing page shell at /", () => {
    renderAtPath("/");

    expect(
      screen.getByRole("heading", {
        name: /a browser incremental that turns cozy fishing into industrial extraction/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/catch fish\. build fleets\. normalize collapse\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /share prototype feedback/i }),
    ).toBeInTheDocument();
  });

  it("does not create a save file when only booting settings on the landing route", async () => {
    localStorage.clear();

    renderAtPath("/");

    await waitFor(() => {
      expect(localStorage.getItem(SAVE_STORAGE_KEY)).toBeNull();
    });
  });

  it("renders a distinct play page shell at /play", () => {
    renderAtPath("/play");

    expect(
      screen.getByRole("heading", { name: /harbor operations/i }),
    ).toBeInTheDocument();
  });

  it("shows first-cast onboarding guidance on a fresh run", () => {
    renderAtPath("/play");

    expect(screen.getByTestId("play-shell-onboarding")).toBeInTheDocument();
    expect(
      screen.getByText(/cast a line and see what's biting/i),
    ).toBeInTheDocument();
  });

  it("shows a restore skeleton before hydrating an existing save", async () => {
    localStorage.setItem(
      SAVE_STORAGE_KEY,
      JSON.stringify(
        createFreshSave({
          run: createFleetOpsRun(),
        }),
      ),
    );
    act(() => {
      gameStore.setState({
        hydrated: false,
        recoveryMessage: null,
        run: createStarterRun(),
      });
    });

    renderAtPath("/play");

    expect(screen.getByTestId("game-shell-loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /fleet operations/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows a recovery prompt when the stored save is malformed", async () => {
    localStorage.setItem(SAVE_STORAGE_KEY, "{ definitely broken json");
    act(() => {
      gameStore.setState({
        hydrated: false,
        recoveryMessage: null,
        run: createStarterRun(),
      });
    });

    renderAtPath("/play");

    await waitFor(() => {
      expect(screen.getByTestId("game-shell-recovery")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /start fresh run/i }),
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
      }, state.meta);
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
        phase: "regionalExtraction",
        uiTone: "industrial",
        lifetimeFishLanded: 1_000,
        lifetimeRevenue: 6_000,
        unlocks: {
          ...state.run.unlocks,
          phasesSeen: [
            "quietPier",
            "skiffOperator",
            "docksideGear",
            "fleetOps",
            "processingContracts",
            "regionalExtraction",
          ],
          upgrades: [
            "rustySkiff",
            "dockLease",
            "usedWorkSkiff",
            "deckhandHire",
            "processingShed",
            "flashFreezer",
          ],
          tabs: ["harbor", "fleet", "processing", "regions", "settings"],
        },
      }, state.meta);
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
      }, state.meta);
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
      }, state.meta);
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
    expect(screen.getByTestId("status-rail")).toHaveClass("max-[959px]:sticky");
    expect(screen.getByTestId("status-rail-grid")).toHaveClass("grid-cols-2");
    expect(screen.getByTestId("status-rail-grid")).toHaveClass(
      "min-[720px]:grid-cols-4",
    );
    expect(screen.getByTestId("game-shell-grid")).toHaveClass(
      "min-[960px]:grid-cols-[1.05fr_1.35fr_1fr]",
    );
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
      }, state.meta);
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
      const state = gameStore.getState();
      state.replaceRun(createSkiffOperatorRun(), state.meta);
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

  it("renders dock storage pressure and gear slot usage once Dockside Gear is unlocked", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createDocksideGearRun(), state.meta);
    });

    renderAtPath("/play");

    const panel = screen.getByTestId("gear-panel");

    expect(
      within(panel).getByRole("heading", { name: /dock storage/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("gear-storage")).toHaveTextContent(/20 \/ 20/i);
    expect(screen.getByTestId("gear-slots")).toHaveTextContent(/1 \/ 2/i);
    expect(
      within(panel).getByText(/1 gear rig paused by full storage/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("gear-decay")).toHaveTextContent(/90%/i);
  });

  it("renders gear cards and lets a crab pot haul buffered catch into storage", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createPassiveGearRun(), state.meta);
    });

    renderAtPath("/play");

    const panel = screen.getByTestId("gear-panel");

    expect(
      within(panel).getByRole("heading", { name: /crab pot/i }),
    ).toBeInTheDocument();

    act(() => {
      gameStore.getState().tick(60);
    });

    expect(screen.getByTestId("gear-storage")).toHaveTextContent(/0 \/ 20/i);

    await user.click(screen.getByRole("button", { name: /haul crab pot/i }));

    expect(gameStore.getState().run.facilities.dockStorageRawFish).toBeCloseTo(10.8);
    expect(screen.getByTestId("gear-storage")).toHaveTextContent(/11 \/ 20/i);
  });

  it("renders a one-time phase unlock modal and dismisses it safely while showing the progress summary", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createUnlockModalRun(), state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("phase-unlock-modal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /skiff operator unlocked/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("progress-summary")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /keep the dock moving/i }));

    expect(screen.queryByTestId("phase-unlock-modal")).not.toBeInTheDocument();
    expect(gameStore.getState().run.unlocks.dismissedPhaseModalIds).toContain(
      "skiffOperator",
    );
  });

  it("shifts the play shell into fleet operations once Fleet Ops is unlocked", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createFleetOpsRun(), state.meta);
    });

    renderAtPath("/play");

    expect(
      screen.getByRole("heading", { name: /fleet operations/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("fleet-panel")).toBeInTheDocument();
    expect(screen.getByTestId("maintenance-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/routes, crews, and maintenance now set the pace/i),
    ).toBeInTheDocument();
  });

  it("shows the contract board empty state before processing comes online", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createFleetOpsRun(), state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("contract-board")).toBeInTheDocument();
    expect(
      screen.getByText(/contracts unlock after processing is online/i),
    ).toBeInTheDocument();
  });

  it("keeps a dockside revenue control reachable after Fleet Ops unlocks", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createFleetOpsRun(), state.meta);
    });

    renderAtPath("/play");

    const startingRevenue = gameStore.getState().run.lifetimeRevenue;

    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(gameStore.getState().run.lifetimeRevenue).toBeGreaterThan(
      startingRevenue,
    );
  });

  it("keeps a fleet refuel control reachable after Fleet Ops unlocks", async () => {
    const user = userEvent.setup();
    const run = createFleetOpsRun();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...run,
        boats: {
          ...run.boats,
          workSkiff: {
            ...run.boats.workSkiff,
            fuelCurrent: 4,
            status: "docked",
          },
        },
      }, state.meta);
    });

    renderAtPath("/play");

    const panel = screen.getByTestId("boat-card-workSkiff");
    const refuelButton = within(panel).getByRole("button", {
      name: /top up fuel/i,
    });

    expect(refuelButton).toBeEnabled();

    await user.click(refuelButton);

    expect(gameStore.getState().run.boats.workSkiff.fuelCurrent).toBe(
      gameStore.getState().run.boats.workSkiff.fuelCap,
    );
  });

  it("renders processing controls and contract actions once processing unlocks", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createProcessingContractsRun(), state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("processing-panel")).toBeInTheDocument();
    expect(screen.getByTestId("contract-board")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /accept restaurant route/i }),
    );

    expect(gameStore.getState().run.contracts.restaurant.status).toBe("active");
  });

  it("shows the regional oversight empty state before offshore expansion", () => {
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createProcessingContractsRun(), state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("regions-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/regional oversight unlocks once your fleet expands offshore/i),
    ).toBeInTheDocument();
  });

  it("shows a stale-data warning if regional extraction has no unlocked waters", () => {
    const starterRun = createStarterRun();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun({
        ...starterRun,
        phase: "regionalExtraction",
        uiTone: "industrial",
        trust: 54,
        oceanHealth: 61,
        regions: {
          pierCove: {
            ...starterRun.regions.pierCove,
            unlocked: false,
          },
          kelpBed: {
            ...starterRun.regions.kelpBed,
            unlocked: false,
          },
          offshoreShelf: {
            ...starterRun.regions.offshoreShelf,
            unlocked: false,
          },
        },
        unlocks: {
          ...starterRun.unlocks,
          tabs: ["harbor", "fleet", "processing", "regions", "settings"],
          phasesSeen: [
            "quietPier",
            "skiffOperator",
            "docksideGear",
            "fleetOps",
            "processingContracts",
            "regionalExtraction",
          ],
        },
      }, state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("regions-panel")).toBeInTheDocument();
    expect(screen.getByTestId("regions-panel")).toHaveTextContent(
      /regional telemetry is stale/i,
    );
  });

  it("shows the regions panel and completes a license renewal reset", async () => {
    const user = userEvent.setup();

    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createRenewalReadyRun(), state.meta);
    });

    renderAtPath("/play");

    expect(screen.getByTestId("regions-panel")).toBeInTheDocument();
    expect(screen.getByTestId("license-renewal-modal")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /renew license/i }));

    expect(gameStore.getState().run.phase).toBe("quietPier");
    expect(gameStore.getState().run.cash).toBeGreaterThan(0);
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

  it("applies reduced motion and UI scale to the document runtime", async () => {
    const user = userEvent.setup();

    renderAtPath("/settings");

    await user.click(screen.getByRole("checkbox", { name: /reduced motion/i }));
    await user.selectOptions(screen.getByLabelText(/ui scale/i), "large");

    expect(document.documentElement).toHaveAttribute("data-reduced-motion", "true");
    expect(document.documentElement).toHaveAttribute("data-ui-scale", "large");
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
    expect(document.documentElement).toHaveAttribute("data-reduced-motion", "true");
    expect(document.documentElement).toHaveAttribute("data-ui-scale", "large");
  });
});
