import { CurrencyBadge } from "../ui";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "../AppText";
import { LinearGradient } from "expo-linear-gradient";
import { LockSimpleIcon } from "phosphor-react-native";
import { files } from "../content";
import { useGame } from "../store";
import {
  Button,
  GameCard,
  Label,
  LevelNode,
  Shell,
  Stars,
  TopBar,
  C,
  s,
} from "../ui";
export default function LevelMapScreen({
  onClose,
  onPlay,
  onReward,
}: {
  onClose: () => void;
  onPlay: (file?: number) => void;
  onReward?: (file: number) => void;
}) {
  const { game: g } = useGame();
  const [selectedFile, setSelectedFile] = useState(g.file);
  const positioned = useRef(false);
  const { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(320);
  const scroll = useRef<ScrollView>(null);
  const arranged = [...files].reverse();
  let offset = 30;
  // The map reads bottom-up, so each volume header sits just below its first bölüm.
  const volumes: { number: number; y: number }[] = [];
  const nodes = arranged.map((file, i) => {
    const current = file.id === g.file;
    const node = {
      file,
      current,
      x: width * (i % 2 === 0 ? 0.72 : 0.25),
      y: offset,
    };
    offset +=
      file.id === selectedFile
        ? 430 * Math.max(1, fontScale)
        : 174 * Math.max(1, fontScale);
    if (file.id % 10 === 1) {
      volumes.push({ number: (file.id - 1) / 10 + 1, y: offset - 40 });
      offset += 60;
    }
    return node;
  });
  const focus = nodes.find((n) => n.current)!;
  const dots: { x: number; y: number; lit: boolean }[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i],
      b = nodes[i + 1];
    for (let j = 0; j < 40; j++) {
      const t = j / 40,
        ease = t * t * (3 - 2 * t);
      dots.push({
        x: a.x + (b.x - a.x) * ease,
        y: a.y + 38 + (b.y - a.y) * t,
        lit: a.file.id <= g.file,
      });
    }
  }
  return (
    <Shell
      scroll
      scrollRef={scroll}
      header={
        <TopBar
          title="Bölüm yolculuğu"
          back={onClose}
          right={<CurrencyBadge amount={g.seals} />}
        />
      }
    >
      <View style={{ gap: 5 }}>
        <Label>HER MÜHÜR BİR ADIM İLERİ</Label>
        <Text style={s.muted}>
          {g.results.filter((r) => r.sealed).length} bölüm mühürlendi ·{" "}
          {files.length} bölümlük yolculuk
        </Text>
      </View>
      <View
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
          if (!positioned.current)
            scroll.current?.scrollTo({
              y: Math.max(0, focus.y - 100),
              animated: false,
            });
          positioned.current = true;
        }}
        style={{ height: offset, width: "100%" }}
      >
        <LinearGradient
          pointerEvents="none"
          colors={["#F0CB7800", "#F0CB7844", "#F0CB7800"]}
          style={{
            position: "absolute",
            top: focus.y - 100,
            left: -20,
            right: -20,
            height: 410,
            borderRadius: 150,
          }}
        />
        {dots.map((dot, i) => (
          <View
            key={i}
            accessible={false}
            style={{
              position: "absolute",
              top: dot.y,
              left: dot.x - 2.5,
              width: dot.lit ? 5 : 4,
              height: dot.lit ? 5 : 4,
              borderRadius: 3,
              backgroundColor: dot.lit ? "#F7D469" : "#354361",
              shadowColor: C.gold,
              shadowOpacity: dot.lit ? 0.75 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        ))}
        {volumes.map(({ number, y }) => {
          const start = (number - 1) * 10;
          const done = g.results.filter(
            (r) => r.file > start && r.file <= start + 10,
          ).length;
          const locked = g.file <= start;
          return (
            <View key={number} style={[m.volume, { top: y }]}>
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
        {nodes.map(({ file, current, x, y }) => {
          const result = g.results.find((r) => r.file === file.id);
          return (
            <React.Fragment key={file.id}>
              <View
                style={{
                  position: "absolute",
                  top: y,
                  left: x - 52,
                  width: 104,
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {current ? (
                  <View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      width: 104,
                      height: 104,
                      top: -12,
                      borderRadius: 52,
                      backgroundColor: "#F6CE5014",
                      borderWidth: 1,
                      borderColor: "#F6CE5028",
                    }}
                  />
                ) : null}
                <LevelNode
                  kind={file.kind}
                  number={file.id}
                  current={current}
                  done={!!result}
                  stars={result?.stars}
                  onPress={
                    current || result
                      ? () => setSelectedFile(file.id)
                      : undefined
                  }
                />
                {file.id % 5 === 0 ? (
                  <Text style={[s.small, { color: C.gold }]}>
                    {file.kind === "final"
                      ? "◆ FİNAL BÖLÜMÜ"
                      : "▣ ÖDÜL BÖLÜMÜ"}
                  </Text>
                ) : null}
              </View>
              {file.id === selectedFile ? (
                <View
                  style={{
                    position: "absolute",
                    top: y + 122,
                    left: 12,
                    right: 12,
                  }}
                >
                  <GameCard
                    style={{
                      gap: 10,
                      alignItems: "center",
                      padding: 17,
                      borderColor: "#8A7842",
                    }}
                  >
                    <Label>
                      {current ? "ŞU ANKİ BÖLÜMÜN" : "TAMAMLANAN BÖLÜM"}
                    </Label>
                    <View style={s.between}>
                      <Text
                        style={{
                          color: C.ink,
                          fontSize: 23,
                          fontWeight: "800",
                        }}
                      >
                        BÖLÜM {String(file.id).padStart(2, "0")}
                      </Text>
                      <Stars count={result?.stars ?? 0} size={20} />
                    </View>
                    <Text style={s.muted}>
                      {file.title} · {file.questions.length} kavram
                    </Text>
                    <View style={{ alignSelf: "stretch", gap: 10 }}>
                      <Button
                        title={result ? "TEKRAR OYNA" : "BAŞLA  →"}
                        onPress={() => onPlay(file.id)}
                      />
                      {result && file.id % 5 === 0 && onReward ? (
                        <Button
                          secondary
                          title="KİLOMETRE TAŞI"
                          onPress={() => onReward(file.id)}
                        />
                      ) : null}
                    </View>
                  </GameCard>
                </View>
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </Shell>
  );
}
const m = StyleSheet.create({
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
    backgroundColor: C.panel,
  },
  volumeTitle: {
    color: C.gold,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  volumeCount: { color: C.muted, fontSize: 12, fontWeight: "700" },
});
