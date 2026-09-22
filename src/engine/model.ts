import type { Question } from "../content";
export type Orientation = "across" | "down";
export type Position = { row: number; col: number };
export type Crossing = {
  wordId: string;
  letterIndex: number;
  otherLetterIndex: number;
  position: Position;
};
// Position belongs to a word's occurrence in a puzzle, never to the shared question.
export type PuzzleWord = {
  questionId: string;
  term: string;
  letterScore: number;
  levelWeight: number;
  gridPosition?: Position;
  orientation?: Orientation;
  crossings: Crossing[];
};
export type Cell = Position & {
  letter: string;
  owners: { wordId: string; letterIndex: number; orientation: Orientation }[];
};
export type Puzzle = {
  version: 1;
  id: string;
  words: PuzzleWord[];
  cells: Cell[];
  rows: number;
  cols: number;
  unplacedWordIds: string[];
  fullyConnected: boolean;
  averageWeight: number;
};
export type Level = {
  id: number;
  kind: "normal" | "reward" | "final";
  title: string;
  questions: Question[];
  puzzle: Puzzle;
};
