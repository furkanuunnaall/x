import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, TextInput, View } from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { cleanName, productOf, validName } from "../product";
import { Button, C, Label, Shell, TopBar, s } from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";

// The screen does not scroll, so the intro hides while typing to keep the form above the keyboard.
function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const a = Keyboard.addListener(show, () => setOpen(true));
    const b = Keyboard.addListener(hide, () => setOpen(false));
    return () => {
      a.remove();
      b.remove();
    };
  }, []);
  return open;
}

export default function NameScreen({ navigation }: Props<"Name">) {
  const { game, dispatch } = useGame(),
    p = productOf(game),
    editing = !!(p.firstName && p.lastName);
  const [first, setFirst] = useState(p.firstName),
    [last, setLast] = useState(p.lastName);
  const [focused, setFocused] = useState("");
  const keyboardOpen = useKeyboardOpen();
  const lastInput = useRef<TextInput>(null);
  const valid = validName(cleanName(first)) && validName(cleanName(last));
  const save = () => {
    if (!valid) return;
    dispatch({ type: "player-name", firstName: first, lastName: last });
    if (editing) navigation.goBack();
  };
  return (
    <Shell>
      <View style={v.body}>
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
        {keyboardOpen ? null : (
          <View style={v.hero}>
            <View style={v.halo}>
              <Seal size={58} />
            </View>
            <Label>{editing ? "OYUNCU PROFİLİN" : "HER BÖLÜM BİR KEŞİF"}</Label>
            <Text style={v.heading}>
              {editing ? "İmzanı güncelle." : "Önce seni tanıyalım."}
            </Text>
            <Text style={v.description}>
              Adını yaz, karakterini seç. İlk bölümün seni bekliyor.
            </Text>
          </View>
        )}
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
      </View>
    </Shell>
  );
}
const v = StyleSheet.create({
  body: { gap: 12 },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 4,
  },
  step: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  activeStep: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  stepLine: { flex: 1, height: 1, backgroundColor: C.line },
  hero: { alignItems: "center", gap: 8, paddingVertical: 4 },
  halo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderColor: "#695A38",
    backgroundColor: "#28374B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heading: {
    color: C.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  description: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 290,
  },
  form: { gap: 6 },
  label: {
    color: C.muted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 4,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: C.ink,
    fontSize: 18,
    backgroundColor: "#1B2C46",
  },
  focused: { borderColor: C.gold, backgroundColor: "#24344C" },
});
