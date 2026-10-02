import { SealCoin } from "../art";
import React, { useRef, useEffect } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { productOf } from "../product";
import { dayKey } from "../game";
import { StreakModal } from "../StreakModal";
import { files } from "../content";
import { Props } from "../navigation";
import { Button, GameCard, Label, Shell, Stars, TopBar, useS } from "../ui";
import { Reveal, useReducedMotion } from "../motion";
import { useTheme } from "../themeMode";
import { colors as N } from "../theme";
export default function ResultScreen({ navigation }: Props<"Result">) {
  const { C, sx } = useTheme();
  const s = useS();
  const v = sx(vN);
  const { game: g, dispatch } = useGame();
  const stamp = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const r = g.results.find((r) => r.file === g.file);
  useEffect(() => {
    if (r?.stars !== 3 || reduced) return;
    stamp.setValue(0.7);
    const animation = Animated.spring(stamp, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [r?.file, reduced]);
  function nextFile() {
    if (g.file % 5 === 0 && !productOf(g).claimedMilestones.includes(g.file)) {
      navigation.navigate("Milestone", { file: g.file });
      return;
    }
    dispatch({ type: "seal" });
    dispatch({ type: "next" });
    navigation.replace((g.file + 1) % 10 === 0 ? "FinalIntro" : "Game");
  }
  if (!r)
    return (
      <Shell>
        <Button
          title="BÖLÜME DÖN"
          onPress={() => navigation.replace("Game")}
        />
      </Shell>
    );
  const final = g.file % 10 === 0;
  const stats: [string, string | number][] = [
    ["Kavram", `${r.count}/${files[g.file - 1].questions.length}`],
    ["XP", `+${r.xp}`],
    ["Mühür", `+${r.seals}`],
    ["En uzun seri", r.best],
    ["İpucu", r.hints],
    ["Hata", r.mistakes ?? g.run.mistakes],
  ];
  return (
    <Shell>
      <View style={v.body}>
        {/* The first bölüm finished today extends the streak; celebrate it once. */}
        {g.lastDay === dayKey() && productOf(g).streakSeen !== g.lastDay ? (
          <StreakModal
            game={g}
            onClose={() => dispatch({ type: "streak-seen", kind: "kept", day: g.lastDay! })}
          />
        ) : null}
        <TopBar
          title={`${final ? "Final Bölümü" : "Bölüm"} ${String(g.file).padStart(2, "0")}`}
          back={() => navigation.popTo("Home")}
        />
        <Reveal>
          <View style={v.hero}>
            <Animated.View style={[v.stamp, { transform: [{ scale: stamp }] }]}>
              <SealCoin size={62} value={final ? "◆" : r.sealed ? "✓" : "M"} />
            </Animated.View>
            <Label>
              {r.sealed ? "MÜHRÜNÜ BIRAKTIN" : "BÜTÜN KAVRAMLAR ÇÖZÜLDÜ"}
            </Label>
            <Text style={v.title}>
              {final ? "FİNAL BÖLÜMÜ ÇÖZÜLDÜ" : "BÖLÜM TAMAMLANDI"}
            </Text>
            <Stars count={r.stars} size={34} />
            <Text style={final ? s.gold : s.muted}>
              {final
                ? "◆ Final ustası · +250 XP ve +100 Mühür dahil"
                : r.stars === 3
                  ? "Kusursuz takip. Üç yıldız senin."
                  : "Bir bölüm daha çözüldü."}
            </Text>
          </View>
        </Reveal>
        <GameCard style={v.stats}>
          {stats.map(([label, value]) => (
            <View key={label} style={v.stat}>
              <Text style={[v.statValue, label === "Mühür" && { color: C.gold }]}>
                {value}
              </Text>
              <Text style={v.statLabel}>{label}</Text>
            </View>
          ))}
        </GameCard>
        {r.file < files.length ? (
          <Button title="SONRAKİ BÖLÜM →" onPress={nextFile} />
        ) : (
          <Text style={s.note}>
            30 bölümün tamamı çözüldü. Yolculuğun arşivde!
          </Text>
        )}
        <View style={v.row}>
          <View style={{ flex: 1 }}>
            <Button
              small
              secondary
              title="HARİTAYA DÖN"
              onPress={() => {
                dispatch({ type: "seal" });
                navigation.popTo("Map");
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              small
              secondary
              title="TEKRAR OYNA"
              onPress={() => {
                dispatch({ type: "replay-start", file: g.file });
                navigation.navigate("Practice", { file: g.file });
              }}
            />
          </View>
        </View>
        <Text style={s.note}>Tekrar oyunları ödül vermez.</Text>
      </View>
    </Shell>
  );
}
const vN = StyleSheet.create({
  body: { gap: 12 },
  hero: { alignItems: "center", gap: 8, paddingVertical: 4 },
  stamp: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: N.panel,
    borderWidth: 2,
    borderColor: N.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: N.ink,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 12,
    paddingHorizontal: 8,
    rowGap: 12,
  },
  stat: { width: "33.33%", alignItems: "center", gap: 2 },
  statValue: { color: N.ink, fontSize: 19, fontWeight: "800" },
  statLabel: { color: N.muted, fontSize: 11 },
  row: { flexDirection: "row", gap: 10 },
});
