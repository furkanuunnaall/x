/** Stable tile order; repeated letters remain separate tiles. Never stores answers in progress. */
export function poolTiles(
  term: string,
  seed: string,
  draft: string[],
  revealed: Record<number, string> = {},
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
  for (let i = 0; i < 3 && decoys.length; i++)
    letters.push(decoys.splice(Math.floor(random() * decoys.length), 1)[0]);
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
