import React from "react";
import { View } from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { Button, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";
export default function FinalIntroScreen({ navigation }: Props<"FinalIntro">) {
  const { game } = useGame();
  return (
    <Shell>
      <View style={{ gap: 10 }}>
        <TopBar title="Özel bölüm" back={() => navigation.goBack()} />
        <View style={{ alignItems: "center", paddingVertical: 6 }}>
          <Seal size={92} value="◆" />
        </View>
        <Label>FİNAL BÖLÜMÜ {String(game.file / 10).padStart(2, "0")}</Label>
        <Text style={[s.hero, { fontSize: 30, lineHeight: 36 }]}>
          FİNAL BÖLÜMÜ
        </Text>
        <Text style={s.gold}>Bütün izler burada birleşiyor.</Text>
        <Text style={s.text}>Bu bölümde öğrendiklerini bir araya getir.</Text>
        <GameCard style={{ gap: 6, padding: 16, borderColor: "#A37832" }}>
          <Text style={s.text}>9 kavram · Zorlu inceleme</Text>
          <Text style={s.gold}>Cevap XP’sine ek +250 XP</Text>
          <Text style={s.gold}>Tamamlama: +150 Mühür</Text>
          <Text style={s.muted}>
            Ayrıca kilometre taşı ödülünü alabilirsin.
          </Text>
        </GameCard>
        <Button title="BAŞLA" onPress={() => navigation.replace("Game")} />
      </View>
    </Shell>
  );
}
