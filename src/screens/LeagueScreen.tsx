import React from "react";
import {
  View,
} from "react-native";
import { Text } from "../AppText";
import { Avatar } from "../character";
import { Button, C, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
import { Gender, Role } from "../product";
const players: {
  name: string;
  gender: Gender;
  role: Role;
  points: number;
  level: number;
}[] = [
  {
    name: "Ada Yılmaz",
    gender: "Kadın",
    role: "Avukat",
    points: 4820,
    level: 18,
  },
  {
    name: "Mert Aras",
    gender: "Erkek",
    role: "Hakim",
    points: 4250,
    level: 16,
  },
  {
    name: "Derya Eren",
    gender: "Kadın",
    role: "Savcı",
    points: 3980,
    level: 15,
  },
  {
    name: "Deniz Kaya",
    gender: "Erkek",
    role: "Avukat",
    points: 3740,
    level: 14,
  },
  {
    name: "Selin Işık",
    gender: "Kadın",
    role: "Hakim",
    points: 3610,
    level: 14,
  },
  { name: "Ege Acar", gender: "Erkek", role: "Savcı", points: 3490, level: 13 },
  {
    name: "Aslı Erdem",
    gender: "Kadın",
    role: "Avukat",
    points: 3320,
    level: 12,
  },
];
export default function LeagueScreen({ navigation }: Props<"League">) {
  return (
    <Shell
      header={
        <TopBar
          title="Mühür Ligi"
          back={() => navigation.goBack()}
          right={<Label>DEMO</Label>}
        />
      }
    >
      <Label>ALTIN KÜRSÜ · ÖRNEK SEZON</Label>
      <Text style={s.hero}>İz bırakanlar.</Text>
      <Text style={s.muted}>
        Bu bir tasarım demosudur. Oyuncular, puanlar ve sıralamalar temsilidir;
        canlı lig veya sezon sayacı yoktur.
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
          paddingTop: 20,
        }}
      >
        {[1, 0, 2].map((i) => {
          const p = players[i],
            color = ["#F0CB78", "#B9CADD", "#CB9972"][i];
          return (
            <View
              key={p.name}
              style={{ flex: 1, alignItems: "center", gap: 10 }}
            >
              <Text style={{ color, fontSize: 24 }}>
                {i === 0 ? "♛" : `#${i + 1}`}
              </Text>
              <Avatar
                gender={p.gender}
                role={p.role}
                size={i === 0 ? 86 : 66}
                borderColor={color}
              />
              <View
                style={{
                  alignSelf: "stretch",
                  minHeight: i === 0 ? 174 : 143,
                  padding: 10,
                  gap: 10,
                  alignItems: "center",
                  borderTopWidth: 2,
                  borderColor: color,
                  borderRadius: 22,
                  backgroundColor: i === 0 ? "#3D3540" : "#182840",
                }}
              >
                <Text
                  style={[s.text, { textAlign: "center", fontWeight: "800" }]}
                >
                  {p.name}
                </Text>
                <Text style={[s.gold, { color }]}>{p.points} P</Text>
                <Text style={s.small}>Seviye {p.level}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Label>↑ YÜKSELME ALANI · DEMO</Label>
      {players.slice(3).map((p, i) => (
        <React.Fragment key={p.name}>
          {i === 2 ? (
            <Text style={[s.note, { color: C.gold }]}>— KADEME SINIRI —</Text>
          ) : null}
          <GameCard
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
            }}
          >
            <Text style={s.gold}>{i + 4}</Text>
            <Avatar gender={p.gender} role={p.role} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[s.text, { fontWeight: "700" }]}>{p.name}</Text>
              <Text style={s.small}>Seviye {p.level}</Text>
            </View>
            <Text style={s.gold}>{p.points}</Text>
          </GameCard>
        </React.Fragment>
      ))}
      <Button
        secondary
        title="PROFİLE DÖN"
        onPress={() => navigation.goBack()}
      />
    </Shell>
  );
}
