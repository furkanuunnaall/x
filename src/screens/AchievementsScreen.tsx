import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../AppText";
import { LinearGradient } from "expo-linear-gradient";
import {
  BooksIcon,
  CrosshairIcon,
  FlagIcon,
  FlameIcon,
  GavelIcon,
  Icon,
  LightningIcon,
  LockSimpleIcon,
  StarIcon,
} from "phosphor-react-native";
import { useGame } from "../store";
import { badges, productOf } from "../product";
import { C, GameCard, Label, ProgressBar, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
const icons: Record<string, Icon> = {
  first: FlagIcon,
  sharp: LightningIcon,
  perfect: StarIcon,
  hunter: CrosshairIcon,
  hundred: BooksIcon,
  streak: FlameIcon,
  final: GavelIcon,
};
export default function AchievementsScreen({
  navigation,
}: Props<"Achievements">) {
  const { game } = useGame(),
    p = productOf(game),
    list = badges(game);
  const [selectedId, setSelectedId] = useState(list[0].id);
  const selected = list.find((b) => b.id === selectedId) ?? list[0];
  const selectedUnlocked = p.unlockedAchievements.includes(selected.id);
  return (
    <Shell
      header={<TopBar title="Başarımlar" back={() => navigation.goBack()} />}
    >
      <Label>
        {p.unlockedAchievements.length}/{list.length} ROZET AÇILDI
      </Label>
      <GameCard
        style={[
          a.detail,
          { borderColor: selectedUnlocked ? C.gold : C.line },
        ]}
      >
        <View style={a.detailRow}>
          <Emblem id={selected.id} unlocked={selectedUnlocked} size={56} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={a.detailTitle}>{selected.title}</Text>
            <Text style={s.muted}>{selected.detail}</Text>
          </View>
        </View>
        <Text style={selectedUnlocked ? s.gold : s.small}>
          {selectedUnlocked
            ? "✓ AÇILDI"
            : `${Math.min(selected.value, selected.total)}/${selected.total} · KİLİTLİ`}
        </Text>
        <ProgressBar
          value={selectedUnlocked ? selected.total : selected.value}
          total={selected.total}
        />
      </GameCard>
      <View style={a.grid}>
        {list.map((b) => {
          const unlocked = p.unlockedAchievements.includes(b.id);
          const active = b.id === selected.id;
          return (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={`${b.title}, ${unlocked ? "açıldı" : "kilitli"}`}
              accessibilityState={{ selected: active }}
              onPress={() => setSelectedId(b.id)}
              style={({ pressed }) => [
                a.tile,
                active && a.activeTile,
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Emblem id={b.id} unlocked={unlocked} size={50} />
              <Text numberOfLines={2} style={a.tileTitle}>
                {b.title}
              </Text>
              <Text style={[a.tileState, unlocked && { color: C.gold }]}>
                {unlocked ? "✓" : `${Math.min(b.value, b.total)}/${b.total}`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Shell>
  );
}
function Emblem({
  id,
  unlocked,
  size,
}: {
  id: string;
  unlocked: boolean;
  size: number;
}) {
  const Glyph = icons[id] ?? StarIcon;
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View style={box}>
      {unlocked ? (
        <LinearGradient
          colors={["#F6DA8A", "#C9993A", "#8A6420"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={[a.emblem, box, { borderColor: "#FFE9B0" }]}
        >
          <Glyph size={size * 0.5} weight="fill" color="#3A2A10" />
        </LinearGradient>
      ) : (
        <View style={[a.emblem, box, a.lockedEmblem]}>
          <Glyph size={size * 0.46} weight="regular" color={C.muted} />
        </View>
      )}
      {unlocked ? null : (
        <View style={[a.lock, { width: size * 0.38, height: size * 0.38 }]}>
          <LockSimpleIcon size={size * 0.22} weight="fill" color={C.muted} />
        </View>
      )}
    </View>
  );
}
const a = StyleSheet.create({
  detail: { gap: 10, padding: 16 },
  detailRow: { flexDirection: "row", gap: 14, alignItems: "center" },
  detailTitle: { color: C.ink, fontSize: 18, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  tile: {
    width: "25%",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTile: { borderColor: C.gold, backgroundColor: "#CFAB4B14" },
  emblem: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  lockedEmblem: { backgroundColor: C.raised, borderColor: C.line },
  lock: {
    position: "absolute",
    right: -2,
    bottom: -2,
    borderRadius: 99,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    color: C.ink,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 28,
  },
  tileState: { color: C.muted, fontSize: 11, fontWeight: "800" },
});
