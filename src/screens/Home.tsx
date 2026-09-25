import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { logoFont, Text } from "../AppText";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  BookOpenTextIcon,
  FlameIcon,
  GearSixIcon,
  HourglassMediumIcon,
  MapTrifoldIcon,
  MedalIcon,
  TargetIcon,
} from "phosphor-react-native";
import { useGame } from "../store";
import { dailyNow, dayKey, entry } from "../game";
import { useReducedMotion } from "../motion";
import { files } from "../content";
import { Props } from "../navigation";
import { C as Palette, CurrencyBadge, ProgressBar } from "../homeUi";
import { LivingBackground } from "../LivingBackground";
import { useDiscovery } from "../discovery/store";
import { Avatar } from "../character";
import { productOf, newTaskDay, playerName } from "../product";

const C = { ...Palette, ink: "#FFF8EA", muted: "#D9D3C7", gold: "#F6CE50" };
const months = [
  "OCAK",
  "ŞUBAT",
  "MART",
  "NİSAN",
  "MAYIS",
  "HAZİRAN",
  "TEMMUZ",
  "AĞUSTOS",
  "EYLÜL",
  "EKİM",
  "KASIM",
  "ARALIK",
];
export default function Home({ navigation }: Props<"Home">) {
  const { game: g, error, retry } = useGame();
  const { day } = useDiscovery();
  const { height, width, fontScale } = useWindowDimensions();
  const p = productOf(g),
    tasks = p.dailyTasks[day] ?? newTaskDay();
  const current = files[g.file - 1];
  const count = current.questions.filter((q) => entry(g, q.id).solved).length;
  const result = g.results.find((r) => r.file === g.file);
  const dailyDone = p.dailyPuzzleClaims.includes(day);
  const insets = useSafeAreaInsets();
  // The home screen does not scroll, so it scales down to the height left after notches.
  const usable = height - insets.top - insets.bottom;
  const compact = usable < 860 || width < 360;
  const tight = usable < 690;
  const go = () =>
    navigation.navigate(
      result ? "Result" : g.file % 10 === 0 ? "FinalIntro" : "Game",
    );
  return (
    <View style={h.screen}>
      <LivingBackground source={require("../../assets/courtyard.png")} />
      <LinearGradient
        pointerEvents="none"
        colors={["#08132977", "#10244322", "#08122599", "#081225F5"]}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={[
            h.content,
            compact && { gap: 8, paddingBottom: 8 },
            fontScale > 1.3 && { gap: 24 },
          ]}
        >
          <View style={h.top}>
            <CurrencyBadge amount={g.seals} />
            <Streak days={dailyNow(g)} lit={g.lastDay === dayKey()} />
          </View>
          {error ? (
            <Pressable accessibilityRole="button" onPress={retry}>
              <Text style={h.error}>{error} · Tekrar dene</Text>
            </Pressable>
          ) : null}
          <View
            style={[
              h.brandArea,
              compact && { paddingTop: 10, paddingBottom: 8 },
              tight && { paddingTop: 0, paddingBottom: 0, gap: 2 },
            ]}
          >
            {tight ? null : (
              <Text style={h.brandOverline}>HER KAVRAM BİR İZ</Text>
            )}
            <Text
              style={[
                h.brand,
                compact && { fontSize: 52 },
                tight && { fontSize: 42 },
              ]}
            >
              MÜHÜR
            </Text>
            <View style={h.brandRule} />
            <Text style={h.tagline}>HUKUK KELİME OYUNU</Text>
          </View>
          <View
            style={[
              h.stage,
              compact && { minHeight: 214 },
              tight && { minHeight: 180 },
            ]}
          >
            <View style={[h.rail, tight && { gap: 8 }]}>
              <Shortcut
                title="GÜNLÜK GÖREVLER"
                icon={<TargetIcon size={32} weight="regular" color="#FFE09A" />}
                detail={`${tasks.claimed.length}/3`}
                label="Günlük görevleri aç"
                onPress={() => navigation.navigate("Tasks")}
              />
              <Shortcut
                title="ROZETLER"
                icon={<MedalIcon size={32} weight="regular" color="#FFE09A" />}
                label="Başarımları aç"
                onPress={() => navigation.navigate("Achievements")}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Bölüm ${g.file}, ${current.title}. Haritayı aç`}
              onPress={() => navigation.navigate("Map")}
              style={h.journey}
            >
              <LinearGradient
                colors={["#D2B77233", "#102448CC", "#142445DD"]}
                style={[
                  h.orbit,
                  compact && { minHeight: 176, paddingVertical: 14 },
                  tight && { minHeight: 150, paddingVertical: 10 },
                ]}
              >
                <Text
                  style={[
                    h.number,
                    compact && { fontSize: 56, lineHeight: 62 },
                    tight && { fontSize: 44, lineHeight: 50 },
                  ]}
                >
                  {g.file}
                </Text>
                <Text style={h.fileTitle}>{current.title}</Text>
                <Text style={h.mapLink}>YOLCULUĞUN ›</Text>
              </LinearGradient>
            </Pressable>
            <View style={[h.rail, tight && { gap: 8 }]}>
              <Shortcut
                title="KAVRAMLAR"
                icon={<BookOpenTextIcon size={32} weight="regular" color="#FFE09A" />}
                label="Kavram koleksiyonunu aç"
                onPress={() =>
                  navigation.navigate("Explore", { tab: "collection" })
                }
              />
              <Shortcut
                title="HARİTA"
                icon={<MapTrifoldIcon size={32} weight="regular" color="#FFE09A" />}
                detail={`${g.results.filter((r) => r.sealed).length}/${files.length}`}
                label="Bölüm haritasını aç"
                onPress={() => navigation.navigate("Map")}
              />
            </View>
          </View>
          <View style={h.playArea}>
            <View style={h.progress}>
              <Text style={h.progressText}>
                {result
                  ? "BÖLÜM TAMAMLANDI"
                  : `${count} / ${current.questions.length} KAVRAM ÇÖZÜLDÜ`}
              </Text>
              <ProgressBar value={count} total={current.questions.length} />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bölüme devam et"
              onPress={go}
              style={({ pressed }) => [
                h.playButton,
                pressed && {
                  transform: [{ translateY: 3 }],
                  borderBottomWidth: 2,
                },
              ]}
            >
              <LinearGradient
                colors={["#14A874", "#08805A", "#05593F"]}
                style={[h.playGradient, tight && { paddingVertical: 8 }]}
              >
                <Text style={h.playCaption}>
                  {result ? "SONUCU GÖR" : "DEVAM ET"}
                </Text>
                <Text style={[h.playText, tight && { fontSize: 23 }]}>
                  BÖLÜM {g.file} ›
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Günün şifresini aç"
              onPress={() => navigation.navigate("Daily")}
              style={({ pressed }) => [
                h.daily,
                tight && { minHeight: 62, paddingVertical: 8 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={h.dailyTitle}>GÜNLÜK BULMACA</Text>
                <Text style={h.dailyDetail}>
                  {dailyDone
                    ? "✓ Bugünün şifresi çözüldü"
                    : "3 hukuk kavramı · +100 XP · +20 Mühür"}
                </Text>
              </View>
              <View style={h.calendar}>
                <Text style={h.calendarTop}>
                  {months[Number(day.slice(5, 7)) - 1]}
                </Text>
                <Text style={h.calendarDay}>{Number(day.slice(-2))}</Text>
              </View>
            </Pressable>
          </View>
          <View
            style={[h.profile, compact && { marginTop: 0, paddingVertical: 4 }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profili aç"
              onPress={() => navigation.navigate("Profile")}
              style={({ pressed }) => [
                h.profileButton,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Avatar
                borderColor="#946213"
                gender={p.selectedGender}
                role={p.selectedRole}
                size={44}
              />
              <View style={{ flexShrink: 1, gap: 3 }}>
                <Text style={h.playerName}>{playerName(g)}</Text>
                <Text style={h.playerDetail}>
                  Seviye {Math.floor(g.xp / 1000) + 1} · {p.selectedRole}
                </Text>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ayarları aç"
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [
                h.settings,
                pressed && { transform: [{ scale: 0.94 }] },
              ]}
            >
              <GearSixIcon size={24} weight="regular" color={C.ink} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
// Unlit until a bölüm is finished today; until then an hourglass shows the day is still open.
function Streak({ days, lit }: { days: number; lit: boolean }) {
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pulse.setValue(0);
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: lit ? 1600 : 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: lit ? 1600 : 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit, reduced]);
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, lit ? 1.08 : 1.15],
  });
  return (
    <View
      accessible
      accessibilityLabel={`${days} günlük istikrar, ${lit ? "bugün tamamlandı" : "bugün henüz bölüm bitirmedin"}`}
      style={[h.streak, lit && h.streakLit]}
    >
      <Animated.View
        style={[
          h.flame,
          { transform: [{ scale }], opacity: lit ? 1 : 0.85 },
        ]}
      >
        <FlameIcon size={22} weight="fill" color={lit ? "#FF9F43" : "#7D8AA3"} />
      </Animated.View>
      <Text style={[h.streakValue, !lit && { color: "#C9D0DC" }]}>{days}</Text>
      {lit ? null : (
        <HourglassMediumIcon size={16} weight="fill" color="#FFB86B" />
      )}
      <Text style={[h.streakLabel, lit && { color: "#FFC98A" }]}>İSTİKRAR</Text>
    </View>
  );
}
function Shortcut({
  title,
  icon,
  detail,
  label,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  detail?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        h.shortcut,
        pressed && { transform: [{ scale: 0.95 }] },
      ]}
    >
      {/* The counter sits beside the gradient, not inside it: Android clips a native
          gradient view's children to its rounded bounds. */}
      <View>
        <LinearGradient
          colors={["#526888", "#20314C", "#10213B"]}
          style={h.shortcutOrb}
        >
          {typeof icon === "string" ? (
            <Text style={h.shortcutIcon}>{icon}</Text>
          ) : (
            icon
          )}
        </LinearGradient>
        {detail ? (
          <View style={h.counter}>
            <Text numberOfLines={1} style={h.counterText}>
              {detail}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={h.shortcutLabel}>{title}</Text>
    </Pressable>
  );
}
const h = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B1830" },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    justifyContent: "space-between",
    gap: 14,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  streak: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#9DACC266",
    borderRadius: 24,
    backgroundColor: "#101C35CC",
  },
  streakLit: { borderColor: "#FF9F4399", backgroundColor: "#2A1A12CC" },
  flame: { alignItems: "center", justifyContent: "center" },
  streakValue: { color: C.ink, fontWeight: "800", fontSize: 20 },
  streakLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  settings: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "#9DACC288",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101C35CC",
  },
  brandArea: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 20,
    gap: 5,
  },
  brandOverline: {
    color: "#F3DFC1",
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "700",
  },
  brand: {
    fontFamily: logoFont,
    color: "#FFF8E8",
    fontSize: 66,
    letterSpacing: 5,
    textShadowColor: "#0A142E",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 3 },
  },
  brandRule: {
    height: 1,
    width: 96,
    backgroundColor: "#DFC994",
    marginVertical: 5,
  },
  tagline: {
    color: "#EFE2CC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  stage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 250,
    gap: 4,
  },
  rail: { width: 70, gap: 26 },
  shortcut: { alignItems: "center", gap: 5, minHeight: 90 },
  shortcutOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#CBBD93",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#071126",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  shortcutIcon: { color: "#FFE09A", fontSize: 33, fontWeight: "700" },
  shortcutLabel: {
    fontSize: 10,
    color: "#FFF8E8",
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "#050C1ACC",
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
  counter: {
    position: "absolute",
    right: -8,
    top: -7,
    minWidth: 28,
    paddingHorizontal: 6,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#AD7830",
    borderWidth: 1,
    borderColor: "#FFE4A0",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  journey: { flex: 1, maxWidth: 250 },
  orbit: {
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#F4DEA788",
    minHeight: 210,
    paddingVertical: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#FFD789",
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
  number: { color: "#FFFAEC", fontSize: 72, lineHeight: 80, fontWeight: "800" },
  fileTitle: {
    color: C.ink,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
  mapLink: {
    color: "#DDCFB3",
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 6,
    fontWeight: "700",
  },
  playArea: { gap: 12, width: "100%", maxWidth: 400, alignSelf: "center" },
  progress: { alignSelf: "center", width: "68%", gap: 7 },
  progressText: {
    color: "#F0E5D0",
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
  playButton: {
    borderRadius: 40,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: "#023826",
    overflow: "hidden",
    shadowColor: "#EAB640",
    shadowRadius: 18,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  playGradient: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 3,
  },
  playCaption: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "800",
    color: "#F6CE50",
  },
  playText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F2FFF8",
    letterSpacing: 0.7,
  },
  daily: {
    minHeight: 78,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#B9B8B599",
    backgroundColor: "#0A152CDB",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 8,
  },
  dailyTitle: { color: "#FFF8E8", fontSize: 17, fontWeight: "800" },
  dailyDetail: { color: C.muted, fontSize: 11, lineHeight: 17 },
  calendar: {
    backgroundColor: "#14233B",
    width: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D3B468",
    overflow: "hidden",
    alignItems: "center",
  },
  calendarTop: {
    backgroundColor: "#D3B468",
    width: "100%",
    color: "#332512",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    padding: 3,
  },
  calendarDay: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF8EA",
    paddingTop: 2,
    paddingBottom: 4,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6,
    paddingVertical: 8,
  },
  profileButton: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playerName: { color: C.ink, fontSize: 14, fontWeight: "700" },
  playerDetail: { color: C.muted, fontSize: 11 },
  error: { color: C.red, backgroundColor: C.bg, padding: 10, borderRadius: 10 },
});
