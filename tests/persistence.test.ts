import { test } from "node:test";
import assert from "node:assert/strict";
import { initialGame, reducer } from "../src/game";
import {
  createSaveQueue,
  loadProgress,
  SAVE_KEY,
  StorageAdapter,
} from "../src/persistence";
function memory(): StorageAdapter & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    async getItem(k) {
      return data.get(k) ?? null;
    },
    async setItem(k, v) {
      data.set(k, v);
    },
  };
}
test("AsyncStorage adapter saves and loads the full game", async () => {
  const storage = memory();
  assert.equal(await loadProgress(storage), null);
  const g = reducer(initialGame(), { type: "hint", id: "q1", hint: "first" });
  const queue = createSaveQueue(storage, () => {});
  await queue.save(g);
  assert.deepEqual(await loadProgress(storage), g);
});
test("a slow earlier save cannot overwrite newer progress", async () => {
  const storage = memory();
  let release: () => void = () => {};
  let calls = 0;
  const gate = new Promise<void>((resolve) => (release = resolve));
  const statuses: boolean[] = [];
  const delayed = {
    ...storage,
    async setItem(k: string, v: string) {
      if (++calls === 1) await gate;
      await storage.setItem(k, v);
    },
  };
  const queue = createSaveQueue(delayed, (e) => statuses.push(e));
  void queue.save(initialGame());
  const latest = reducer(initialGame(), { type: "key", id: "q1", key: "F" });
  void queue.save(latest);
  release();
  await queue.idle();
  assert.deepEqual(await loadProgress(storage), latest);
  assert.deepEqual(statuses, [false, false]);
});
test("failed save can be retried without blocking later saves", async () => {
  const storage = memory();
  let fail = true;
  const statuses: boolean[] = [];
  const queue = createSaveQueue(
    {
      ...storage,
      async setItem(k: string, v: string) {
        if (fail) throw Error("Disk unavailable");
        await storage.setItem(k, v);
      },
    },
    (e) => statuses.push(e),
  );
  await queue.save(initialGame());
  fail = false;
  const next = reducer(initialGame(), { type: "key", id: "q1", key: "F" });
  await queue.save(next);
  assert.deepEqual(statuses, [true, false]);
  assert.deepEqual(await loadProgress(storage), next);
});
test("corrupt progress is reported and never replaced by a fresh game", async () => {
  const storage = memory();
  storage.data.set(SAVE_KEY, "broken data");
  await assert.rejects(loadProgress(storage));
  assert.equal(storage.data.get(SAVE_KEY), "broken data");
});
