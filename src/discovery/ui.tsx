import React from "react";
import {
  Pressable,
} from "react-native";
import { Text } from "../AppText";
import { s } from "../ui";
import { useDiscovery } from "./store";
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
