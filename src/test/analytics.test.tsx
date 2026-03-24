import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/AppRouter";
import {
  createAnalyticsClient,
  type AnalyticsClient,
} from "@/lib/analytics/analytics";
import { createFeedbackClickEvent } from "@/lib/analytics/events";
import { useSettingsStore } from "@/features/settings/settingsStore";
import {
  createDefaultSettings,
  createStarterRun,
  type RunState,
} from "@/lib/storage/saveSchema";
import { gameStore } from "@/lib/simulation/gameStore";

function renderWithProviders(pathname: string, client: AnalyticsClient) {
  window.history.pushState({}, "", pathname);

  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppProviders client={client}>
        <AppRouter />
      </AppProviders>
    </MemoryRouter>,
  );
}

function createConsentEnabledRun(overrides: Partial<RunState> = {}): RunState {
  const starterRun = createStarterRun();

  return {
    ...starterRun,
    phase: "fleetOps",
    uiTone: "operational",
    unlocks: {
      ...starterRun.unlocks,
      tabs: ["harbor", "fleet", "settings"],
      phasesSeen: ["quietPier", "skiffOperator", "docksideGear", "fleetOps"],
    },
    ...overrides,
  };
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
  };
}

describe("analytics", () => {
  beforeEach(() => {
    gameStore.getState().stopSimulationLoop();
    localStorage.clear();
    useSettingsStore.setState({
      ...createDefaultSettings(),
      errorMessage: null,
      initialized: true,
    });
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createStarterRun(), state.meta);
    });
  });

  it("no-ops safely when analytics env configuration is absent", async () => {
    const fetchMock = vi.fn();
    const infoMock = vi.fn();
    const client = createAnalyticsClient({
      fetchImpl: fetchMock as typeof fetch,
      logger: { info: infoMock },
      preview: false,
    });

    const result = await client.track(
      createFeedbackClickEvent(
        "settings-feedback",
        "mailto:hello@definitelynotoverfishing.com",
      ),
    );

    expect(result).toBe("disabled");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(infoMock).not.toHaveBeenCalled();
  });

  it("logs events in preview mode when sending is not configured", async () => {
    const infoMock = vi.fn();
    const client = createAnalyticsClient({
      logger: { info: infoMock },
      preview: true,
    });

    const result = await client.track(
      createFeedbackClickEvent(
        "settings-feedback",
        "mailto:hello@definitelynotoverfishing.com",
      ),
    );

    expect(result).toBe("preview");
    expect(infoMock).toHaveBeenCalledWith(
      "[analytics:preview]",
      "feedback_click",
      expect.objectContaining({
        source: "settings-feedback",
      }),
    );
  });

  it("tracks session start and phase reach when consent is enabled", async () => {
    const track = vi.fn().mockResolvedValue("preview");

    useSettingsStore.setState({
      ...createDefaultSettings(),
      analyticsConsent: true,
      errorMessage: null,
      initialized: true,
    });
    gameStore.setState({
      hydrated: true,
      recoveryMessage: null,
      run: createConsentEnabledRun(),
    });

    renderWithProviders("/play", { track });

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ name: "session_start" }),
      );
    });
    expect(track).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "phase_reached",
        payload: expect.objectContaining({
          phaseId: "fleetOps",
        }),
      }),
    );
  });

  it("tracks license renewals and feedback clicks when consent is enabled", async () => {
    const user = userEvent.setup();
    const track = vi.fn().mockResolvedValue("preview");

    useSettingsStore.setState({
      ...createDefaultSettings(),
      analyticsConsent: true,
      errorMessage: null,
      initialized: true,
    });
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createRenewalReadyRun(), state.meta);
    });

    renderWithProviders("/settings", { track });

    const feedbackLink = screen.getByRole("link", { name: /send build feedback/i });
    feedbackLink.addEventListener("click", (event) => event.preventDefault());

    await user.click(feedbackLink);
    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ name: "feedback_click" }),
      );
    });

    act(() => {
      gameStore.getState().renewLicense();
    });

    await waitFor(() => {
      expect(track).toHaveBeenCalledWith(
        expect.objectContaining({ name: "license_renewed" }),
      );
    });
  });

  it("does not track a license renewal event when the run is not renewal-ready", () => {
    const track = vi.fn().mockResolvedValue("preview");

    useSettingsStore.setState({
      ...createDefaultSettings(),
      analyticsConsent: true,
      errorMessage: null,
      initialized: true,
    });
    act(() => {
      const state = gameStore.getState();
      state.replaceRun(createConsentEnabledRun(), state.meta);
    });

    renderWithProviders("/settings", { track });

    act(() => {
      gameStore.getState().renewLicense();
    });

    expect(track).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: "license_renewed" }),
    );
  });
});
