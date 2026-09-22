import type { StorageAdapter } from "../persistence";
import {
  DISCOVERY_KEY,
  Discovery,
  emptyDiscovery,
  parseDiscovery,
} from "./model";
export async function loadDiscovery(storage: StorageAdapter) {
  const raw = await storage.getItem(DISCOVERY_KEY);
  return raw === null ? emptyDiscovery() : parseDiscovery(raw);
}
export function discoverySaveQueue(
  storage: StorageAdapter,
  onStatus: (failed: boolean) => void,
) {
  let pending = Promise.resolve();
  return {
    save(data: Discovery) {
      const snapshot = JSON.stringify(data);
      pending = pending.then(async () => {
        try {
          await storage.setItem(DISCOVERY_KEY, snapshot);
          onStatus(false);
        } catch {
          onStatus(true);
        }
      });
      return pending;
    },
  };
}
