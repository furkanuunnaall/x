import {
  initialProduct,
  migrateProduct,
  productOf,
  applyProduct,
  enrichProgress,
  type Product,
  type ProductAction,
} from "./product";
import { files } from "./content";
export type Hint = "letter" | "first" | "extra" | "word";
export const costs: Record<Hint, number> = {
  letter: 20,
  first: 30,
  extra: 40,
  word: 60,
};
export type Entry = {
  solved: boolean;
  letters: Record<number, string>;
  extra: boolean;
  draft: string[];
};
export type Run = {
  combo?: number;
  entries: Record<string, Entry>;
  mistakes: number;
  hints: number;
  xp: number;
  best: number;
};
export type Result = {
  mistakes?: number;
  file: number;
  stars: number;
  xp: number;
  seals: number;
  hints: number;
  best: number;
  count: number;
  sealed: boolean;
};
export type Game = {
  product?: Product;
  selected?: string;
  version: 1;
  file: number;
  xp: number;
  seals: number;
  combo: number;
  best: number;
  solved: number;
  daily: number;
  lastDay: string | null;
  run: Run;
  results: Result[];
};
export const emptyRun = (): Run => ({
  combo: 0,
  entries: {},
  mistakes: 0,
  hints: 0,
  xp: 0,
  best: 0,
});
export const initialGame = (): Game => ({
  product: initialProduct(),
  version: 1,
  file: 1,
  xp: 0,
  seals: 100,
  combo: 0,
  best: 0,
  solved: 0,
  daily: 0,
  lastDay: null,
  run: emptyRun(),
  results: [],
});
export const entry = (g: Game, id: string): Entry =>
  g.run.entries[id] ?? { solved: false, letters: {}, extra: false, draft: [] };
export const normalize = (s: string) =>
  s
    .trim()
    .normalize("NFC")
    .toLocaleUpperCase("tr-TR")
    .replace(/Â/g, "A")
    .replace(/Î/g, "İ")
    .replace(/Û/g, "U");
export const reward = (combo: number) =>
  combo >= 5 ? 150 : 100 + (Math.max(1, combo) - 1) * 10;
export const stars = (mistakes: number, hints: number) =>
  mistakes === 0 && hints <= 2 ? 3 : mistakes <= 2 ? 2 : 1;
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dailyNow = (g: Game, date = new Date()) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return g.lastDay === dayKey(date) || g.lastDay === dayKey(yesterday)
    ? g.daily
    : 0;
};
export type CoreAction =
  | { type: "key"; id: string; key: string; index?: number }
  | { type: "select"; id: string }
  | { type: "clear"; id: string }
  | { type: "delete"; id: string }
  | { type: "submit"; id: string; date?: Date }
  | { type: "hint"; id: string; hint: Hint; index?: number }
  | { type: "seal" }
  | { type: "next" };
export function coreReducer(g: Game, a: CoreAction): Game {
  const completed = g.results.find((r) => r.file === g.file);
  if (a.type === "seal")
    return completed && !completed.sealed
      ? {
          ...g,
          results: g.results.map((r) =>
            r.file === g.file ? { ...r, sealed: true } : r,
          ),
        }
      : g;
  if (a.type === "next")
    return completed?.sealed && g.file < files.length
      ? { ...g, file: g.file + 1, selected: undefined, run: emptyRun() }
      : g;
  const q = files[g.file - 1]?.questions.find((q) => q.id === a.id);
  if (q && a.type === "select")
    return g.selected === q.id ? g : { ...g, selected: q.id };
  if (!q || completed) return g;
  const e = entry(g, q.id);
  if (e.solved) return g;
  const update = (
    next: Entry,
    other: Partial<Game> = {},
    run: Partial<Run> = {},
  ): Game => ({
    ...g,
    selected: q.id,
    ...other,
    run: { ...g.run, ...run, entries: { ...g.run.entries, [q.id]: next } },
  });
  const draft = Array.from(
    { length: q.term.length },
    (_, i) => e.letters[i] ?? e.draft[i] ?? "",
  );
  if (a.type === "key") {
    const index = a.index ?? draft.findIndex((c, i) => !c && !e.letters[i]);
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= draft.length ||
      e.letters[index] ||
      !/^[A-ZÇĞİÖŞÜ]$/.test(a.key)
    )
      return g;
    draft[index] = a.key;
    return update({ ...e, draft });
  }
  if (a.type === "clear")
    return update({ ...e, draft: draft.map((_, i) => e.letters[i] ?? "") });
  if (a.type === "delete") {
    for (let i = draft.length - 1; i >= 0; i--)
      if (draft[i] && !e.letters[i]) {
        draft[i] = "";
        break;
      }
    return update({ ...e, draft });
  }
  if (a.type === "hint") {
    if (g.seals < costs[a.hint]) return g;
    if (a.hint === "word") {
      if (Object.keys(e.letters).length === q.term.length) return g;
      const letters = Object.fromEntries(
        q.term.split("").map((letter, i) => [i, letter]),
      );
      return update(
        { ...e, letters, draft: q.term.split("") },
        { seals: g.seals - costs.word },
        { hints: g.run.hints + 1 },
      );
    }
    if (a.hint === "extra")
      return e.extra
        ? g
        : update(
            { ...e, extra: true },
            { seals: g.seals - 40 },
            { hints: g.run.hints + 1 },
          );
    const i =
      a.hint === "first"
        ? 0
        : (a.index ?? q.term.split("").findIndex((_, i) => !e.letters[i]));
    if (!Number.isInteger(i) || i < 0 || i >= draft.length || e.letters[i])
      return g;
    draft[i] = q.term[i];
    return update(
      { ...e, draft, letters: { ...e.letters, [i]: q.term[i] } },
      { seals: g.seals - costs[a.hint] },
      { hints: g.run.hints + 1 },
    );
  }
  if (a.type !== "submit" || draft.some((c) => !c)) return g;
  if (normalize(draft.join("")) !== q.term)
    return update(
      { ...e, draft: draft.map((_, i) => e.letters[i] ?? "") },
      { combo: 0 },
      { mistakes: g.run.mistakes + 1, combo: 0 },
    );
  const combo = g.combo + 1,
    xp = reward(combo),
    runCombo = (g.run.combo ?? 0) + 1,
    best = Math.max(g.run.best, runCombo);
  let next = update(
    { ...e, solved: true, draft: q.term.split("") },
    {
      combo,
      best: Math.max(g.best, combo),
      xp: g.xp + xp,
      solved: g.solved + 1,
    },
    { xp: g.run.xp + xp, best, combo: runCombo },
  );
  if (files[g.file - 1].questions.every((q) => entry(next, q.id).solved)) {
    const date = a.date ?? new Date(),
      today = dayKey(date);
    next = {
      ...next,
      seals: next.seals + 50,
      daily: g.lastDay === today ? g.daily : dailyNow(g, date) + 1,
      lastDay: today,
      results: [
        ...g.results,
        {
          file: g.file,
          mistakes: g.run.mistakes,
          stars: stars(g.run.mistakes, g.run.hints),
          xp: next.run.xp,
          seals: 50,
          hints: g.run.hints,
          best,
          count: files[g.file - 1].questions.length,
          sealed: false,
        },
      ],
    };
  }
  return next;
}
export function parseSave(raw: string): Game {
  const g = JSON.parse(raw) as Game;
  if (
    !g ||
    g.version !== 1 ||
    !Number.isInteger(g.file) ||
    g.file < 1 ||
    g.file > files.length ||
    !Array.isArray(g.results) ||
    !g.run?.entries
  )
    throw Error("Geçersiz kayıt");
  for (const n of [
    g.xp,
    g.seals,
    g.combo,
    g.best,
    g.solved,
    g.daily,
    g.run.mistakes,
    g.run.hints,
    g.run.xp,
    g.run.best,
  ])
    if (!Number.isSafeInteger(n) || n < 0) throw Error("Geçersiz sayaç");
  if (
    g.lastDay !== null &&
    (typeof g.lastDay !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(g.lastDay))
  )
    throw Error("Geçersiz gün");
  if (
    g.selected !== undefined &&
    !files[g.file - 1].questions.some((q) => q.id === g.selected)
  )
    throw Error("Geçersiz seçim");
  if (
    g.run.combo !== undefined &&
    (!Number.isSafeInteger(g.run.combo) || g.run.combo < 0)
  )
    throw Error("Geçersiz seri");
  for (const [id, e] of Object.entries(g.run.entries)) {
    const q = files[g.file - 1].questions.find((q) => q.id === id);
    if (
      !q ||
      !e ||
      typeof e.solved !== "boolean" ||
      typeof e.extra !== "boolean" ||
      !e.letters ||
      !Array.isArray(e.draft)
    )
      throw Error("Geçersiz cevap");
    if (
      e.draft.length > q.term.length ||
      e.draft.some((c) => typeof c !== "string" || !/^([A-ZÇĞİÖŞÜ])?$/.test(c))
    )
      throw Error("Geçersiz harf");
    for (const [index, letter] of Object.entries(e.letters)) {
      const i = Number(index);
      if (
        !Number.isInteger(i) ||
        i < 0 ||
        i >= q.term.length ||
        letter !== q.term[i]
      )
        throw Error("Geçersiz ipucu");
    }
    if (e.solved && e.draft.join("") !== q.term) throw Error("Geçersiz çözüm");
  }
  const seen = new Set<number>();
  for (const r of g.results) {
    if (
      !r ||
      !Number.isInteger(r.file) ||
      r.file < 1 ||
      r.file > g.file ||
      seen.has(r.file) ||
      ![1, 2, 3].includes(r.stars) ||
      typeof r.sealed !== "boolean" ||
      r.count !== files[r.file - 1].questions.length
    )
      throw Error("Geçersiz sonuç");
    for (const n of [r.xp, r.seals, r.hints, r.best])
      if (!Number.isSafeInteger(n) || n < 0)
        throw Error("Geçersiz sonuç sayacı");
    seen.add(r.file);
  }
  return { ...g, product: migrateProduct(g) };
}

export type Action = CoreAction | ProductAction;
export function reducer(g: Game, a: Action): Game {
  const core = [
    "key",
    "select",
    "clear",
    "delete",
    "submit",
    "hint",
    "seal",
    "next",
  ].includes(a.type);
  let next: Game;
  if (core) {
    if (
      a.type === "hint" &&
      a.hint === "letter" &&
      productOf(g).freeLetters > 0
    ) {
      const hinted = coreReducer({ ...g, seals: g.seals + 20 }, a);
      next =
        hinted.run.hints > g.run.hints
          ? {
              ...hinted,
              product: {
                ...productOf(g),
                freeLetters: productOf(g).freeLetters - 1,
              },
            }
          : g;
    } else next = coreReducer(g, a as CoreAction);
  } else next = applyProduct(g, a as ProductAction);
  return enrichProgress(g, next, "date" in a ? a.date : undefined);
}
