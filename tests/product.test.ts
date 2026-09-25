import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialGame,
  reducer,
  parseSave,
  entry,
  Game,
  coreReducer,
} from "../src/game";
import { files, questions } from "../src/content";
import { unlockedQuestions } from "../src/discovery/model";
import {
  badges,
  dailyQuestions,
  knownTerms,
  playerLevel,
  productOf,
} from "../src/product";
const date = new Date(2026, 8, 21, 12);
function solve(g: Game, id: string, term: string, at = date) {
  for (const key of term) g = reducer(g, { type: "key", id, key });
  return reducer(g, { type: "submit", id, date: at });
}
function finish(g: Game, at = date) {
  for (const q of files[g.file - 1].questions) g = solve(g, q.id, q.term, at);
  return g;
}
function daily(g: Game, at = date) {
  g = reducer(g, { type: "daily-start", date: at });
  const day = `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
  for (const [index, q] of dailyQuestions(day).entries()) {
    g = reducer(g, { type: "session-select", mode: "daily", index, date: at });
    g = reducer(g, {
      type: "session-key",
      mode: "daily",
      value: q.term,
      date: at,
    });
    g = reducer(g, { type: "session-submit", mode: "daily", date: at });
  }
  return g;
}
test("legacy saves preserve draft, balances and results; new defaults do not award historical level bonuses", () => {
  let old = initialGame();
  delete old.product;
  old.xp = 2410;
  old.seals = 73;
  old.run.entries.q1 = {
    solved: false,
    letters: { 0: "F" },
    draft: ["F", "E"],
    extra: false,
  };
  const loaded = parseSave(JSON.stringify(old));
  assert.equal(loaded.xp, 2410);
  assert.equal(loaded.seals, 73);
  assert.deepEqual(loaded.run, old.run);
  assert.equal(productOf(loaded).claimedPlayerLevel, 3);
  assert.equal(productOf(loaded).hasCompletedOnboarding, false);
  const next = reducer(loaded, { type: "onboard" });
  assert.equal(next.seals, 73);
  assert.equal(productOf(next).notices.length, 0);
});
test("onboarding, character and settings roundtrip without changing economy", () => {
  let g = reducer(initialGame(), { type: "onboard" });
  g = reducer(g, { type: "character", gender: "Kadın", role: "Hakim" });
  g = reducer(g, { type: "setting", key: "sound", value: false });
  g = parseSave(JSON.stringify(g));
  assert.equal(productOf(g).selectedCharacter, "Selin Acar");
  assert.equal(productOf(g).settings.sound, false);
  assert.equal(g.seals, 100);
  assert.equal(g.xp, 0);
});
test("30 real files, three finals, 100+ unique concepts, legacy first five files stable", () => {
  assert.equal(files.length, 30);
  assert.ok(questions.length >= 100);
  assert.equal(new Set(questions.map((q) => q.term)).size, questions.length);
  for (const f of files) {
    assert.equal(f.questions.length, f.id % 10 === 0 ? 9 : 6);
    assert.equal(
      new Set(f.questions.map((q) => q.id)).size,
      f.questions.length,
    );
    if (f.id <= 5)
      assert.deepEqual(
        f.questions.map((q) => q.id),
        Array.from({ length: 6 }, (_, i) => `q${(f.id - 1) * 6 + i + 1}`),
      );
  }
  assert.deepEqual(
    files.filter((f) => f.kind === "final").map((f) => f.id),
    [10, 20, 30],
  );
});
test("normal awards remain identical to core rules, level-up is a separate once-only grant", () => {
  let g = initialGame();
  for (const q of files[0].questions) {
    let baseline = { ...g };
    for (const key of q.term)
      baseline = coreReducer(baseline, { type: "key", id: q.id, key });
    baseline = coreReducer(baseline, { type: "submit", id: q.id, date });
    g = solve(g, q.id, q.term);
    assert.equal(g.xp, baseline.xp);
    assert.equal(g.seals, baseline.seals);
  }
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  const q = files[1].questions[0];
  g = solve(g, q.id, q.term);
  const before = g;
  g = solve(g, files[1].questions[1].id, files[1].questions[1].term);
  assert.equal(g.seals - before.seals, 30);
  assert.equal(playerLevel(g.xp), 2);
  const balance = g.seals;
  g = reducer(g, { type: "select", id: files[1].questions[2].id });
  assert.equal(g.seals, balance);
});
test("daily 3-concept reward is atomic, once per date, repeat-safe, and does not advance campaign", () => {
  const start = initialGame();
  let g = daily(start);
  assert.equal(g.xp, 100);
  assert.equal(g.seals, 120);
  assert.equal(g.file, 1);
  assert.equal(g.solved, 0);
  assert.equal(g.daily, 0);
  assert.deepEqual(g.run, start.run);
  g = parseSave(JSON.stringify(g));
  g = reducer(g, { type: "daily-start", replay: true, date });
  g = daily(g);
  assert.equal(g.xp, 100);
  assert.equal(g.seals, 120);
  g = daily(g, new Date(2026, 8, 22, 12));
  assert.equal(g.xp, 200);
  assert.equal(g.seals, 140);
  g = daily(g, date);
  assert.equal(g.seals, 140);
});
test("daily tasks reflect today's actions, claims and 3/3 bonus cannot duplicate, next day starts empty", () => {
  let g = finish(initialGame());
  let base = g.seals;
  for (let index = 0; index < 3; index++)
    g = reducer(g, { type: "task-claim", index, date });
  g = reducer(g, { type: "task-bonus", date });
  assert.equal(g.seals, base + 60);
  const saved = g;
  for (let index = 0; index < 3; index++)
    g = reducer(g, { type: "task-claim", index, date });
  g = reducer(g, { type: "task-bonus", date });
  assert.deepEqual(g, saved);
  g = reducer(g, { type: "task-bonus", date: new Date(2026, 8, 22, 12) });
  assert.deepEqual(g, saved);
});
test("milestone free letter consumes one token without spending seals; invalid hint does not consume", () => {
  let g = initialGame();
  for (let i = 1; i <= 5; i++) {
    g = finish(g);
    if (i < 5) g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  }
  const balance = g.seals;
  g = reducer(g, { type: "milestone", file: 5 });
  assert.equal(g.seals, balance + 50);
  assert.equal(productOf(g).freeLetters, 1);
  assert.equal(reducer(g, { type: "milestone", file: 5 }), g);
  g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  const q = files[5].questions[0];
  const before = g;
  g = reducer(g, { type: "hint", id: q.id, hint: "letter", index: 99 });
  assert.equal(g, before);
  g = reducer(g, { type: "hint", id: q.id, hint: "letter", index: 0 });
  assert.equal(g.seals, before.seals);
  assert.equal(productOf(g).freeLetters, 0);
  assert.equal(entry(g, q.id).letters[0], q.term[0]);
});
test("final awards and final achievement persist once; replay never changes earned statistics", () => {
  let g = initialGame();
  for (let i = 1; i <= 10; i++) {
    g = finish(g);
    if (i < 10) g = reducer(reducer(g, { type: "seal" }), { type: "next" });
  }
  const final = g.results.at(-1)!;
  assert.equal(final.file, 10);
  assert.equal(final.count, 9);
  assert.equal(final.seals, 150);
  assert.equal(final.xp, g.run.xp + 250);
  assert.ok(productOf(g).unlockedAchievements.includes("final"));
  g = parseSave(JSON.stringify(g));
  const before = g;
  g = reducer(g, { type: "replay-start", file: 10 });
  for (const [index, q] of files[9].questions.entries()) {
    g = reducer(g, { type: "session-select", mode: "replay", index });
    g = reducer(g, { type: "session-key", mode: "replay", value: q.term });
    g = reducer(g, { type: "session-submit", mode: "replay" });
  }
  for (const key of ["xp", "seals", "solved", "daily", "best", "file"] as const)
    assert.equal(g[key], before[key]);
  assert.deepEqual(g.results, before.results);
  assert.deepEqual(g.run, before.run);
});
test("all 30 files end safely; distinct concept badges are achievable, notices do not duplicate", () => {
  let g = initialGame();
  for (let i = 1; i <= 30; i++) {
    g = finish(g, new Date(2026, 8, i, 12));
    g = reducer(g, { type: "seal" });
    if (i < 30) g = reducer(g, { type: "next" });
  }
  assert.equal(g.file, 30);
  assert.equal(g.results.length, 30);
  assert.ok(knownTerms(g).length >= 100);
  assert.ok(productOf(g).unlockedAchievements.includes("hundred"));
  assert.ok(productOf(g).unlockedAchievements.includes("streak"));
  assert.equal(reducer(g, { type: "next" }), g);
  assert.deepEqual(parseSave(JSON.stringify(g)), g);
  const notice = productOf(g).notices[0];
  g = reducer(g, { type: "notice-dismiss", id: notice.id });
  assert.equal(
    productOf(g).notices.some((n) => n.id === notice.id),
    false,
  );
});
test("corrupt V1 fields are rejected; partial settings get defaults", () => {
  const g = initialGame();
  g.product!.settings = { sound: false } as any;
  const loaded = parseSave(JSON.stringify(g));
  assert.equal(productOf(loaded).settings.vibration, true);
  g.product!.freeLetters = -1;
  assert.throws(() => parseSave(JSON.stringify(g)));
});

test("player names normalize, persist independently of character and reject blank names", () => {
  let g = initialGame();
  assert.equal(
    reducer(g, { type: "player-name", firstName: " ", lastName: "Kaya" }),
    g,
  );
  g = reducer(g, {
    type: "player-name",
    firstName: "  Çağla   Nur ",
    lastName: "Öztürk",
  });
  g = reducer(g, { type: "character", gender: "Kadın", role: "Hakim" });
  g = parseSave(JSON.stringify(g));
  assert.equal(productOf(g).firstName, "Çağla Nur");
  assert.equal(productOf(g).lastName, "Öztürk");
  assert.equal(g.xp, 0);
  assert.equal(g.seals, 100);
  const old = JSON.parse(JSON.stringify(g));
  delete old.product.firstName;
  delete old.product.lastName;
  assert.equal(productOf(parseSave(JSON.stringify(old))).firstName, "");
});
test("terms solved in the daily puzzle join the concept collection", () => {
  const g = daily(initialGame());
  const terms = dailyQuestions("2026-09-21").map((q) => q.id);
  const collection = unlockedQuestions(g).map((q) => q.id);
  assert.ok(terms.every((id) => collection.includes(id)));
  assert.ok(terms.every((id) => knownTerms(g).some((q) => q.id === id)));
  assert.equal(unlockedQuestions(initialGame()).length, 0);
});
