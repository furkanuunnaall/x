// CrossWordia inverse-frequency + length scoring, adapted for MÜHÜR's corpus.
// See THIRD_PARTY_NOTICES.md. These values are NEVER XP or hint prices.
import type { Question } from "../content";
export const ALPHABET = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
export function letters(term: string): string[] {
  const normalized = term.normalize("NFC").toLocaleUpperCase("tr-TR");
  if (!normalized || [...normalized].some((c) => !ALPHABET.includes(c)))
    throw new Error(`Invalid Turkish term: ${term}`);
  return [...normalized];
}
export type Frequencies = Readonly<Record<string, number>>;
export function corpusFrequencies(questions: readonly Question[]): Frequencies {
  // Add-one smoothing; corpus frequencies, not claimed Turkish-language statistics.
  const counts: Record<string, number> = Object.fromEntries(
    [...ALPHABET].map((c) => [c, 1]),
  );
  let total = ALPHABET.length;
  const seen = new Set<string>();
  for (const q of questions) {
    const chars = letters(q.term),
      term = chars.join("");
    if (seen.has(term)) continue;
    seen.add(term);
    for (const c of chars) {
      counts[c]++;
      total++;
    }
  }
  return Object.freeze(
    Object.fromEntries(Object.entries(counts).map(([c, n]) => [c, n / total])),
  );
}
export function scoreWord(term: string, frequencies: Frequencies): number {
  const chars = letters(term);
  return chars.reduce((sum, c) => {
    const frequency = frequencies[c];
    if (!Number.isFinite(frequency) || frequency <= 0 || frequency > 1)
      throw new Error(`Missing/invalid frequency: ${c}`);
    return sum + Math.round(1 / frequency);
  }, chars.length * 10);
}
export function wordMetrics(q: Question, frequencies: Frequencies) {
  const letterScore = scoreWord(q.term, frequencies);
  // Editorial legal difficulty dominates; rare letters contribute only a bounded amount.
  const levelWeight =
    q.difficulty * 100 +
    letters(q.term).length * 4 +
    Math.min(60, Math.round(letterScore / 20));
  return { letterScore, levelWeight };
}
export function validateQuestions(questions: readonly Question[]) {
  if (questions.length > 5000)
    throw new Error("Question pool exceeds 5000 entries");
  const ids = new Set<string>(),
    terms = new Set<string>();
  for (const q of questions) {
    const term = letters(q.term).join("");
    if (!q.id || ids.has(q.id) || terms.has(term))
      throw new Error("Duplicate question ID or term");
    if (
      term.length > 32 ||
      ![1, 2, 3].includes(q.difficulty) ||
      !q.clue?.trim() ||
      !q.explanation?.trim() ||
      !q.category?.trim()
    )
      throw new Error(`Invalid question: ${q.id}`);
    ids.add(q.id);
    terms.add(term);
  }
}
