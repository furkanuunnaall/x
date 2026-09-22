import type { Question } from "../content";
import type { Level, Puzzle } from "./model";
import { createPuzzle } from "./puzzle";
import {
  corpusFrequencies,
  letters,
  validateQuestions,
  wordMetrics,
} from "./scoring";
export type GenerationOptions = {
  id: number;
  seed: string;
  title?: string;
  count?: number;
  size?: number;
  targetDifficulty?: number;
  excludeIds?: readonly string[];
};
function hash(value: string) {
  let n = 2166136261;
  for (const char of value) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
  return n >>> 0;
}
// Content authoring API only. Never replaces a published campaign or changes a save.
export function generateLevel(
  pool: readonly Question[],
  options: GenerationOptions,
): Level {
  validateQuestions(pool);
  if (pool.length > 512)
    throw new Error("Generate from a curated pool of at most 512 questions");
  const { id, seed } = options;
  if (!Number.isSafeInteger(id) || id < 1 || !seed || seed.length > 200)
    throw new Error("Positive level ID and a seed (1..200 chars) required");
  const kind = id % 10 === 0 ? "final" : id % 5 === 0 ? "reward" : "normal";
  const count = options.count ?? (kind === "final" ? 9 : 6);
  if (!Number.isInteger(count) || count < 1 || count > 12)
    throw new Error("Word count must be 1..12");
  const difficulty =
    options.targetDifficulty ??
    Math.min(3, 1 + (id - 1) / 20 + (kind === "final" ? 0.5 : 0));
  if (!Number.isFinite(difficulty) || difficulty < 1 || difficulty > 3)
    throw new Error("Target difficulty must be 1..3");
  const excluded = new Set(options.excludeIds ?? []);
  const frequencies = corpusFrequencies(pool);
  const candidates = pool.filter((q) => !excluded.has(q.id));
  if (candidates.length < count)
    throw new Error("Not enough distinct questions after exclusions");
  const metrics = new Map(
    candidates.map((q) => [q.id, wordMetrics(q, frequencies)]),
  );
  let best: Level | undefined,
    bestDistance = Infinity;
  // Bounded alternate starting points, rather than an unbounded random retry loop.
  for (let attempt = 0; attempt < 8; attempt++) {
    const chosen: Question[] = [];
    let puzzle: Puzzle | undefined;
    for (let slot = 0; slot < count; slot++) {
      const selected = new Set(chosen.map((q) => q.id));
      const categories = new Map<string, number>();
      for (const q of chosen)
        categories.set(q.category, (categories.get(q.category) ?? 0) + 1);
      const shared = new Set(chosen.flatMap((q) => letters(q.term)));
      const target = difficulty * 100 + 44;
      const rank = (q: Question) =>
        Math.abs(metrics.get(q.id)!.levelWeight - target) +
        (categories.get(q.category) ?? 0) * 18 -
        letters(q.term).filter((c) => shared.has(c)).length * 2 +
        (hash(`${seed}:${attempt}:${slot}:${q.id}`) % 35);
      const ordered = candidates
        .filter((q) => !selected.has(q.id))
        .sort((a, b) => rank(a) - rank(b) || (a.id < b.id ? -1 : 1));
      let found = false;
      for (const candidate of ordered) {
        const proposal = createPuzzle(
          `generated-v1:${id}:${seed}`,
          [...chosen, candidate],
          { size: options.size, frequencies },
        );
        if (proposal.fullyConnected) {
          chosen.push({ ...candidate, term: letters(candidate.term).join("") });
          puzzle = proposal;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    if (chosen.length !== count || !puzzle) continue;
    const distance = Math.abs(
      chosen.reduce((sum, q) => sum + q.difficulty, 0) / count - difficulty,
    );
    if (distance < bestDistance) {
      bestDistance = distance;
      best = {
        id,
        kind,
        title:
          options.title ??
          (kind === "final" ? `Final Dosyası ${id / 10}` : `Dosya ${id}`),
        questions: chosen,
        puzzle,
      };
    }
  }
  if (!best)
    throw new Error(
      "Could not generate a fully connected level within the bounded search; widen the grid or question pool",
    );
  return best;
}
