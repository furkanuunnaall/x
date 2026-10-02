import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ambient, SealCoin } from "./art";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Text } from "./AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "./store";
import { colors, spacing, radius, typography, shadows } from "./theme";
import { useTheme } from "./themeMode";
import { colors as N } from "./theme";
export function useS() {
  return useTheme().sx(sN);
}
export function GameCard({
  children,
  style,
  tone = "default",
}: {
  tone?: "default" | "paper";
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { sx, tg } = useTheme();
  const s = sx(sN);
  const success = StyleSheet.flatten(style)?.backgroundColor === "#E2EED6";
  return (
    <LinearGradient
      colors={tg(
        success
          ? ["#193E38", "#112D2A"]
          : tone === "paper"
            ? ["#FFF8EA", "#E8DCC5"]
            : ["#23334DEE", "#101F38F5"],
      )}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[s.card, style]}
    >
      {children}
    </LinearGradient>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  small?: boolean;
}) {
  const { C, sx, tg } = useTheme();
  const s = sx(sN);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        small && s.smallButton,
        secondary ? s.secondary : shadows.gold,
        disabled && { opacity: 0.38 },
        pressed && { transform: [{ translateY: 2 }], borderBottomWidth: 1 },
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={
          secondary ? tg(["#263952", "#15243E"]) : ["#FFE3A0", "#E9BB59", "#C88E33"]
        }
        style={[StyleSheet.absoluteFill, { borderRadius: 28 }]}
      />
      <Text
        style={[
          s.buttonText,
          small && { fontSize: 12, letterSpacing: 0.4 },
          secondary && { color: C.ink },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export const PrimaryButton = Button;
export function SecondaryButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} secondary />;
}
export function Label({ children }: { children: React.ReactNode }) {
  const { sx } = useTheme();
  const s = sx(sN);
  return <Text style={s.label}>{children}</Text>;
}
export function CurrencyBadge({ amount }: { amount: number }) {
  const { sx } = useTheme();
  const s = sx(sN);
  return (
    <View accessibilityLabel={`${amount} Mühür`} style={s.currency}>
      <SealCoin size={24} />
      <Text style={s.currencyText}>{amount}</Text>
    </View>
  );
}
export function TopBar({
  title,
  back,
  right,
}: {
  title: string;
  back?: () => void;
  right?: React.ReactNode;
}) {
  const { C, sx } = useTheme();
  const s = sx(sN);
  return (
    <View style={s.top}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={back}
          style={s.back}
        >
          <Text style={{ color: C.ink, fontSize: 27 }}>‹</Text>
        </Pressable>
      ) : null}
      <Text style={s.brand}>{title}</Text>
      {right}
    </View>
  );
}
export function Top({
  title,
  back,
  right,
}: {
  title: string;
  back?: () => void;
  right?: string;
}) {
  const { sx } = useTheme();
  const s = sx(sN);
  return (
    <TopBar
      title={title}
      back={back}
      right={right ? <Text style={s.gold}>{right}</Text> : undefined}
    />
  );
}
export function ProgressBar({
  value,
  total = 1000,
}: {
  value: number;
  total?: number;
}) {
  const { sx } = useTheme();
  const s = sx(sN);
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
export function XPTrack({ xp }: { xp: number }) {
  const { sx } = useTheme();
  const s = sx(sN);
  return (
    <View style={{ gap: 9 }}>
      <View style={s.between}>
        <Text style={s.small}>{xp} XP</Text>
        <Text style={s.small}>Sonraki seviyeye {1000 - (xp % 1000)} XP</Text>
      </View>
      <ProgressBar value={xp % 1000} />
    </View>
  );
}
export function Stars({
  count = 0,
  size = 23,
  color,
}: {
  color?: string;
  count?: number;
  size?: number;
}) {
  const { C, tc } = useTheme();
  color ??= C.gold;
  return (
    <Text
      accessibilityLabel={`${count} yıldız`}
      style={{ color, fontSize: size, letterSpacing: 4 }}
    >
      {"★".repeat(count)}
      <Text style={{ color: tc("#6B7693", "text") }}>{"☆".repeat(3 - count)}</Text>
    </Text>
  );
}
export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  const { C, sx } = useTheme();
  const s = sx(sN);
  return (
    <GameCard style={{ flex: 1, minWidth: 125, gap: 8, padding: 16 }}>
      {icon ? (
        <Text style={{ color: C.gold, fontSize: 21 }}>{icon}</Text>
      ) : null}
      <Text style={s.value}>{value}</Text>
      <Text style={s.muted}>{label}</Text>
    </GameCard>
  );
}
export function LevelNode({
  kind = "normal",
  number,
  current,
  done,
  stars = 0,
  onPress,
}: {
  kind?: "normal" | "reward" | "final";
  number: number;
  current: boolean;
  done: boolean;
  stars?: number;
  onPress?: () => void;
}) {
  const { C, sx } = useTheme();
  const s = sx(sN);
  return (
    <View style={{ alignItems: "center", gap: 7 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Bölüm ${number}, ${current ? "mevcut" : done ? "tamamlandı" : "kilitli"}`}
        accessibilityState={{ disabled: !onPress }}
        disabled={!onPress}
        onPress={onPress}
        style={[
          s.node,
          current && s.currentNode,
          done && !current && s.doneNode,
          kind === "final" && {
            width: 82,
            height: 82,
            borderRadius: 26,
            borderWidth: 2,
          },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={
            current
              ? ["#FFECA6", "#F5C843", "#CF9A26"]
              : done
                ? ["#A4FFDF", "#54DDA7", "#259273"]
                : ["#2C3A51", "#152038"]
          }
          style={[StyleSheet.absoluteFill, { borderRadius: current ? 40 : 32 }]}
        />
        <Text
          style={{
            color: current ? C.bg : done ? "#09372A" : C.muted,
            fontSize: current ? 30 : 24,
            fontWeight: "800",
          }}
        >
          {done && !current ? "✓" : number}
        </Text>
      </Pressable>
      {done ? (
        <Stars count={stars} size={16} />
      ) : (
        <Text style={s.small}>{current ? "ŞİMDİ OYNA" : "KİLİTLİ"}</Text>
      )}
    </View>
  );
}
export function AnswerSlot({
  letter,
  locked,
  active,
  failed,
  width,
  onPress,
  label,
}: {
  letter: string;
  locked: boolean;
  active: boolean;
  failed: boolean;
  width: number;
  onPress: () => void;
  label: string;
}) {
  const { C, sx, tc } = useTheme();
  const s = sx(sN);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: locked, selected: active }}
      disabled={locked}
      onPress={onPress}
      style={[
        s.slot,
        { width },
        active && { borderColor: C.gold },
        locked && { backgroundColor: tc("#393322"), borderColor: C.gold },
        failed && { borderColor: C.red },
      ]}
    >
      <Text
        style={{
          color: locked ? C.gold : C.ink,
          fontSize: 20,
          fontWeight: "800",
        }}
      >
        {letter}
      </Text>
    </Pressable>
  );
}
export function Shell({
  children,
  header,
  footer,
  compact,
  scroll = false,
  scrollRef,
  dim = 0,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
  scroll?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
  /** Extra darkening over the background art, 0–1, so busy content stands out. */
  dim?: number;
}) {
  const { sx, tc, light } = useTheme();
  const s = sx(sN);
  const { error, retry } = useGame();
  const errorBanner = error ? (
    <Pressable accessibilityRole="button" onPress={retry}>
      <Text style={s.error}>{error}</Text>
    </Pressable>
  ) : null;
  return (
    <SafeAreaView style={s.safe}>
      <Ambient />
      {dim ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            // Night darkens toward black; day softens toward cream paper.
            { backgroundColor: light ? `rgba(244, 236, 221, ${dim * 0.8})` : `rgba(0, 0, 0, ${dim})` },
          ]}
        />
      ) : null}
      {header ? (
        <View
          style={[
            s.frame,
            {
              padding: 14,
              backgroundColor: tc("#0C1934B8"),
              borderRadius: 22,
              marginTop: 10,
              marginBottom: 12,
              width: "94%",
            },
          ]}
        >
          {header}
        </View>
      ) : null}
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[s.page, compact && { paddingTop: 0 }]}
        >
          {errorBanner}
          {children}
        </ScrollView>
      ) : (
        <View style={[s.page, s.fixedPage, compact && { paddingTop: 0 }]}>
          {errorBanner}
          {children}
        </View>
      )}
      {footer ? (
        <View
          style={[
            s.frame,
            {
              width: "94%",
              padding: 14,
              marginBottom: 10,
              backgroundColor: tc("#131D31F2"),
              borderWidth: 1,
              borderColor: tc("#2A3752"),
              borderRadius: 22,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
export const sN = StyleSheet.create({
  safe: { flex: 1, backgroundColor: N.bg },
  frame: { width: "100%", maxWidth: 560, alignSelf: "center" },
  page: {
    padding: 16,
    paddingBottom: 28,
    marginVertical: 12,
    backgroundColor: "transparent",
    borderRadius: 26,
    width: "94%",
    maxWidth: 560,
    alignSelf: "center",
    gap: 20,
  },
  fixedPage: { flex: 1, overflow: "hidden", paddingBottom: 16 },
  card: {
    backgroundColor: N.panel,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "#52607980",
    ...shadows.card,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
  brand: { color: N.ink, fontSize: 21, fontWeight: "800", flex: 1 },
  back: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: N.panel,
    borderRadius: radius.md,
  },
  currency: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: radius.sm,
    backgroundColor: N.panel,
  },
  currencyText: { color: N.ink, fontSize: 15, fontWeight: "700" },
  gold: { color: N.gold, fontSize: 17, fontWeight: "700" },
  label: {
    color: N.gold,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  text: { color: N.ink, fontSize: typography.body, lineHeight: 24 },
  muted: { color: N.muted, fontSize: 14, lineHeight: 21 },
  small: { color: N.muted, fontSize: 12, lineHeight: 18 },
  value: { fontSize: 27, fontWeight: "800", color: N.ink },
  hero: {
    color: N.ink,
    fontSize: typography.hero,
    fontWeight: "800",
    lineHeight: 39,
  },
  between: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  row: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  button: {
    minHeight: 56,
    backgroundColor: N.gold,
    borderRadius: 30,
    borderBottomWidth: 4,
    borderBottomColor: "#8B6228",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButton: {
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
  },
  secondary: {
    backgroundColor: N.raised,
    borderBottomColor: N.line,
    borderBottomWidth: 2,
  },
  buttonText: {
    color: "#332512",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.7,
    textAlign: "center",
  },
  track: {
    height: 7,
    backgroundColor: "#34425B",
    borderRadius: 9,
    overflow: "hidden",
  },
  fill: { height: 7, backgroundColor: N.gold, borderRadius: 9 },
  note: { fontSize: 13, color: N.muted, lineHeight: 21, textAlign: "center" },
  error: { color: N.red, fontSize: 14, padding: 12 },
  node: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: N.panel,
    borderWidth: 3,
    borderColor: N.line,
    justifyContent: "center",
    alignItems: "center",
  },
  currentNode: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: N.gold,
    borderColor: "#FFEBA0",
    ...shadows.gold,
  },
  doneNode: { backgroundColor: N.green, borderColor: "#A2F7D6" },
  slot: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: N.line,
    backgroundColor: N.panel,
    alignItems: "center",
    justifyContent: "center",
  },
});
