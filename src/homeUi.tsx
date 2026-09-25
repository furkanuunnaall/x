import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { Text } from "./AppText";
import { SealCoin } from "./art";
import { colors as C, spacing, radius, typography, shadows } from "./homeTheme";
export { C };
export function CurrencyBadge({ amount }: { amount: number }) {
  return (
    <View accessibilityLabel={`${amount} Mühür`} style={s.currency}>
      <SealCoin size={26} />
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

const s = StyleSheet.create({
  // Same dark glass pill as the streak badge, so the two top badges read as a pair.
  currency: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 44,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#9DACC266",
    backgroundColor: "#101C35CC",
  },
  currencyText: { color: "#FFF5E3", fontSize: 20, fontWeight: "800" },
  track: {
    height: 7,
    backgroundColor: "#D2C7B5",
    borderRadius: 9,
    overflow: "hidden",
  },
  fill: { height: 7, backgroundColor: C.gold, borderRadius: 9 },
});
