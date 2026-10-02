import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { StampIcon, XIcon } from "phosphor-react-native";
import { Text, logoFont } from "./AppText";
import { courtyard, SealCoin } from "./art";
import { useReducedMotion } from "./motion";
import { useTheme } from "./themeMode";
import { useGame } from "./store";
import { productOf, stampBoard } from "./product";
import { dayKey } from "./game";

/** Home badge for the daily envelopes; a gold dot shows while today's pick is still unused. */
export function StampButton({ onPress }: { onPress: () => void }) {
  const { game: g } = useGame();
  const { light } = useTheme();
  const ready = productOf(g).dailyStamp?.day !== dayKey();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ready ? "Günlük zarflar, seçim hakkın var" : "Günlük zarflar, bugün seçildi"}
      onPress={onPress}
      style={({ pressed }) => [x.badge, light && x.badgeDay, pressed && { opacity: 0.75 }]}
    >
      <StampIcon size={24} weight="fill" color={light ? "#9A7524" : "#FFE09A"} />
      {ready ? <View style={x.dot} /> : null}
    </Pressable>
  );
}

const untilMidnight = (now: Date) => {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
};

/** One sealed envelope. It flips (squeezes to a line and back) to show the reward inside. */
function Envelope({
  amount,
  open,
  picked,
  faded,
  width,
  disabled,
  onPress,
  index,
}: {
  amount: number;
  open: Animated.Value;
  picked: boolean;
  faded: boolean;
  width: number;
  disabled: boolean;
  onPress: () => void;
  index: number;
}) {
  const height = width * 0.78;
  const rare = amount >= 60;
  const front = open.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] });
  const back = open.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [0, 0, faded ? 0.5 : 1, faded ? 0.5 : 1],
  });
  const squeeze = open.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.02, 1] });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={disabled ? `${index + 1}. zarf: ${amount} Mühür` : `${index + 1}. zarfı aç`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{ width, height }, pressed && { transform: [{ scale: 0.95 }] }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scaleX: squeeze }] }]}>
        <Animated.View style={[x.envelope, { opacity: front }]}>
          {/* Flap lines drawn edge to edge so the envelope scales with the grid. */}
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 78"
            preserveAspectRatio="none"
            style={StyleSheet.absoluteFill}
          >
            <Path d="M2 3 L50 44 L98 3" stroke="#C9B48A" strokeWidth={1.6} fill="none" />
            <Path d="M2 76 L38 36 M98 76 L62 36" stroke="#E0D0AE" strokeWidth={1.2} fill="none" />
          </Svg>
          <View
            style={[
              x.wax,
              { width: width * 0.34, height: width * 0.34, borderRadius: width * 0.17 },
            ]}
          >
            <Text style={[x.waxLetter, { fontSize: width * 0.16 }]}>M</Text>
          </View>
        </Animated.View>
        <Animated.View
          style={[x.card, rare && x.cardRare, picked && x.cardPicked, { opacity: back }]}
        >
          <SealCoin size={width * 0.24} />
          <Text style={[x.cardAmount, rare && { color: "#8A5A10" }, { fontSize: width * 0.19 }]}>
            +{amount}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** Daily envelopes: nine sealed envelopes, the player breaks one seal a day and keeps what is inside. */
export function DailyStampModal({ onClose }: { onClose: () => void }) {
  const { game: g, dispatch } = useGame();
  const { light } = useTheme();
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width: screen } = useWindowDimensions();
  const p = productOf(g);
  const today = dayKey();
  const board = stampBoard(today);
  const pick = p.dailyStamp?.day === today ? p.dailyStamp : null;
  const [revealed, setRevealed] = useState(pick !== null);
  const [now, setNow] = useState(() => new Date());
  const flips = useRef(board.map(() => new Animated.Value(pick ? 1 : 0))).current;
  const sound = useAudioPlayer(require("../assets/correct.wav"));

  useEffect(() => {
    if (!revealed) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [revealed]);

  function choose(index: number) {
    if (pick) return;
    dispatch({ type: "daily-stamp", index });
    if (p.settings.vibration)
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (p.settings.sound)
      void sound
        .seekTo(0)
        .then(() => sound.play())
        .catch(() => {});
    if (reduced) {
      flips.forEach((f) => f.setValue(1));
      setRevealed(true);
      return;
    }
    // The chosen envelope opens first; the rest follow so the player sees what else was on the table.
    Animated.sequence([
      Animated.timing(flips[index], {
        toValue: 1,
        duration: 520,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(450),
      Animated.stagger(
        70,
        flips
          .filter((_, i) => i !== index)
          .map((f) => Animated.timing(f, { toValue: 1, duration: 360, useNativeDriver: true })),
      ),
    ]).start(() => setRevealed(true));
  }

  const inkText = light ? "#2A2418" : "#FFF5E3";
  const muted = light ? "#5E5444" : "#D9CDB8";
  const gap = 12;
  const grid = Math.min(screen - 48, 340);
  const cell = (grid - gap * 2) / 3;
  const amount = pick?.amount ?? 0;
  return (
    <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={x.screen}>
        <ImageBackground
          source={light ? courtyard.morning : courtyard.night}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          blurRadius={3}
        />
        <LinearGradient
          colors={
            light
              ? ["#FFF8EC88", "#FFF3DEDD", "#FFF8ECF5"]
              : ["#0B1229AA", "#101C35E0", "#0B1229F8"]
          }
          style={StyleSheet.absoluteFill}
        />
        <View style={[x.body, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={12}
            onPress={onClose}
            style={({ pressed }) => [
              x.close,
              { top: insets.top + 12 },
              light && x.closeDay,
              pressed && { opacity: 0.6 },
            ]}
          >
            <XIcon size={20} weight="bold" color={inkText} />
          </Pressable>
          <Text style={[x.label, { color: light ? "#9A7524" : "#F0CB78" }]}>GÜNLÜK ZARFLAR</Text>
          {/* Cinzel has no lowercase, so titles are written in Turkish capitals to keep the dotted İ. */}
          <Text style={[x.title, { color: inkText }]}>
            {!pick
              ? "BİR ZARF SEÇ"
              : amount >= 100
                ? "BÜYÜK ÖDÜL!"
                : amount >= 60
                  ? "NADİR ZARF!"
                  : "ZARF AÇILDI"}
          </Text>
          <Text style={[x.note, { color: muted }]}>
            {pick
              ? "Diğer zarflarda neler olduğunu gör."
              : "Dokuz mühürlü zarftan birini aç,\niçindeki Mühürler senin."}
          </Text>
          <View style={[x.grid, { width: grid, gap }]}>
            {board.map((value, i) => (
              <Envelope
                key={i}
                index={i}
                amount={value}
                open={flips[i]}
                picked={pick?.index === i}
                faded={pick !== null && pick.index !== i}
                width={cell}
                disabled={pick !== null}
                onPress={() => choose(i)}
              />
            ))}
          </View>
          <View style={[x.result, { opacity: pick && revealed ? 1 : 0 }]}>
            <View style={x.reward}>
              <SealCoin size={30} />
              <Text style={[x.rewardText, { color: inkText }]}>+{amount} Mühür</Text>
            </View>
            <Text style={[x.note, { color: muted, marginTop: 6 }]}>
              Yarın yeni zarflar seni bekliyor{"\n"}
              <Text style={{ color: inkText, fontWeight: "800" }}>{untilMidnight(now)}</Text>
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const x = StyleSheet.create({
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#9DACC266",
    backgroundColor: "#101C35CC",
  },
  badgeDay: { borderColor: "#C9A04A", backgroundColor: "#FFFDF8E6" },
  dot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#F2B33D",
    borderWidth: 2,
    borderColor: "#FFF5E3",
  },
  screen: { flex: 1, backgroundColor: "#0B1229" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  close: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F0CB7855",
    backgroundColor: "#15233DCC",
  },
  closeDay: { borderColor: "#C9A04A", backgroundColor: "#FFFDF8E6" },
  label: { fontSize: 13, letterSpacing: 3, fontWeight: "800" },
  title: { fontFamily: logoFont, fontSize: 28, marginTop: 6, textAlign: "center" },
  note: { marginTop: 10, fontSize: 14, lineHeight: 22, fontWeight: "600", textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 26 },
  envelope: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: "#FBF3E2",
    borderWidth: 1,
    borderColor: "#D8C69E",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  wax: {
    marginTop: 8,
    backgroundColor: "#A8302A",
    borderWidth: 2,
    borderColor: "#7E1F1A",
    alignItems: "center",
    justifyContent: "center",
  },
  waxLetter: { fontFamily: logoFont, color: "#F6D3C8" },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: "#FFFDF8",
    borderWidth: 1,
    borderColor: "#D8C69E",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cardRare: { backgroundColor: "#FFF1CC", borderColor: "#C9A04A" },
  cardPicked: { borderWidth: 3, borderColor: "#22A06B" },
  cardAmount: { fontWeight: "900", color: "#3A2A10" },
  result: { alignItems: "center", marginTop: 22 },
  reward: { flexDirection: "row", alignItems: "center", gap: 8 },
  rewardText: { fontSize: 26, fontWeight: "900" },
});
