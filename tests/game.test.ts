import { test } from "node:test";
import assert from "node:assert/strict";
import { files, questions } from "../src/content";
import {
  Game,
  initialGame,
  reducer,
  entry,
  reward,
  stars,
  parseSave,
  dailyNow,
  normalize,
} from "../src/game";
function solve(
  g: Game,
  id: string,
  term: string,
  date = new Date(2026, 8, 21),
) {
  for (const key of term) g = reducer(g, { type: "key", id, key });
  return reducer(g, { type: "submit", id, date });
}
function finish(g: Game, date = new Date(2026, 8, 21)) {
  for (const q of files[g.file - 1].questions) g = solve(g, q.id, q.term, date);
  return g;
}
test("unique playable terms, Turkish normalization", () => {
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  assert.equal(new Set(questions.map((q) => q.term)).size, questions.length);
  assert.equal(normalize(" zilyetlik "), "ZİLYETLİK");
  assert.equal(normalize("ı"), "I");
  for (const q of questions) assert.match(q.term, /^[A-ZÇĞİÖŞÜ]+$/);
});
test("XP schedule, one reward per answer, wrong resets combo without exposing solution", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6].map(reward),
    [100, 110, 120, 130, 150, 150],
  );
  let g = solve(initialGame(), "q1", "FERAGAT");
  assert.equal(g.xp, 100);
  assert.equal(reducer(g, { type: "submit", id: "q1" }), g);
  g = solve(g, "q2", "A".repeat(questions[1].term.length));
  assert.equal(g.combo, 0);
  assert.equal(g.run.mistakes, 1);
  assert.equal(entry(g, "q2").draft.join(""), "");
  assert.equal(g.solved, 1);
});
test("hints charge once, preserve revealed letters and reject insufficient funds", () => {
  let g = reducer(initialGame(), { type: "hint", id: "q1", hint: "first" });
  assert.equal(g.seals, 70);
  assert.equal(reducer(g, { type: "hint", id: "q1", hint: "first" }), g);
  g = reducer(g, { type: "delete", id: "q1" });
  assert.equal(entry(g, "q1").draft[0], "F");
  g = reducer(g, { type: "hint", id: "q1", hint: "extra" });
  assert.equal(g.seals, 30);
  assert.equal(reducer(g, { type: "hint", id: "q1", hint: "extra" }), g);
  g = reducer(g, { type: "hint", id: "q1", hint: "letter" });
  assert.equal(g.seals, 10);
  assert.equal(entry(g, "q1").letters[1], "E");
  assert.equal(reducer(g, { type: "hint", id: "q1", hint: "letter" }), g);
});
test("completion, sealing and next file cannot duplicate rewards", () => {
  let g = finish(initialGame());
  assert.equal(g.results[0].stars, 3);
  assert.equal(g.xp, 760);
  assert.equal(g.seals, 150);
  assert.equal(reducer(g, { type: "next" }), g);
  g = reducer(g, { type: "seal" });
  assert.equal(reducer(g, { type: "seal" }), g);
  g = reducer(g, { type: "next" });
  assert.equal(g.file, 2);
  assert.equal(g.run.xp, 0);
  assert.equal(g.combo, 6);
  assert.equal(reducer(g, { type: "next" }), g);
});
test("daily streak same day, next day, missed day and expired display", () => {
  let g = finish(initialGame());
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  g = finish(g);
  assert.equal(g.daily, 1);
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  g = finish(g, new Date(2026, 8, 22));
  assert.equal(g.daily, 2);
  assert.equal(dailyNow(g, new Date(2026, 8, 24)), 0);
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  g = finish(g, new Date(2026, 8, 24));
  assert.equal(g.daily, 1);
});
test("star boundaries", () => {
  assert.equal(stars(0, 2), 3);
  assert.equal(stars(0, 3), 2);
  assert.equal(stars(2, 0), 2);
  assert.equal(stars(3, 0), 1);
});
test("save roundtrip preserves draft, hint, rewards and pending completion", () => {
  let g = reducer(initialGame(), { type: "hint", id: "q1", hint: "first" });
  g = reducer(g, { type: "key", id: "q1", key: "E" });
  assert.deepEqual(parseSave(JSON.stringify(g)), g);
  const completed = finish(initialGame());
  assert.deepEqual(parseSave(JSON.stringify(completed)), completed);
  assert.throws(() => parseSave("{}"));
  assert.throws(() => parseSave("{oops"));
});
test("legacy first five files keep base rewards and unlock the new sixth file", () => {
  let g = initialGame();
  for (let i = 0; i < 5; i++) {
    g = finish(g);
    g = reducer(g, { type: "seal" });
    g = reducer(g, { type: "next" });
  }
  assert.equal(g.file, 6);
  assert.equal(g.solved, 30);
  assert.equal(g.results.length, 5);
  assert.equal(
    g.results.reduce((sum, r) => sum + r.seals, 0),
    250,
  );
  assert.equal(g.seals, 350 + 30 * Math.floor(g.xp / 1000));
  assert.equal(reducer(g, { type: "next" }), g);
});

test("edit a chosen box without changing other letters; revealed letters remain locked", () => {
  let g = initialGame();
  for (const key of "XERAGAT") g = reducer(g, { type: "key", id: "q1", key });
  g = reducer(g, { type: "key", id: "q1", key: "F", index: 0 });
  assert.equal(entry(g, "q1").draft.join(""), "FERAGAT");
  g = reducer(g, { type: "hint", id: "q1", hint: "first" });
  const before = g;
  assert.equal(
    reducer(g, { type: "key", id: "q1", key: "X", index: 0 }),
    before,
  );
  assert.equal(
    reducer(g, { type: "key", id: "q1", key: "X", index: 99 }),
    before,
  );
  g = reducer(g, { type: "clear", id: "q1" });
  assert.equal(entry(g, "q1").draft.join(""), "F");
});
test("question selection and independent drafts survive restore", () => {
  let g = reducer(initialGame(), { type: "key", id: "q1", key: "F" });
  g = reducer(g, { type: "select", id: "q2" });
  g = reducer(g, { type: "key", id: "q2", key: "Z" });
  g = parseSave(JSON.stringify(g));
  assert.equal(g.selected, "q2");
  assert.equal(entry(g, "q1").draft[0], "F");
  assert.equal(entry(g, "q2").draft[0], "Z");
});
test("file best streak is separate from lifetime streak", () => {
  let g = finish(initialGame());
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  g = finish(g);
  assert.equal(g.best, 12);
  assert.equal(g.results[1].best, 6);
  assert.equal(g.results[1].xp, 900);
});
test("specific letter hint charges once and does not accept invalid indices", () => {
  let g = reducer(initialGame(), {
    type: "hint",
    id: "q1",
    hint: "letter",
    index: 4,
  });
  assert.equal(entry(g, "q1").letters[4], "G");
  assert.equal(g.seals, 80);
  assert.equal(
    reducer(g, { type: "hint", id: "q1", hint: "letter", index: 4 }),
    g,
  );
  assert.equal(
    reducer(g, { type: "hint", id: "q1", hint: "letter", index: 500 }),
    g,
  );
});
test("incomplete submissions do not count as mistakes or earn XP", () => {
  const g = reducer(initialGame(), { type: "key", id: "q1", key: "F" });
  assert.equal(reducer(g, { type: "submit", id: "q1" }), g);
});
test("malformed stored results and letter data are rejected", () => {
  assert.throws(() => parseSave("null"));
  assert.throws(() =>
    parseSave(JSON.stringify({ ...initialGame(), results: [{ file: 99 }] })),
  );
  assert.throws(() =>
    parseSave(
      JSON.stringify({
        ...initialGame(),
        run: {
          ...initialGame().run,
          entries: {
            q1: { solved: false, extra: false, letters: { 0: "X" }, draft: [] },
          },
        },
      }),
    ),
  );
});
