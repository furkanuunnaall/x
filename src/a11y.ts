import { AccessibilityInfo, Platform } from "react-native";

/** Reads a message aloud when a screen reader is on; does nothing otherwise. */
export function announce(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

/** For text that is also shown on screen with accessibilityLiveRegion: Android already reads
 * live regions, iOS does not, so only iOS needs it announced. */
export function announceOnIOS(message: string) {
  if (Platform.OS === "ios") announce(message);
}

/** A button title as a screen reader should say it: arrows and separators dropped. */
export const spoken = (title: string) =>
  title
    .replace(/\s*·\s*/g, ", ")
    .replace(/[→›‹]/g, "")
    .replace(/\s+/g, " ")
    .trim();
