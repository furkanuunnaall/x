import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { files, questions, type Question } from "../src/content";
import { initialGame, reducer } from "../src/game";
import {
  createPuzzle,
  corpusFrequencies,
  scoreWord,
  letters,
  generateLevel,
  puzzleProgress,
  crossingHelp,
  getCampaignPuzzle,
  getCurrentPuzzleProgress,
} from "../src/engine";
import { checkPlacement, positionAt } from "../src/engine/grid";
import type { Cell, Puzzle } from "../src/engine";
const q = (id: string, term: string): Question => ({
  id,
  term,
  clue: "Özgün tanım",
  explanation: "Kısa açıklama",
  difficulty: 1,
  category: "Usul",
});
function assertGrid(p: Puzzle) {
  const cells = new Map(p.cells.map((c) => [`${c.row},${c.col}`, c]));
  assert.equal(cells.size, p.cells.length);
  for (const cell of p.cells) {
    assert.ok(
      cell.row >= 0 && cell.row < p.rows && cell.col >= 0 && cell.col < p.cols,
    );
    assert.ok(cell.owners.length >= 1 && cell.owners.length <= 2);
    assert.equal(
      new Set(cell.owners.map((o) => o.orientation)).size,
      cell.owners.length,
    );
    for (const owner of cell.owners) {
      const word = p.words.find((w) => w.questionId === owner.wordId)!;
      assert.equal(word.term[owner.letterIndex], cell.letter);
      assert.deepEqual(
        positionAt(word.gridPosition!, owner.orientation, owner.letterIndex),
        { row: cell.row, col: cell.col },
      );
    }
  }
  for (const w of p.words) {
    if (!w.gridPosition) {
      assert.ok(p.unplacedWordIds.includes(w.questionId));
      continue;
    }
    for (const i of [-1, w.term.length]) {
      const pos = positionAt(w.gridPosition, w.orientation!, i);
      assert.ok(!cells.has(`${pos.row},${pos.col}`));
    }
    for (let i = 0; i < w.term.length; i++) {
      const pos = positionAt(w.gridPosition, w.orientation!, i),
        cell = cells.get(`${pos.row},${pos.col}`)!;
      if (cell.owners.length === 1)
        for (const offset of [-1, 1]) {
          const neighbor = positionAt(
            pos,
            w.orientation === "across" ? "down" : "across",
            offset,
          );
          assert.ok(!cells.has(`${neighbor.row},${neighbor.col}`));
        }
    }
    for (const cross of w.crossings) {
      const other = p.words.find((x) => x.questionId === cross.wordId)!;
      assert.equal(
        w.term[cross.letterIndex],
        other.term[cross.otherLetterIndex],
      );
      assert.ok(
        other.crossings.some(
          (x) =>
            x.wordId === w.questionId &&
            x.letterIndex === cross.otherLetterIndex &&
            x.otherLetterIndex === cross.letterIndex,
        ),
      );
    }
  }
}
test("Turkish normalization preserves dotted/dotless I, combines Unicode and rejects unsupported input", () => {
  assert.equal(letters("iıçğöşü").join(""), "İIÇĞÖŞÜ");
  assert.equal(letters("I\u0307BRA").join(""), "İBRA");
  for (const invalid of ["", "A B", "TEST1", "Q", "🙂"])
    assert.throws(() => letters(invalid));
});
test("corpus rarity scoring is deterministic, counts duplicate letters and remains separate from rewards", () => {
  const f = corpusFrequencies([q("a", "AAAA"), q("b", "AZ")]);
  assert.ok(scoreWord("Z", f) > scoreWord("A", f));
  assert.equal(scoreWord("AA", f), scoreWord("A", f) * 2);
  assert.deepEqual(
    f,
    corpusFrequencies([q("b", "AZ"), q("a", "AAAA"), q("c", "AZ")]),
  );
  assert.throws(() => scoreWord("A", {}));
});
test("placement enforces bounds, perpendicular crossings, mismatches, neighbors and word-end gaps", () => {
  const cell: Cell = {
    row: 3,
    col: 3,
    letter: "A",
    owners: [{ wordId: "old", letterIndex: 0, orientation: "across" }],
  };
  const board = new Map([["3,3", cell]]);
  assert.equal(checkPlacement(board, "KAR", { row: 2, col: 3 }, "down", 7), 1);
  assert.equal(
    checkPlacement(board, "KAR", { row: 3, col: 2 }, "across", 7),
    null,
  );
  assert.equal(
    checkPlacement(board, "KİR", { row: 2, col: 3 }, "down", 7),
    null,
  );
  assert.equal(
    checkPlacement(board, "KAR", { row: 2, col: 2 }, "down", 7),
    null,
  );
  assert.equal(
    checkPlacement(board, "KAR", { row: 0, col: 3 }, "down", 7),
    null,
  );
  assert.equal(
    checkPlacement(board, "KAR", { row: -1, col: 0 }, "down", 7),
    null,
  );
  assert.equal(
    checkPlacement(board, "KAR", { row: 6, col: 0 }, "down", 7),
    null,
  );
});
test("all campaign layouts have valid symmetric crossings and retain every question", () => {
  for (const file of files) {
    const p = getCampaignPuzzle(file.id);
    assertGrid(p);
    assert.deepEqual(
      p.words.map((w) => w.questionId),
      file.questions.map((q) => q.id),
    );
    assert.equal(
      p.words.length,
      p.words.filter((w) => !!w.gridPosition).length + p.unplacedWordIds.length,
    );
    assert.deepEqual(p, getCampaignPuzzle(file.id));
  }
});
test("disconnected/oversized terms remain explicit and completion requires them too", () => {
  const p = createPuzzle(
    "test",
    [q("a", "AAA"), q("b", "ZZZ"), q("c", "BBBBBBBB")],
    { size: 5 },
  );
  assert.equal(p.fullyConnected, false);
  assert.equal(p.unplacedWordIds.length, 2);
  assert.equal(puzzleProgress(p, { a: { solved: true } }).complete, false);
  assert.equal(
    puzzleProgress(p, {
      a: { solved: true },
      b: { solved: true },
      c: { solved: true },
    }).complete,
    true,
  );
  assert.equal(puzzleProgress(createPuzzle("empty", []), {}).complete, false);
});
test("crossing assistance is opt-in, never leaks unsolved answers and never mutates saved entries", () => {
  const p = createPuzzle("test", [q("a", "KARAR"), q("b", "İKRAR")]);
  assert.ok(p.fullyConnected);
  const entries = {
    a: { solved: true, letters: {} },
    b: { solved: false, letters: {} },
  };
  const before = JSON.stringify(entries);
  assert.deepEqual(crossingHelp(p, entries), []);
  const hints = crossingHelp(p, entries, true);
  assert.ok(hints.length > 0);
  assert.ok(hints.every((h) => h.sourceWordId === "a" && h.wordId === "b"));
  assert.equal(puzzleProgress(p, entries).complete, false);
  assert.ok(puzzleProgress(p, {}).visibleCells.every((c) => c.letter === null));
  assert.equal(JSON.stringify(entries), before);
  assert.deepEqual(
    crossingHelp(p, { a: { solved: true }, b: { solved: true } }, true),
    [],
  );
});
test("generation is seeded, input-order independent, connected and respects count/kind/exclusions", () => {
  const options = {
    id: 31,
    seed: "muhur-engine-v1",
    excludeIds: [questions[0].id],
  };
  const input = JSON.stringify(questions),
    a = generateLevel(questions, options);
  assert.deepEqual(a, generateLevel([...questions].reverse(), options));
  assert.equal(a.questions.length, 6);
  assert.equal(a.kind, "normal");
  assert.ok(a.puzzle.fullyConnected);
  assert.ok(!a.questions.some((q) => q.id === questions[0].id));
  assertGrid(a.puzzle);
  assert.equal(JSON.stringify(questions), input);
  const final = generateLevel(questions, { id: 40, seed: "final" });
  assert.equal(final.kind, "final");
  assert.equal(final.questions.length, 9);
  assertGrid(final.puzzle);
  assert.ok(final.puzzle.averageWeight > a.puzzle.averageWeight);
  const reward = generateLevel(questions, { id: 35, seed: "reward" });
  assert.equal(reward.kind, "reward");
});
test("harder targets generate higher editorial difficulty for the same corpus", () => {
  const easy = generateLevel(questions, {
    id: 31,
    seed: "balance",
    targetDifficulty: 1,
  });
  const hard = generateLevel(questions, {
    id: 31,
    seed: "balance",
    targetDifficulty: 3,
  });
  const avg = (list: Question[]) =>
    list.reduce((n, q) => n + q.difficulty, 0) / list.length;
  assert.ok(avg(hard.questions) > avg(easy.questions));
});
test("generation fails explicitly on impossible or invalid requests instead of hanging or returning partial levels", () => {
  assert.throws(() =>
    generateLevel([q("a", "AAA"), q("b", "ZZZ")], {
      id: 1,
      seed: "x",
      count: 2,
    }),
  );
  for (const options of [
    { id: 0, seed: "x" },
    { id: 1, seed: "" },
    { id: 1, seed: "x", count: 13 },
    { id: 1, seed: "x", size: 100 },
    { id: 1, seed: "x", targetDifficulty: NaN },
  ])
    assert.throws(() => generateLevel(questions, options));
  assert.throws(() => createPuzzle("dupe", [q("a", "İBRA"), q("a", "İKRAR")]));
  assert.throws(() => createPuzzle("dupe", [q("a", "İBRA"), q("b", "ibra")]));
});
test("campaign remains byte-equivalent in JSON and engine reads do not modify reducer or saves", () => {
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
  const before = JSON.stringify(game),
    p = getCurrentPuzzleProgress(game);
  assert.ok(p.solvedWordIds.includes(first.id));
  assert.equal(p.complete, false);
  assert.equal(game.xp, 100);
  assert.equal(JSON.stringify(game), before);
});

test("new authored levels canonicalize Turkish terms without modifying source questions", () => {
  const source = [q("a", "karar"), q("b", "ikrar")];
  const level = generateLevel(source, { id: 1, seed: "case", count: 2 });
  assert.ok(level.questions.every(question => question.term === letters(question.term).join("")));
  assert.equal(source[0].term, "karar");
  assert.ok(level.puzzle.fullyConnected);
});
