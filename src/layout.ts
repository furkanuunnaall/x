import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Phone height classes, measured on the space left after the notch and home indicator:
 * compact ≈ iPhone SE / small Android, regular ≈ iPhone 15, tall ≈ Pro Max / large Android. */
export type SizeClass = "compact" | "regular" | "tall";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
// Usable height of a regular phone (iPhone 15: 852 − 59 − 34); sizes are designed for it.
const BASE_HEIGHT = 760;

/**
 * One source of truth for sizing a screen to the phone it runs on. Values are designed for a
 * regular phone and then grow or shrink with the usable height, always within limits, so a
 * screen neither overflows on an SE nor floats in empty space on a Pro Max.
 */
export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usable = height - insets.top - insets.bottom;
  const size: SizeClass = usable < 680 ? "compact" : usable >= 800 ? "tall" : "regular";
  const k = clamp(usable / BASE_HEIGHT, 0.85, 1.15);
  /** A size (icon, tile, button height) that follows the screen within ±20% of its design. */
  const fit = (base: number, min = base * 0.8, max = base * 1.2) =>
    Math.round(clamp(base * k, min, max));
  // 0 on an iPhone SE, 1 on a phone with room for the full design (usable ≥ 860).
  const t = clamp((usable - 650) / 210, 0, 1);
  /** Blends a value from its smallest-phone size to its full size by the usable height. */
  const between = (small: number, full: number) => Math.round(small + (full - small) * t);
  /** A gap or padding; spacing gives way first on short screens and opens up on tall ones. */
  const space = (base: number) => Math.round(clamp(base * k * k, base * 0.6, base * 1.4));
  return {
    width,
    height,
    usable,
    insets,
    size,
    compact: size === "compact",
    tall: size === "tall",
    fontScale,
    fit,
    space,
    between,
  };
}
