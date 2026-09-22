import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { DISCOVERY_KEY } from "./model";
import { discoverySaveQueue, loadDiscovery } from "./persistence";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { dayKey } from "../game";
import {
  Discovery,
  DiscoveryAction,
  discoveryReducer,
  emptyDiscovery,
} from "./model";
const Context = createContext<{
  data: Discovery;
  ready: boolean;
  error: string;
  day: string;
  dispatch: (a: DiscoveryAction) => void;
  retry: () => void;
  reset: () => Promise<void>;
}>(null!);
export const useDiscovery = () => useContext(Context);
export function DiscoveryProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(emptyDiscovery);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [day, setDay] = useState(dayKey);
  const current = useRef(data);
  const queue = useRef<ReturnType<typeof discoverySaveQueue> | null>(null);
  if (!queue.current)
    queue.current = discoverySaveQueue(AsyncStorage, (failed) =>
      setError(failed ? "Keşif ilerlemesi kaydedilemedi. Tekrar dene." : ""),
    );
  const save = (value: Discovery) => {
    void queue.current!.save(value);
  };
  const load = async () => {
    try {
      current.current = await loadDiscovery(AsyncStorage);
      setData(current.current);
      setReady(true);
      setError("");
    } catch {
      setError("Keşif kaydı okunamadı. Kayıt korunuyor; tekrar dene.");
    }
  };
  useEffect(() => {
    void load();
    const update = () => setDay(dayKey());
    const timer = setInterval(update, 30000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") update();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  const dispatch = (a: DiscoveryAction) => {
    if (!ready) return;
    const next = discoveryReducer(current.current, a);
    if (next === current.current) return;
    current.current = next;
    setData(next);
    save(next);
  };
  return (
    <Context.Provider
      value={{
        data,
        ready,
        error,
        day,
        dispatch,
        reset: async () => {
          const fresh = emptyDiscovery();
          await queue.current!.save(fresh);
          await AsyncStorage.setItem(DISCOVERY_KEY, JSON.stringify(fresh));
          current.current = fresh;
          setData(fresh);
          setReady(true);
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
