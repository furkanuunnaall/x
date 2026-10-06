import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { Action, Game, initialGame, parseSave, reducer } from "./game";
import { createSaveQueue, loadProgress, SAVE_KEY } from "./persistence";
type Store = {
  game: Game;
  ready: boolean;
  error: string;
  dispatch: (a: Action) => void;
  retry: () => void;
  reset: () => Promise<void>;
};
const typing = new Set(["key", "delete", "select", "session-key", "draft"]);
const Context = createContext<Store>(null!);
export const useGame = () => useContext(Context);
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState(initialGame),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  const current = useRef(game);
  const queue = useRef<ReturnType<typeof createSaveQueue> | null>(null);
  if (!queue.current)
    queue.current = createSaveQueue(AsyncStorage, (failed) =>
      setError(failed ? "İlerleme kaydedilemedi. Tekrar dene." : ""),
    );
  // Keystrokes are coalesced into one write; everything else is saved immediately.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    void queue.current!.save(current.current);
  };
  const save = (later = false) => {
    if (!later) return flush();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  };
  const load = async () => {
    try {
      const g = (await loadProgress(AsyncStorage)) ?? initialGame();
      current.current = g;
      setGame(g);
      setReady(true);
      setError("");
    } catch {
      setError("Kayıt okunamadı. Verilerin korunuyor; tekrar dene.");
    }
  };
  useEffect(() => {
    void load();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setGame({ ...current.current });
      else if (timer.current) flush();
    });
    return () => {
      sub.remove();
      if (timer.current) flush();
    };
  }, []);
  const dispatch = (a: Action) => {
    if (!ready) return;
    const next = reducer(current.current, a);
    if (next === current.current) return;
    current.current = next;
    setGame(next);
    save(typing.has(a.type));
  };
  return (
    <Context.Provider
      value={{
        game,
        ready,
        error,
        dispatch,
        reset: async () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = null;
          await queue.current!.idle();
          const fresh = initialGame();
          await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
          current.current = fresh;
          setGame(fresh);
          // Also leaves the "save unreadable" screen when the reset starts over from there.
          setReady(true);
          setError("");
        },
        retry: () => {
          if (ready) save();
          else void load();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
