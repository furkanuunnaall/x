import { Avatar } from "../character";
import { productOf, knownTerms, playerName } from "../product";
import { SealCoin } from "../art";
import React, { useState } from "react";
import {
  Pressable,
  View,
  StyleSheet,
} from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { dailyNow } from "../game";
import { Props } from "../navigation";
import { Button, GameCard, Label, Shell, TopBar, XPTrack, StatCard, CurrencyBadge, useS } from "../ui";
import { useTheme } from "../themeMode";
import { colors as N } from "../theme";
export default function Profile({ navigation }: Props<"Profile">) {
  const { C, sx, tc } = useTheme();
  const s = useS();
  const v = sx(vN);
  const { game: g } = useGame();
  const p = productOf(g);
  const [ranking, setRanking] = useState(false);
  const ranked = [...g.results].sort(
    (a, b) => b.xp - a.xp || a.file - b.file,
  );
  return (
    <Shell scroll>
      <TopBar
        title={ranking ? "Kişisel sıralama" : "Oyuncu profilin"}
        back={() => (ranking ? setRanking(false) : navigation.popTo("Home"))}
        right={<CurrencyBadge amount={g.seals} />}
      />
      {!ranking && (
        <Button
          secondary
          title="MÜHÜR LİGİ · DEMO →"
          onPress={() => navigation.navigate("League")}
        />
      )}
      {!ranking && (
        <Button
          secondary
          title="KİŞİSEL BÖLÜM SIRALAMAM"
          onPress={() => setRanking(true)}
        />
      )}
      {ranking ? (
        <>
          <GameCard style={{ gap: 8 }}>
            <Label>✦ KİŞİSEL BÖLÜM SIRALAMAN</Label>
            <Text style={s.text}>En güçlü sonuçların, aynı kürsüde.</Text>
            <Text style={s.small}>
              XP’ye göre sıralanır. Yalnızca bu cihazdaki
              sonuçların.
            </Text>
          </GameCard>
          {ranked.length ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "flex-end",
                  paddingTop: 20,
                }}
              >
                {[1, 0, 2]
                  .filter((i) => ranked[i])
                  .map((i) => (
                    <View
                      key={i}
                      style={{ flex: 1, alignItems: "center", gap: 10 }}
                    >
                      <Text style={{ color: C.gold, fontSize: 22 }}>
                        {i === 0 ? "♛" : `#${i + 1}`}
                      </Text>
                      <SealCoin size={i === 0 ? 72 : 56} value={String(i + 1)} />
                      <View
                        style={{
                          alignSelf: "stretch",
                          minHeight: i === 0 ? 160 : 132,
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          backgroundColor: i === 0 ? tc("#3C3540") : C.panel,
                          padding: 10,
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                          borderTopWidth: 2,
                          borderColor: i === 0 ? C.gold : C.line,
                        }}
                      >
                        <Text
                          style={[
                            s.text,
                            {
                              fontSize: 15,
                              fontWeight: "800",
                              textAlign: "center",
                            },
                          ]}
                        >
                          Bölüm {ranked[i].file}
                        </Text>
                        <Text style={[s.gold, { fontSize: 17 }]}>
                          {ranked[i].xp} XP
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
              {ranked.slice(3).map((r, i) => (
                <GameCard
                  key={r.file}
                  style={{
                    padding: 16,
                    flexDirection: "row",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: i < 3 ? C.gold : C.muted,
                      fontSize: 21,
                      fontWeight: "800",
                      minWidth: 26,
                    }}
                  >
                    {i + 4}
                  </Text>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={[s.text, { fontWeight: "700" }]}>
                      Bölüm {r.file}
                    </Text>
                    <Text style={s.small}>
                      {r.count} kavram · {r.best} en uzun seri
                    </Text>
                  </View>
                  <View style={{ gap: 6, alignItems: "flex-end" }}>
                    <Text style={s.gold}>{r.xp} XP</Text>
                  </View>
                </GameCard>
              ))}
            </>
          ) : (
            <GameCard
              style={{ gap: 18, alignItems: "center", paddingVertical: 30 }}
            >
              <SealCoin size={80} />
              <Text style={s.hero}>Kürsü seni bekliyor.</Text>
              <Text style={[s.muted, { textAlign: "center" }]}>
                İlk bölümünü tamamladığında kişisel sıralaman burada oluşacak.
              </Text>
              <Button
                title="BÖLÜME DEVAM ET"
                onPress={() =>
                  navigation.navigate(g.file % 10 === 0 ? "FinalIntro" : "Game")
                }
              />
            </GameCard>
          )}
        </>
      ) : (
        <>
          <GameCard style={v.identity}>
            <View style={v.identityTop}>
              <Label>OYUNCU KARTIN</Label>
              <Text style={v.level}>SEVİYE {Math.floor(g.xp / 1000) + 1}</Text>
            </View>
            <View style={v.portrait}>
              <Avatar
                size={116}
                gender={p.selectedGender}
                role={p.selectedRole}
              />
              <View style={v.levelBadge}>
                <Text style={v.levelNumber}>{Math.floor(g.xp / 1000) + 1}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", gap: 8 }}>
              <Label>{p.selectedRole ?? "KAVRAM ÇÖZÜCÜ"}</Label>
              <Text style={v.playerName}>{playerName(g)}</Text>
            </View>
            <XPTrack xp={g.xp} />
          </GameCard>
          <View style={s.row}>
            <StatCard
              label="Çözülen kavram"
              value={knownTerms(g).length}
              icon="▤"
            />
            <StatCard
              label="Günlük seri"
              value={`${dailyNow(g)} gün`}
              icon="✦"
            />
          </View>
          <GameCard style={{ gap: 19 }}>
            {[
              ["Mevcut bölüm", g.file],
              ["En uzun doğru serisi", g.best],
            ].map(([label, value]) => (
              <View key={label} style={s.between}>
                <Text style={s.muted}>{label}</Text>
                <Text style={[s.text, { fontWeight: "800" }]}>{value}</Text>
              </View>
            ))}
          </GameCard>
        </>
      )}
      {!ranking && (
        <>
          <Label>PROFİLİNİ ÖZELLEŞTİR</Label>
          <View style={v.menu}>
            {(
              [
                ["AD SOYAD DÜZENLE", "Name", "✎"],
                ["KARAKTERİ DEĞİŞTİR", "Character", "◉"],
              ] as const
            ).map(([title, route, icon], index) => (
              <Pressable
                key={route}
                accessibilityRole="button"
                accessibilityLabel={title}
                onPress={() => navigation.navigate(route)}
                style={({ pressed }) => [
                  v.menuRow,
                  index > 0 && v.separator,
                  pressed && { backgroundColor: C.raised },
                ]}
              >
                <Text style={v.menuIcon}>{icon}</Text>
                <Text style={v.menuTitle}>{title}</Text>
                <Text style={v.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
      <Text style={s.note}>İlerlemen bu cihazda saklanır.</Text>
    </Shell>
  );
}

const vN = StyleSheet.create({
  identity: { gap: 20, borderColor: "#766641", paddingVertical: 22 },
  identityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  level: {
    color: N.gold,
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "#3A3540",
    padding: 7,
    borderRadius: 8,
  },
  portrait: {
    alignSelf: "center",
    borderWidth: 2,
    borderColor: N.gold,
    padding: 5,
    borderRadius: 80,
  },
  levelBadge: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1CE65",
    borderWidth: 3,
    borderColor: "#FFF6E6",
    alignItems: "center",
    justifyContent: "center",
  },
  levelNumber: { fontSize: 16, fontWeight: "800", color: "#382B14" },
  playerName: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "800",
    color: N.ink,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  menu: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: N.line,
    backgroundColor: "#14243D",
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    minHeight: 60,
    padding: 16,
    alignItems: "center",
    gap: 14,
  },
  separator: { borderTopWidth: 1, borderColor: "#39465C" },
  menuIcon: { color: N.gold, fontSize: 21, width: 25, textAlign: "center" },
  menuTitle: {
    flex: 1,
    color: N.ink,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  chevron: { color: N.muted, fontSize: 27 },
});
