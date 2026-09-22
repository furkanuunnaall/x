import { test } from "node:test";
import assert from "node:assert/strict";
import {
  achievements,
  dailyQuestion,
  dailySolved,
  discoveryReducer,
  emptyDiscovery,
  parseDiscovery,
  roundFor,
  scoreGuess,
  unlockedQuestions,
} from "../src/discovery/model";
import { initialGame, reducer } from "../src/game";
import { files } from "../src/content";

test("daily selection is deterministic, changes on the next day, and fits the keyboard board", () => {
  const first = dailyQuestion("2026-09-21");
  assert.equal(first.id, dailyQuestion("2026-09-21").id);
  assert.notEqual(first.id, dailyQuestion("2026-09-22").id);
  assert.ok(first.term.length >= 5 && first.term.length <= 8);
});
test("daily feedback consumes duplicate letters only once after matching exact positions", () => {
  assert.deepEqual(scoreGuess("AAAAA", "HACİZ"), [
    "absent",
    "correct",
    "absent",
    "absent",
    "absent",
  ]);
  assert.deepEqual(scoreGuess("İLDEL", "DELİL"), [
    "present",
    "present",
    "present",
    "present",
    "correct",
  ]);
  assert.deepEqual(scoreGuess("İİİİİ", "DELİL"), [
    "absent",
    "absent",
    "absent",
    "correct",
    "absent",
  ]);
});
test("draft survives restore; full guesses clear input and a solved day cannot be replayed for duplicate stamps", () => {
  const day = "2026-09-21",
    answer = dailyQuestion(day).term;
  let d = discoveryReducer(emptyDiscovery(), {
    type: "draft",
    day,
    value: answer.slice(0, 3),
  });
  d = parseDiscovery(JSON.stringify(d));
  assert.equal(roundFor(d, day).draft, answer.slice(0, 3));
  assert.deepEqual(discoveryReducer(d, { type: "guess", day }), d);
  d = discoveryReducer(d, { type: "draft", day, value: answer });
  d = discoveryReducer(d, { type: "guess", day });
  assert.equal(dailySolved(d, day), true);
  assert.equal(roundFor(d, day).draft, "");
  assert.deepEqual(discoveryReducer(d, { type: "guess", day }), d);
  assert.equal(dailySolved(d, "2026-09-22"), false);
  assert.deepEqual(parseDiscovery(JSON.stringify(d)), d);
});
test("failed daily attempts never impose an energy or attempt limit", () => {
  const day = "2026-09-21";
  let d = emptyDiscovery();
  for (let i = 0; i < 9; i++) {
    d = discoveryReducer(d, {
      type: "draft",
      day,
      value: "Q".repeat(dailyQuestion(day).term.length),
    });
    d = discoveryReducer(d, { type: "guess", day });
  }
  assert.equal(roundFor(d, day).guesses.length, 9);
  assert.equal(dailySolved(d, day), false);
});
test("collection exposes only solved campaign terms including previous files", () => {
  let g = initialGame();
  assert.equal(unlockedQuestions(g).length, 0);
  for (const q of files[0].questions) {
    for (const key of q.term) g = reducer(g, { type: "key", id: q.id, key });
    g = reducer(g, { type: "submit", id: q.id });
  }
  g = reducer(g, { type: "seal" });
  g = reducer(g, { type: "next" });
  assert.equal(unlockedQuestions(g).length, 6);
  assert.equal(
    unlockedQuestions(g).some((q) => files[1].questions.includes(q)),
    false,
  );
  assert.equal(
    achievements(g, emptyDiscovery()).find((a) => a.id === "first")?.value,
    1,
  );
});
test("favorites persist, malformed saves are rejected, discovery never changes campaign economy", () => {
  const g = initialGame(),
    snapshot = JSON.stringify(g);
  let d = discoveryReducer(emptyDiscovery(), { type: "favorite", id: "q1" });
  assert.deepEqual(parseDiscovery(JSON.stringify(d)).favorites, ["q1"]);
  d = discoveryReducer(d, { type: "favorite", id: "q1" });
  assert.deepEqual(d.favorites, []);
  assert.equal(JSON.stringify(g), snapshot);
  assert.throws(() => parseDiscovery('{"version":1,"days":[],"favorites":[]}'));
  assert.throws(() =>
    parseDiscovery(
      '{"version":1,"days":{"2026-02-31":{"draft":"","guesses":[]}},"favorites":[]}',
    ),
  );
  assert.throws(() =>
    parseDiscovery('{"version":1,"days":{},"favorites":["unknown"]}'),
  );
});

import {
  discoverySaveQueue,
  loadDiscovery,
} from "../src/discovery/persistence";
import { DISCOVERY_KEY } from "../src/discovery/model";
import { SAVE_KEY } from "../src/persistence";
test("discovery storage preserves campaign saves, serializes writes and recovers from a failed write", async () => {
  const records = new Map([[SAVE_KEY, "campaign-untouched"]]);
  const statuses: boolean[] = [];
  let fail = true;
  const storage = {
    async getItem(key: string) {
      return records.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      if (fail) {
        fail = false;
        throw Error("disk full");
      }
      records.set(key, value);
    },
  };
  assert.deepEqual(await loadDiscovery(storage), emptyDiscovery());
  const queue = discoverySaveQueue(storage, (failed) => statuses.push(failed));
  await queue.save(emptyDiscovery());
  const newer = discoveryReducer(emptyDiscovery(), {
    type: "favorite",
    id: "q1",
  });
  await Promise.all([queue.save(emptyDiscovery()), queue.save(newer)]);
  assert.deepEqual(await loadDiscovery(storage), newer);
  assert.deepEqual(statuses, [true, false, false]);
  assert.equal(records.get(SAVE_KEY), "campaign-untouched");
  records.set(DISCOVERY_KEY, "broken");
  await assert.rejects(loadDiscovery(storage));
  assert.equal(records.get(DISCOVERY_KEY), "broken");
});
