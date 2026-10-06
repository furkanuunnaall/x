import { dailyNow, dayKey, type Game } from "./game";
import { productOf } from "./product";

/** The one daily reminder goes out at this hour, local time. */
export const REMINDER_HOUR = 13;
/** Days planned ahead; every app visit plans them again from scratch. */
const DAYS_AHEAD = 14;

export type Reminder = { date: Date; title: string; body: string };

/**
 * What to say on a given day: the daily puzzle if it is still open, the İSTİKRAR streak if
 * it ends unless a bölüm is finished that day, or both in one message. Null: nothing to say.
 */
export function reminderText(puzzleOpen: boolean, streak: number) {
  if (puzzleOpen && streak > 0)
    return {
      title: "Bugün iki şey seni bekliyor",
      body: `${streak} günlük serini korumak için bir bölüm bitir. Günlük bulmaca da hazır.`,
    };
  if (streak > 0)
    return {
      title: "İstikrar serin devam etsin",
      body: `${streak} günlük serini korumak için bugün bir bölüm bitir.`,
    };
  if (puzzleOpen)
    return {
      title: "Günlük bulmaca hazır",
      body: "Bugünün 3 kavramı seni bekliyor: bir kolay, bir orta, bir zor.",
    };
  return null;
}

/**
 * The reminders for the coming days, assuming the player does not open the game again.
 * Opening it re-plans everything, so a solved puzzle or a finished bölüm cancels that day's
 * message. The streak can only be at risk today (kept alive by yesterday) or tomorrow (kept
 * alive by today); after a missed day it is gone, so later days only mention the puzzle.
 */
export function planReminders(g: Game, now = new Date()): Reminder[] {
  const today = dayKey(now);
  const playedToday = g.lastDay === today;
  const plan: Reminder[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, REMINDER_HOUR);
    if (date <= now) continue;
    const puzzleOpen = i > 0 || !productOf(g).dailyPuzzleClaims.includes(today);
    const streak =
      i === 0 ? (playedToday ? 0 : dailyNow(g, now)) : i === 1 && playedToday ? g.daily : 0;
    const text = reminderText(puzzleOpen, streak);
    if (text) plan.push({ date, ...text });
  }
  return plan;
}
