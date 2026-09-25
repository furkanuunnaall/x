import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Text } from "../AppText";
import { files } from "../content";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { dailyQuestions, newSession, productOf } from "../product";
import { Button, C, GameCard, Label, Shell, TopBar, s } from "../ui";
import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { LetterPool } from "../LetterPool";
import { Props } from "../navigation";
import { useFeedback } from "../feedback";
import { useReducedMotion } from "../motion";
export default function SessionScreen({
  navigation,
  route,
}: Props<"DailyPlay"> | Props<"Practice">) {
  const { game, dispatch } = useGame(),
    p = productOf(game);
  const { day: today } = useDiscovery();
  const day = route.name === "DailyPlay" ? route.params.day : today;
  const daily = route.name === "DailyPlay",
    mode = daily ? ("daily" as const) : ("replay" as const);
  const file = route.name === "Practice" ? route.params.file : game.file;
  const session =
    (daily
      ? p.dailyPuzzles[day]
      : p.replay?.file === file
        ? p.replay.session
        : undefined) ?? newSession();
  const qs = daily ? dailyQuestions(day) : files[file - 1].questions;
  const q = qs[session.selected],
    draft = session.drafts[q.id] ?? "",
    solved = session.solved.includes(q.id),
    done = session.solved.length === qs.length;
  const claimed = p.dailyPuzzleClaims.includes(day);
  // The screen does not scroll, so answer slots shrink to stay on one row.
  const { width } = useWindowDimensions();
  const available = Math.min(width, 560) * 0.94 - 32;
  const slotWidth = Math.min(
    30,
    Math.floor((available - (q.term.length - 1) * 4) / q.term.length),
  );
  // The daily puzzle is typed by tapping a shuffled letter pool (7 tiles per row); replay uses the keyboard.
  const tileSize = Math.min(46, Math.floor((available - 6 * 8) / 7));
  const [failed, setFailed] = useState(false);
  // Latest draft between renders, so fast typing never builds on a stale value.
  const live = useRef(draft);
  live.current = draft;
  const input = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current,
    reduced = useReducedMotion(),
    feedback = useFeedback();
  useEffect(() => {
    if (daily) dispatch({ type: "daily-start", puzzleDate: day });
    else if (p.replay?.file !== file) dispatch({ type: "replay-start", file });
  }, [day, daily, file]);
  useEffect(() => {
    if (!done && !daily) input.current?.focus();
  }, []);
  function check(answer = draft) {
    if (answer.length !== q.term.length || solved) return;
    const correct = answer === q.term;
    feedback(correct);
    setFailed(!correct);
    dispatch({ type: "session-submit", puzzleDate: day, mode });
    if (!correct && !reduced)
      Animated.sequence(
        [-6, 6, -3, 3, 0].map((toValue) =>
          Animated.timing(shake, {
            toValue,
            duration: 65,
            useNativeDriver: true,
          }),
        ),
      ).start();
  }
  function choose(index: number) {
    setFailed(false);
    dispatch({ type: "session-select", puzzleDate: day, mode, index });
    if (!daily) showKeyboard(input.current);
  }
  function type(value: string) {
    if (solved) return;
    live.current = value;
    setFailed(false);
    dispatch({ type: "session-key", puzzleDate: day, mode, value });
  }
  function next() {
    choose(qs.findIndex((item) => !session.solved.includes(item.id)));
  }
  function replay() {
    if (daily) dispatch({ type: "daily-start", puzzleDate: day, replay: true });
    else dispatch({ type: "replay-start", file });
    setFailed(false);
  }
  const title = daily ? "Günün şifresi" : `Bölüm ${file} · Tekrar`;
  return (
    <Shell header={<TopBar title={title} back={() => navigation.goBack()} />}>
      <View style={{ gap: 10 }}>
        <Label>
          {daily
            ? `${day.split("-").reverse().join(".")} · ${claimed ? "ÖDÜL ALINDI" : "+100 XP · +20 MÜHÜR"}`
            : "ALIŞTIRMA · ANA İLERLEME KORUNUR"}
        </Label>
        {done ? (
          <>
            <GameCard
              style={{ gap: 12, alignItems: "center", borderColor: C.gold }}
            >
              <Text style={{ fontSize: 40, color: C.gold }}>✦</Text>
              <Text style={s.hero}>
                {daily ? "GÜNLÜK BULMACA ÇÖZÜLDÜ" : "TEKRAR TAMAMLANDI"}
              </Text>
              <Text style={s.text}>
                {session.solved.length}/{qs.length} kavram · {session.mistakes}{" "}
                hata
              </Text>
              {daily ? (
                <>
                  <Text style={s.gold}>Günün ödülü: +100 XP · +20 Mühür</Text>
                  <Text style={s.muted}>
                    Bu tarihin ödülü hesabına bir kez eklendi.
                  </Text>
                </>
              ) : (
                <Text style={s.muted}>
                  Bu alıştırma XP, Mühür veya bölüm yıldızlarını değiştirmez.
                </Text>
              )}
            </GameCard>
            {daily && (
              <Button
                title="TAKVİME DÖN"
                onPress={() => navigation.popTo("Daily")}
              />
            )}
            <Button
              title="ANA SAYFAYA DÖN"
              onPress={() => navigation.popTo("Home")}
            />
            <Button secondary title="TEKRAR OYNA · ÖDÜLSÜZ" onPress={replay} />
          </>
        ) : (
          <>
            <View style={[s.row, { justifyContent: "center" }]}>
              {qs.map((item, i) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${i + 1}. soru`}
                  onPress={() => choose(i)}
                  style={{
                    minWidth: 40,
                    minHeight: 40,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: i === session.selected ? C.gold : C.line,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: session.solved.includes(item.id)
                      ? C.success
                      : C.panel,
                  }}
                >
                  <Text style={s.gold}>
                    {session.solved.includes(item.id) ? "✓" : i + 1}
                  </Text>
                </Pressable>
              ))}
            </View>
            <GameCard
              style={{
                gap: 10,
                padding: 16,
                borderColor: solved ? C.green : C.line,
              }}
            >
              <Label>
                {solved
                  ? "✓ DOĞRU"
                  : `${session.selected + 1}. SORU · ${q.term.length} HARF`}
              </Label>
              <Text style={solved ? s.hero : s.text}>
                {solved ? q.term : q.clue}
              </Text>
              {solved ? (
                <>
                  <Text style={s.gold}>{session.combo}’li seri</Text>
                  <Text style={s.muted}>{q.explanation}</Text>
                </>
              ) : null}
            </GameCard>
            {!solved ? (
              <>
                <Animated.View style={{ transform: [{ translateX: shake }] }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cevap kutuları, klavyeyi aç"
                    disabled={daily}
                    onPress={() => showKeyboard(input.current)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    {q.term.split("").map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: slotWidth,
                          height: 40,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: failed
                            ? C.red
                            : i === draft.length
                              ? C.gold
                              : C.line,
                          backgroundColor: C.raised,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={[s.text, { fontWeight: "800" }]}>
                          {draft[i] ?? "·"}
                        </Text>
                      </View>
                    ))}
                  </Pressable>
                </Animated.View>
                {failed ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[s.small, { color: C.red }]}
                  >
                    Henüz değil. Bir kez daha dene.
                  </Text>
                ) : null}
                {daily ? (
                  <LetterPool
                    term={q.term}
                    seed={q.id}
                    draft={draft.split("")}
                    size={tileSize}
                    disabled={draft.length >= q.term.length}
                    onLetter={(letter) => type(live.current + letter)}
                  />
                ) : null}
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Button
                      secondary
                      title="⌫ SİL"
                      disabled={!draft}
                      onPress={() => type(draft.slice(0, -1))}
                    />
                  </View>
                  <View style={{ flex: 2 }}>
                    <Button
                      title="ONAYLA"
                      disabled={draft.length !== q.term.length}
                      onPress={() => check()}
                    />
                  </View>
                </View>
              </>
            ) : (
              <Button title="DEVAM ET" onPress={next} />
            )}
          </>
        )}
      </View>
      {done || daily ? null : (
        <NativeLetterInput
          ref={input}
          onLetters={(letters) =>
            type((live.current + letters.join("")).slice(0, q.term.length))
          }
          onDelete={() => live.current && type(live.current.slice(0, -1))}
          onSubmit={() => (solved ? next() : check())}
        />
      )}
    </Shell>
  );
}
