import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { productOf } from "../product";
import { useFeedback } from "../feedback";
import { adjacentUnsolved, nextBlank } from "../wordFlow";
import { Ambient, Seal } from "../art";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "../AppText";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useGame } from "../store";
import { costs, entry, Hint, normalize, reward } from "../game";
import { files } from "../content";
import { Props } from "../navigation";
import { Button, C, GameCard, CurrencyBadge } from "../ui";
import { radius, shadows } from "../theme";
import { useReducedMotion } from "../motion";

export default function GameScreen({ navigation }: Props<"Game">) {
  const { game: g, dispatch, error, retry } = useGame();
  const qs = files[g.file - 1].questions;
  const selected = Math.max(
    0,
    qs.findIndex(
      (q) =>
        q.id === (g.selected ?? qs.find((q) => !entry(g, q.id).solved)?.id),
    ),
  );
  const q = qs[selected],
    e = entry(g, q.id);
  const draft = q.term
    .split("")
    .map((_, i) => e.letters[i] ?? e.draft[i] ?? "");
  const [cursor, setCursor] = useState<number | null>(null);
  const [sheet, setSheet] = useState<"hints" | "word" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [success, setSuccess] = useState<{
    id: string;
    xp: number;
    combo: number;
  } | null>(null);
  const shake = useRef(new Animated.Value(0)).current,
    pop = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const feedbackEffect = useFeedback();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [boardWidth, setBoardWidth] = useState(Math.min(width, 560));
  const active =
    cursor !== null && !e.letters[cursor] ? cursor : draft.findIndex((c) => !c);
  const count = qs.filter((item) => entry(g, item.id).solved).length;
  const unresolved = qs.map((item) => !entry(g, item.id).solved);
  const previousQuestion = adjacentUnsolved(unresolved, selected, -1);
  const nextQuestion = adjacentUnsolved(unresolved, selected, 1);
  const result = g.results.find((r) => r.file === g.file);
  const scroll = useRef<ScrollView>(null);
  const input = useRef<TextInput>(null);
  useEffect(() => {
    if (!e.solved) input.current?.focus();
  }, []);
  function choose(id: string) {
    if (entry(g, id).solved) return;
    dispatch({ type: "select", id });
    setCursor(null);
    setSheet(null);
    setFailed(false);
    setFeedback("");
    setSuccess(null);
    showKeyboard(input.current);
  }
  function typeLetters(letters: string[]) {
    if (e.solved || active < 0) return;
    const updated = [...draft];
    let index: number | null = active;
    for (const letter of letters) {
      if (index === null) break;
      dispatch({ type: "key", id: q.id, key: letter, index });
      updated[index] = letter;
      index = nextBlank(updated, index);
    }
    setCursor(index);
    setFeedback("");
    setFailed(false);
  }
  function remove() {
    dispatch({ type: "delete", id: q.id });
    setCursor(null);
    setFeedback("");
    setFailed(false);
  }
  function submit(answer = draft) {
    if (e.solved || answer.some((c) => !c)) return;
    const correct = normalize(answer.join("")) === q.term;
    feedbackEffect(correct);
    setFailed(!correct);
    setCursor(null);
    if (correct)
      setSuccess({ id: q.id, xp: reward(g.combo + 1), combo: g.combo + 1 });
    setFeedback(correct ? "" : "Henüz değil. Bir kez daha dene.");
    dispatch({ type: "submit", id: q.id });
    if (!reduced) {
      shake.stopAnimation();
      shake.setValue(0);
      pop.stopAnimation();
      pop.setValue(1);
      if (correct)
        Animated.sequence([
          Animated.timing(pop, {
            toValue: 1.025,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(pop, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      else
        Animated.sequence(
          [-8, 8, -5, 5, 0].map((toValue) =>
            Animated.timing(shake, {
              toValue,
              duration: 60,
              useNativeDriver: true,
            }),
          ),
        ).start();
    }
  }
  function buy(hint: Hint) {
    const candidates = draft.map((_, i) => i).filter((i) => !e.letters[i]);
    dispatch({
      type: "hint",
      id: q.id,
      hint,
      index: candidates[Math.floor(Math.random() * candidates.length)],
    });
    setCursor(null);
    setFailed(false);
    setFeedback("");
    setSheet(null);
  }
  function next() {
    if (result) navigation.replace("Result");
    else {
      const item =
        qs.find((item, i) => i > selected && !entry(g, item.id).solved) ??
        qs.find((item) => !entry(g, item.id).solved);
      if (item) choose(item.id);
    }
  }

  // Keep the complete board outside the scrolling clue/keyboard area.
  const usableHeight = height - insets.top - insets.bottom;
  const rowHeight = Math.max(
    28,
    Math.min(
      44,
      Math.floor((usableHeight * 0.38 - 12 - (qs.length - 1) * 3) / qs.length),
    ),
  );
  const availableWidth = boardWidth - 58;
  const missing = draft.map((_, i) => i).filter((i) => !e.letters[i]);
  const letterPrice = productOf(g).freeLetters > 0 ? 0 : costs.letter;
  const wordPrice = costs.word;
  function openWord() {
    if (e.solved || g.seals < wordPrice) return;
    dispatch({ type: "hint", id: q.id, hint: "word" });
    setCursor(null);
    setFailed(false);
    setFeedback("Kelime açıldı. Onayla ile devam et.");
    setSheet(null);
  }
  return (
    <SafeAreaView style={s.screen}>
      <Ambient />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: "#071426DC" }]}
      />
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={() => navigation.navigate("Home")}
          style={s.back}
        >
          <Text style={s.backText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
          <Text style={s.title}>BÖLÜM {g.file}</Text>
          <Text style={s.progressText}>
            {count} / {qs.length}
          </Text>
        </View>
        <CurrencyBadge amount={g.seals} />
      </View>
      <View
        accessibilityLabel="Bölümdeki kelime satırları"
        onLayout={(event) => setBoardWidth(event.nativeEvent.layout.width)}
        style={s.board}
      >
        {qs.map((item, row) => {
          const cell = entry(g, item.id),
            current = row === selected;
          const letters = item.term
            .split("")
            .map((_, i) =>
              cell.solved
                ? item.term[i]
                : (cell.letters[i] ?? cell.draft[i] ?? ""),
            );
          const tileGap = item.term.length > 12 ? 2 : 3;
          const tileWidth = Math.min(
            38,
            (availableWidth - (item.term.length - 1) * tileGap) /
              item.term.length,
          );
          return (
            <Animated.View
              key={item.id}
              style={{ transform: [{ translateX: current ? shake : 0 }] }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${row + 1}. soruyu seç${cell.solved ? ", çözüldü" : ""}`}
                accessibilityState={{
                  selected: current,
                  disabled: cell.solved,
                }}
                disabled={cell.solved}
                onPress={() => choose(item.id)}
                style={[
                  s.wordRow,
                  { height: rowHeight },
                  current && s.activeRow,
                  cell.solved && s.doneRow,
                ]}
              >
                <Text
                  style={[
                    s.number,
                    {
                      color: current ? C.gold : cell.solved ? C.green : C.muted,
                    },
                  ]}
                >
                  {cell.solved ? "✓" : row + 1}
                </Text>
                <View style={[s.tiles, { gap: tileGap }]}>
                  {letters.map((letter, i) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${row + 1}. soru, ${i + 1}. harf: ${letter || "boş"}`}
                      accessibilityState={{
                        disabled: cell.solved || !!cell.letters[i],
                      }}
                      disabled={cell.solved || !!cell.letters[i]}
                      onPress={(event) => {
                        event.stopPropagation();
                        if (!current) choose(item.id);
                        else showKeyboard(input.current);
                        setCursor(i);
                      }}
                      key={i}
                      style={[
                        s.tile,
                        {
                          width: Math.min(tileWidth, rowHeight - 6),
                          height: Math.min(tileWidth, rowHeight - 6),
                        },
                        !!letter && s.filled,
                        cell.solved && s.doneTile,
                        current && i === active && !cell.solved && s.cursor,
                        current && failed && { borderColor: C.red },
                      ]}
                    >
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={[
                          s.letter,
                          cell.solved && { color: "#79DDB6" },
                          { fontSize: Math.min(20, tileWidth * 0.65) },
                        ]}
                      >
                        {letter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <ScrollView
        ref={scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <Pressable onPress={retry}>
            <Text style={s.error}>{error}</Text>
          </Pressable>
        ) : null}
        <Animated.View
          accessibilityLiveRegion="polite"
          style={{ transform: [{ scale: pop }] }}
        >
          <GameCard
            tone="default"
            style={[s.card, e.solved && { backgroundColor: "#E2EED6" }]}
          >
            <View style={s.questionHeader}>
              <Text style={[s.eyebrow, e.solved && { color: C.green }]}>
                {e.solved
                  ? "✓ DOĞRU"
                  : `${selected + 1}. SORU · ${q.term.length} HARF`}
              </Text>
              {!e.solved ? (
                <View style={s.questionArrows}>
                  <QuestionArrow
                    label="Önceki soru"
                    glyph="‹"
                    disabled={previousQuestion === null}
                    onPress={() =>
                      previousQuestion !== null &&
                      choose(qs[previousQuestion].id)
                    }
                  />
                  <QuestionArrow
                    label="Sonraki soru"
                    glyph="›"
                    disabled={nextQuestion === null}
                    onPress={() =>
                      nextQuestion !== null && choose(qs[nextQuestion].id)
                    }
                  />
                </View>
              ) : null}
            </View>
            {e.solved ? (
              <>
                <Text style={s.solvedTerm}>{q.term}</Text>
                {success?.id === q.id ? (
                  <Text style={s.gold}>
                    +{success.xp} XP · {success.combo}’li seri
                  </Text>
                ) : null}
                <Text style={s.explanation}>{q.explanation}</Text>
              </>
            ) : (
              <>
                <Text style={s.clue}>{q.clue}</Text>
                {e.extra ? <Text style={s.extra}>{q.explanation}</Text> : null}
              </>
            )}
          </GameCard>
        </Animated.View>
        {e.solved ? (
          <Button
            title={result ? "BÖLÜM SONUCUNU GÖR" : "DEVAM ET →"}
            onPress={next}
          />
        ) : (
          <>
            <View style={s.boosters}>
              {[
                {
                  icon: "✦",
                  title: "İpucu",
                  detail: `${costs.extra} Mühür`,
                  disabled: e.extra || g.seals < costs.extra,
                  onPress: () => buy("extra"),
                },
                {
                  icon: "A",
                  title: "Harf Aç",
                  detail:
                    letterPrice === 0 ? "Ücretsiz" : `${letterPrice} Mühür`,
                  disabled: missing.length === 0 || g.seals < letterPrice,
                  onPress: () => buy("letter"),
                },
                {
                  icon: "gavel",
                  title: "Kelime Aç",
                  detail: `${wordPrice} Mühür`,
                  disabled: missing.length === 0 || g.seals < wordPrice,
                  onPress: () => setSheet("word"),
                },
              ].map((b) => (
                <Pressable
                  key={b.title}
                  accessibilityRole="button"
                  accessibilityLabel={b.title}
                  accessibilityState={{ disabled: b.disabled }}
                  disabled={b.disabled}
                  onPress={b.onPress}
                  style={[s.booster, b.disabled && { opacity: 0.4 }]}
                >
                  <View style={s.boosterIcon}>
                    {b.icon === "gavel" ? (
                      <GavelIcon />
                    ) : (
                      <Text style={s.boosterIconText}>{b.icon}</Text>
                    )}
                  </View>
                  <View style={s.boosterCopy}>
                    <Text style={s.boosterTitle}>{b.title}</Text>
                    <View style={s.boosterCost}>
                      {b.detail === "Ücretsiz" ? null : <Seal size={17} />}
                      <Text style={s.boosterPrice}>
                        {b.detail.replace(" Mühür", "")}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
            <View style={s.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Son harfi sil"
                onPress={remove}
                style={s.delete}
              >
                <Text style={s.boosterTitle}>⌫ Sil</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button
                  title="ONAYLA"
                  disabled={draft.some((c) => !c)}
                  onPress={() => submit()}
                />
              </View>
            </View>
            {feedback ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[s.feedback, failed && { color: C.red }]}
              >
                {feedback}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
      <NativeLetterInput
        ref={input}
        onLetters={typeLetters}
        onDelete={remove}
        onSubmit={() => (e.solved ? next() : submit())}
      />
      <Modal
        visible={sheet === "word"}
        transparent
        animationType={reduced ? "none" : "slide"}
        onRequestClose={() => setSheet(null)}
      >
        <View style={s.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pencereyi kapat"
            style={StyleSheet.absoluteFill}
            onPress={() => setSheet(null)}
          />
          <SafeAreaView
            edges={["bottom"]}
            style={s.sheet}
            accessibilityViewIsModal
          >
            <Text style={s.solvedTerm}>Kelimeyi aç</Text>
            <Text style={s.explanation}>
              Kalan {missing.length} harf {wordPrice} Mühür karşılığında açılır.
              Bir ipucu kullanımı sayılır. Ücretsiz Harf Aç hakların korunur.
            </Text>
            <Button
              title={`${wordPrice} MÜHÜR · KELİMEYİ AÇ`}
              disabled={g.seals < wordPrice}
              onPress={openWord}
            />
            <Button secondary title="VAZGEÇ" onPress={() => setSheet(null)} />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function GavelIcon() {
  return (
    <View accessibilityElementsHidden style={s.gavel}>
      <View style={s.gavelHead} />
      <View style={s.gavelHandle} />
    </View>
  );
}

function QuestionArrow({
  label,
  glyph,
  disabled,
  onPress,
}: {
  label: string;
  glyph: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.questionArrow,
        disabled && { opacity: 0.28 },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}
    >
      <Text style={s.questionArrowText}>{glyph}</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#0B1934BB",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: C.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: C.ink, fontSize: 32 },
  title: { color: C.ink, fontSize: 19, fontWeight: "800" },
  progressText: { color: C.muted, fontSize: 14 },
  board: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 3,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 6,
  },
  activeRow: {
    borderColor: C.gold,
    backgroundColor: "#CFAB4B14",
    shadowColor: C.gold,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  doneRow: { backgroundColor: "#15362F33", borderColor: "transparent" },
  number: { width: 22, textAlign: "center", fontWeight: "800", fontSize: 14 },
  tiles: { flexDirection: "row", gap: 3, flex: 1, justifyContent: "center" },
  tile: {
    borderWidth: 1,
    borderColor: "#34404F",
    backgroundColor: "#1B293B",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: "#FFFBF2", borderColor: "#E7DECC" },
  doneTile: { backgroundColor: "#193D36", borderColor: "#397961" },
  cursor: {
    borderColor: C.gold,
    borderWidth: 2,
    backgroundColor: "#465267",
    shadowColor: C.gold,
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  letter: { color: "#17243B", fontWeight: "800" },
  content: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    borderRadius: radius.lg,
    padding: 18,
    minHeight: 118,
    gap: 12,
    ...shadows.card,
  },
  questionHeader: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  questionArrows: { flexDirection: "row", gap: 7 },
  questionArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#3C4B63",
    backgroundColor: "#14233B",
    alignItems: "center",
    justifyContent: "center",
  },
  questionArrowText: {
    color: "#F8E7B6",
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "700",
  },
  eyebrow: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  clue: {
    color: "#F5F1E7",
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "500",
  },
  extra: { color: "#C0CABF", fontSize: 14, lineHeight: 20 },
  solvedTerm: { color: C.ink, fontSize: 25, fontWeight: "800" },
  gold: { color: C.gold, fontSize: 18, fontWeight: "800" },
  explanation: { color: C.muted, fontSize: 15, lineHeight: 22 },
  boosters: { flexDirection: "row", gap: 8 },
  booster: {
    flex: 1,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  boosterIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#D3B468",
    backgroundColor: "#27303C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#020815",
    shadowOpacity: 0.45,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },
  boosterIconText: { color: C.gold, fontSize: 20, fontWeight: "900" },
  boosterCopy: { flexShrink: 1, gap: 2 },
  boosterCost: {
    minHeight: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  gavel: {
    width: 29,
    height: 29,
    transform: [{ rotate: "-38deg" }],
    alignItems: "center",
  },
  gavelHead: {
    width: 25,
    height: 10,
    borderRadius: 3,
    backgroundColor: C.gold,
    borderWidth: 1,
    borderColor: "#806026",
  },
  gavelHandle: {
    width: 6,
    height: 21,
    marginTop: -1,
    borderRadius: 3,
    backgroundColor: "#E5C36C",
  },
  boosterTitle: { color: C.ink, fontWeight: "800", fontSize: 12 },
  boosterPrice: { color: C.gold, fontSize: 12, fontWeight: "700" },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  delete: {
    minWidth: 90,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: C.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  feedback: { color: C.muted, fontSize: 14, textAlign: "center" },
  error: { color: C.red },
  overlay: { flex: 1, backgroundColor: "#0009", justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    backgroundColor: C.panel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
});
