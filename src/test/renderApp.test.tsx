import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import App from "@/App";
import { gameStore } from "@/lib/simulation/gameStore";

function renderAtPath(pathname: string) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
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

  it("casts through timing windows on the live play route", () => {
    vi.useFakeTimers();

    renderAtPath("/play");
    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(
      screen.getByText(/perfect pull: \+2 fish, \+\$8\./i),
    ).toBeInTheDocument();
    expect(screen.getByText("Cash in hand: $8")).toBeInTheDocument();
    expect(screen.getByText("Pier Cove stock: 118 / 120")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(screen.getByText(/clean cast: \+1 fish, \+\$4\./i)).toBeInTheDocument();
    expect(screen.getByText("Cash in hand: $12")).toBeInTheDocument();
    expect(screen.getByText("Pier Cove stock: 118 / 120")).toBeInTheDocument();
    expect(
      screen.getByText(/ready in 2\.2s/i),
    ).toBeInTheDocument();
  });

  it("keeps manual progress when the play route remounts in the same session", () => {
    vi.useFakeTimers();

    const firstRender = renderAtPath("/play");
    fireEvent.click(screen.getByRole("button", { name: /cast line/i }));

    expect(screen.getByText(/cash in hand: \$8/i)).toBeInTheDocument();

    firstRender.unmount();
    renderAtPath("/play");

    expect(screen.getByText(/cash in hand: \$8/i)).toBeInTheDocument();
    expect(screen.getByText(/pier cove stock: 118 \/ 120/i)).toBeInTheDocument();
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
