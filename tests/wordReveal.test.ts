import { test } from "node:test";
import assert from "node:assert/strict";
import { initialGame, reducer, entry, parseSave } from "../src/game";
import { files } from "../src/content";
test("normal files contain exactly six independent concepts and finals eight to ten", () => {
  for (const file of files)
    assert.ok(
      file.id % 10 === 0
        ? file.questions.length >= 8 && file.questions.length <= 10
        : file.questions.length === 6,
    );
});
test("word reveal costs 60 once, keeps free letters, persists, and requires confirmation", () => {
  const q = files[0].questions[0];
  let g = initialGame();
  g.product!.freeLetters = 2;
  g = reducer(g, { type: "hint", id: q.id, hint: "word" });
  assert.equal(g.seals, 40);
  assert.equal(g.run.hints, 1);
  assert.equal(g.product!.freeLetters, 2);
  assert.equal(entry(g, q.id).draft.join(""), q.term);
  assert.equal(entry(g, q.id).solved, false);
  assert.equal(g.xp, 0);
  assert.deepEqual(reducer(g, { type: "hint", id: q.id, hint: "word" }), g);
  assert.deepEqual(parseSave(JSON.stringify(g)), g);
  g = reducer(g, { type: "submit", id: q.id });
  assert.equal(g.xp, 100);
  assert.equal(entry(g, q.id).solved, true);
  assert.deepEqual(reducer(g, { type: "key", id: q.id, key: "X" }), g);
});
test("insufficient word reveal balance leaves all state intact", () => {
  const g = { ...initialGame(), seals: 59 };
  assert.deepEqual(
    reducer(g, { type: "hint", id: files[0].questions[0].id, hint: "word" }),
    g,
  );
});
