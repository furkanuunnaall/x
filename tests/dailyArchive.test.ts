import { test } from "node:test";
import assert from "node:assert/strict";
import { initialGame, reducer, parseSave, Game } from "../src/game";
import { productOf, dailyQuestions, canAccessDaily } from "../src/product";
const now = new Date(2026, 8, 21, 12),
  today = "2026-09-21",
  past = "2026-09-20";
function finish(g: Game, day: string) {
  for (const [index, q] of dailyQuestions(day).entries()) {
    g = reducer(g, {
      type: "session-select",
      mode: "daily",
      puzzleDate: day,
      index,
      date: now,
    });
    g = reducer(g, {
      type: "session-key",
      mode: "daily",
      puzzleDate: day,
      value: q.term,
      date: now,
    });
    g = reducer(g, {
      type: "session-submit",
      mode: "daily",
      puzzleDate: day,
      date: now,
    });
  }
  return g;
}
test("today is free; archive entry charges exactly 3 once and survives reload", () => {
  let g = reducer(initialGame(), { type: "daily-start", date: now });
  assert.equal(g.seals, 100);
  g = reducer(g, { type: "daily-start", puzzleDate: past, date: now });
  assert.equal(g.seals, 97);
  assert.ok(productOf(g).unlockedDailyDates.includes(past));
  g = parseSave(JSON.stringify(g));
  g = reducer(g, { type: "daily-start", puzzleDate: past, date: now });
  assert.equal(g.seals, 97);
  assert.ok(canAccessDaily(productOf(g), past, today));
});
test("unpaid archive cannot be edited, insufficient funds and future/invalid dates cannot be opened", () => {
  const g = { ...initialGame(), seals: 2 };
  for (const puzzleDate of [past, "2026-09-22", "2026-02-30", "invalid"]) {
    assert.deepEqual(
      reducer(g, { type: "daily-start", puzzleDate, date: now }),
      g,
    );
    assert.deepEqual(
      reducer(g, {
        type: "session-key",
        mode: "daily",
        puzzleDate,
        value: "A",
        date: now,
      }),
      g,
    );
  }
});
test("archive has its own saved session, rewards once per date, and credits actual play day's tasks", () => {
  let g = reducer(initialGame(), {
    type: "daily-start",
    puzzleDate: past,
    date: now,
  });
  g = finish(g, past);
  assert.equal(g.xp, 100);
  assert.equal(g.seals, 117);
  assert.deepEqual(productOf(g).dailyPuzzleClaims, [past]);
  assert.equal(productOf(g).dailyTasks[today].solved, 3);
  assert.equal(productOf(g).dailyTasks[past], undefined);
  assert.equal(g.file, 1);
  assert.equal(g.solved, 0);
  const previous = productOf(g).dailyPuzzles[past];
  g = reducer(g, { type: "daily-start", puzzleDate: today, date: now });
  assert.deepEqual(productOf(g).dailyPuzzles[past], previous);
  g = reducer(g, {
    type: "daily-start",
    puzzleDate: past,
    replay: true,
    date: now,
  });
  g = finish(g, past);
  assert.equal(g.xp, 100);
  assert.equal(g.seals, 117);
  assert.equal(productOf(g).dailyTasks[today].solved, 3);
});
test("legacy daily sessions remain accessible without paying and missing new field defaults safely", () => {
  const g = reducer(initialGame(), {
    type: "daily-start",
    date: new Date(2026, 8, 20, 12),
  });
  const data = JSON.parse(JSON.stringify(g));
  delete data.product.unlockedDailyDates;
  const restored = parseSave(JSON.stringify(data));
  assert.deepEqual(productOf(restored).unlockedDailyDates, []);
  assert.equal(
    reducer(restored, { type: "daily-start", puzzleDate: past, date: now })
      .seals,
    100,
  );
});
test("a running daily puzzle remains on its chosen date after local midnight", () => {
  let g = reducer(initialGame(), {
    type: "daily-start",
    puzzleDate: past,
    date: new Date(2026, 8, 20, 23, 59),
  });
  const question = dailyQuestions(past)[0];
  g = reducer(g, {
    type: "session-key",
    mode: "daily",
    puzzleDate: past,
    value: question.term,
    date: now,
  });
  g = reducer(g, {
    type: "session-submit",
    mode: "daily",
    puzzleDate: past,
    date: now,
  });
  assert.deepEqual(productOf(g).dailyPuzzles[past].solved, [question.id]);
  assert.equal(productOf(g).dailyPuzzles[today], undefined);
  assert.equal(g.seals, 100);
});
