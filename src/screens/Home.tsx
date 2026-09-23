import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { logoFont, Text } from "../AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGame } from "../store";
import { dailyNow, entry } from "../game";
import { files } from "../content";
import { Props } from "../navigation";
import { C as Palette, CurrencyBadge, ProgressBar } from "../homeUi";
import { Seal } from "../art";
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
  const compact = height < 740 || width < 360;
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            h.content,
            { minHeight: Math.max(620, height - 54) },
            fontScale > 1.3 && { gap: 24 },
          ]}
        >
          <View style={h.top}>
            <CurrencyBadge amount={g.seals} />
            <View style={h.streak}>
              <Text style={h.streakIcon}>✦</Text>
              <Text style={h.streakValue}>{dailyNow(g)}</Text>
              <Text style={h.streakLabel}>GÜN</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ayarları aç"
              onPress={() => navigation.navigate("Settings")}
              style={h.settings}
            >
              <Text style={h.settingsIcon}>⚙</Text>
            </Pressable>
          </View>
          {error ? (
            <Pressable accessibilityRole="button" onPress={retry}>
              <Text style={h.error}>{error} · Tekrar dene</Text>
            </Pressable>
          ) : null}
          <View
            style={[
              h.brandArea,
              compact && { paddingTop: 18, paddingBottom: 16 },
            ]}
          >
            <Text style={h.brandOverline}>HER KAVRAM BİR İZ</Text>
            <Text style={[h.brand, compact && { fontSize: 51 }]}>MÜHÜR</Text>
            <View style={h.brandRule} />
            <Text style={h.tagline}>HUKUK KELİME OYUNU</Text>
          </View>
          <View style={[h.stage, compact && { minHeight: 220 }]}>
            <View style={h.rail}>
              <Shortcut
                title="GÜNLÜK GÖREVLER"
                icon="✦"
                detail={`${tasks.claimed.length}/3`}
                label="Günlük görevleri aç"
                onPress={() => navigation.navigate("Tasks")}
              />
              <Shortcut
                title="ROZETLER"
                icon="★"
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
                style={[h.orbit, compact && { minHeight: 170 }]}
              >
                <Text
                  style={[
                    h.number,
                    compact && { fontSize: 55, lineHeight: 62 },
                  ]}
                >
                  {g.file}
                </Text>
                <Text style={h.fileTitle}>{current.title}</Text>
                <Text style={h.mapLink}>YOLCULUĞUN ›</Text>
              </LinearGradient>
            </Pressable>
            <View style={h.rail}>
              <Shortcut
                title="KAVRAMLAR"
                icon="▤"
                label="Kavram koleksiyonunu aç"
                onPress={() =>
                  navigation.navigate("Explore", { tab: "collection" })
                }
              />
              <Shortcut
                title="HARİTA"
                icon="⌁"
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
                style={h.playGradient}
              >
                <Text style={h.playCaption}>
                  {result ? "SONUCU GÖR" : "DEVAM ET"}
                </Text>
                <Text style={h.playText}>BÖLÜM {g.file} ›</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Günün şifresini aç"
              onPress={() => navigation.navigate("Daily")}
              style={({ pressed }) => [h.daily, pressed && { opacity: 0.8 }]}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profili aç"
            onPress={() => navigation.navigate("Profile")}
            style={h.profile}
          >
            <Avatar
              borderColor="#946213"
              gender={p.selectedGender}
              role={p.selectedRole}
              size={44}
            />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={h.playerName}>{playerName(g)}</Text>
              <Text style={h.playerDetail}>
                Seviye {Math.floor(g.xp / 1000) + 1} · {p.selectedRole}
              </Text>
            </View>
            <Text style={h.profileLink}>PROFİL ›</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
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
  icon: string;
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
      <LinearGradient
        colors={["#526888", "#20314C", "#10213B"]}
        style={h.shortcutOrb}
      >
        {icon === "★" ? (
          <Seal size={40} value="★" />
        ) : (
          <Text style={h.shortcutIcon}>{icon}</Text>
        )}
        {detail ? (
          <View style={h.counter}>
            <Text style={h.counterText}>{detail}</Text>
          </View>
        ) : null}
      </LinearGradient>
      <Text style={h.shortcutLabel}>{title}</Text>
    </Pressable>
  );
}
const h = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0B1830" },
  content: {
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
  streakIcon: { color: "#FFBA57", fontSize: 23 },
  streakValue: { color: C.ink, fontWeight: "800", fontSize: 20 },
  streakLabel: { color: C.muted, fontSize: 10, fontWeight: "800" },
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
  settingsIcon: { color: C.ink, fontSize: 27 },
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
    minWidth: 26,
    paddingHorizontal: 4,
    minHeight: 21,
    borderRadius: 11,
    backgroundColor: "#AD7830",
    borderWidth: 1,
    borderColor: "#FFE4A0",
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
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
    gap: 10,
    marginTop: 6,
    paddingVertical: 8,
  },
  playerName: { color: C.ink, fontSize: 14, fontWeight: "700" },
  playerDetail: { color: C.muted, fontSize: 11 },
  profileLink: { color: C.gold, fontSize: 11, fontWeight: "800" },
  error: { color: C.red, backgroundColor: C.bg, padding: 10, borderRadius: 10 },
});
