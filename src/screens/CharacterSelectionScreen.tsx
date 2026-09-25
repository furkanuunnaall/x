import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "../AppText";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "../store";
import { characters, Gender, productOf, Role, playerName } from "../product";
import { Avatar } from "../character";
import { Button, C, Label, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
export default function CharacterSelectionScreen({
  navigation,
}: Props<"Character">) {
  const { game, dispatch } = useGame(),
    p = productOf(game);
  const [gender, setGender] = useState<Gender>(p.selectedGender ?? "Kadın");
  const [role, setRole] = useState<Role>(p.selectedRole ?? "Avukat");
  const c = characters.find((c) => c.gender === gender && c.role === role)!;
  return (
    <Shell>
      <View style={v.body}>
        <TopBar
          title="Karakterini seç"
          back={p.selectedCharacter ? () => navigation.goBack() : undefined}
        />
        <Text style={s.muted}>Aynı sen. Oyunda başka bir hikâye.</Text>
        <View style={v.section}>
          <View style={v.sectionHeader}>
            <Label>01 · GÖRÜNÜM</Label>
            <Text style={s.small}>Tarzını seç</Text>
          </View>
          <View style={v.row}>
            {(["Kadın", "Erkek"] as Gender[]).map((value) => (
              <Choice
                key={value}
                text={value}
                selected={gender === value}
                onPress={() => setGender(value)}
              />
            ))}
          </View>
        </View>
        <View style={v.section}>
          <View style={v.sectionHeader}>
            <Label>02 · OYUN ROLÜ</Label>
            <Text style={s.small}>Karakterine yön ver</Text>
          </View>
          <View style={v.row}>
            {(["Avukat", "Hakim", "Savcı"] as Role[]).map((value) => (
              <Choice
                key={value}
                icon={{ Avukat: "§", Hakim: "◆", Savcı: "▥" }[value]}
                text={value}
                selected={role === value}
                onPress={() => setRole(value)}
              />
            ))}
          </View>
        </View>
        <LinearGradient
          colors={["#25344B", "#1C2A40", "#14223A"]}
          style={v.preview}
        >
          <View style={v.previewRow}>
            <View style={v.portraitFrame}>
              <Avatar gender={gender} role={role} size={92} />
              <View style={v.badge}>
                <Text style={v.badgeText}>✦</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Label>{role.toLocaleUpperCase("tr-TR")}</Label>
              <Text style={v.name}>{playerName(game)}</Text>
              <Text style={v.detail}>{c.detail}</Text>
            </View>
          </View>
          <View style={v.previewFoot}>
            <Text style={v.themeName}>{c.name} karakterinden ilhamla</Text>
          </View>
        </LinearGradient>
        <Button
          title="SEÇ VE DEVAM ET"
          onPress={() => {
            dispatch({ type: "character", gender, role });
            if (p.selectedCharacter) navigation.goBack();
          }}
        />
        <Text style={s.note}>
          Bu bir oyun rolü; profilinden istediğin zaman değiştirebilirsin.
        </Text>
      </View>
    </Shell>
  );
}
function Choice({
  text,
  icon,
  selected,
  onPress,
}: {
  text: string;
  icon?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={text}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        v.choice,
        icon ? v.roleChoice : v.genderChoice,
        selected && v.selected,
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon && (
        <Text style={[v.icon, selected && { color: C.gold }]}>{icon}</Text>
      )}
      <Text style={[v.choiceText, selected && { color: C.gold }]}>{text}</Text>
      {selected && <Text style={v.check}>✓</Text>}
    </Pressable>
  );
}
const v = StyleSheet.create({
  body: { gap: 12 },
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  row: { flexDirection: "row", gap: 10 },
  choice: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: "#1B2C46",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  genderChoice: { minHeight: 46 },
  roleChoice: { minHeight: 66, gap: 4 },
  selected: { borderColor: C.gold, backgroundColor: "#3A3540", borderWidth: 2 },
  choiceText: { color: C.ink, fontSize: 15, fontWeight: "700" },
  icon: { color: C.muted, fontSize: 22 },
  check: {
    position: "absolute",
    right: 9,
    top: 6,
    color: C.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  preview: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#998047",
    paddingTop: 16,
    paddingHorizontal: 16,
    gap: 10,
    overflow: "hidden",
  },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  portraitFrame: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: C.gold,
    shadowColor: C.gold,
    shadowRadius: 18,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 0 },
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: 0,
    borderRadius: 15,
    width: 28,
    height: 28,
    backgroundColor: "#F1CE65",
    borderWidth: 2,
    borderColor: "#FAF1E2",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 14, color: "#443215" },
  name: {
    color: C.ink,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  detail: { color: C.muted, fontSize: 13, lineHeight: 18 },
  previewFoot: {
    alignSelf: "stretch",
    borderTopWidth: 1,
    borderColor: "#D4C3A8",
    paddingVertical: 10,
  },
  themeName: { fontSize: 12, color: C.muted, textAlign: "center" },
});
