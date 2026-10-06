import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { files, questions } from "../src/content";
import { exampleSentences } from "../src/exampleSentences";
import { termCategories } from "../src/termCategories";
import { initialGame, reducer } from "../src/game";

test("campaign remains byte-equivalent in JSON and solving a word does not modify the campaign", () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL("./fixtures/campaign-v2.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(files, fixture);
  let game = initialGame();
  const first = files[0].questions[0];
  for (const key of first.term)
    game = reducer(game, { type: "key", id: first.id, key });
  game = reducer(game, { type: "submit", id: first.id });
  assert.ok(game.run.entries[first.id].solved);
  assert.equal(game.xp, 100);
  assert.deepEqual(files, fixture);
});

test("every term has one example sentence with exactly one bold-marked word", () => {
  for (const q of questions) {
    const sentence = exampleSentences[q.term];
    assert.ok(sentence, `${q.term} has no example sentence`);
    assert.equal(sentence.match(/\*[^*]+\*/g)?.length, 1, q.term);
  }
  assert.equal(Object.keys(exampleSentences).length, questions.length);
});

test("terms in several categories list their own category and only existing ones", () => {
  const categories = new Set(questions.map((q) => q.category));
  for (const [term, list] of Object.entries(termCategories)) {
    const q = questions.find((item) => item.term === term);
    assert.ok(q, `${term} is not a term`);
    assert.ok(list.length > 1, term);
    assert.equal(new Set(list).size, list.length, term);
    assert.ok(list.includes(q!.category), term);
    for (const c of list) assert.ok(categories.has(c), `${term}: unknown category ${c}`);
  }
});
