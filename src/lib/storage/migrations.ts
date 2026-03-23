import {
  createDefaultSettings,
  createFreshSave,
  saveFileSchema,
  settingsStateSchema,
  type SaveFile,
  type SettingsState,
} from "@/lib/storage/saveSchema";

export const LATEST_SAVE_VERSION = 1;

function recoverSettings(value: unknown): SettingsState | null {
  if (!value || typeof value !== "object" || !("settings" in value)) {
    return null;
  }

  const candidate = (value as { settings?: unknown }).settings;
  const parsed = settingsStateSchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
}

export function normalizeSaveFile(value: unknown): SaveFile {
  const parsed = saveFileSchema.safeParse(value);

  if (parsed.success) {
    return parsed.data;
  }

  const recoveredSettings = recoverSettings(value) ?? createDefaultSettings();

  return createFreshSave({
    settings: recoveredSettings,
  });
}
