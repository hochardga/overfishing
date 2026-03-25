import {
  createRecoveredSave,
  normalizeSaveFileWithMetadata,
} from "@/lib/storage/migrations";
import { createFreshSave, type SaveFile } from "@/lib/storage/saveSchema";
import { renewLicenseSaveData } from "@/lib/simulation/reducers/prestige";

export const SAVE_STORAGE_KEY = "overfishing-save";

export type LoadOrCreateSaveResult = {
  save: SaveFile;
  status: "created" | "loaded" | "recovered";
  message?: string;
};

function persistRawSave(save: SaveFile): SaveFile {
  const saveToWrite = {
    ...save,
    lastSavedAt: new Date().toISOString(),
  };

  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveToWrite));

  return saveToWrite;
}

export function createAndPersistFreshSave(): SaveFile {
  return persistRawSave(createFreshSave());
}

export function hasStoredSave() {
  return localStorage.getItem(SAVE_STORAGE_KEY) !== null;
}

export function loadOrCreateSaveResult(): LoadOrCreateSaveResult {
  const rawSave = localStorage.getItem(SAVE_STORAGE_KEY);

  if (!rawSave) {
    return {
      save: createAndPersistFreshSave(),
      status: "created",
    };
  }

  try {
    const parsed = JSON.parse(rawSave) as unknown;
    const normalized = normalizeSaveFileWithMetadata(parsed);
    const save = persistRawSave(normalized.save);

    if (normalized.recovered) {
      return {
        save,
        status: "recovered",
        message:
          "We could not restore the previous harbor log. Settings were kept when possible, and you can start a fresh run below.",
      };
    }

    return {
      save,
      status: "loaded",
    };
  } catch {
    return {
      save: persistRawSave(createRecoveredSave()),
      status: "recovered",
      message:
        "We could not restore the previous harbor log. A fresh run is ready so you can get back on the water.",
    };
  }
}

export function loadOrCreateSave(): SaveFile {
  return loadOrCreateSaveResult().save;
}

export function saveGame(save: SaveFile): SaveFile {
  return persistRawSave(save);
}

export function updateSave(
  updater: (currentSave: SaveFile) => SaveFile,
): SaveFile {
  return saveGame(updater(loadOrCreateSave()));
}

export function renewLicenseSave(): SaveFile {
  return saveGame(renewLicenseSaveData(loadOrCreateSave()));
}
