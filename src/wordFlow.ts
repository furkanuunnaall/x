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

/** The letters of a term in a fixed shuffled order (never the term itself), for the İpucu joker. */
export function scrambled(term: string, seed: string): string[] {
  let hash = 2166136261;
  for (const c of seed) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    return hash / 4294967296;
  };
  const letters = [...term];
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  // A shuffle that lands on the answer would give it away; rotate until it differs.
  for (let i = 0; i < letters.length && letters.join("") === term; i++)
    letters.push(letters.shift()!);
  return letters;
}
