import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Seal } from "./art";
import { colors as C, spacing, radius, typography, shadows } from "./homeTheme";
export { C };
export function CurrencyBadge({ amount }: { amount: number }) {
  return (
    <View accessibilityLabel={`${amount} Mühür`} style={s.currency}>
      <Seal size={22} />
      <Text style={s.currencyText}>{amount}</Text>
    </View>
  );
}

export function ProgressBar({
  value,
  total = 1000,
}: {
  value: number;
  total?: number;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: value }}
      style={s.track}
    >
      <View
        style={[
          s.fill,
          { width: `${Math.min(100, Math.max(0, (value / total) * 100))}%` },
        ]}
      />
    </View>
  );
}

export function Stars({
  count = 0,
  size = 23,
  color = C.gold,
}: {
  color?: string;
  count?: number;
  size?: number;
}) {
  return (
    <Text
      accessibilityLabel={`${count} yıldız`}
      style={{ color, fontSize: size, letterSpacing: 4 }}
    >
      {"★".repeat(count)}
      <Text style={{ color: "#6B7693" }}>{"☆".repeat(3 - count)}</Text>
    </Text>
  );
}

const s = StyleSheet.create({
  currency: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: 10,
    backgroundColor: C.panel,
  },
  currencyText: { color: C.ink, fontSize: 15, fontWeight: "700" },
  track: {
    height: 7,
    backgroundColor: "#D2C7B5",
    borderRadius: 9,
    overflow: "hidden",
  },
  fill: { height: 7, backgroundColor: C.gold, borderRadius: 9 },
});
