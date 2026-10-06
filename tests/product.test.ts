import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialGame,
  reducer,
  parseSave,
  entry,
  Game,
  coreReducer,
  normalize,
} from "../src/game";
import { files, questions } from "../src/content";
import { unlockedQuestions } from "../src/discovery/model";
import {
  badges,
  dailyQuestions,
  knownTerms,
  playerLevel,
  productOf,
  stampBoard,
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
  const first = files[0].questions[0];
  old.run.entries[first.id] = {
    solved: false,
    letters: { 0: first.term[0] },
    draft: [first.term[0], first.term[1]],
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
test("80 bölüm in ten-bölüm volumes, four to six terms, six-term finals, no answer in its own title", () => {
  assert.equal(files.length, 80);
  assert.equal(new Set(questions.map((q) => q.term)).size, questions.length);
  assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
  for (const f of files) {
    if (f.id % 10 === 0) assert.equal(f.questions.length, 6);
    else assert.ok(f.questions.length >= 4 && f.questions.length <= 6, `bölüm ${f.id}`);
    assert.equal(new Set(f.questions.map((q) => q.id)).size, f.questions.length);
    for (const q of f.questions) {
      assert.ok(q.term.length <= 10, q.term);
      assert.ok(!normalize(f.title).includes(q.term), `${f.title}: ${q.term}`);
      assert.ok(!normalize(q.clue).includes(q.term), q.term);
      assert.ok(!normalize(q.explanation).includes(q.term), q.term);
      for (const other of f.questions)
        assert.ok(other === q || !other.term.includes(q.term), `${q.term} / ${other.term}`);
    }
  }
  assert.deepEqual(
    files.filter((f) => f.kind === "final").map((f) => f.id),
    [10, 20, 30, 40, 50, 60, 70, 80],
  );
  // Volumes get harder, and a term returns only rarely (in finals).
  const avg = (v: number) =>
    files.slice(v * 10, v * 10 + 10).flatMap((f) => f.questions)
      .reduce((sum, q, _, all) => sum + q.difficulty / all.length, 0);
  for (let v = 1; v < 8; v++) assert.ok(avg(v) >= avg(v - 1), `volume ${v + 1}`);
  // Inside volumes 2-8 the climb is easy → medium → hard; volume 1 stays easy.
  const level = (f: (typeof files)[number]) =>
    f.questions.reduce((sum, q) => sum + q.difficulty / f.questions.length, 0);
  for (const f of files.slice(0, 10)) assert.ok(Math.abs(level(f) - 1) < 1e-9, `bölüm ${f.id}`);
  for (let v = 1; v < 8; v++) {
    const vol = files.slice(v * 10, v * 10 + 10).map(level);
    for (let i = 1; i < 10; i++) assert.ok(vol[i] >= vol[i - 1] - 1e-9, `bölüm ${v * 10 + i + 1}`);
    assert.ok(Math.abs(vol[9] - 3) < 1e-9, `final ${v * 10 + 10}`);
  }
  // The KOLAY / ORTA / ZOR tag matches what each bölüm asks.
  for (const f of files) {
    if (f.level === 1) assert.ok(f.questions.every((q) => q.difficulty <= 2), `bölüm ${f.id}`);
    if (f.level === 2) assert.ok(f.questions.every((q) => q.difficulty === 2), `bölüm ${f.id}`);
    if (f.level === 3) assert.ok(f.questions.every((q) => q.difficulty === 3), `bölüm ${f.id}`);
  }
  const uses = new Map<string, number>();
  for (const q of files.flatMap((f) => f.questions)) uses.set(q.id, (uses.get(q.id) ?? 0) + 1);
  const repeated = [...uses.values()].filter((n) => n > 1).length;
  assert.ok(repeated > 0 && repeated <= 40, `${repeated} repeated terms`);
  assert.ok([...uses.values()].every((n) => n <= 2));
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
  // Just below level 2, so the next answer crosses it without finishing the bölüm.
  const before = { ...g, xp: 990 };
  g = solve(before, files[1].questions[1].id, files[1].questions[1].term);
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
  // Two short bölüm: enough for the five-concept task.
  let g = finish(reducer(reducer(finish(initialGame()), { type: "seal" }), { type: "next" }));
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
  assert.equal(final.count, 6);
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
test("all bölüm end safely; distinct concept badges are achievable, notices do not duplicate", () => {
  let g = initialGame();
  for (let i = 1; i <= files.length; i++) {
    g = finish(g, new Date(2026, 8, i, 12));
    g = reducer(g, { type: "seal" });
    if (i < files.length) g = reducer(g, { type: "next" });
  }
  assert.equal(g.file, files.length);
  assert.equal(g.results.length, files.length);
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
test("theme setting defaults to night, persists, and rejects unknown modes", () => {
  let g = initialGame();
  assert.equal(productOf(g).settings.theme, "dark");
  g = reducer(g, { type: "setting", key: "theme", value: "auto" });
  g = parseSave(JSON.stringify(g));
  assert.equal(productOf(g).settings.theme, "auto");
  const legacy = initialGame();
  legacy.product!.settings = { sound: true, vibration: true, reduceMotion: false } as any;
  assert.equal(productOf(parseSave(JSON.stringify(legacy))).settings.theme, "dark");
  legacy.product!.settings = { ...legacy.product!.settings, theme: "sepia" } as any;
  assert.throws(() => parseSave(JSON.stringify(legacy)));
});

test("streak screens are remembered once per day and old saves get defaults", () => {
  let g = initialGame();
  assert.equal(productOf(g).streakSeen, null);
  g = reducer(g, { type: "streak-seen", kind: "kept", day: "2026-10-02" });
  g = reducer(g, { type: "streak-seen", kind: "lost", day: "2026-09-28" });
  g = parseSave(JSON.stringify(g));
  assert.equal(productOf(g).streakSeen, "2026-10-02");
  assert.equal(productOf(g).streakLossSeen, "2026-09-28");
  const legacy = initialGame();
  delete (legacy.product as any).streakSeen;
  assert.equal(productOf(parseSave(JSON.stringify(legacy))).streakSeen, null);
  legacy.product!.streakLossSeen = "dün" as any;
  assert.throws(() => parseSave(JSON.stringify(legacy)));
});

test("daily envelopes: one pick per day, fixed board, jackpot always present", () => {
  let g = initialGame();
  const before = g.seals;
  const date = new Date(2026, 9, 2, 10);
  const board = stampBoard("2026-10-02");
  assert.deepEqual([...board].sort((a, b) => a - b), [15, 15, 15, 20, 25, 25, 40, 60, 100]);
  assert.deepEqual(stampBoard("2026-10-02"), board);
  assert.notDeepEqual(stampBoard("2026-10-03"), board);
  g = reducer(g, { type: "daily-stamp", index: 4, date });
  assert.equal(g.seals, before + board[4]);
  assert.deepEqual(productOf(g).dailyStamp, { day: "2026-10-02", index: 4, amount: board[4] });
  assert.equal(reducer(g, { type: "daily-stamp", index: 0, date }).seals, before + board[4]);
  assert.equal(reducer(initialGame(), { type: "daily-stamp", index: 9, date }).seals, before);
  g = parseSave(JSON.stringify(g));
  assert.equal(productOf(g).dailyStamp?.index, 4);
  g.product!.dailyStamp = { day: "2026-10-02", index: 4, amount: 999 };
  assert.throws(() => parseSave(JSON.stringify(g)));
});
