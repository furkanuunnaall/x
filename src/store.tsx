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
  const save = (g: Game) => {
    void queue.current!.save(g);
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
    });
    return () => sub.remove();
  }, []);
  const dispatch = (a: Action) => {
    if (!ready) return;
    const next = reducer(current.current, a);
    if (next === current.current) return;
    current.current = next;
    setGame(next);
    save(next);
  };
  return (
    <Context.Provider
      value={{
        game,
        ready,
        error,
        dispatch,
        reset: async () => {
          await queue.current!.idle();
          const fresh = initialGame();
          await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
          current.current = fresh;
          setGame(fresh);
          setError("");
        },
        retry: () => {
          if (ready) save(current.current);
          else void load();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
