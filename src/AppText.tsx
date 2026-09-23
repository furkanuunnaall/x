import React, { createContext, useContext } from "react";
import { Text as RNText, StyleSheet, TextProps, TextStyle } from "react-native";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel";

export const fontAssets = {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  Cinzel_700Bold,
};

export const logoFont = "Cinzel_700Bold";

const manrope: Record<string, keyof typeof fontAssets> = {
  "500": "Manrope_500Medium",
  "600": "Manrope_600SemiBold",
  "700": "Manrope_700Bold",
  bold: "Manrope_700Bold",
  "800": "Manrope_800ExtraBold",
  "900": "Manrope_800ExtraBold",
};

const Nested = createContext(false);

// Custom fonts ignore fontWeight on Android, so each weight maps to its own font file.
export function Text({ style, ...props }: TextProps) {
  const nested = useContext(Nested);
  const flat: TextStyle = StyleSheet.flatten(style) ?? {};
  let fontStyle: TextStyle | undefined;
  if (!flat.fontFamily && (flat.fontWeight !== undefined || !nested)) {
    fontStyle = {
      fontFamily: manrope[String(flat.fontWeight)] ?? "Manrope_400Regular",
      fontWeight: "normal",
    };
  }
  return (
    <Nested.Provider value>
      <RNText {...props} style={fontStyle ? [style, fontStyle] : style} />
    </Nested.Provider>
  );
}
