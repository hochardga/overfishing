import { create } from "zustand";

import {
  loadOrCreateSave,
  updateSave,
} from "@/lib/storage/saveAdapter";
import {
  createDefaultSettings,
  settingsStateSchema,
  type SettingsState,
} from "@/lib/storage/saveSchema";
import { SAVE_STORAGE_KEY } from "@/lib/storage/saveAdapter";

type SettingsStore = SettingsState & {
  errorMessage: string | null;
  initialized: boolean;
  initialize: () => void;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
};

const initialSettings = createDefaultSettings();

function applySettingsToDocument(settings: SettingsState) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;

  root.dataset.analyticsConsent = settings.analyticsConsent ? "true" : "false";
  root.dataset.reducedMotion = settings.reducedMotion ? "true" : "false";
  root.dataset.soundEnabled = settings.soundEnabled ? "true" : "false";
  root.dataset.uiScale = settings.uiScale;
}

function readStoredSettings(): SettingsState {
  if (typeof localStorage === "undefined") {
    return initialSettings;
  }

  const rawSave = localStorage.getItem(SAVE_STORAGE_KEY);

  if (!rawSave) {
    return loadOrCreateSave().settings;
  }

  try {
    const parsed = JSON.parse(rawSave) as unknown;

    if (parsed && typeof parsed === "object" && "settings" in parsed) {
      const settingsCandidate = (parsed as { settings?: unknown }).settings;
      const result = settingsStateSchema.safeParse(settingsCandidate);

      if (result.success) {
        return result.data;
      }
    }
  } catch {
    return initialSettings;
  }

  return initialSettings;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...initialSettings,
  errorMessage: null,
  initialized: false,
  initialize: () => {
    try {
      const settings = readStoredSettings();

      applySettingsToDocument(settings);
      set({
        ...settings,
        errorMessage: null,
        initialized: true,
      });
    } catch {
      applySettingsToDocument(initialSettings);
      set({
        ...initialSettings,
        errorMessage: "Could not load your saved settings. Default preferences are active.",
        initialized: true,
      });
    }
  },
  updateSetting: (key, value) => {
    try {
      const updatedSave = updateSave((currentSave) => ({
        ...currentSave,
        settings: {
          ...currentSave.settings,
          [key]: value,
        },
      }));

      applySettingsToDocument(updatedSave.settings);
      set({
        ...updatedSave.settings,
        errorMessage: null,
        initialized: true,
      });
    } catch {
      set((currentState) => ({
        ...currentState,
        errorMessage: "This preference could not be saved. Try again.",
        initialized: true,
      }));
    }
  },
}));
