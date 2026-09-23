import React from "react";
import {
  View,
} from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { badges, productOf } from "../product";
import { C, GameCard, Label, ProgressBar, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
export default function AchievementsScreen({
  navigation,
}: Props<"Achievements">) {
  const { game } = useGame(),
    p = productOf(game),
    list = badges(game);
  return (
    <Shell
      header={<TopBar title="Başarımlar" back={() => navigation.goBack()} />}
    >
      <Text style={s.hero}>İz bırakan başarılar.</Text>
      <Label>
        {p.unlockedAchievements.length}/{list.length} ROZET AÇILDI
      </Label>
      {list.map((b) => {
        const unlocked = p.unlockedAchievements.includes(b.id);
        return (
          <GameCard
            key={b.id}
            style={{
              gap: 12,
              borderColor: unlocked ? C.gold : C.line,
              opacity: unlocked ? 1 : 0.7,
              shadowColor: unlocked ? C.gold : C.bg,
              shadowOpacity: unlocked ? 0.22 : 0.1,
              shadowRadius: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: unlocked ? "#3A3540" : C.raised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: unlocked ? C.gold : C.muted,
                    fontSize: 24,
                    fontWeight: "800",
                  }}
                >
                  {b.icon}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[s.text, { fontWeight: "800" }]}>{b.title}</Text>
                <Text style={s.muted}>{b.detail}</Text>
              </View>
            </View>
            <Text style={unlocked ? s.gold : s.small}>
              {unlocked
                ? "✓ AÇILDI"
                : `${Math.min(b.value, b.total)}/${b.total} · KİLİTLİ`}
            </Text>
            <ProgressBar value={unlocked ? b.total : b.value} total={b.total} />
          </GameCard>
        );
      })}
    </Shell>
  );
}
