import React, { useEffect, useRef } from "react";
import { Animated, ImageBackground, Modal, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLayout } from "./layout";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { CheckIcon } from "phosphor-react-native/src/icons/Check";
import { XIcon } from "phosphor-react-native/src/icons/X";
import { Text, logoFont } from "./AppText";
import { courtyard } from "./art";
import { useReducedMotion } from "./motion";
import { useTheme } from "./themeMode";
import { dailyNow, dayKey, type Game } from "./game";

type Kind = "kept" | "pending" | "lost" | "new";
type DayState = "done" | "missed" | "today" | "future";

const weekdays = ["PZ", "PT", "SA", "ÇA", "PE", "CU", "CT"];
const parseDay = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const shift = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Five days around today: streak days are sealed, days skipped after the last one are marked missed.
 * A broken streak looks further back so its last sealed day stays in view. */
function week(lastDay: string | null, streak: number, kept: boolean, now = new Date()) {
  // Compare whole days: strip the clock so today's afternoon is not "after" a midnight-parsed day.
  const today = parseDay(dayKey(now));
  const last = lastDay ? parseDay(lastDay) : null;
  const first = last ? shift(last, -(streak - 1)) : null;
  return (kept ? [-2, -1, 0, 1, 2] : [-3, -2, -1, 0, 1]).map((offset) => {
    const date = shift(today, offset),
      key = dayKey(date);
    let state: DayState = offset > 0 ? "future" : "today";
    if (offset <= 0 && last && first && date >= first && date <= last) state = "done";
    else if (offset < 0) state = last && date > last ? "missed" : "future";
    return { key, label: weekdays[date.getDay()], state };
  });
}

/** Wax-seal flame: lit gold and ember when the streak holds, cold ash once it breaks. */
function FlameEmblem({ lit, cracked, size }: { lit: boolean; cracked: boolean; size: number }) {
  const id = React.useId().replace(/:/g, "");
  const outer = lit ? ["#FF7A45", "#D8402A"] : ["#8E98AA", "#4F5A6E"];
  const inner = lit ? ["#FFF0A8", "#FFC24A", "#F08A2C"] : ["#E4E8EF", "#AEB7C6", "#7F8A9E"];
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120">
      <Defs>
        <SvgGradient id={`o${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={outer[0]} />
          <Stop offset="1" stopColor={outer[1]} />
        </SvgGradient>
        <SvgGradient id={`i${id}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={inner[0]} />
          <Stop offset="0.55" stopColor={inner[1]} />
          <Stop offset="1" stopColor={inner[2]} />
        </SvgGradient>
      </Defs>
      <Path
        d="M50 4C58 26 84 40 86 70C88 99 69 117 50 117C29 117 13 101 13 77C13 58 24 46 33 35C35 50 41 56 47 58C42 40 44 20 50 4Z"
        fill={`url(#o${id})`}
        stroke={lit ? "#8E2A17" : "#363F50"}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path
        d="M50 34C56 50 73 60 73 82C73 99 62 108 50 108C37 108 27 99 27 86C27 75 34 68 39 62C41 73 46 77 51 79C48 66 47 50 50 34Z"
        fill={`url(#i${id})`}
      />
      <Path
        d="M40 70C37 76 36 82 38 88"
        stroke="#FFFFFF"
        strokeOpacity={lit ? 0.55 : 0.35}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      {!cracked ? null : (
        // A crack across the cold flame marks the broken streak.
        <Path
          d="M58 46L50 62L58 70L46 90"
          stroke="#2A3242"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
    </Svg>
  );
}

/** Soft ember halo behind the lit flame. */
function Glow({ color }: { color: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <Svg width={240} height={240} style={x.glow} pointerEvents="none">
      <Defs>
        <RadialGradient id={`g${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={120} r={120} fill={`url(#g${id})`} />
    </Svg>
  );
}

function DayDot({ state, pop }: { state: DayState; pop: Animated.Value | null }) {
  const { light } = useTheme();
  const dot = [
    x.dot,
    light && x.dayDot,
    state === "done" && x.done,
    state === "missed" && x.missed,
    state === "today" && (light ? x.todayDay : x.today),
  ];
  const icon =
    state === "done" ? (
      <CheckIcon size={20} weight="bold" color="#FFFFFF" />
    ) : state === "missed" ? (
      <XIcon size={18} weight="bold" color="#FFE9E5" />
    ) : null;
  return pop ? (
    <Animated.View style={[dot, { transform: [{ scale: pop }] }]}>{icon}</Animated.View>
  ) : (
    <View style={dot}>{icon}</View>
  );
}

/** Which İSTİKRAR screen fits the save right now. */
export function streakKind(g: Game): Kind {
  if (g.lastDay === dayKey()) return "kept";
  if (dailyNow(g) > 0) return "pending";
  return g.daily > 0 && g.lastDay ? "lost" : "new";
}

/** Full-screen İSTİKRAR info screen: today's state, the last few days and a close button. */
export function StreakModal({ game: g, onClose }: { game: Game; onClose: () => void }) {
  const { light } = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const layout = useLayout();
  const kind = streakKind(g);
  const kept = kind === "kept",
    alive = kept || kind === "pending",
    lost = kind === "lost";
  const streak = g.daily;
  const rise = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const pop = useRef(new Animated.Value(reduced ? 1 : 0.4)).current;
  useEffect(() => {
    if (reduced) return;
    const animation = Animated.sequence([
      Animated.spring(rise, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [reduced]);
  const days = week(g.lastDay, streak, !lost);
  const missed = days.filter((d) => d.state === "missed").length;
  const ink = light ? "#2A2418" : "#FFF5E3";
  const muted = light ? "#5E5444" : "#D9CDB8";
  const veil = light
    ? alive
      ? ["#FFF8EC66", "#FFF3DECC", "#FFF8ECF2"]
      : ["#E9EEF4AA", "#EEF1F5DD", "#F4F1EAF5"]
    : alive
      ? ["#0B122999", "#2A1A12D9", "#0B1229F5"]
      : ["#0B1229CC", "#141C2EE6", "#070C1AF8"];
  const note = {
    kept: "Bugünün mührü basıldı!\nYarın da bir bölüm bitir, istikrarını sürdür.",
    pending: "Bugün henüz bölüm bitirmedin.\nGün bitmeden bir bölüm bitir, serin devam etsin.",
    lost: `${missed > 1 ? `${missed} günü` : "Bir günü"} kaçırdın, alev söndü.\nBugün bir bölüm bitir, yeniden yak!`,
    new: "Her gün bir bölüm bitir,\nalevini yak ve istikrarını sürdür.",
  }[kind];
  return (
    <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={x.screen}>
        <ImageBackground
          source={light ? courtyard.morning : courtyard.night}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          blurRadius={alive ? 2 : 4}
        />
        <LinearGradient colors={veil as any} style={StyleSheet.absoluteFill} />
        <View style={[x.body, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={12}
            onPress={onClose}
            style={({ pressed }) => [
              x.close,
              { top: insets.top + 12 },
              light && x.closeDay,
              pressed && { opacity: 0.6 },
            ]}
          >
            <XIcon size={20} weight="bold" color={ink} />
          </Pressable>
          <Animated.View
            style={[
              x.hero,
              {
                opacity: rise,
                transform: [
                  { scale: rise.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                ],
              },
            ]}
          >
            {kept ? <Glow color={light ? "#FFB86B" : "#FF9F43"} /> : null}
            <View style={kind === "pending" && { opacity: 0.6 }}>
              <FlameEmblem lit={alive} cracked={lost} size={layout.fit(118, 92, 140)} />
            </View>
          </Animated.View>
          <Text style={[x.label, { color: alive ? (light ? "#B4561F" : "#FFC98A") : muted }]}>
            {lost ? "İSTİKRAR BOZULDU" : "İSTİKRAR"}
          </Text>
          <Text style={[x.count, { color: ink, fontSize: layout.fit(52, 44, 60) }]}>
            {alive ? streak : 0} Gün
          </Text>
          {lost ? (
            <Text style={[x.previous, { color: muted }]}>Önceki serin: {streak} gün</Text>
          ) : null}
          <View style={[x.strip, light && x.stripDay]}>
            {days.map((d) => (
              <View key={d.key} style={x.day}>
                <Text
                  style={[
                    x.weekday,
                    { color: d.key === dayKey() ? (light ? "#9A7524" : "#F0CB78") : muted },
                  ]}
                >
                  {d.label}
                </Text>
                <DayDot
                  state={d.state}
                  pop={kept && d.state === "done" && d.key === dayKey() ? pop : null}
                />
              </View>
            ))}
          </View>
          <Text style={[x.note, { color: ink }]}>{note}</Text>
        </View>
      </View>
    </Modal>
  );
}

const x = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B1229" },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  hero: { alignItems: "center", justifyContent: "center", marginBottom: 18 },
  glow: { position: "absolute" },
  label: { fontSize: 13, letterSpacing: 3, fontWeight: "800" },
  count: { fontFamily: logoFont, fontSize: 52, marginTop: 4 },
  previous: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  strip: {
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#F0CB7855",
    backgroundColor: "#15233DCC",
  },
  stripDay: { borderColor: "#C9A04A", backgroundColor: "#FFFDF8E6" },
  day: { alignItems: "center", gap: 7 },
  weekday: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  dot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#43516A",
    backgroundColor: "#0B1229AA",
  },
  dayDot: { borderColor: "#D8CCB4", backgroundColor: "#F4ECDD" },
  done: {
    backgroundColor: "#22A06B",
    borderColor: "#7FE0B4",
  },
  missed: { backgroundColor: "#B5413E", borderColor: "#E77A72" },
  today: { borderColor: "#F0CB78", borderStyle: "dashed" },
  todayDay: { borderColor: "#B8892F", borderStyle: "dashed" },
  note: {
    marginTop: 26,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
    textAlign: "center",
  },
  close: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0CB7855",
    backgroundColor: "#15233DCC",
  },
  closeDay: { borderColor: "#C9A04A", backgroundColor: "#FFFDF8E6" },
});
