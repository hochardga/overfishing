import { normalizeSaveFile } from "@/lib/storage/migrations";
import { createFreshSave, type SaveFile } from "@/lib/storage/saveSchema";

export const SAVE_STORAGE_KEY = "overfishing-save";

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

export function loadOrCreateSave(): SaveFile {
  const rawSave = localStorage.getItem(SAVE_STORAGE_KEY);

  if (!rawSave) {
    return createAndPersistFreshSave();
  }

  try {
    const parsed = JSON.parse(rawSave) as unknown;
    return persistRawSave(normalizeSaveFile(parsed));
  } catch {
    return createAndPersistFreshSave();
  }
}

export function saveGame(save: SaveFile): SaveFile {
  return persistRawSave(save);
}

export function updateSave(
  updater: (currentSave: SaveFile) => SaveFile,
): SaveFile {
  return saveGame(updater(loadOrCreateSave()));
}
