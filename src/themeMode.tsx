import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { colors } from "./theme";
import { useGame } from "./store";
import { productOf, type ThemeMode } from "./product";

export type Palette = typeof colors;

/** Day theme: cream paper surfaces, dark ink, a deeper gold that stays readable on cream. */
export const lightColors: Palette = {
  bg: "#F4ECDD",
  panel: "#FFFDF8F2",
  raised: "#EFE5D2",
  line: "#D8CCB4",
  ink: "#2A2418",
  muted: "#6E6352",
  gold: "#9A7524",
  goldEdge: "#B8892F",
  green: "#1F8A63",
  red: "#C2413E",
  paper: "#FFFFFF",
  success: "#DDEFE5",
};

type Kind = "text" | "fill" | "shadow" | "glow";

// Colours that need a specific day counterpart rather than the automatic conversion below.
const overrides: Record<Kind, Record<string, string>> = {
  text: {
    "#FFF5E3": "#2A2418",
    "#BEC5D2": "#6E6352",
    "#F0CB78": "#9A7524",
    "#75D6AA": "#1F8A63",
    "#FF8D8B": "#C2413E",
    "#273047": "#FFF5E3",
    "#3A2A10": "#3A2A10",
    "#443215": "#443215",
    "#6B4A12": "#6B4A12",
    "#79DDB6": "#1F6B4C",
    "#A8F2DD": "#1F6B4C",
    "#FFFFFF": "#FFFFFF",
  },
  fill: {
    "#0B1229": "#F4ECDD",
    "#15233D": "#FFFDF8",
    "#233550": "#EFE5D2",
    "#43516A": "#D8CCB4",
    "#183D36": "#DDEFE5",
    "#F0CB78": "#C9A04A",
    "#1B293B": "#FFFFFF",
    "#34404F": "#D8CCB4",
    "#193D36": "#DDEFE5",
    "#397961": "#8CC7A8",
    "#0E2B2E": "#E3F3EC",
    "#526888": "#FFFDF8",
  },
  shadow: {},
  glow: {},
};

const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

function toHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min,
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function fromHsl(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12,
    a = s * Math.min(l, 1 - l),
    f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}

/** Converts one night colour to its day counterpart; anything that is not a hex colour passes through. */
export function dayColor(value: string, kind: Kind = "fill"): string {
  const m = hex.exec(value);
  if (!m) return value;
  const base = `#${m[1].toUpperCase()}`,
    alpha = m[2] ?? "";
  const fixed = overrides[kind][base];
  if (fixed) return fixed + alpha;
  if (kind === "shadow") return "#5A4630" + alpha;
  // Text shadows that darkened light text at night become a soft paper glow by day.
  if (kind === "glow") return "#FFF8EC" + alpha;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const [h, s, l] = toHsl(r, g, b);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const blueish = h >= 190 && h <= 250;
  if (kind === "text") {
    // Light text becomes dark ink; colourful accents keep their hue but darken for cream.
    if (chroma < 0.2 || blueish) return l > 0.55 ? (l > 0.8 ? "#2A2418" : "#6E6352") + alpha : value;
    return l > 0.42 ? fromHsl(h, Math.min(1, s), 0.32) + alpha : value;
  }
  // Fills: dark navy surfaces become cream paper, dark tinted ones a pale tint of their hue.
  if (l < 0.4) {
    if (blueish || chroma < 0.12) return (l < 0.12 ? "#F4ECDD" : l < 0.24 ? "#FFFDF8" : "#EFE5D2") + alpha;
    return fromHsl(h, Math.min(s, 0.45), 0.9) + alpha;
  }
  return value;
}

const textKeys = new Set(["color", "tintColor", "placeholderTextColor"]);
function mapStyle(style: any): any {
  if (Array.isArray(style)) return style.map(mapStyle);
  if (!style || typeof style !== "object") return style;
  const out: any = {};
  for (const key of Object.keys(style)) {
    const v = style[key];
    if (typeof v === "string" && /color$/i.test(key))
      out[key] = dayColor(
        v,
        textKeys.has(key)
          ? "text"
          : key === "textShadowColor"
            ? "glow"
            : key === "shadowColor"
              ? "shadow"
              : "fill",
      );
    else if (v && typeof v === "object" && !Array.isArray(v) && key !== "shadowOffset") out[key] = mapStyle(v);
    else out[key] = v;
  }
  return out;
}

const sheetCache = new WeakMap<object, any>();
/** Day version of a whole StyleSheet, computed once per sheet. */
function daySheet<T extends object>(sheet: T): T {
  let mapped = sheetCache.get(sheet);
  if (!mapped) {
    mapped = Object.fromEntries(Object.entries(sheet).map(([k, v]) => [k, mapStyle(v)]));
    sheetCache.set(sheet, mapped);
  }
  return mapped;
}

export type Theme = {
  light: boolean;
  C: Palette;
  /** A StyleSheet in the active theme. */
  sx: <T extends object>(sheet: T) => T;
  /** A single literal colour in the active theme. */
  tc: (color: string, kind?: Kind) => string;
  /** Gradient stops in the active theme. */
  tg: <const T extends readonly string[]>(stops: T) => T;
};

const night: Theme = {
  light: false,
  C: colors,
  sx: (sheet) => sheet,
  tc: (color) => color,
  tg: (stops) => stops,
};
const day: Theme = {
  light: true,
  C: lightColors,
  sx: daySheet,
  tc: (color, kind = "fill") => dayColor(color, kind),
  tg: (stops) => stops.map((c) => dayColor(c, "fill")) as any,
};

/** "auto" follows the clock: day from 07:00 to 19:00. */
export function isDay(mode: ThemeMode, date = new Date()) {
  if (mode !== "auto") return mode === "light";
  const hour = date.getHours();
  return hour >= 7 && hour < 19;
}

const Context = createContext<Theme>(night);
export const useTheme = () => useContext(Context);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { game } = useGame();
  const mode = productOf(game).settings.theme;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (mode !== "auto") return;
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [mode]);
  const light = isDay(mode, now);
  const value = useMemo(() => (light ? day : night), [light]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
