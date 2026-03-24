import { Card } from "@/components/ui/Card";
import { useSettingsStore } from "@/features/settings/settingsStore";

function SettingsToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-raised px-4 py-3">
      <span>{label}</span>
      <input
        checked={checked}
        className="h-5 w-5 accent-secondary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  );
}

export function SettingsPanel() {
  const {
    analyticsConsent,
    errorMessage,
    initialized,
    reducedMotion,
    soundEnabled,
    uiScale,
    updateSetting,
  } = useSettingsStore();

  if (!initialized) {
    return (
      <Card className="space-y-3">
        <h2 className="font-heading text-2xl text-text">Loading settings</h2>
        <p className="text-sm text-text-muted">
          Pulling your saved presentation and consent preferences into the shell.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      {errorMessage ? (
        <div className="rounded-xl bg-error/15 px-4 py-3 text-sm text-text">
          {errorMessage}
        </div>
      ) : null}

      <SettingsToggle
        checked={reducedMotion}
        label="Reduced motion"
        onChange={(checked) => updateSetting("reducedMotion", checked)}
      />

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

      <SettingsToggle
        checked={soundEnabled}
        label="Sound enabled"
        onChange={(checked) => updateSetting("soundEnabled", checked)}
      />

      <SettingsToggle
        checked={analyticsConsent}
        label="Analytics consent"
        onChange={(checked) => updateSetting("analyticsConsent", checked)}
      />
    </Card>
  );
}
