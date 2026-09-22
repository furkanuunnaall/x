import { files, questions } from "./content";
import { dayKey, normalize, type Game } from "./game";
export type Gender = "Kadın" | "Erkek";
export type Role = "Avukat" | "Hakim" | "Savcı";
export type Settings = {
  sound: boolean;
  vibration: boolean;
  reduceMotion: boolean;
};
export type Session = {
  selected: number;
  drafts: Record<string, string>;
  solved: string[];
  mistakes: number;
  combo: number;
  best: number;
};
export type TaskDay = {
  solved: number;
  files: number;
  combo: number;
  best: number;
  claimed: number[];
  bonus: boolean;
};
export type Notice = {
  id: string;
  kind: "badge" | "level";
  title: string;
  amount?: number;
};
export type Product = {
  firstName: string;
  lastName: string;
  hasCompletedOnboarding: boolean;
  selectedGender: Gender | null;
  selectedRole: Role | null;
  selectedCharacter: string | null;
  settings: Settings;
  dailyTasksDate: string;
  dailyTasks: Record<string, TaskDay>;
  lastDailyPuzzleDate: string | null;
  dailyPuzzleCompletedDate: string | null;
  dailyPuzzles: Record<string, Session>;
  dailyPuzzleClaims: string[];
  unlockedDailyDates: string[];
  unlockedAchievements: string[];
  claimedMilestones: number[];
  freeLetters: number;
  claimedPlayerLevel: number;
  notices: Notice[];
  replay: { file: number; session: Session } | null;
};
export const playerLevel = (xp: number) => Math.floor(xp / 1000) + 1;
export const newSession = (): Session => ({
  selected: 0,
  drafts: {},
  solved: [],
  mistakes: 0,
  combo: 0,
  best: 0,
});
export const newTaskDay = (): TaskDay => ({
  solved: 0,
  files: 0,
  combo: 0,
  best: 0,
  claimed: [],
  bonus: false,
});
export const initialProduct = (): Product => ({
  firstName: "",
  lastName: "",
  hasCompletedOnboarding: false,
  selectedGender: null,
  selectedRole: null,
  selectedCharacter: null,
  settings: { sound: true, vibration: true, reduceMotion: false },
  dailyTasksDate: "",
  dailyTasks: {},
  lastDailyPuzzleDate: null,
  dailyPuzzleCompletedDate: null,
  dailyPuzzles: {},
  dailyPuzzleClaims: [],
  unlockedDailyDates: [],
  unlockedAchievements: [],
  claimedMilestones: [],
  freeLetters: 0,
  claimedPlayerLevel: 1,
  notices: [],
  replay: null,
});
export const characters = [
  {
    gender: "Kadın",
    role: "Avukat",
    name: "Ece Deniz",
    detail: "Sözcüklerin ardındaki ayrıntıları keşfeder.",
  },
  {
    gender: "Kadın",
    role: "Hakim",
    name: "Selin Acar",
    detail: "Dengeli kararları ve güçlü sezgileriyle öne çıkar.",
  },
  {
    gender: "Kadın",
    role: "Savcı",
    name: "Derya Aksoy",
    detail: "İpuçlarını bir araya getirmekte başarılıdır.",
  },
  {
    gender: "Erkek",
    role: "Avukat",
    name: "Mert Kaya",
    detail: "Detayları yakalamakta ustadır.",
  },
  {
    gender: "Erkek",
    role: "Hakim",
    name: "Arda Eren",
    detail: "Her kelimeyi sabırla ve dikkatle değerlendirir.",
  },
  {
    gender: "Erkek",
    role: "Savcı",
    name: "Bora Yalın",
    detail: "Kararlılıkla iz sürer, bağlantıları ortaya çıkarır.",
  },
] as const;
export const productOf = (g: Game): Product => g.product ?? initialProduct();
export function knownTerms(g: Game) {
  const ids = new Set<string>();
  for (const f of files)
    if (g.results.some((r) => r.file === f.id))
      f.questions.forEach((q) => ids.add(q.id));
  for (const [id, e] of Object.entries(g.run.entries))
    if (e.solved) ids.add(id);
  return questions.filter((q) => ids.has(q.id));
}
export function badges(g: Game) {
  const known = knownTerms(g).length;
  return [
    {
      id: "first",
      title: "İlk Dosya",
      detail: "İlk dosyanı tamamla.",
      value: g.results.length,
      total: 1,
      icon: "01",
    },
    {
      id: "sharp",
      title: "Keskin Zihin",
      detail: "5 doğru cevabı art arda ver.",
      value: g.best,
      total: 5,
      icon: "✦",
    },
    {
      id: "perfect",
      title: "Mükemmel Dosya",
      detail: "Bir dosyada üç yıldız kazan.",
      value: g.results.filter((r) => r.stars === 3).length,
      total: 1,
      icon: "★",
    },
    {
      id: "hunter",
      title: "Kavram Avcısı",
      detail: "50 farklı kavram çöz.",
      value: known,
      total: 50,
      icon: "50",
    },
    {
      id: "hundred",
      title: "Yüz Kavram",
      detail: "100 farklı kavram çöz.",
      value: known,
      total: 100,
      icon: "100",
    },
    {
      id: "streak",
      title: "Seri Ustası",
      detail: "7 günlük dosya serisine ulaş.",
      value: g.daily,
      total: 7,
      icon: "7",
    },
    {
      id: "final",
      title: "Final Ustası",
      detail: "Bir Final Dosyası çöz.",
      value: g.results.filter((r) => r.file % 10 === 0).length,
      total: 1,
      icon: "◆",
    },
  ];
}
export function migrateProduct(g: Game): Product {
  const d = initialProduct();
  const p = g.product;
  if (!p)
    return {
      ...d,
      claimedPlayerLevel: playerLevel(g.xp),
      unlockedAchievements: badges(g)
        .filter((b) => b.value >= b.total)
        .map((b) => b.id),
    };
  // Absent fields from earlier versions receive defaults; malformed values are rejected, never reset silently.
  const next = { ...d, ...p, settings: { ...d.settings, ...p.settings } };
  if (
    typeof next.firstName !== "string" ||
    typeof next.lastName !== "string" ||
    (next.firstName && !validName(next.firstName)) ||
    (next.lastName && !validName(next.lastName))
  )
    throw Error("Geçersiz oyuncu adı");
  for (const n of [next.freeLetters, next.claimedPlayerLevel])
    if (!Number.isSafeInteger(n) || n < 0) throw Error("Geçersiz V1 sayaç");
  if (
    typeof next.hasCompletedOnboarding !== "boolean" ||
    Object.values(next.settings).some((v) => typeof v !== "boolean")
  )
    throw Error("Geçersiz ayar");
  if (
    next.selectedCharacter !== null &&
    !characters.some(
      (c) =>
        c.name === next.selectedCharacter &&
        c.gender === next.selectedGender &&
        c.role === next.selectedRole,
    )
  )
    throw Error("Geçersiz karakter");
  for (const list of [
    next.unlockedAchievements,
    next.claimedMilestones,
    next.dailyPuzzleClaims,
    next.unlockedDailyDates,
    next.notices,
  ])
    if (!Array.isArray(list)) throw Error("Geçersiz V1 liste");
  if (
    !next.dailyPuzzles ||
    !next.dailyTasks ||
    typeof next.dailyPuzzles !== "object" ||
    typeof next.dailyTasks !== "object"
  )
    throw Error("Geçersiz günlük kayıt");
  for (const [day, session] of Object.entries(next.dailyPuzzles)) {
    validateDay(day);
    validateSession(session, dailyQuestions(day));
  }
  for (const [day, task] of Object.entries(next.dailyTasks)) {
    validateDay(day);
    if (
      !task ||
      !Array.isArray(task.claimed) ||
      task.claimed.some((n) => ![0, 1, 2].includes(n)) ||
      typeof task.bonus !== "boolean" ||
      [task.solved, task.files, task.combo, task.best].some(
        (n) => !Number.isSafeInteger(n) || n < 0,
      )
    )
      throw Error("Geçersiz görev");
  }
  next.dailyPuzzleClaims.forEach(validateDay);
  next.unlockedDailyDates.forEach(validateDay);
  for (const day of [next.lastDailyPuzzleDate, next.dailyPuzzleCompletedDate])
    if (day !== null) validateDay(day);
  if (next.dailyTasksDate) validateDay(next.dailyTasksDate);
  if (
    Array.isArray(next.dailyPuzzles) ||
    Array.isArray(next.dailyTasks) ||
    next.claimedMilestones.some(
      (n) => !Number.isInteger(n) || n < 5 || n > 30 || n % 5 !== 0,
    ) ||
    next.unlockedAchievements.some((id) => !badges(g).some((b) => b.id === id))
  )
    throw Error("Geçersiz V1 ilerleme");
  if (
    next.selectedGender !== null &&
    !["Kadın", "Erkek"].includes(next.selectedGender)
  )
    throw Error("Geçersiz görünüm");
  if (
    next.selectedRole !== null &&
    !["Avukat", "Hakim", "Savcı"].includes(next.selectedRole)
  )
    throw Error("Geçersiz rol");
  if (
    next.notices.some(
      (n) =>
        !n ||
        typeof n.id !== "string" ||
        typeof n.title !== "string" ||
        !["badge", "level"].includes(n.kind) ||
        (n.kind === "level" &&
          (!Number.isSafeInteger(n.amount) || (n.amount ?? -1) < 0)),
    )
  )
    throw Error("Geçersiz bildirim");
  if (next.replay) {
    const file = files.find((f) => f.id === next.replay!.file);
    if (!file || !g.results.some((r) => r.file === file.id))
      throw Error("Geçersiz tekrar");
    validateSession(next.replay.session, file.questions);
  }
  return next;
}
function validateDay(day: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    new Date(`${day}T12:00:00Z`).toISOString().slice(0, 10) !== day
  )
    throw Error("Geçersiz gün");
}
function validateSession(s: Session, qs: typeof questions) {
  if (
    !s ||
    !Number.isInteger(s.selected) ||
    s.selected < 0 ||
    s.selected >= qs.length ||
    !s.drafts ||
    !Array.isArray(s.solved) ||
    s.solved.some((id) => !qs.some((q) => q.id === id)) ||
    [s.mistakes, s.combo, s.best].some((n) => !Number.isSafeInteger(n) || n < 0)
  )
    throw Error("Geçersiz oturum");
  for (const [id, draft] of Object.entries(s.drafts))
    if (
      !qs.some(
        (q) =>
          q.id === id &&
          typeof draft === "string" &&
          draft.length <= q.term.length &&
          /^[A-ZÇĞİÖŞÜ]*$/.test(draft),
      )
    )
      throw Error("Geçersiz taslak");
}
export function dailyQuestions(day: string) {
  const [y, m, d] = day.split("-").map(Number),
    seed = Math.floor(Date.UTC(y, m - 1, d) / 86400000);
  return Array.from(
    { length: 3 },
    (_, i) =>
      questions[
        (((seed * 3 + i) % questions.length) + questions.length) %
          questions.length
      ],
  );
}
export const taskDefinitions = [
  { title: "5 kavram çöz", total: 5 },
  { title: "1 dosya tamamla", total: 1 },
  { title: "3 doğruyu seri yap", total: 3 },
];
export function taskValues(t: TaskDay) {
  return [t.solved, t.files, t.best];
}
export const cleanName = (value: string) => value.trim().replace(/\s+/g, " ");
export const validName = (value: string) =>
  value.length >= 1 &&
  value.length <= 40 &&
  /^[\p{L}\p{M} '’‐-]+$/u.test(value);
export const playerName = (g: Game) =>
  [productOf(g).firstName, productOf(g).lastName].filter(Boolean).join(" ") ||
  productOf(g).selectedCharacter ||
  "Oyuncu";
export type ProductAction =
  | { type: "player-name"; firstName: string; lastName: string }
  | { type: "onboard" }
  | { type: "character"; gender: Gender; role: Role }
  | { type: "setting"; key: keyof Settings; value: boolean }
  | { type: "notice-dismiss"; id: string }
  | { type: "milestone"; file: number }
  | { type: "task-claim"; index: number; date?: Date }
  | { type: "task-bonus"; date?: Date }
  | { type: "daily-start"; replay?: boolean; puzzleDate?: string; date?: Date }
  | { type: "replay-start"; file: number }
  | {
      type: "session-select";
      mode: "daily" | "replay";
      puzzleDate?: string;
      index: number;
      date?: Date;
    }
  | {
      type: "session-key";
      mode: "daily" | "replay";
      puzzleDate?: string;
      value: string;
      date?: Date;
    }
  | {
      type: "session-submit";
      mode: "daily" | "replay";
      puzzleDate?: string;
      date?: Date;
    };
export function applyProduct(g: Game, a: ProductAction): Game {
  const p = productOf(g),
    day = dayKey("date" in a ? a.date : undefined);
  const update = (changes: Partial<Product>, xp = 0, seals = 0): Game => ({
    ...g,
    xp: g.xp + xp,
    seals: g.seals + seals,
    product: { ...p, ...changes },
  });
  if (a.type === "player-name") {
    const firstName = cleanName(a.firstName),
      lastName = cleanName(a.lastName);
    return validName(firstName) && validName(lastName)
      ? update({ firstName, lastName })
      : g;
  }
  if (a.type === "onboard") return update({ hasCompletedOnboarding: true });
  if (a.type === "character") {
    const c = characters.find(
      (c) => c.gender === a.gender && c.role === a.role,
    );
    return c
      ? update({
          selectedGender: c.gender,
          selectedRole: c.role,
          selectedCharacter: c.name,
        })
      : g;
  }
  if (a.type === "setting")
    return update({ settings: { ...p.settings, [a.key]: a.value } });
  if (a.type === "notice-dismiss")
    return update({ notices: p.notices.filter((n) => n.id !== a.id) });
  if (a.type === "milestone") {
    if (
      a.file % 5 ||
      !g.results.some((r) => r.file === a.file) ||
      p.claimedMilestones.includes(a.file)
    )
      return g;
    return update(
      {
        claimedMilestones: [...p.claimedMilestones, a.file],
        freeLetters: p.freeLetters + 1,
      },
      0,
      50,
    );
  }
  if (a.type === "task-claim" || a.type === "task-bonus") {
    const t = p.dailyTasks[day] ?? newTaskDay();
    if (a.type === "task-claim") {
      if (
        ![0, 1, 2].includes(a.index) ||
        t.claimed.includes(a.index) ||
        taskValues(t)[a.index] < taskDefinitions[a.index].total
      )
        return g;
      return update(
        {
          dailyTasksDate: day,
          dailyTasks: {
            ...p.dailyTasks,
            [day]: { ...t, claimed: [...t.claimed, a.index] },
          },
        },
        0,
        10,
      );
    }
    if (t.bonus || t.claimed.length !== 3) return g;
    return update(
      {
        dailyTasksDate: day,
        dailyTasks: { ...p.dailyTasks, [day]: { ...t, bonus: true } },
      },
      0,
      30,
    );
  }
  const today = day;
  const targetDay = "puzzleDate" in a && a.puzzleDate ? a.puzzleDate : today;
  if (a.type === "daily-start" || ("mode" in a && a.mode === "daily")) {
    if (!isPlayableDailyDate(targetDay, today)) return g;
    if (a.type !== "daily-start" && !canAccessDaily(p, targetDay, today))
      return g;
  }
  if (a.type === "daily-start") {
    const price = canAccessDaily(p, targetDay, today) ? 0 : DAILY_ARCHIVE_COST;
    if (g.seals < price) return g;
    const day = targetDay;
    const old = p.dailyPuzzles[day];
    if (old && !(a.replay && old.solved.length === 3)) return g;
    return update(
      {
        lastDailyPuzzleDate: day,
        unlockedDailyDates: p.unlockedDailyDates.includes(day)
          ? p.unlockedDailyDates
          : [...p.unlockedDailyDates, day],
        dailyPuzzles: { ...p.dailyPuzzles, [day]: newSession() },
      },
      0,
      -price,
    );
  }
  if (a.type === "replay-start")
    return g.results.some((r) => r.file === a.file)
      ? update({ replay: { file: a.file, session: newSession() } })
      : g;
  {
    const day = targetDay;
    const daily = a.mode === "daily",
      qs = daily
        ? dailyQuestions(day)
        : files[(p.replay?.file ?? 1) - 1].questions;
    const session = daily
      ? (p.dailyPuzzles[day] ?? newSession())
      : p.replay?.session;
    if (!session) return g;
    const q = qs[session.selected];
    const store = (
      s: Session,
      extra: Partial<Product> = {},
      xp = 0,
      seals = 0,
    ) =>
      update(
        daily
          ? {
              ...extra,
              lastDailyPuzzleDate: day,
              dailyPuzzles: { ...p.dailyPuzzles, [day]: s },
            }
          : { ...extra, replay: { file: p.replay!.file, session: s } },
        xp,
        seals,
      );
    if (a.type === "session-select")
      return Number.isInteger(a.index) && a.index >= 0 && a.index < qs.length
        ? store({ ...session, selected: a.index })
        : g;
    if (session.solved.includes(q.id)) return g;
    if (a.type === "session-key") {
      const value = normalize(a.value);
      return value.length <= q.term.length && /^[A-ZÇĞİÖŞÜ]*$/.test(value)
        ? store({ ...session, drafts: { ...session.drafts, [q.id]: value } })
        : g;
    }
    const answer = session.drafts[q.id] ?? "";
    if (answer.length !== q.term.length) return g;
    const correct = normalize(answer) === q.term;
    const next = {
      ...session,
      drafts: { ...session.drafts, [q.id]: correct ? answer : "" },
      solved: correct ? [...session.solved, q.id] : session.solved,
      combo: correct ? session.combo + 1 : 0,
      best: Math.max(session.best, correct ? session.combo + 1 : 0),
      mistakes: session.mistakes + (correct ? 0 : 1),
    };
    const eligible = daily && !p.dailyPuzzleClaims.includes(day);
    const finished = eligible && next.solved.length === qs.length;
    const t = p.dailyTasks[today] ?? newTaskDay();
    const extra: Partial<Product> = eligible
      ? {
          dailyTasksDate: today,
          dailyTasks: {
            ...p.dailyTasks,
            [today]: {
              ...t,
              solved: t.solved + (correct ? 1 : 0),
              combo: correct ? t.combo + 1 : 0,
              best: Math.max(t.best, correct ? t.combo + 1 : 0),
            },
          },
        }
      : {};
    if (finished) {
      extra.dailyPuzzleClaims = [...p.dailyPuzzleClaims, day];
      extra.dailyPuzzleCompletedDate = day;
    }
    return store(next, extra, finished ? 100 : 0, finished ? 20 : 0);
  }
}
export function enrichProgress(
  before: Game,
  after: Game,
  date = new Date(),
): Game {
  if (before === after) return after;
  let p = productOf(after),
    next = after;
  const day = dayKey(date);
  if (
    after.solved > before.solved ||
    after.run.mistakes > before.run.mistakes
  ) {
    const t = p.dailyTasks[day] ?? newTaskDay(),
      correct = after.solved > before.solved;
    p = {
      ...p,
      dailyTasksDate: day,
      dailyTasks: {
        ...p.dailyTasks,
        [day]: {
          ...t,
          solved: t.solved + (correct ? 1 : 0),
          files:
            t.files + (after.results.length > before.results.length ? 1 : 0),
          combo: correct ? t.combo + 1 : 0,
          best: Math.max(t.best, correct ? t.combo + 1 : 0),
        },
      },
    };
  }
  if (after.results.length > before.results.length && after.file % 10 === 0) {
    next = {
      ...next,
      xp: next.xp + 250,
      seals: next.seals + 100,
      results: next.results.map((r) =>
        r.file === next.file
          ? { ...r, xp: r.xp + 250, seals: r.seals + 100 }
          : r,
      ),
    };
  }
  const level = playerLevel(next.xp);
  if (level > p.claimedPlayerLevel) {
    const amount = (level - p.claimedPlayerLevel) * 30;
    p = {
      ...p,
      claimedPlayerLevel: level,
      notices: [
        ...p.notices,
        {
          id: `level-${level}`,
          kind: "level",
          title: `LEVEL ${level}`,
          amount,
        },
      ],
    };
    next = { ...next, seals: next.seals + amount };
  }
  const unlocked = badges(next).filter(
    (b) => b.value >= b.total && !p.unlockedAchievements.includes(b.id),
  );
  if (unlocked.length)
    p = {
      ...p,
      unlockedAchievements: [
        ...p.unlockedAchievements,
        ...unlocked.map((b) => b.id),
      ],
      notices: [
        ...p.notices,
        ...unlocked.map((b) => ({
          id: `badge-${b.id}`,
          kind: "badge" as const,
          title: b.title,
        })),
      ],
    };
  return { ...next, product: p };
}
export function weeklySolved(g: Game, date = new Date()) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const start = dayKey(monday),
    end = dayKey(date);
  return Object.entries(productOf(g).dailyTasks)
    .filter(([day]) => day >= start && day <= end)
    .reduce((total, [, task]) => total + task.solved, 0);
}

export const DAILY_ARCHIVE_COST = 3;
export function isPlayableDailyDate(value: string, today: string) {
  try {
    validateDay(value);
    return value <= today;
  } catch {
    return false;
  }
}
export function canAccessDaily(p: Product, value: string, today: string) {
  return (
    value === today ||
    p.unlockedDailyDates.includes(value) ||
    !!p.dailyPuzzles[value] ||
    p.dailyPuzzleClaims.includes(value)
  );
}
