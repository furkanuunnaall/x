import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { Text } from "./AppText";
import { LinearGradient } from "expo-linear-gradient";
import { colors as C } from "./theme";
/** Original seal and document artwork, built from native shapes. */
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
