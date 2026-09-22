import { files, questions } from "../content";
import type { Game } from "../game";
import { createPuzzle } from "./puzzle";
import { corpusFrequencies } from "./scoring";
import { puzzleProgress } from "./state";
// Lazy derived metadata: no grid generation at app startup and no AsyncStorage fields.
export function getCampaignPuzzle(fileId: number) {
  const file = files.find((f) => f.id === fileId);
  if (!file) throw new Error(`Unknown campaign file: ${fileId}`);
  return createPuzzle(`campaign-v1:${file.id}`, file.questions, {
    frequencies: corpusFrequencies(questions),
  });
}
export function getCurrentPuzzleProgress(game: Game) {
  return puzzleProgress(getCampaignPuzzle(game.file), game.run.entries);
}
