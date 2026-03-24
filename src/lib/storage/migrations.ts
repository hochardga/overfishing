import {
  createDefaultSettings,
  createFreshSave,
  saveFileSchema,
  settingsStateSchema,
  type SaveFile,
  type SettingsState,
} from "@/lib/storage/saveSchema";

export const LATEST_SAVE_VERSION = 1;

export type NormalizedSaveFileResult = {
  save: SaveFile;
  recovered: boolean;
};

function recoverSettings(value: unknown): SettingsState | null {
  if (!value || typeof value !== "object" || !("settings" in value)) {
    return null;
  }

  const candidate = (value as { settings?: unknown }).settings;
  const parsed = settingsStateSchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
}

export function normalizeSaveFileWithMetadata(
  value: unknown,
): NormalizedSaveFileResult {
  const parsed = saveFileSchema.safeParse(value);

  if (parsed.success) {
    return {
      save: parsed.data,
      recovered: false,
    };
  }

  const recoveredSettings = recoverSettings(value) ?? createDefaultSettings();

  return {
    save: createFreshSave({
      settings: recoveredSettings,
    }),
    recovered: true,
  };
}

export function normalizeSaveFile(value: unknown): SaveFile {
  return normalizeSaveFileWithMetadata(value).save;
}
