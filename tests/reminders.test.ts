import test from "node:test";
import assert from "node:assert/strict";
import { initialGame, type Game } from "../src/game";
import { initialProduct } from "../src/product";
import { planReminders, REMINDER_HOUR } from "../src/reminders";

const game = (changes: Partial<Game>, claims: string[] = []): Game => ({
  ...initialGame(),
  ...changes,
  product: { ...initialProduct(), dailyPuzzleClaims: claims },
});
const at = (day: number, hour: number) => new Date(2026, 9, day, hour);

test("before 13:00 an open puzzle and a streak kept by yesterday share one message", () => {
  const plan = planReminders(game({ lastDay: "2026-10-05", daily: 4 }), at(6, 9));
  assert.equal(plan[0].date.getTime(), at(6, REMINDER_HOUR).getTime());
  assert.equal(plan[0].title, "Bugün iki şey seni bekliyor");
  assert.match(plan[0].body, /4 günlük serini/);
  // Tomorrow the streak is already lost unless today is played, so only the puzzle remains.
  assert.equal(plan[1].title, "Günlük bulmaca hazır");
  assert.equal(plan.length, 14);
});

test("a solved puzzle leaves only the streak, a played day leaves nothing for today", () => {
  let plan = planReminders(game({ lastDay: "2026-10-05", daily: 2 }, ["2026-10-06"]), at(6, 9));
  assert.equal(plan[0].title, "İstikrar serin devam etsin");
  assert.match(plan[0].body, /2 günlük serini/);
  plan = planReminders(game({ lastDay: "2026-10-06", daily: 3 }, ["2026-10-06"]), at(6, 9));
  // Today: puzzle solved and bölüm finished. Tomorrow: the streak of 3 is at risk again.
  assert.equal(plan[0].date.getDate(), 7);
  assert.equal(plan[0].title, "Bugün iki şey seni bekliyor");
  assert.match(plan[0].body, /3 günlük serini/);
  assert.equal(plan[1].title, "Günlük bulmaca hazır");
});

test("after 13:00 today is skipped; without a streak only the puzzle is mentioned", () => {
  const plan = planReminders(game({}), at(6, 15));
  assert.equal(plan[0].date.getTime(), at(7, REMINDER_HOUR).getTime());
  assert.ok(plan.every((r) => r.title === "Günlük bulmaca hazır"));
  assert.equal(plan.length, 13);
});
