import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "../AppText";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { productOf, canAccessDaily, DAILY_ARCHIVE_COST } from "../product";
import { Props } from "../navigation";
import { Button, C, CurrencyBadge, GameCard, Shell, TopBar, s } from "../ui";
import { dayKey } from "../game";
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
  const { game, dispatch } = useGame(),
    p = productOf(game);
  const { day: today } = useDiscovery();
  const [selected, setSelected] = useState(today);
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
          back={() => navigation.navigate("Home")}
          right={<CurrencyBadge amount={game.seals} />}
        />
      }
    >
      <GameCard style={{ padding: 14, gap: 16 }}>
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
          source={require("../../assets/courtyard.png")}
          style={v.banner}
          imageStyle={{ borderRadius: 16 }}
        >
          <LinearGradient
            colors={["#14264222", "#12233CEE"]}
            style={v.bannerShade}
          >
            <Text style={v.bannerTitle}>HUKUK GÜNLÜĞÜ</Text>
            <Text style={v.bannerDetail}>
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
        <Text style={s.note}>Bugün ücretsiz · Geçmiş bir günü aç: 3 Mühür</Text>
      </GameCard>
      <View style={v.monthProgress}>
        <Text style={v.progressIcon}>✦</Text>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={[s.text, { fontWeight: "800" }]}>
            {solvedMonth} günlük bulmaca tamamlandı
          </Text>
          <Text style={s.small}>
            Bu ay çözdüğün günler takvimde ✓ ile işaretlenir.
          </Text>
        </View>
      </View>
      <GameCard style={{ gap: 14 }}>
        <View style={v.selection}>
          <View style={v.dateBadge}>
            <Text style={v.dateMonth}>{months[m - 1]}</Text>
            <Text style={v.dateNumber}>{Number(selected.slice(-2))}</Text>
          </View>
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={[s.text, { fontWeight: "800" }]}>
              {selected === today ? "Bugünün bulmacası" : "Arşiv bulmacası"}
            </Text>
            <Text style={s.small}>
              {completed ? "Tamamlandı · Yeniden oyna" : "3 hukuk kavramı"}
            </Text>
            <Text style={s.small}>
              {cost
                ? "3 Mühür · Bir kez öde, tekrar ücretsiz"
                : "Ücretsiz erişim"}
            </Text>
          </View>
        </View>
        <Button
          title={
            game.seals < cost
              ? "YETERSİZ MÜHÜR"
              : completed
                ? "BULMACAYI AÇ"
                : cost
                  ? "3 MÜHÜR İLE AÇ"
                  : "BAŞLA"
          }
          disabled={future || game.seals < cost}
          onPress={start}
        />
        <Text style={s.note}>
          {completed
            ? "Bu tarihin ödülü alındı; tekrar ödül verilmez."
            : "+100 XP · +20 Mühür — bu tarihi tamamlayınca bir kez."}
        </Text>
      </GameCard>
    </Shell>
  );
}
const v = StyleSheet.create({
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  month: { color: C.ink, fontSize: 27, fontWeight: "900", letterSpacing: 1 },
  arrow: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: { fontSize: 34, color: C.muted },
  banner: { height: 110, borderRadius: 16, overflow: "hidden" },
  bannerShade: { flex: 1, justifyContent: "flex-end", padding: 14, gap: 5 },
  bannerTitle: { color: "#FFF9EA", fontSize: 22, fontWeight: "900" },
  bannerDetail: { color: "#EEE2CE", fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cellWrap: {
    width: "14.285714%",
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  weekday: { color: C.muted, fontWeight: "800", paddingVertical: 6 },
  day: {
    width: "100%",
    minHeight: 44,
    backgroundColor: "#14233D",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { color: C.ink, fontSize: 19, fontWeight: "800" },
  today: { borderColor: C.green },
  selected: { backgroundColor: C.green, borderColor: C.green },
  tinyDate: { fontSize: 9, color: C.muted },
  monthProgress: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 16,
    backgroundColor: C.panel,
    borderRadius: 20,
  },
  progressIcon: { color: C.gold, fontSize: 36 },
  selection: { flexDirection: "row", gap: 16, alignItems: "center" },
  dateBadge: {
    width: 62,
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
    fontSize: 10,
    letterSpacing: 0.5,
    padding: 5,
    textAlign: "center",
    width: "100%",
  },
  dateNumber: { color: "#FFF8EA", fontSize: 30, fontWeight: "800", padding: 6 },
});
