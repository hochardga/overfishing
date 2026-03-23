import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "@/App";

function renderAtPath(pathname: string) {
  window.history.pushState({}, "", pathname);
  return render(<App />);
}

describe("App bootstrap", () => {
  beforeEach(() => {
    localStorage.clear();
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
