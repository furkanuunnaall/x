// Inspired by CrossWordia's longest-first placement and boundary/neighbor checks.
// Reimplemented with sparse cells, direction ownership and deterministic candidate ranking.
// See THIRD_PARTY_NOTICES.md.
import type { Cell, Orientation, Position, PuzzleWord } from "./model";
const key = (p: Position) => `${p.row},${p.col}`;
export function positionAt(
  start: Position,
  direction: Orientation,
  index: number,
): Position {
  return {
    row: start.row + (direction === "down" ? index : 0),
    col: start.col + (direction === "across" ? index : 0),
  };
}
export function checkPlacement(
  cells: ReadonlyMap<string, Cell>,
  term: string,
  start: Position,
  direction: Orientation,
  size: number,
): number | null {
  if (!Number.isInteger(start.row) || !Number.isInteger(start.col)) return null;
  if (
    cells.has(key(positionAt(start, direction, -1))) ||
    cells.has(key(positionAt(start, direction, term.length)))
  )
    return null;
  let intersections = 0;
  for (let i = 0; i < term.length; i++) {
    const pos = positionAt(start, direction, i);
    if (pos.row < 0 || pos.col < 0 || pos.row >= size || pos.col >= size)
      return null;
    const occupied = cells.get(key(pos));
    if (occupied) {
      if (
        occupied.letter !== term[i] ||
        occupied.owners.some((o) => o.orientation === direction) ||
        occupied.owners.length >= 2
      )
        return null;
      intersections++;
    } else {
      const perpendicular = direction === "across" ? "down" : "across";
      if (
        [-1, 1].some((offset) =>
          cells.has(key(positionAt(pos, perpendicular, offset))),
        )
      )
        return null;
    }
  }
  return intersections;
}
export function placeWords(input: readonly PuzzleWord[], size = 25) {
  if (!Number.isInteger(size) || size < 3 || size > 64)
    throw new Error("Grid size must be 3..64");
  if (input.length > 12) throw new Error("At most 12 words per puzzle");
  const words = input.map((w) => ({
    ...w,
    gridPosition: undefined as Position | undefined,
    orientation: undefined as Orientation | undefined,
    crossings: [] as PuzzleWord["crossings"],
  }));
  const cells = new Map<string, Cell>();
  const ordered = [...words].sort(
    (a, b) =>
      b.term.length - a.term.length || (a.questionId < b.questionId ? -1 : 1),
  );
  const put = (word: PuzzleWord, start: Position, orientation: Orientation) => {
    word.gridPosition = start;
    word.orientation = orientation;
    for (let i = 0; i < word.term.length; i++) {
      const p = positionAt(start, orientation, i),
        k = key(p);
      const cell = cells.get(k) ?? { ...p, letter: word.term[i], owners: [] };
      cell.owners.push({
        wordId: word.questionId,
        letterIndex: i,
        orientation,
      });
      cells.set(k, cell);
    }
  };
  // Retry unplaced words after every successful pass; never silently drop them.
  let pending = ordered.filter((w) => w.term.length <= size),
    changed = true;
  while (pending.length && changed) {
    changed = false;
    const remaining: typeof pending = [];
    for (const word of pending) {
      if (!cells.size) {
        put(
          word,
          {
            row: Math.floor(size / 2),
            col: Math.floor((size - word.term.length) / 2),
          },
          "across",
        );
        changed = true;
        continue;
      }
      let best:
        { start: Position; orientation: Orientation; rank: number } | undefined;
      const seen = new Set<string>();
      for (const cell of cells.values())
        for (let i = 0; i < word.term.length; i++) {
          if (word.term[i] !== cell.letter || cell.owners.length !== 1)
            continue;
          const orientation =
            cell.owners[0].orientation === "across" ? "down" : "across";
          const start = positionAt(cell, orientation, -i),
            signature = `${key(start)}:${orientation}`;
          if (seen.has(signature)) continue;
          seen.add(signature);
          const hits = checkPlacement(
            cells,
            word.term,
            start,
            orientation,
            size,
          );
          if (!hits) continue;
          // Prefer many crossings, then a compact extension near the center.
          const end = positionAt(start, orientation, word.term.length - 1);
          const rank =
            hits * 1000 -
            Math.abs(start.row + end.row - size + 1) -
            Math.abs(start.col + end.col - size + 1);
          if (!best || rank > best.rank) best = { start, orientation, rank };
        }
      if (best) {
        put(word, best.start, best.orientation);
        changed = true;
      } else remaining.push(word);
    }
    pending = remaining;
  }
  const allCells = [...cells.values()];
  const minRow = allCells.length ? Math.min(...allCells.map((c) => c.row)) : 0;
  const minCol = allCells.length ? Math.min(...allCells.map((c) => c.col)) : 0;
  for (const w of words)
    if (w.gridPosition)
      w.gridPosition = {
        row: w.gridPosition.row - minRow,
        col: w.gridPosition.col - minCol,
      };
  for (const cell of allCells) {
    cell.row -= minRow;
    cell.col -= minCol;
    if (cell.owners.length === 2)
      for (let i = 0; i < 2; i++) {
        const own = cell.owners[i],
          other = cell.owners[1 - i];
        words
          .find((w) => w.questionId === own.wordId)!
          .crossings.push({
            wordId: other.wordId,
            letterIndex: own.letterIndex,
            otherLetterIndex: other.letterIndex,
            position: { row: cell.row, col: cell.col },
          });
      }
  }
  allCells.sort((a, b) => a.row - b.row || a.col - b.col);
  return {
    words,
    cells: allCells,
    rows: allCells.length ? Math.max(...allCells.map((c) => c.row)) + 1 : 0,
    cols: allCells.length ? Math.max(...allCells.map((c) => c.col)) + 1 : 0,
    unplacedWordIds: words
      .filter((w) => !w.gridPosition)
      .map((w) => w.questionId),
    fullyConnected: words.length > 0 && words.every((w) => !!w.gridPosition),
  };
}
