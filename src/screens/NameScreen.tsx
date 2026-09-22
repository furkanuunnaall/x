import React, { useRef, useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { useGame } from "../store";
import { cleanName, productOf, validName } from "../product";
import { Button, C, Label, Shell, TopBar, s } from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";
export default function NameScreen({ navigation }: Props<"Name">) {
  const { game, dispatch } = useGame(),
    p = productOf(game),
    editing = !!(p.firstName && p.lastName);
  const [first, setFirst] = useState(p.firstName),
    [last, setLast] = useState(p.lastName);
  const [focused, setFocused] = useState("");
  const lastInput = useRef<TextInput>(null);
  const valid = validName(cleanName(first)) && validName(cleanName(last));
  const save = () => {
    if (!valid) return;
    dispatch({ type: "player-name", firstName: first, lastName: last });
    if (editing) navigation.goBack();
  };
  return (
    <Shell>
      <TopBar
        title={editing ? "Oyuncu bilgilerin" : "MÜHÜR"}
        back={editing ? () => navigation.goBack() : undefined}
      />
      {!editing && (
        <View style={v.steps}>
          <Text style={v.activeStep}>01 SENİN İMZAN</Text>
          <View style={v.stepLine} />
          <Text style={v.step}>02 KARAKTERİN</Text>
        </View>
      )}
      <View style={v.hero}>
        <View style={v.halo}>
          <Seal size={82} />
        </View>
        <Label>{editing ? "OYUNCU PROFİLİN" : "HER DOSYA BİR KEŞİF"}</Label>
        <Text style={v.heading}>
          {editing ? "İmzanı güncelle." : "Önce seni tanıyalım."}
        </Text>
        <Text style={v.description}>
          Adını yaz, karakterini seç. İlk dosyan seni bekliyor.
        </Text>
      </View>
      <View style={v.form}>
        <Text style={v.label}>AD</Text>
        <TextInput
          accessibilityLabel="Ad"
          value={first}
          onChangeText={setFirst}
          placeholder="Adın"
          placeholderTextColor="#8290AD"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="givenName"
          maxLength={40}
          returnKeyType="next"
          onSubmitEditing={() => lastInput.current?.focus()}
          onFocus={() => setFocused("first")}
          onBlur={() => setFocused("")}
          style={[v.input, focused === "first" && v.focused]}
        />
        <Text style={v.label}>SOYAD</Text>
        <TextInput
          ref={lastInput}
          accessibilityLabel="Soyad"
          value={last}
          onChangeText={setLast}
          placeholder="Soyadın"
          placeholderTextColor="#8290AD"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="familyName"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={save}
          onFocus={() => setFocused("last")}
          onBlur={() => setFocused("")}
          style={[v.input, focused === "last" && v.focused]}
        />
      </View>
      <Button
        title={editing ? "KAYDET" : "DEVAM ET · KARAKTERİNİ SEÇ"}
        disabled={!valid}
        onPress={save}
      />
      <Text style={s.note}>
        Yalnızca bu cihazdaki oyuncu profilin için kullanılır.
      </Text>
    </Shell>
  );
}
const v = StyleSheet.create({
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 8,
  },
  step: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  activeStep: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  stepLine: { flex: 1, height: 1, backgroundColor: C.line },
  hero: { alignItems: "center", gap: 14, paddingVertical: 18 },
  halo: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 1,
    borderColor: "#695A38",
    backgroundColor: "#28374B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  heading: {
    color: C.ink,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  description: {
    color: C.muted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 290,
  },
  form: { gap: 10, paddingVertical: 8 },
  label: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 6,
  },
  input: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: C.ink,
    fontSize: 19,
    backgroundColor: "#1B2C46",
  },
  focused: { borderColor: C.gold, backgroundColor: "#24344C" },
});
