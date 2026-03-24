import { create } from "zustand";

import {
  loadOrCreateSave,
  updateSave,
} from "@/lib/storage/saveAdapter";
import {
  createDefaultSettings,
  type SettingsState,
} from "@/lib/storage/saveSchema";

type SettingsStore = SettingsState & {
  initialized: boolean;
  initialize: () => void;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
};

const initialSettings = createDefaultSettings();

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...initialSettings,
  initialized: false,
  initialize: () => {
    const save = loadOrCreateSave();

    set({
      ...save.settings,
      initialized: true,
    });
  },
  updateSetting: (key, value) => {
    const updatedSave = updateSave((currentSave) => ({
      ...currentSave,
      settings: {
        ...currentSave.settings,
        [key]: value,
      },
    }));

    set({
      ...updatedSave.settings,
      initialized: true,
    });
  },
}));
