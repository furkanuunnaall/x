import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { files } from "../content";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { dailyQuestions, newSession, productOf } from "../product";
import { Button, C, GameCard, Label, Shell, TopBar, s } from "../ui";
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
  const [failed, setFailed] = useState(false);
  const shake = useRef(new Animated.Value(0)).current,
    reduced = useReducedMotion(),
    feedback = useFeedback();
  useEffect(() => {
    if (daily) dispatch({ type: "daily-start", puzzleDate: day });
    else if (p.replay?.file !== file) dispatch({ type: "replay-start", file });
  }, [day, daily, file]);
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
  }
  function replay() {
    if (daily) dispatch({ type: "daily-start", puzzleDate: day, replay: true });
    else dispatch({ type: "replay-start", file });
    setFailed(false);
  }
  const title = daily ? "Günün şifresi" : `Dosya ${file} · Tekrar`;
  return (
    <Shell header={<TopBar title={title} back={() => navigation.goBack()} />}>
      <Label>
        {daily
          ? `${day.split("-").reverse().join(".")} · 3 KAVRAM`
          : "ALIŞTIRMA · ANA İLERLEME KORUNUR"}
      </Label>
      {done ? (
        <>
          <GameCard
            style={{ gap: 20, alignItems: "center", borderColor: C.gold }}
          >
            <Text style={{ fontSize: 50, color: C.gold }}>✦</Text>
            <Text style={s.hero}>
              {daily ? "GÜNLÜK DOSYA ÇÖZÜLDÜ" : "TEKRAR TAMAMLANDI"}
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
                Bu alıştırma XP, Mühür veya dosya yıldızlarını değiştirmez.
              </Text>
            )}
          </GameCard>
          {daily && (
            <Button
              title="TAKVİME DÖN"
              onPress={() => navigation.navigate("Daily")}
            />
          )}
          <Button
            title="ANA SAYFAYA DÖN"
            onPress={() => navigation.navigate("Home")}
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
                  minWidth: 44,
                  minHeight: 44,
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
          <GameCard style={{ gap: 16, borderColor: solved ? C.green : C.line }}>
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
              <Animated.View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 5,
                  transform: [{ translateX: shake }],
                }}
              >
                {q.term.split("").map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 32,
                      height: 46,
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
              </Animated.View>
              <Text
                accessibilityLiveRegion="polite"
                style={[s.small, failed && { color: C.red }]}
              >
                {failed
                  ? "Henüz değil. Bir kez daha dene."
                  : "Harfleri seç, kavramı oluştur."}
              </Text>
              <LetterPool
                term={q.term}
                seed={q.id}
                draft={draft.split("")}
                disabled={draft.length >= q.term.length}
                onLetter={(letter) => {
                  setFailed(false);
                  const answer = draft + letter;
                  dispatch({
                    type: "session-key",
                    puzzleDate: day,
                    mode,
                    value: answer,
                  });
                }}
              />
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Button
                    secondary
                    title="⌫ SİL"
                    disabled={!draft}
                    onPress={() =>
                      dispatch({
                        type: "session-key",
                        puzzleDate: day,
                        mode,
                        value: draft.slice(0, -1),
                      })
                    }
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
            <Button
              title="DEVAM ET"
              onPress={() =>
                choose(
                  qs.findIndex((item) => !session.solved.includes(item.id)),
                )
              }
            />
          )}
          <Text style={s.note}>
            {daily
              ? claimed
                ? "Bu tarihin ödülü alındı. Bu tekrar ödülsüzdür."
                : "3 kavramı tamamla: +100 XP ve +20 Mühür. Günde bir kez."
              : "Tekrar oynarken ödül, ipucu harcaması veya ana seri değişmez."}
          </Text>
        </>
      )}
    </Shell>
  );
}
