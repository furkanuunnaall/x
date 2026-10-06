import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { dayKey, type Game } from "./game";
import { productOf } from "./product";
import { planReminders } from "./reminders";
import { useGame } from "./store";

// Local notifications only: planned on the phone, no server and no internet needed.
const supported = Platform.OS !== "web";
const CHANNEL = "daily";

export async function hasPermission() {
  if (!supported) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Shows the system permission dialog when needed; true when reminders may be sent. */
export async function askPermission() {
  if (!supported) return false;
  if (await hasPermission()) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Replaces every planned reminder with a fresh plan for the current game state. */
export async function syncReminders(g: Game) {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!productOf(g).settings.notifications || !(await hasPermission())) return;
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: "Günlük hatırlatma",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  for (const r of planReminders(g))
    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: r.date,
        channelId: CHANNEL,
      },
    });
}

/**
 * Keeps the planned reminders in step with the game: re-plans when the setting, today's
 * puzzle or the streak changes, and whenever the app goes to the background or comes back.
 */
export function useReminderSync() {
  const { game, ready } = useGame();
  const current = useRef(game);
  current.current = game;
  const p = productOf(game);
  const today = dayKey();
  const key = [
    p.settings.notifications,
    p.dailyPuzzleClaims.includes(today),
    game.lastDay,
    game.daily,
  ].join("|");
  useEffect(() => {
    if (ready) void syncReminders(current.current).catch(() => {});
  }, [ready, key]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (ready && state !== "inactive")
        void syncReminders(current.current).catch(() => {});
    });
    return () => sub.remove();
  }, [ready]);
}
