import { useEffect } from "react";

import { Link } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { useSettingsStore } from "@/features/settings/settingsStore";

export default function SettingsPage() {
  const {
    analyticsConsent,
    initialize,
    reducedMotion,
    soundEnabled,
    uiScale,
    updateSetting,
  } = useSettingsStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-text">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="inline-flex w-fit rounded-full bg-surface-raised px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-secondary shadow-soft">
          Player preferences
        </div>
        <h1 className="font-heading text-4xl text-text">Session settings</h1>
        <p className="text-lg text-text-muted">
          Presentation and consent preferences persist immediately so the first
          prototype already behaves like a save-backed product shell.
        </p>
        <Card className="space-y-4">
          <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-raised px-4 py-3">
            <span>Reduced motion</span>
            <input
              checked={reducedMotion}
              className="h-5 w-5 accent-secondary"
              onChange={(event) =>
                updateSetting("reducedMotion", event.target.checked)
              }
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-raised px-4 py-3">
            <span>UI scale</span>
            <select
              aria-label="UI scale"
              className="min-h-11 rounded-xl border border-border bg-background px-3 py-2"
              onChange={(event) =>
                updateSetting("uiScale", event.target.value as "default" | "large")
              }
              value={uiScale}
            >
              <option value="default">Default</option>
              <option value="large">Large</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-raised px-4 py-3">
            <span>Sound enabled</span>
            <input
              checked={soundEnabled}
              className="h-5 w-5 accent-secondary"
              onChange={(event) =>
                updateSetting("soundEnabled", event.target.checked)
              }
              type="checkbox"
            />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-raised px-4 py-3">
            <span>Analytics consent</span>
            <input
              checked={analyticsConsent}
              className="h-5 w-5 accent-secondary"
              onChange={(event) =>
                updateSetting("analyticsConsent", event.target.checked)
              }
              type="checkbox"
            />
          </label>
        </Card>
        <Link
          className="w-fit rounded-full bg-surface-raised px-5 py-3 font-medium text-text shadow-soft"
          to="/"
        >
          Back to landing
        </Link>
      </div>
    </main>
  );
}
