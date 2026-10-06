import { announce, announceOnIOS } from "../a11y";
import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { productOf } from "../product";
import { useFeedback } from "../feedback";
import { adjacentUnsolved, nextBlank, scrambled } from "../wordFlow";
import { Ambient, SealCoin } from "../art";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "../AppText";
import { CaretLeftIcon } from "phosphor-react-native/src/icons/CaretLeft";
import { CaretRightIcon } from "phosphor-react-native/src/icons/CaretRight";
import { GavelIcon } from "phosphor-react-native/src/icons/Gavel";
import { KeyIcon } from "phosphor-react-native/src/icons/Key";
import type { Icon } from "phosphor-react-native";
import { MagnifyingGlassIcon } from "phosphor-react-native/src/icons/MagnifyingGlass";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useGame } from "../store";
import { costs, entry, Hint, normalize } from "../game";
import { useDiscovery } from "../discovery/store";
import { strugglePoints } from "../discovery/model";
import { files } from "../content";
import { Props } from "../navigation";
import { Button, GameCard, CurrencyBadge } from "../ui";
import { radius, shadows } from "../theme";
import { useReducedMotion } from "../motion";
import { useTheme } from "../themeMode";
import { colors as N } from "../theme";

export default function GameScreen({ navigation }: Props<"Game">) {
  const { C, sx, tc, light } = useTheme();
  const s = sx(sN);
  const { game: g, dispatch, error, retry } = useGame();
  const discovery = useDiscovery();
  /** Feeds "Zor kelimelerim": wrong answers and jokers raise a term's struggle score. */
  const struggle = (id: string, points: number) =>
    discovery.dispatch({ type: "struggle", id, points });
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
  const [sheet, setSheet] = useState<"extra" | "letter" | "word" | null>(null);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  // Bumped on every check so the hidden input starts empty for the next try.
  const [attempts, setAttempts] = useState(0);
  const shake = useRef(new Animated.Value(0)).current,
    pop = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const feedbackEffect = useFeedback();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const [boardWidth, setBoardWidth] = useState(Math.min(width, 560));
  const active =
    cursor !== null && !e.letters[cursor] ? cursor : draft.findIndex((c) => !c);
  // Fast typing can deliver several key events before React re-renders; handlers read and
  // advance this instead of the render-time draft, or two letters land in the same slot.
  const live = useRef({ draft, active });
  live.current = { draft, active };
  const count = qs.filter((item) => entry(g, item.id).solved).length;
  const unresolved = qs.map((item) => !entry(g, item.id).solved);
  const previousQuestion = adjacentUnsolved(unresolved, selected, -1);
  const nextQuestion = adjacentUnsolved(unresolved, selected, 1);
  const result = g.results.find((r) => r.file === g.file);
  const input = useRef<TextInput>(null);
  useEffect(() => {
    if (!e.solved) input.current?.focus();
  }, []);
  // A level-up window takes the keyboard away while it is open; bring it back once it closes.
  const levelUp = productOf(g).notices.some((n) => n.kind === "level");
  const hadLevelUp = useRef(false);
  useEffect(() => {
    if (levelUp) {
      hadLevelUp.current = true;
      input.current?.blur();
    } else if (hadLevelUp.current) {
      hadLevelUp.current = false;
      if (!e.solved) showKeyboard(input.current);
    }
  }, [levelUp]);
  function choose(id: string) {
    if (entry(g, id).solved) return;
    dispatch({ type: "select", id });
    setCursor(null);
    setSheet(null);
    setFailed(false);
    setFeedback("");
    // Moving on to the next word while the level-up window is open waits for it to close.
    if (!levelUp) showKeyboard(input.current);
  }
  function typeLetters(letters: string[]) {
    if (e.solved || live.current.active < 0) return;
    checkAfterHint.current = false;
    const updated = [...live.current.draft];
    let index: number | null = live.current.active;
    for (const letter of letters) {
      if (index === null) break;
      dispatch({ type: "key", id: q.id, key: letter, index });
      updated[index] = letter;
      index = nextBlank(updated, index);
    }
    live.current = { draft: updated, active: index ?? -1 };
    setCursor(index);
    setFeedback("");
    setFailed(false);
    // A completed word is checked right away; Enter is no longer needed.
    if (updated.every(Boolean)) submit(updated);
  }
  function remove() {
    const updated = [...live.current.draft];
    for (let i = updated.length - 1; i >= 0; i--)
      if (updated[i] && !e.letters[i]) {
        updated[i] = "";
        break;
      }
    live.current = { draft: updated, active: updated.findIndex((c) => !c) };
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
    setFeedback(correct ? "" : "Henüz değil. Bir kez daha dene.");
    if (correct) announce(`Doğru: ${q.term}`);
    else announceOnIOS("Henüz değil. Bir kez daha dene.");
    dispatch({ type: "submit", id: q.id });
    if (!correct) struggle(q.id, strugglePoints.wrong);
    setAttempts((n) => n + 1);
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
    struggle(q.id, strugglePoints[hint === "first" ? "letter" : hint]);
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
    checkAfterHint.current = hint !== "extra";
  }
  // There is no confirm button: a word completed by a hint is checked as soon as it lands.
  const checkAfterHint = useRef(false);
  useEffect(() => {
    if (!checkAfterHint.current) return;
    checkAfterHint.current = false;
    if (draft.every(Boolean)) submit();
  }, [draft.join("")]);
  // A solved word moves straight on: the row turns green for a moment, then the next unsolved
  // word opens, or the bölüm result once every word is found (explanations live there).
  useEffect(() => {
    if (!e.solved) return;
    const timer = setTimeout(next, reduced ? 0 : 500);
    return () => clearTimeout(timer);
  }, [e.solved, q.id, !!result]);
  function next() {
    if (result) navigation.replace("Result");
    else {
      const item =
        qs.find((item, i) => i > selected && !entry(g, item.id).solved) ??
        qs.find((item) => !entry(g, item.id).solved);
      if (item) choose(item.id);
    }
  }

  // The board, the header and the clue card must stay above the keyboard; on a short phone
  // the rows give up height for it (the boosters reappear when the keyboard is closed).
  const usableHeight = height - insets.top - insets.bottom;
  const free = height - insets.top - Math.max(insets.bottom, keyboard);
  const boardBudget = Math.min(usableHeight * 0.38, free - (keyboard ? 200 : 290));
  const rowHeight = Math.max(
    26,
    Math.min(46, Math.floor((boardBudget - 12 - (qs.length - 1) * 3) / qs.length)),
  );
  const availableWidth = boardWidth - 58;
  // The active row grows ~10%: it takes extra height from the other rows so the board keeps
  // its size, and its tiles scale up only as far as the row width allows.
  const extra = Math.round(rowHeight * 0.12);
  const grow = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) return grow.setValue(1);
    grow.setValue(0);
    Animated.spring(grow, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [selected, reduced]);
  const missing = draft.map((_, i) => i).filter((i) => !e.letters[i]);
  const letterPrice = productOf(g).freeLetters > 0 ? 0 : costs.letter;
  const wordPrice = costs.word;
  function openWord() {
    if (e.solved || g.seals < wordPrice) return;
    dispatch({ type: "hint", id: q.id, hint: "word" });
    setCursor(null);
    setFailed(false);
    setFeedback("");
    setSheet(null);
    checkAfterHint.current = true;
  }
  // Every booster asks first; this is what each confirmation sheet says and does.
  const confirm = {
    extra: {
      title: "İpucu al",
      body: `Kelimenin harfleri karışık sırayla soru kartında gösterilir (${costs.extra} Mühür). Bir ipucu kullanımı sayılır.`,
      action: `${costs.extra} MÜHÜR · İPUCU AL`,
      disabled: e.extra || g.seals < costs.extra,
      run: () => buy("extra"),
    },
    letter: {
      title: "Harf aç",
      body:
        letterPrice === 0
          ? `Rastgele bir harf ücretsiz açılır. ${productOf(g).freeLetters} ücretsiz hakkın var. Bir ipucu kullanımı sayılır.`
          : `Rastgele bir harf ${letterPrice} Mühür karşılığında açılır. Bir ipucu kullanımı sayılır.`,
      action: letterPrice === 0 ? "ÜCRETSİZ · HARF AÇ" : `${letterPrice} MÜHÜR · HARF AÇ`,
      disabled: missing.length === 0 || g.seals < letterPrice,
      run: () => buy("letter"),
    },
    word: {
      title: "Kelimeyi aç",
      body: `Kalan ${missing.length} harf ${wordPrice} Mühür karşılığında açılır. Bir ipucu kullanımı sayılır. Ücretsiz Harf Aç hakların korunur.`,
      action: `${wordPrice} MÜHÜR · KELİMEYİ AÇ`,
      disabled: g.seals < wordPrice,
      run: openWord,
    },
  }[sheet ?? "word"];
  // A tap that no row or button claims (empty space, the clue card) hides the keyboard;
  // tapping a word row brings it back through showKeyboard.
  function hideKeyboard() {
    input.current?.blur();
    Keyboard.dismiss();
  }
  return (
    <SafeAreaView
      style={s.screen}
      onStartShouldSetResponder={() => true}
      onResponderRelease={hideKeyboard}
    >
      <Ambient />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: tc("#071426DC") }]}
      />
      <View style={s.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          onPress={() => navigation.popTo("Home")}
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
          const height = current
            ? rowHeight + extra
            : rowHeight - extra / (qs.length - 1);
          const tileSize = Math.min(tileWidth, rowHeight - 6);
          const used = item.term.length * tileSize + (item.term.length - 1) * tileGap;
          const scale = Math.min(1.1, availableWidth / used, (rowHeight + extra - 4) / tileSize);
          return (
            <Animated.View
              key={item.id}
              style={{ transform: [{ translateX: current ? shake : 0 }] }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  cell.solved
                    ? `${row + 1}. soru, çözüldü: ${item.term}`
                    : `${row + 1}. soru, ${item.term.length} harf${
                        letters.some(Boolean)
                          ? `, yazılan: ${letters.map((l) => l || "boş").join(" ")}`
                          : ""
                      }`
                }
                accessibilityState={{
                  selected: current,
                  disabled: cell.solved,
                }}
                disabled={cell.solved}
                onPress={() => choose(item.id)}
                style={[
                  s.wordRow,
                  { height },
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
                <Animated.View
                  style={[
                    s.tiles,
                    { gap: tileGap },
                    current && {
                      transform: [
                        {
                          scale: grow.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, scale],
                          }),
                        },
                      ],
                    },
                  ]}
                >
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
                        { width: tileSize, height: tileSize },
                        !!letter && s.filled,
                        light && !!letter && !cell.solved && dayFilled,
                        cell.solved && s.doneTile,
                        current && i === active && !cell.solved && s.cursor,
                        current && failed && { borderColor: C.red },
                      ]}
                    >
                      <Text
                        maxFontSizeMultiplier={1.2}
                        style={[
                          s.letter,
                          light && !!letter && !cell.solved && { color: "#2A2418" },
                          cell.solved && { color: tc("#79DDB6", "text") },
                          // A full-width box: iOS can measure a lone narrow glyph like "I" a hair
                          // too small and then drop it entirely instead of drawing it.
                          {
                            fontSize: Math.min(20, tileSize * 0.7),
                            alignSelf: "stretch",
                            textAlign: "center",
                          },
                        ]}
                      >
                        {letter}
                      </Text>
                    </Pressable>
                  ))}
                </Animated.View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
      <View style={s.content}>
        {error ? (
          <Pressable accessibilityRole="button" accessibilityHint="Tekrar dener" onPress={retry}>
            <Text style={s.error}>{error}</Text>
          </Pressable>
        ) : null}
        <Animated.View
          accessibilityLiveRegion="polite"
          style={{ transform: [{ scale: pop }] }}
        >
          <GameCard
            tone="default"
            style={[s.card, e.solved && s.solvedCard]}
          >
            <View style={s.questionHeader}>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[s.eyebrow, e.solved && { color: C.green }]}
              >
                {e.solved
                  ? `✓ DOĞRU · ${q.category.toLocaleUpperCase("tr-TR")}`
                  : `${selected + 1}. SORU · ${q.category.toLocaleUpperCase("tr-TR")} · ${q.term.length} HARF`}
              </Text>
              {!e.solved ? (
                <View style={s.questionArrows}>
                  <QuestionArrow
                    label="Önceki soru"
                    Glyph={CaretLeftIcon}
                    disabled={previousQuestion === null}
                    onPress={() =>
                      previousQuestion !== null &&
                      choose(qs[previousQuestion].id)
                    }
                  />
                  <QuestionArrow
                    label="Sonraki soru"
                    Glyph={CaretRightIcon}
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
              </>
            ) : (
              <>
                <Text style={s.clue}>{q.clue}</Text>
                {e.extra ? (
                  <View style={s.pool}>
                    <Text style={s.poolLabel}>HARFLER</Text>
                    <View
                      accessibilityLabel={`Harfler: ${scrambled(q.term, q.id).join(" ")}`}
                      style={s.poolTiles}
                    >
                      {scrambled(q.term, q.id).map((letter, i) => (
                        <View key={i} style={s.poolTile}>
                          <Text style={s.poolLetter}>{letter}</Text>
                        </View>
                      ))}
                    </View>
                    {q.explanation !== q.clue ? (
                      <Text style={s.extra}>{q.explanation}</Text>
                    ) : null}
                  </View>
                ) : null}
              </>
            )}
          </GameCard>
        </Animated.View>
        {e.solved ? null : (
          <>
            <View style={s.boosters}>
              {[
                {
                  icon: MagnifyingGlassIcon,
                  title: "İpucu",
                  detail: `${costs.extra} Mühür`,
                  disabled: e.extra || g.seals < costs.extra,
                  onPress: () => setSheet("extra"),
                },
                {
                  icon: KeyIcon,
                  title: "Harf Aç",
                  detail:
                    letterPrice === 0 ? "Ücretsiz" : `${letterPrice} Mühür`,
                  disabled: missing.length === 0 || g.seals < letterPrice,
                  onPress: () => setSheet("letter"),
                },
                {
                  icon: GavelIcon,
                  title: "Kelime Aç",
                  detail: `${wordPrice} Mühür`,
                  disabled: missing.length === 0 || g.seals < wordPrice,
                  onPress: () => setSheet("word"),
                },
              ].map((b) => (
                <Pressable
                  key={b.title}
                  accessibilityRole="button"
                  accessibilityLabel={`${b.title}, ${b.detail}`}
                  accessibilityState={{ disabled: b.disabled }}
                  disabled={b.disabled}
                  onPress={b.onPress}
                  style={[s.booster, b.disabled && { opacity: 0.4 }]}
                >
                  <View style={s.boosterIcon}>
                    <b.icon size={24} weight="bold" color={C.gold} />
                  </View>
                  <View style={s.boosterCopy}>
                    <Text numberOfLines={1} adjustsFontSizeToFit style={s.boosterTitle}>
                      {b.title}
                    </Text>
                    <View style={s.boosterCost}>
                      {b.detail === "Ücretsiz" ? null : <SealCoin size={17} />}
                      <Text style={s.boosterPrice}>
                        {b.detail.replace(" Mühür", "")}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
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
      </View>
      <NativeLetterInput
        ref={input}
        onLetters={typeLetters}
        onDelete={remove}
        onSubmit={() => (e.solved ? next() : submit())}
        resetKey={`${q.id}:${attempts}`}
      />
      <Modal
        visible={sheet !== null}
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
            <Text style={s.solvedTerm}>{confirm.title}</Text>
            <Text style={s.explanation}>{confirm.body}</Text>
            <Button
              title={confirm.action}
              disabled={confirm.disabled}
              onPress={confirm.run}
            />
            <Button secondary title="VAZGEÇ" onPress={() => setSheet(null)} />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function QuestionArrow({
  label,
  Glyph,
  disabled,
  onPress,
}: {
  label: string;
  Glyph: Icon;
  disabled: boolean;
  onPress: () => void;
}) {
  const { sx, tc } = useTheme();
  const s = sx(sN);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        s.questionArrow,
        disabled && { opacity: 0.28 },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}
    >
      <Glyph size={16} weight="bold" color={tc("#F8E7B6", "text")} />
    </Pressable>
  );
}
// By day a filled tile is warm parchment with a gold edge, so it reads apart from the white blanks.
const dayFilled = { backgroundColor: "#F3E2B8", borderColor: "#C9A04A" };
const sN = StyleSheet.create({
  screen: { flex: 1, backgroundColor: N.bg },
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
    backgroundColor: N.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: N.ink, fontSize: 32 },
  title: { color: N.ink, fontSize: 19, fontWeight: "800" },
  progressText: { color: N.muted, fontSize: 14 },
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
    borderColor: N.gold,
    backgroundColor: "#CFAB4B14",
    shadowColor: N.gold,
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
    borderColor: N.gold,
    borderWidth: 2,
    backgroundColor: "#465267",
    shadowColor: N.gold,
    shadowOpacity: 0.35,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  letter: { color: "#17243B", fontWeight: "800" },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    ...shadows.card,
  },
  questionHeader: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  questionArrows: { flexDirection: "row", gap: 8 },
  questionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3C4B63",
    backgroundColor: "#14233B",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    flexShrink: 1,
    color: N.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  clue: {
    color: "#F5F1E7",
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "500",
  },
  extra: { color: "#C0CABF", fontSize: 14, lineHeight: 20 },
  pool: { gap: 8, marginTop: 2 },
  poolLabel: { color: N.gold, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  poolTiles: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  poolTile: {
    minWidth: 28,
    height: 30,
    paddingHorizontal: 4,
    borderRadius: 7,
    backgroundColor: "#FFFBF2",
    borderWidth: 1,
    borderColor: "#E7DECC",
    alignItems: "center",
    justifyContent: "center",
  },
  poolLetter: { color: "#17243B", fontSize: 15, fontWeight: "800" },
  solvedCard: {
    backgroundColor: "#0E3A2D",
    borderWidth: 1,
    borderColor: "#2F8F68",
  },
  solvedTerm: {
    color: N.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
  },
  explanation: { color: N.muted, fontSize: 15, lineHeight: 22 },
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
  boosterCopy: { flexShrink: 1, gap: 2 },
  boosterCost: {
    minHeight: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  boosterTitle: { color: N.ink, fontWeight: "800", fontSize: 12 },
  boosterPrice: { color: N.gold, fontSize: 12, fontWeight: "700" },
  feedback: { color: N.muted, fontSize: 14, textAlign: "center" },
  error: { color: N.red },
  overlay: { flex: 1, backgroundColor: "#0009", justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    backgroundColor: N.panel,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
});

/** Height of the on-screen keyboard, 0 while it is closed. */
function useKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    // iOS reports the change before the animation, Android only after it.
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(ios ? "keyboardWillShow" : "keyboardDidShow", (e) =>
      setHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(ios ? "keyboardWillHide" : "keyboardDidHide", () =>
      setHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}
