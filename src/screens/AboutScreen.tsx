import React from "react";
import { View } from "react-native";
import { Text, logoFont } from "../AppText";
import { SealCoin } from "../art";
import { GameCard, Label, Shell, TopBar, useS } from "../ui";
import { Props } from "../navigation";
import { useTheme } from "../themeMode";
import { files } from "../content";
import app from "../../app.json";

const sections: [string, string][] = [
  [
    "OYUN",
    "MÜHÜR, hukuk kavramlarıyla oynanan bağımsız bir kelime oyunudur. Her bölümde ipuçlarından yola çıkarak kavramları bulur, Mühür ve XP kazanırsın.",
  ],
  [
    "İÇERİK",
    `${files.length} bölüm, günlük bulmacalar ve kavram koleksiyonu. Karakterler kurgusaldır; tanımlar oyun amaçlı kısa açıklamalardır.`,
  ],
  [
    "VERİ",
    "İlerlemen yalnızca bu cihazda saklanır. Hesap gerekmez, kişisel veri toplanmaz.",
  ],
  [
    "UYARI",
    "Oyundaki bilgiler eğitim ve eğlence amaçlıdır; hukuki danışmanlık yerine geçmez.",
  ],
];

export default function AboutScreen({ navigation }: Props<"About">) {
  const { C } = useTheme();
  const s = useS();
  return (
    <Shell header={<TopBar title="Hakkında" back={() => navigation.goBack()} />}>
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 8 }}>
        <SealCoin size={72} />
        <Text style={{ fontFamily: logoFont, fontSize: 30, color: C.ink, marginTop: 6 }}>
          MÜHÜR
        </Text>
        <Text style={[s.small, { letterSpacing: 2, fontWeight: "800" }]}>HUKUK KELİME OYUNU</Text>
        <Text style={s.muted}>Sürüm {app.expo.version}</Text>
      </View>
      {sections.map(([title, body]) => (
        <GameCard key={title} style={{ gap: 8, padding: 16 }}>
          <Label>{title}</Label>
          <Text style={s.text}>{body}</Text>
        </GameCard>
      ))}
    </Shell>
  );
}
