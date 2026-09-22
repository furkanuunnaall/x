import type { Puzzle } from "./model";
export type SolvedEntries = Readonly<
  Record<
    string,
    { solved: boolean; letters?: Readonly<Record<number, string>> } | undefined
  >
>;
// Derived view of existing state. No second save, awards, dispatch or auto-completion.
export function puzzleProgress(puzzle: Puzzle, entries: SolvedEntries) {
  const solvedWordIds = puzzle.words
    .filter((w) => entries[w.questionId]?.solved)
    .map((w) => w.questionId);
  return {
    solvedWordIds,
    remainingWordIds: puzzle.words
      .filter((w) => !entries[w.questionId]?.solved)
      .map((w) => w.questionId),
    complete:
      puzzle.words.length > 0 && solvedWordIds.length === puzzle.words.length,
    visibleCells: puzzle.cells.map((cell) => ({
      row: cell.row,
      col: cell.col,
      letter: cell.owners.some(
        (o) =>
          entries[o.wordId]?.solved ||
          entries[o.wordId]?.letters?.[o.letterIndex] === cell.letter,
      )
        ? cell.letter
        : null,
    })),
  };
}
// Future opt-in mechanic. Computing suggestions never applies a hint or solves a word.
export function crossingHelp(
  puzzle: Puzzle,
  entries: SolvedEntries,
  enabled = false,
) {
  if (!enabled) return [];
  const hints = new Map<
    string,
    {
      wordId: string;
      letterIndex: number;
      letter: string;
      sourceWordId: string;
    }
  >();
  for (const word of puzzle.words) {
    if (!entries[word.questionId]?.solved) continue;
    for (const crossing of word.crossings) {
      if (
        entries[crossing.wordId]?.solved ||
        entries[crossing.wordId]?.letters?.[crossing.otherLetterIndex]
      )
        continue;
      const key = `${crossing.wordId}:${crossing.otherLetterIndex}`;
      hints.set(key, {
        wordId: crossing.wordId,
        letterIndex: crossing.otherLetterIndex,
        letter: word.term[crossing.letterIndex],
        sourceWordId: word.questionId,
      });
    }
  }
  return [...hints.values()];
}
