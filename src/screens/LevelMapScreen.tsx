import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import {
  BankIcon,
  CheckCircleIcon,
  GiftIcon,
  LockSimpleIcon,
  MapPinIcon,
  ScalesIcon,
} from "phosphor-react-native";
import { Text } from "../AppText";
import { files } from "../content";
import { useGame } from "../store";
import { useReducedMotion } from "../motion";
import { Button, CurrencyBadge, Label, Shell, Stars, TopBar } from "../ui";
import { useTheme } from "../themeMode";
import { colors as N } from "../theme";

const TEAL = "#2FB39A";
const ROAD = "#18233A";
// Horizontal lanes the road winds through, as fractions of the map width.
const LANES = [0.5, 0.76, 0.5, 0.24];

type State = "done" | "current" | "locked";

export default function LevelMapScreen({
  onClose,
  onPlay,
  onReward,
}: {
  onClose: () => void;
  onPlay: (file?: number) => void;
  onReward?: (file: number) => void;
}) {
  const { C, sx, light } = useTheme();
  const m = sx(mN);
  const { game: g } = useGame();
  const [selectedFile, setSelectedFile] = useState(g.file);
  const positioned = useRef(false);
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(320);
  const scroll = useRef<ScrollView>(null);
  const scale = Math.max(1, fontScale);
  const sealed = g.results.filter((r) => r.sealed).length;

  // Lay out from the top (Bölüm 30) down to Bölüm 1; the map is read bottom-up.
  let y = 110;
  const volumes: { number: number; y: number }[] = [];
  const nodes = [...files].reverse().map((file, i) => {
    const current = file.id === g.file;
    if (current) y += 40;
    const node = {
      file,
      x: width * LANES[i % LANES.length],
      y,
      state: (current
        ? "current"
        : g.results.some((r) => r.file === file.id)
          ? "done"
          : "locked") as State,
    };
    y += (current ? 190 : 150) * scale;
    if (file.id % 10 === 1) {
      volumes.push({ number: (file.id - 1) / 10 + 1, y: y - 62 });
      y += 70;
    }
    return node;
  });
  const height = y - 40;
  const focus = nodes.find((n) => n.state === "current") ?? nodes.at(-1)!;

  // One smooth road through every node. Its dashes are green up to the current bölüm and
  // black ahead, where the road is still locked.
  let road = "",
    completed = "",
    ahead = "";
  nodes.forEach((a, i) => {
    const b = nodes[i + 1];
    if (!b) return;
    const mid = (a.y + b.y) / 2;
    const segment = `M${a.x} ${a.y} C${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
    road += segment;
    if (a.file.id <= g.file) completed += segment;
    else ahead += segment;
  });

  const selected =
    files.find((f) => f.id === selectedFile) ?? files[g.file - 1];
  const selectedResult = g.results.find((r) => r.file === selected.id);
  const selectedCurrent = selected.id === g.file;

  return (
    <Shell
      scroll
      dim={0.5}
      scrollRef={scroll}
      header={
        <TopBar
          title="Bölüm yolculuğu"
          back={onClose}
          right={<CurrencyBadge amount={g.seals} />}
        />
      }
      footer={
        <View style={{ gap: 10 }}>
          <View style={m.footRow}>
            <View
              style={[
                m.footDot,
                { backgroundColor: selectedCurrent ? C.gold : TEAL },
              ]}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <Label>
                {selectedCurrent ? "ŞU ANKİ BÖLÜMÜN" : "TAMAMLANAN BÖLÜM"}
              </Label>
              <Text numberOfLines={1} style={m.footTitle}>
                BÖLÜM {String(selected.id).padStart(2, "0")} ·{" "}
                <Text style={m.footMuted}>
                  {selected.title} · {selected.questions.length} kavram
                </Text>
              </Text>
            </View>
            <Stars count={selectedResult?.stars ?? 0} size={15} />
          </View>
          <Button
            title={selectedResult ? "TEKRAR OYNA" : "BAŞLA  →"}
            onPress={() => onPlay(selected.id)}
          />
          {selectedResult && selected.id % 5 === 0 && onReward ? (
            <Button
              small
              secondary
              title="KİLOMETRE TAŞI"
              onPress={() => onReward(selected.id)}
            />
          ) : null}
        </View>
      }
    >
      <View style={m.summary}>
        <View style={m.summaryIcon}>
          <BankIcon size={24} weight="regular" color={C.gold} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Label>HER MÜHÜR BİR ADIM İLERİ</Label>
          <Text style={m.summaryText}>
            {sealed} bölüm mühürlendi · {files.length} bölümlük yolculuk
          </Text>
        </View>
        <View style={m.summaryPill}>
          <Text style={m.summaryCount}>{sealed}</Text>
          <Text style={m.summaryTotal}>/{files.length}</Text>
        </View>
      </View>
      <View
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          if (!positioned.current)
            scroll.current?.scrollTo({
              y: Math.max(0, focus.y - 220),
              animated: false,
            });
          positioned.current = true;
        }}
        style={{ height, width: "100%" }}
      >
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path d={road} stroke={light ? "#E3D3B2" : "#0D1526"} strokeWidth={38} fill="none" strokeLinecap="round" />
          <Path d={road} stroke={light ? "#F3E9D6" : ROAD} strokeWidth={30} fill="none" strokeLinecap="round" />
          {[
            [ahead, light ? "#BFAE8E" : "#05080F"],
            [completed, TEAL],
          ].map(([d, color]) =>
            d ? (
              <Path
                key={color}
                d={d}
                stroke={color}
                strokeWidth={5}
                strokeDasharray="14 10"
                strokeLinecap="round"
                fill="none"
              />
            ) : null,
          )}
        </Svg>
        {volumes.map(({ number, y: top }) => {
          const start = (number - 1) * 10;
          const done = g.results.filter(
            (r) => r.file > start && r.file <= start + 10,
          ).length;
          const locked = g.file <= start;
          return (
            <View key={number} style={[m.volume, { top }]}>
              <View style={m.volumeLine} />
              <View style={[m.volumePill, locked && { borderColor: C.line }]}>
                {locked ? (
                  <LockSimpleIcon size={14} weight="fill" color={C.muted} />
                ) : null}
                <Text style={[m.volumeTitle, locked && { color: C.muted }]}>
                  CİLT {["I", "II", "III"][number - 1]}
                </Text>
                <Text style={m.volumeCount}>{done}/10 bölüm</Text>
              </View>
              <View style={m.volumeLine} />
            </View>
          );
        })}
        {nodes.map(({ file, x, y: cy, state }, i) => (
          <MapNode
            side={
              x > width * 0.6 || (x > width * 0.4 && i % 4 === 2)
                ? "left"
                : "right"
            }
            mapWidth={width}
            key={file.id}
            id={file.id}
            title={file.title}
            kind={file.kind}
            count={file.questions.length}
            state={state}
            stars={g.results.find((r) => r.file === file.id)?.stars ?? 0}
            selected={file.id === selectedFile}
            x={x}
            y={cy}
            onPress={
              state === "locked" ? undefined : () => setSelectedFile(file.id)
            }
          />
        ))}
      </View>
    </Shell>
  );
}

/** A 0→1→0 loop for ambient motion; stays at 0 when the player asked for reduced motion. */
function useLoop(duration: number) {
  const value = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    value.setValue(0);
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced]);
  return value;
}

function HerePill() {
  const { sx } = useTheme();
  const m = sx(mN);
  const bob = useLoop(900);
  return (
    <Animated.View
      style={[
        m.here,
        { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) }] },
      ]}
    >
      <View style={m.herePill}>
        <MapPinIcon size={13} weight="fill" color="#3A2A10" />
        <Text style={m.hereText}>BURADASINIZ</Text>
      </View>
      <View style={m.hereTip} />
    </Animated.View>
  );
}

// The two gold rings breathe in turn, so the playable bölüm keeps drawing the eye.
function Halos() {
  const { sx } = useTheme();
  const m = sx(mN);
  const pulse = useLoop(1100);
  const ring = (size: number, from: number, to: number, grow: number) => (
    <Animated.View
      style={[
        m.halo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [from, to] }),
          transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, grow] }) }],
        },
      ]}
    />
  );
  return (
    <>
      {ring(150, 0.04, 0.16, 1.08)}
      {ring(120, 0.28, 0.1, 1.04)}
    </>
  );
}

function MapNode({
  side,
  mapWidth,
  id,
  title,
  kind,
  count,
  state,
  stars,
  selected,
  x,
  y,
  onPress,
}: {
  side: "left" | "right";
  mapWidth: number;
  id: number;
  title: string;
  kind: "normal" | "reward" | "final";
  count: number;
  state: State;
  stars: number;
  selected: boolean;
  x: number;
  y: number;
  onPress?: () => void;
}) {
  const { C, sx, tc, tg } = useTheme();
  const m = sx(mN);
  const final = kind === "final";
  const size = final ? 84 : state === "current" ? 88 : state === "done" ? 60 : 54;
  const tone = state === "done" ? TEAL : state === "current" ? C.gold : tc("#2A3752");
  const muted = tc("#5F6B85", "text");
  const tag =
    kind === "final" ? "◆ FİNAL BÖLÜMÜ" : kind === "reward" ? "▣ ÖDÜL BÖLÜMÜ" : null;
  const label = `Bölüm ${id}, ${title}, ${
    state === "done" ? `tamamlandı, ${stars} yıldız` : state === "current" ? "buradasınız" : "kilitli"
  }`;

  const badge = (
    <View style={[m.lockBadge, { right: final ? -6 : -4, bottom: final ? -6 : -4 }]}>
      <LockSimpleIcon size={11} weight="fill" color={muted} />
    </View>
  );

  let body: React.ReactNode;
  if (final)
    body = (
      <LinearGradient
        colors={tg(["#26324A", "#141C2C"])}
        style={[m.finalTile, { borderColor: tone, borderWidth: state === "locked" ? 1 : 2 }]}
      >
        <BankIcon size={28} weight="regular" color={state === "locked" ? muted : C.gold} />
        <Text style={[m.finalLabel, state === "locked" && { color: muted }]}>
          BÖLÜM {id}
        </Text>
        {state === "locked" ? badge : null}
      </LinearGradient>
    );
  else if (state === "current")
    body = (
      <View style={m.currentWrap}>
        <Halos />
        <LinearGradient
          colors={["#FFE3A3", "#F2B45A", "#B9791F"]}
          style={{ width: size, height: size, borderRadius: size / 2, padding: 4 }}
        >
          <View style={m.currentFace}>
            <ScalesIcon size={20} weight="bold" color={C.gold} />
            <Text style={m.currentNumber}>{id}</Text>
          </View>
        </LinearGradient>
      </View>
    );
  else if (state === "done")
    body = (
      <View
        style={[
          m.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: tc("#0E2B2E"),
            borderColor: selected ? C.gold : TEAL,
            borderWidth: selected ? 3 : 2,
          },
        ]}
      >
        <Text style={m.doneNumber}>{id}</Text>
        <CheckCircleIcon size={14} weight="bold" color={TEAL} />
      </View>
    );
  else
    body = (
      <View
        style={[
          m.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: tc("#141C2C"), borderColor: tc("#253149") },
        ]}
      >
        {kind === "reward" ? (
          <GiftIcon size={20} weight="regular" color={muted} />
        ) : (
          <Text style={m.lockedNumber}>{id}</Text>
        )}
        {badge}
      </View>
    );

  // The caption sits beside the node, as wide as the room left on that side allows.
  const gap = 12;
  const room =
    side === "right" ? mapWidth - (x + size / 2 + gap) : x - size / 2 - gap;
  const align = side === "right" ? "flex-start" : "flex-end";
  const textAlign = side === "right" ? "left" : "right";
  const caption = final ? (
    <>
      {/* The tile already shows the bölüm number, so only the tag names it a final. */}
      <Text style={[m.tag, { fontSize: 11, textAlign }, state === "locked" && { opacity: 0.7 }]}>
        {tag}
      </Text>
      {state === "done" ? <Stars count={stars} size={13} /> : null}
    </>
  ) : state === "current" ? (
    <>
      <View style={m.titlePill}>
        <View style={m.titleDot} />
        <Text style={m.titlePillText}>{title}</Text>
      </View>
      <Text style={[m.subline, { textAlign }]}>
        {count} kavram{tag ? ` · ${tag}` : ""}
      </Text>
    </>
  ) : state === "done" ? (
    <>
      <Text style={[m.doneTitle, { textAlign }]}>{title}</Text>
      <Stars count={stars} size={13} />
      {tag ? <Text style={[m.tag, { textAlign }]}>{tag}</Text> : null}
    </>
  ) : (
    <>
      <Text style={[m.lockedText, { textAlign }]}>KİLİTLİ</Text>
      {tag ? <Text style={[m.tag, { opacity: 0.7, textAlign }]}>{tag}</Text> : null}
    </>
  );
  return (
    <View
      pointerEvents="box-none"
      style={[m.node, { left: x - size / 2, top: y - size / 2, width: size, height: size }]}
    >
      {state === "current" ? <HerePill /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !onPress, selected }}
        disabled={!onPress}
        onPress={onPress}
        style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}
      >
        {body}
      </Pressable>
      <View
        pointerEvents="none"
        style={[
          m.caption,
          { width: Math.max(80, Math.min(170, room)), alignItems: align },
          side === "right" ? { left: size + gap } : { right: size + gap },
        ]}
      >
        {caption}
      </View>
    </View>
  );
}

const mN = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A3752",
    backgroundColor: "#131D31E6",
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8A784266",
    backgroundColor: "#1B2740",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: { color: N.ink, fontSize: 13, fontWeight: "700" },
  summaryPill: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "#0B1426",
  },
  summaryCount: { color: N.gold, fontSize: 17, fontWeight: "800" },
  summaryTotal: { color: N.muted, fontSize: 12, fontWeight: "700" },
  node: { position: "absolute", alignItems: "center", justifyContent: "center" },
  caption: { position: "absolute", top: 0, bottom: 0, justifyContent: "center", gap: 4 },
  circle: { alignItems: "center", justifyContent: "center", borderWidth: 1 },
  doneNumber: { color: "#A8F2DD", fontSize: 20, fontWeight: "800", lineHeight: 22 },
  lockedNumber: { color: "#5F6B85", fontSize: 18, fontWeight: "800" },
  lockBadge: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#0D1526",
    borderWidth: 1,
    borderColor: "#253149",
    alignItems: "center",
    justifyContent: "center",
  },
  currentWrap: { alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", backgroundColor: "#F2B45A" },
  currentFace: {
    flex: 1,
    borderRadius: 99,
    backgroundColor: "#171B25",
    alignItems: "center",
    justifyContent: "center",
  },
  currentNumber: { color: N.gold, fontSize: 30, fontWeight: "800", lineHeight: 32 },
  here: { position: "absolute", top: -46, alignItems: "center", zIndex: 2 },
  // Speech-bubble tip pointing down at the bölüm.
  hereTip: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#F2B45A",
  },
  herePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: "#F2B45A",
  },
  hereText: { color: "#3A2A10", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  titlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "#141D30",
    borderWidth: 1,
    borderColor: "#2A3752",
  },
  titleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL },
  titlePillText: { color: N.ink, fontSize: 15, fontWeight: "800" },
  subline: { color: N.muted, fontSize: 11, fontWeight: "700" },
  doneTitle: { color: "#C9D0DC", fontSize: 11, fontWeight: "700" },
  lockedText: { color: "#6B7693", fontSize: 11, fontWeight: "700" },
  tag: { color: N.gold, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  finalTile: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  finalLabel: { color: N.ink, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  volume: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  volumeLine: { flex: 1, height: 1, backgroundColor: "#8A784266" },
  volumePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#8A7842",
    backgroundColor: N.panel,
  },
  volumeTitle: { color: N.gold, fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  volumeCount: { color: N.muted, fontSize: 12, fontWeight: "700" },
  footRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  footDot: { width: 10, height: 10, borderRadius: 5 },
  footTitle: { color: N.ink, fontSize: 15, fontWeight: "800" },
  footMuted: { color: N.muted, fontSize: 13, fontWeight: "600" },
});
