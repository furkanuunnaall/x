import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { C, s } from "../ui";
import { useDiscovery } from "./store";
import { Mark } from "./model";
export const markColors = {
  correct: "#267354",
  present: "#8C681C",
  absent: "#354158",
};
export function DiscoveryStatus() {
  const { ready, error, retry } = useDiscovery();
  return error ? (
    <Pressable accessibilityRole="button" onPress={retry}>
      <Text style={s.error}>{error}</Text>
    </Pressable>
  ) : !ready ? (
    <Text style={s.muted}>Kayıt açılıyor…</Text>
  ) : null;
}
export function TurkishKeyboard({
  onLetter,
  marks = {},
  disabled = false,
  rounded = false,
}: {
  onLetter: (letter: string) => void;
  marks?: Record<string, Mark>;
  disabled?: boolean;
  rounded?: boolean;
}) {
  return (
    <View style={k.board}>
      {["QWERTYUIOPĞÜ", "ASDFGHJKLŞİ", "ZXCVBNMÖÇ"].map((row) => (
        <View key={row} style={k.row}>
          {row.split("").map((letter) => (
            <Pressable
              key={letter}
              accessibilityRole="button"
              accessibilityLabel={`${letter}${marks[letter] === "correct" ? ", doğru konumda" : marks[letter] === "present" ? ", kelimede var" : marks[letter] === "absent" ? ", kelimede yok" : " harfi"}`}
              disabled={disabled}
              onPress={() => onLetter(letter)}
              style={({ pressed }) => [
                k.key,
                rounded && { borderRadius: 24, borderBottomWidth: 1, borderColor: "#2F3F58" },
                marks[letter] && { backgroundColor: markColors[marks[letter]] },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text maxFontSizeMultiplier={1.2} style={k.text}>
                {letter}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
const k = StyleSheet.create({
  board: { gap: 6, paddingVertical: 8 },
  row: { flexDirection: "row", gap: 3, justifyContent: "center" },
  key: {
    flex: 1,
    maxWidth: 46,
    minHeight: 48,
    borderRadius: 7,
    backgroundColor: C.raised,
    borderBottomWidth: 3,
    borderBottomColor: "#C4B496",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: C.ink, fontSize: 15, fontWeight: "800" },
});
