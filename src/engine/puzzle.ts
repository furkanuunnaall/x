import type { Question } from "../content";
import type { Puzzle } from "./model";
import {
  corpusFrequencies,
  letters,
  validateQuestions,
  wordMetrics,
  type Frequencies,
} from "./scoring";
import { placeWords } from "./grid";
export function createPuzzle(
  id: string,
  questions: readonly Question[],
  options: { size?: number; frequencies?: Frequencies } = {},
): Puzzle {
  if (!id) throw new Error("Puzzle ID required");
  validateQuestions(questions);
  const frequencies = options.frequencies ?? corpusFrequencies(questions);
  const result = placeWords(
    questions.map((q) => ({
      questionId: q.id,
      term: letters(q.term).join(""),
      ...wordMetrics(q, frequencies),
      crossings: [],
    })),
    options.size,
  );
  return {
    version: 1,
    id,
    ...result,
    averageWeight: result.words.length
      ? result.words.reduce((sum, w) => sum + w.levelWeight, 0) /
        result.words.length
      : 0,
  };
}
