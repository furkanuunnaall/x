import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "../AppText";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { productOf, canAccessDaily, DAILY_ARCHIVE_COST } from "../product";
import { Props } from "../navigation";
import { Button, CurrencyBadge, GameCard, Shell, TopBar, useS } from "../ui";
import { dayKey } from "../game";
import { useTheme } from "../themeMode";
import { courtyard } from "../art";
import { colors as N } from "../theme";
const months = [
  "OCAK",
  "ŞUBAT",
  "MART",
  "NİSAN",
  "MAYIS",
  "HAZİRAN",
  "TEMMUZ",
  "AĞUSTOS",
  "EYLÜL",
  "EKİM",
  "KASIM",
  "ARALIK",
];
export default function DailyCalendarScreen({ navigation }: Props<"Daily">) {
  const { C, sx, tg, light } = useTheme();
  const s = useS();
  const v = sx(vN);
  const { game, dispatch } = useGame(),
    p = productOf(game);
  const { day: today } = useDiscovery();
  const [selected, setSelected] = useState(today);
  // Tall screens have room for the full banner; short ones keep the slim strip so nothing scrolls.
  const { height } = useWindowDimensions();
  const tall = height >= 740;
  const [month, setMonth] = useState(today.slice(0, 7));
  const [year, m] = month.split("-").map(Number);
  const first = new Date(year, m - 1, 1, 12),
    offset = (first.getDay() + 6) % 7;
  const length = new Date(year, m, 0).getDate();
  const cells = Array.from(
    { length: Math.ceil((offset + length) / 7) * 7 },
    (_, i) => (i >= offset && i < offset + length ? i - offset + 1 : null),
  );
  const free = canAccessDaily(p, selected, today),
    cost = free ? 0 : DAILY_ARCHIVE_COST;
  const completed = p.dailyPuzzleClaims.includes(selected);
  const solvedMonth = p.dailyPuzzleClaims.filter((d) =>
    d.startsWith(month),
  ).length;
  const future = selected > today;
  function move(delta: number) {
    const date = new Date(year, m - 1 + delta, 1, 12);
    const next = dayKey(date).slice(0, 7);
    if (next > today.slice(0, 7) || date.getFullYear() < 2000) return;
    setMonth(next);
    setSelected(next === today.slice(0, 7) ? today : `${next}-01`);
  }
  function start() {
    if (future || game.seals < cost) return;
    dispatch({ type: "daily-start", puzzleDate: selected });
    navigation.navigate("DailyPlay", { day: selected });
  }
  return (
    <Shell
      header={
        <TopBar
          title="Günlük bulmaca"
          back={() => navigation.popTo("Home")}
          right={<CurrencyBadge amount={game.seals} />}
        />
      }
    >
      <GameCard style={{ padding: 12, gap: 10 }}>
        <View style={v.monthHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Önceki ay"
            disabled={year <= 2000 && m === 1}
            onPress={() => move(-1)}
            style={v.arrow}
          >
            <Text style={v.arrowText}>‹</Text>
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={v.month}>{months[m - 1]}</Text>
            <Text style={s.small}>{year}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sonraki ay"
            disabled={month >= today.slice(0, 7)}
            onPress={() => move(1)}
            style={[v.arrow, month >= today.slice(0, 7) && { opacity: 0.25 }]}
          >
            <Text style={v.arrowText}>›</Text>
          </Pressable>
        </View>
        <ImageBackground
          source={light ? courtyard.morning : courtyard.night}
          style={[v.banner, tall && v.bannerTall]}
          imageStyle={{ borderRadius: tall ? 16 : 12 }}
        >
          <LinearGradient
            colors={tg(["#14264222", "#12233CEE"])}
            style={[v.bannerShade, tall && v.bannerShadeTall]}
          >
            <Text style={[v.bannerTitle, tall && { fontSize: 20 }]}>HUKUK GÜNLÜĞÜ</Text>
            <Text style={[v.bannerDetail, tall && { fontSize: 12 }]}>
              Her gün yeni bir bulmaca. Üç yeni kavram.
            </Text>
          </LinearGradient>
        </ImageBackground>
        <View style={v.grid}>
          {["P", "S", "Ç", "P", "C", "C", "P"].map((d, i) => (
            <View key={`week-${i}`} style={v.cellWrap}>
              <Text style={v.weekday}>{d}</Text>
            </View>
          ))}
          {cells.map((n, i) => {
            const key = `${month}-${String(n).padStart(2, "0")}`,
              locked = key > today,
              done = p.dailyPuzzleClaims.includes(key),
              current = key === today,
              active = key === selected;
            return (
              <View key={i} style={v.cellWrap}>
                {n !== null && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${key}${done ? ", tamamlandı" : current ? ", bugün" : locked ? ", henüz açılmadı" : ""}`}
                    accessibilityState={{ selected: active, disabled: locked }}
                    disabled={locked}
                    onPress={() => setSelected(key)}
                    style={[
                      v.day,
                      current && v.today,
                      active && v.selected,
                      locked && { opacity: 0.3 },
                    ]}
                  >
                    <Text
                      style={[
                        v.dayText,
                        done && { color: C.green },
                        active && { color: "#FFF" },
                      ]}
                    >
                      {done ? "✓" : n}
                    </Text>
                    {done && (
                      <Text style={[v.tinyDate, active && { color: "#FFF" }]}>
                        {n}
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
        <Text style={v.footer}>
          ✦ Bu ay {solvedMonth} bulmaca çözüldü · Geçmiş gün: 3 Mühür
        </Text>
      </GameCard>
      <GameCard style={v.selection}>
        <View style={v.dateBadge}>
          <Text style={v.dateMonth}>{months[m - 1]}</Text>
          <Text style={v.dateNumber}>{Number(selected.slice(-2))}</Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={v.selectionTitle}>
            {selected === today ? "Bugünün bulmacası" : "Arşiv bulmacası"}
          </Text>
          <Text style={s.small}>
            {completed
              ? "Tamamlandı · tekrar ödül yok"
              : "+100 XP · +20 Mühür"}
          </Text>
        </View>
        <Button
          small
          title={
            game.seals < cost
              ? "YETERSİZ"
              : completed
                ? "AÇ"
                : cost
                  ? "3 MÜHÜR"
                  : "BAŞLA"
          }
          disabled={future || game.seals < cost}
          onPress={start}
        />
      </GameCard>
    </Shell>
  );
}
const vN = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  month: { color: N.ink, fontSize: 21, fontWeight: "800", letterSpacing: 1 },
  arrow: {
    width: 40,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 30, color: N.muted },
  banner: { height: 50, borderRadius: 12, overflow: "hidden" },
  bannerTall: { height: 110, borderRadius: 16 },
  bannerShade: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    gap: 1,
  },
  bannerShadeTall: { justifyContent: "flex-end", padding: 14, gap: 4 },
  bannerTitle: { color: "#FFF9EA", fontSize: 14, fontWeight: "800" },
  bannerDetail: { color: "#EEE2CE", fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: {
    width: "14.285714%",
    paddingHorizontal: 2,
    paddingVertical: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  weekday: { color: N.muted, fontWeight: "800", fontSize: 11 },
  day: {
    width: "100%",
    height: 30,
    backgroundColor: "#14233D",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: N.ink, fontSize: 14, fontWeight: "800", lineHeight: 16 },
  today: { borderColor: N.green },
  selected: { backgroundColor: N.green, borderColor: N.green },
  tinyDate: { fontSize: 8, lineHeight: 9, color: N.muted },
  footer: { color: N.muted, fontSize: 12, textAlign: "center" },
  selection: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 12,
  },
  selectionTitle: { color: N.ink, fontSize: 15, fontWeight: "800" },
  dateBadge: {
    width: 50,
    borderRadius: 12,
    backgroundColor: "#14233B",
    overflow: "hidden",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D3B468",
  },
  dateMonth: {
    backgroundColor: "#D3B468",
    color: "#332512",
    fontWeight: "800",
    fontSize: 8,
    letterSpacing: 0.5,
    padding: 3,
    textAlign: "center",
    width: "100%",
  },
  dateNumber: { color: "#FFF8EA", fontSize: 20, fontWeight: "800", padding: 3 },
});
