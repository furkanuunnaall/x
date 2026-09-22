/** Continue forward through empty cells, wrapping around a selected cell. */
export function nextBlank(draft: string[], after: number): number | null {
  for (let offset = 1; offset <= draft.length; offset++) {
    const index = (after + offset) % draft.length;
    if (!draft[index]) return index;
  }
  return null;
}

/** Skip solved rows; never return the current row as a navigation target. */
export function adjacentUnsolved(
  unresolved: boolean[],
  current: number,
  direction: 1 | -1,
): number | null {
  for (let offset = 1; offset < unresolved.length; offset++) {
    const index =
      (current + direction * offset + unresolved.length) % unresolved.length;
    if (unresolved[index]) return index;
  }
  return null;
}
