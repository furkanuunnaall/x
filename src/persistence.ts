import { Game, parseSave } from "./game";
export const SAVE_KEY = "@muhur/progress-v1";
export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};
export async function loadProgress(storage: StorageAdapter) {
  const raw = await storage.getItem(SAVE_KEY);
  return raw === null ? null : parseSave(raw);
}
/** Serializes writes so a slow earlier write cannot replace newer progress. */
export function createSaveQueue(
  storage: StorageAdapter,
  onStatus: (error: boolean) => void,
) {
  let pending = Promise.resolve();
  return {
    save(game: Game) {
      const snapshot = JSON.stringify(game);
      pending = pending.then(async () => {
        try {
          await storage.setItem(SAVE_KEY, snapshot);
          onStatus(false);
        } catch {
          onStatus(true);
        }
      });
      return pending;
    },
    idle() {
      return pending;
    },
  };
}
