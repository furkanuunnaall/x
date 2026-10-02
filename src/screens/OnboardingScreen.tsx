import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { Button, Shell, GameCard, useS } from "../ui";
import { FileArt, SealCoin } from "../art";
import { useTheme } from "../themeMode";
const slides = [
  [
    "Hukuk kelimelerini çöz.",
    "Tanımları oku, kavramları bul, bölümleri tamamla.",
  ],
  ["Bölümleri ilerlet.", "Yıldız kazan, XP topla ve yeni bölümleri aç."],
  ["Kendini geliştir.", "Günlük görevler, seriler ve başarımlarla ilerle."],
];
export default function OnboardingScreen() {
  const { C } = useTheme();
  const s = useS();
  const [index, setIndex] = useState(0);
  const { dispatch } = useGame();
  return (
    <Shell>
      <View style={{ gap: 12 }}>
        <Text style={[s.brand, { flex: 0 }]}>MÜHÜR</Text>
        <View style={{ alignItems: "center", paddingVertical: 4 }}>
          <GameCard
            style={{
              width: "100%",
              minHeight: 200,
              paddingVertical: 20,
              gap: 14,
              alignItems: "center",
              justifyContent: "center",
              borderColor: C.gold,
            }}
          >
            {index === 0 ? (
              <>
                <Text
                  style={{
                    color: C.gold,
                    fontSize: 12,
                    fontWeight: "800",
                    letterSpacing: 2,
                  }}
                >
                  TANIMDAN KAVRAMA
                </Text>
                <Text
                  style={{
                    color: C.ink,
                    fontSize: 18,
                    lineHeight: 26,
                    textAlign: "center",
                  }}
                >
                  Bir bölümü tamamlayan son dokunuş.
                </Text>
                <View style={{ flexDirection: "row", gap: 5, marginTop: 14 }}>
                  {"MÜHÜR".split("").map((letter, i) => (
                    <View
                      key={i}
                      style={{
                        width: 42,
                        height: 50,
                        borderRadius: 10,
                        borderBottomWidth: 4,
                        borderColor: "#B8A77E",
                        backgroundColor: i === 4 ? C.gold : "#F3EDDE",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "800",
                          color: "#273047",
                        }}
                      >
                        {letter}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text
                  style={{
                    color: C.green,
                    fontSize: 14,
                    fontWeight: "700",
                    marginTop: 12,
                  }}
                >
                  ✓ Bir kavram, bir adım daha.
                </Text>
              </>
            ) : (
              <SealCoin size={110} />
            )}
          </GameCard>
        </View>
        <Text style={[s.hero, { textAlign: "center" }]}>
          {slides[index][0]}
        </Text>
        <Text
          style={[
            s.text,
            { lineHeight: 22, textAlign: "center", color: C.muted },
          ]}
        >
          {slides[index][1]}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            padding: 6,
          }}
        >
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 26 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? C.gold : C.raised,
              }}
            />
          ))}
        </View>
        <Button
          title={index === 2 ? "BAŞLA" : "DEVAM ET"}
          onPress={() =>
            index === 2 ? dispatch({ type: "onboard" }) : setIndex(index + 1)
          }
        />
        {index > 0 ? (
          <Button secondary title="GERİ" onPress={() => setIndex(index - 1)} />
        ) : null}
      </View>
    </Shell>
  );
}
