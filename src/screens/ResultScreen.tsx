import { Seal } from "../art";
import React, { useRef, useEffect } from "react";
import { Animated, Text, View } from "react-native";
import { useGame } from "../store";
import { productOf } from "../product";
import { files } from "../content";
import { Props } from "../navigation";
import {
  Button,
  GameCard,
  Label,
  Shell,
  Stars,
  TopBar,
  C,
  s,
  SecondaryButton,
} from "../ui";
import { Reveal, useReducedMotion } from "../motion";
export default function ResultScreen({ navigation }: Props<"Result">) {
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
          title="DOSYAYA DÖN"
          onPress={() => navigation.replace("Game")}
        />
      </Shell>
    );
  return (
    <Shell>
      <TopBar
        title={`${g.file % 10 === 0 ? "Final Dosyası" : "Dosya"} ${String(g.file).padStart(2, "0")}`}
        back={() => navigation.navigate("Home")}
      />
      <Reveal>
        <View style={{ alignItems: "center", gap: 18, paddingVertical: 20 }}>
          <Animated.View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: C.panel,
              borderWidth: 2,
              borderColor: C.gold,
              justifyContent: "center",
              alignItems: "center",
              transform: [{ scale: stamp }],
            }}
          >
            <Seal
              size={84}
              value={g.file % 10 === 0 ? "◆" : r.sealed ? "✓" : "M"}
            />
          </Animated.View>
          <Label>
            {r.sealed ? "MÜHRÜNÜ BIRAKTIN" : "BÜTÜN KAVRAMLAR ÇÖZÜLDÜ"}
          </Label>
          <Text style={[s.hero, { textAlign: "center" }]}>
            {g.file % 10 === 0 ? "FINAL DOSYASI\nÇÖZÜLDÜ" : "DOSYA\nTAMAMLANDI"}
          </Text>
          <Stars count={r.stars} size={48} />
          <Text style={s.muted}>
            {r.stars === 3
              ? "Kusursuz takip. Üç yıldız senin."
              : "Bir dosya daha çözüldü."}
          </Text>
        </View>
      </Reveal>
      {g.file % 10 === 0 ? (
        <GameCard
          style={{ gap: 10, borderColor: C.gold, backgroundColor: "#392C35" }}
        >
          <Label>◆ FINAL USTASI</Label>
          <Text style={s.text}>Final dosyasına mührünü bıraktın.</Text>
          <Text style={s.muted}>
            +250 bonus XP ve +100 ek Mühür aşağıdaki toplam ödüle dahildir.
          </Text>
        </GameCard>
      ) : null}
      <GameCard style={{ gap: 19 }}>
        {[
          [
            "Çözülen kavram",
            `${r.count}/${files[g.file - 1].questions.length}`,
          ],
          ["Kazanılan XP", `+${r.xp} XP`],
          ["Kazanılan Mühür", `+${r.seals} ◈`],
          ["En uzun seri", `${r.best} doğru`],
          ["Kullanılan ipucu", r.hints],
          ["Hata sayısı", r.mistakes ?? g.run.mistakes],
        ].map(([label, value]) => (
          <View key={label} style={s.between}>
            <Text style={s.muted}>{label}</Text>
            <Text
              style={[
                s.text,
                {
                  fontWeight: "800",
                  color: label === "Kazanılan Mühür" ? C.gold : C.ink,
                },
              ]}
            >
              {value}
            </Text>
          </View>
        ))}
      </GameCard>
      {g.file % 5 === 0 ? (
        <Button
          secondary
          title={
            productOf(g).claimedMilestones.includes(g.file)
              ? "✓ KİLOMETRE TAŞI ÖDÜLÜ ALINDI"
              : "KİLOMETRE TAŞI · ÖDÜLÜNÜ GÖR"
          }
          onPress={() => navigation.navigate("Milestone", { file: g.file })}
        />
      ) : null}
      {r.file < files.length ? (
        <Button title="SONRAKİ DOSYA →" onPress={nextFile} />
      ) : (
        <Text style={s.note}>
          30 dosyanın tamamı çözüldü. Yolculuğun arşivde!
        </Text>
      )}
      <SecondaryButton
        title="HARİTAYA DÖN"
        onPress={() => {
          dispatch({ type: "seal" });
          navigation.navigate("Map");
        }}
      />
      <Button
        secondary
        title="TEKRAR OYNA · ÖDÜLSÜZ"
        onPress={() => {
          dispatch({ type: "replay-start", file: g.file });
          navigation.navigate("Practice", { file: g.file });
        }}
      />
    </Shell>
  );
}
