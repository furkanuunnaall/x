import { files, questions } from "../content";
import { Game, entry, normalize } from "../game";
import { dailySolvedIds } from "../product";

export type Mark = "correct" | "present" | "absent";
export type DailyRound = { guesses: string[]; draft: string };
export type Discovery = {
  version: 1;
  days: Record<string, DailyRound>;
  favorites: string[];
};
export const DISCOVERY_KEY = "@muhur/discovery-v1";
export const emptyDiscovery = (): Discovery => ({
  version: 1,
  days: {},
  favorites: [],
});
const dailyPool = questions
  .slice(0, 30)
  .filter((q) => q.term.length >= 5 && q.term.length <= 8);
export function dailyQuestion(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const ordinal = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return dailyPool[
    ((ordinal % dailyPool.length) + dailyPool.length) % dailyPool.length
  ];
}
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(answer.length).fill("absent");
  const remaining: Record<string, number> = {};
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) marks[i] = "correct";
    else remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < answer.length; i++) {
    if (marks[i] !== "correct" && remaining[guess[i]] > 0) {
      marks[i] = "present";
      remaining[guess[i]]--;
    }
  }
  return marks;
}
export const roundFor = (d: Discovery, day: string): DailyRound =>
  d.days[day] ?? { guesses: [], draft: "" };
export const dailySolved = (d: Discovery, day: string) =>
  roundFor(d, day).guesses.includes(dailyQuestion(day).term);
export type DiscoveryAction =
  | { type: "favorite"; id: string }
  | { type: "draft"; day: string; value: string }
  | { type: "guess"; day: string };
export function discoveryReducer(d: Discovery, a: DiscoveryAction): Discovery {
  if (a.type === "favorite") {
    if (!questions.some((q) => q.id === a.id)) return d;
    return {
      ...d,
      favorites: d.favorites.includes(a.id)
        ? d.favorites.filter((id) => id !== a.id)
        : [...d.favorites, a.id],
    };
  }
  if (dailySolved(d, a.day)) return d;
  const round = roundFor(d, a.day);
  const term = dailyQuestion(a.day).term;
  if (a.type === "draft") {
    const draft = normalize(a.value);
    if (draft.length > term.length || !/^[A-ZÇĞİÖŞÜ]*$/.test(draft)) return d;
    return { ...d, days: { ...d.days, [a.day]: { ...round, draft } } };
  }
  if (round.draft.length !== term.length) return d;
  return {
    ...d,
    days: {
      ...d.days,
      [a.day]: { guesses: [...round.guesses, round.draft], draft: "" },
    },
  };
}
export function parseDiscovery(raw: string): Discovery {
  const d = JSON.parse(raw) as Discovery;
  if (
    !d ||
    d.version !== 1 ||
    !d.days ||
    typeof d.days !== "object" ||
    Array.isArray(d.days) ||
    !Array.isArray(d.favorites) ||
    d.favorites.some((id) => !questions.some((q) => q.id === id))
  )
    throw Error("Geçersiz keşif kaydı");
  for (const [day, r] of Object.entries(d.days)) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
      new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) !== day
    )
      throw Error("Geçersiz gün");
    const length = dailyQuestion(day).term.length;
    if (
      !r ||
      !Array.isArray(r.guesses) ||
      typeof r.draft !== "string" ||
      r.draft.length > length ||
      !/^[A-ZÇĞİÖŞÜ]*$/.test(r.draft) ||
      r.guesses.some(
        (g) =>
          typeof g !== "string" ||
          g.length !== length ||
          !/^[A-ZÇĞİÖŞÜ]+$/.test(g),
      )
    )
      throw Error("Geçersiz tahmin");
  }
  return d;
}
export function unlockedQuestions(g: Game) {
  const finished = new Set(g.results.map((r) => r.file));
  const ids = new Set(
    files.flatMap((f) =>
      f.questions
        .filter(
          (q) =>
            finished.has(f.id) || (f.id === g.file && entry(g, q.id).solved),
        )
        .map((q) => q.id),
    ),
  );
  for (const id of dailySolvedIds(g)) ids.add(id);
  return questions.filter((q) => ids.has(q.id));
}
export function achievements(g: Game, d: Discovery) {
  const days = Object.keys(d.days).filter((day) => dailySolved(d, day)).length;
  return [
    {
      id: "first",
      icon: "01",
      title: "İlk mühür",
      detail: "Bir bölümü çöz ve mühürle.",
      value: g.results.filter((r) => r.sealed).length,
      total: 1,
    },
    {
      id: "combo",
      icon: "✦",
      title: "Kesintisiz",
      detail: "Peş peşe 5 doğru cevap ver.",
      value: g.best,
      total: 5,
    },
    {
      id: "star",
      icon: "★",
      title: "Kusursuz bölüm",
      detail: "Bir bölümde 3 yıldız kazan.",
      value: g.results.filter((r) => r.stars === 3).length,
      total: 1,
    },
    {
      id: "archive",
      icon: "▤",
      title: "İz koleksiyoncusu",
      detail: "12 kavramı koleksiyonuna kat.",
      value: unlockedQuestions(g).length,
      total: 12,
    },
    {
      id: "daily",
      icon: "◇",
      title: "Şifre çözücü",
      detail: "3 farklı günün şifresini çöz.",
      value: days,
      total: 3,
    },
    {
      id: "all",
      icon: "M",
      title: "Bölüm ustası",
      detail: "Bütün kavramları koleksiyonuna kat.",
      value: unlockedQuestions(g).length,
      total: questions.length,
    },
  ];
}
