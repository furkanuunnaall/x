import { test } from "node:test";
import assert from "node:assert/strict";
import { nextBlank, adjacentUnsolved, scrambled } from "../src/wordFlow";
import { initialGame, reducer, entry, parseSave } from "../src/game";
import { files } from "../src/content";

test("cursor skips filled/hinted cells and wraps to remaining gaps", () => {
  assert.equal(nextBlank(["", "A", "", "B", ""], 2), 4);
  assert.equal(nextBlank(["", "A", "B"], 2), 0);
  assert.equal(nextBlank(["A", "B"], 1), null);
});

test("question navigation wraps, skips solved rows, and stops at the last unresolved row", () => {
  assert.equal(adjacentUnsolved([true, false, true], 2, 1), 0);
  assert.equal(adjacentUnsolved([true, false, true], 0, -1), 2);
  assert.equal(adjacentUnsolved([false, true, false], 1, 1), null);
});

test("last-letter submission keeps hints, rewards exactly once, and survives persistence", () => {
  const q = files[0].questions[0];
  let g = reducer(initialGame(), { type: "hint", id: q.id, hint: "first" });
  for (let index = 1; index < q.term.length; index++) {
    g = reducer(g, { type: "key", id: q.id, key: q.term[index], index });
    if (entry(g, q.id).draft.every(Boolean)) g = reducer(g, { type: "submit", id: q.id });
  }
  assert.equal(entry(g, q.id).solved, true);
  assert.equal(g.xp, 100);
  assert.equal(g.seals, 70);
  assert.deepEqual(reducer(g, { type: "submit", id: q.id }), g);
  assert.deepEqual(parseSave(JSON.stringify(g)), g);
});

test("İpucu letter pool holds exactly the term's letters, never in answer order, and is stable", () => {
  for (const f of files)
    for (const q of f.questions) {
      const pool = scrambled(q.term, q.id);
      assert.deepEqual([...pool].sort(), [...q.term].sort());
      if (new Set(q.term).size > 1) assert.notEqual(pool.join(""), q.term, q.term);
      assert.deepEqual(pool, scrambled(q.term, q.id));
    }
});
