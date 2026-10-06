/** Stable tile order; repeated letters remain separate tiles. Never stores answers in progress. */
export function poolTiles(
  term: string,
  seed: string,
  draft: string[],
  revealed: Record<number, string> = {},
  /** False after the İpucu joker: only the answer's own letters stay in the pool. */
  decoyed = true,
) {
  let hash = 2166136261;
  for (const c of seed)
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619) >>> 0;
  const random = () => {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    return hash / 4294967296;
  };
  const letters = [...term];
  const decoys = [..."ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ"].filter(
    (c) => !term.includes(c),
  );
  // Decoys are always drawn, so hiding them leaves the rest of the random sequence unchanged.
  const extra: string[] = [];
  for (let i = 0; i < 3 && decoys.length; i++)
    extra.push(decoys.splice(Math.floor(random() * decoys.length), 1)[0]);
  if (decoyed) letters.push(...extra);
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const used = new Map<string, number>();
  draft.forEach((letter, i) => {
    if (letter && !revealed[i]) used.set(letter, (used.get(letter) ?? 0) + 1);
  });
  return letters.map((letter, id) => {
    const count = used.get(letter) ?? 0;
    used.set(letter, Math.max(0, count - 1));
    return { id, letter, used: count > 0 };
  });
}
