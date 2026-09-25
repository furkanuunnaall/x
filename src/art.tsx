import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { logoFont, Text } from "./AppText";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { colors as C } from "./theme";
// Milled coin edge for SealCoin, drawn once in a 64-unit box.
const coinRidges = Array.from({ length: 48 }, (_, i) => {
  const a = (i / 48) * Math.PI * 2,
    c = Math.cos(a),
    s = Math.sin(a);
  return `M${(32 + 24.5 * c).toFixed(2)} ${(32 + 24.5 * s).toFixed(2)}L${(32 + 27 * c).toFixed(2)} ${(32 + 27 * s).toFixed(2)}`;
}).join("");
/** The Mühür currency: a milled gold coin with an engraved Cinzel M. */
export function SealCoin({ size = 24 }: { size?: number }) {
  // Gradient ids must be unique: on web a hidden screen's <svg> would otherwise own them.
  const id = React.useId().replace(/:/g, "");
  const letter = {
    position: "absolute" as const,
    width: size,
    textAlign: "center" as const,
    fontFamily: logoFont,
    fontSize: size * 0.38,
    lineHeight: size * 0.46,
  };
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={`${id}face`} x1="0.2" y1="0" x2="0.8" y2="1">
            <Stop offset="0" stopColor="#FFF0B8" />
            <Stop offset="0.45" stopColor="#E2B546" />
            <Stop offset="1" stopColor="#8A6420" />
          </SvgGradient>
          <SvgGradient id={`${id}inner`} x1="0.8" y1="1" x2="0.2" y2="0">
            <Stop offset="0" stopColor="#FFE39A" />
            <Stop offset="0.5" stopColor="#D9A83A" />
            <Stop offset="1" stopColor="#9C7224" />
          </SvgGradient>
        </Defs>
        <Circle cx={32} cy={33.5} r={27} fill="#5E420F" />
        <Circle cx={32} cy={32} r={27} fill={`url(#${id}face)`} />
        <Path d={coinRidges} stroke="#8A6420" strokeOpacity={0.55} strokeWidth={1.2} />
        <Circle cx={32} cy={32} r={21} fill={`url(#${id}inner)`} stroke="#7A5519" strokeWidth={1} />
        <Circle cx={32} cy={32} r={18} fill="none" stroke="#FFF0B8" strokeOpacity={0.5} />
        <Path
          d="M14 24 A20 20 0 0 1 30 10"
          stroke="#FFFFFF"
          strokeOpacity={0.55}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text style={[letter, { color: "#FFF3C899", marginTop: size * 0.03 }]}>M</Text>
      <Text style={[letter, { color: "#6B4A12" }]}>M</Text>
    </View>
  );
}
/** Original seal and document artwork, built from native shapes. The classic gold seal is
 * kept as the previous currency icon so it can be restored in CurrencyBadge at any time. */
export function Seal({
  size = 60,
  value = "M",
}: {
  size?: number;
  value?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: size * 0.18,
          transform: [{ rotate: "45deg" }],
          backgroundColor: "#5D4B24",
          borderWidth: 1,
          borderColor: "#B79848",
        }}
      />
      <LinearGradient
        colors={["#FFE8A0", "#D5A535", "#8E6720"]}
        style={{
          width: size * 0.82,
          height: size * 0.82,
          borderRadius: size,
          borderWidth: 2,
          borderColor: "#F5D878",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: size * 0.65,
            height: size * 0.65,
            borderRadius: size,
            borderWidth: 1,
            borderColor: "#8E681D",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#372B13",
              fontSize: size * 0.34,
              fontWeight: "900",
            }}
          >
            {value}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
export function FileArt() {
  return (
    <View accessible={false} style={{ width: 100, height: 114 }}>
      <View
        style={{
          position: "absolute",
          width: 76,
          height: 93,
          top: 9,
          left: 15,
          borderRadius: 10,
          backgroundColor: "#263953",
          borderWidth: 1,
          borderColor: "#566A84",
          transform: [{ rotate: "12deg" }],
        }}
      />
      <LinearGradient
        colors={["#F2E6C3", "#C0AD7D"]}
        style={{
          width: 75,
          height: 96,
          padding: 12,
          borderRadius: 8,
          transform: [{ rotate: "-8deg" }],
        }}
      >
        <View
          style={{
            width: 22,
            height: 4,
            backgroundColor: "#9B8250",
            marginBottom: 14,
          }}
        />
        {[44, 37, 43, 28].map((w, i) => (
          <View
            key={i}
            style={{
              height: 3,
              width: w,
              backgroundColor: "#B4A176",
              marginBottom: 7,
            }}
          />
        ))}
      </LinearGradient>
      <View style={{ position: "absolute", right: 0, bottom: 0 }}>
        <Seal size={47} />
      </View>
    </View>
  );
}
export function Ambient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={require("../assets/courtyard.png")}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["#07142BAA", "#0B1933D9", "#081326F2"]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
