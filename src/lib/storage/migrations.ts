import {
  createDefaultSettings,
  createFreshSave,
  expandedShellDiscoverySteps,
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

const QUIET_PIER_INTRO_SEEN_FLAG = "quietPierIntroSeen";

function recoverSettings(value: unknown): SettingsState | null {
  if (!value || typeof value !== "object" || !("settings" in value)) {
    return null;
  }

  const candidate = (value as { settings?: unknown }).settings;
  const parsed = settingsStateSchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
}

function hasMissingDiscoverySteps(value: unknown): boolean {
  if (!value || typeof value !== "object" || !("run" in value)) {
    return false;
  }

  const run = (value as { run?: unknown }).run;

  if (!run || typeof run !== "object" || !("unlocks" in run)) {
    return false;
  }

  const unlocks = (run as { unlocks?: unknown }).unlocks;

  return (
    !!unlocks &&
    typeof unlocks === "object" &&
    !Object.prototype.hasOwnProperty.call(unlocks, "discoverySteps")
  );
}

function withRecoveredDiscoveryState(save: SaveFile): SaveFile {
  const unlockFlags = Array.from(
    new Set([...save.meta.unlockFlags, QUIET_PIER_INTRO_SEEN_FLAG]),
  );

  return {
    ...save,
    meta: {
      ...save.meta,
      unlockFlags,
    },
    run: save.run
      ? {
          ...save.run,
          unlocks: {
            ...save.run.unlocks,
            discoverySteps: [...expandedShellDiscoverySteps],
          },
        }
      : save.run,
  };
}

export function createRecoveredSave(
  settings: SettingsState = createDefaultSettings(),
): SaveFile {
  return withRecoveredDiscoveryState(
    createFreshSave({
      settings,
    }),
  );
}

export function normalizeSaveFileWithMetadata(
  value: unknown,
): NormalizedSaveFileResult {
  const parsed = saveFileSchema.safeParse(value);

  if (parsed.success) {
    if (hasMissingDiscoverySteps(value)) {
      return {
        save: withRecoveredDiscoveryState(parsed.data),
        recovered: true,
      };
    }

    return {
      save: parsed.data,
      recovered: false,
    };
  }

  const recoveredSettings = recoverSettings(value) ?? createDefaultSettings();

  return {
    save: createRecoveredSave(recoveredSettings),
    recovered: true,
  };
}

export function normalizeSaveFile(value: unknown): SaveFile {
  return normalizeSaveFileWithMetadata(value).save;
}
