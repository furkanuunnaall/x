import React from "react";
import { Text, View } from "react-native";
import { useGame } from "../store";
import { Button, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";
export default function FinalIntroScreen({ navigation }: Props<"FinalIntro">) {
  const { game } = useGame();
  return (
    <Shell>
      <TopBar title="Özel dosya" back={() => navigation.goBack()} />
      <View style={{ alignItems: "center", padding: 32 }}>
        <Seal size={140} value="◆" />
      </View>
      <Label>FINAL DOSYASI {String(game.file / 10).padStart(2, "0")}</Label>
      <Text style={[s.hero, { fontSize: 38, lineHeight: 46 }]}>
        FINAL DOSYASI
      </Text>
      <Text style={s.gold}>Bütün izler burada birleşiyor.</Text>
      <Text style={s.text}>Bu dosyada öğrendiklerini bir araya getir.</Text>
      <GameCard style={{ gap: 14, borderColor: "#A37832" }}>
        <Text style={s.text}>9 kavram · Zorlu inceleme</Text>
        <Text style={s.gold}>Cevap XP’sine ek +250 XP</Text>
        <Text style={s.gold}>Tamamlama: +150 Mühür</Text>
        <Text style={s.muted}>Ayrıca kilometre taşı ödülünü alabilirsin.</Text>
      </GameCard>
      <Button title="BAŞLA" onPress={() => navigation.replace("Game")} />
    </Shell>
  );
}
