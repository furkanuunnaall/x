import { announce, announceOnIOS } from "../a11y";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyIcon } from "phosphor-react-native/src/icons/Key";
import { MagnifyingGlassIcon } from "phosphor-react-native/src/icons/MagnifyingGlass";
import { SealCoin } from "../art";
import { costs } from "../game";
import { Text } from "../AppText";
import { files } from "../content";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { strugglePoints } from "../discovery/model";
import { dailyQuestions, newSession, productOf } from "../product";
import { Button, GameCard, Label, Shell, TopBar, useS } from "../ui";
import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { LetterPool } from "../LetterPool";
import { Props } from "../navigation";
import { useFeedback } from "../feedback";
import { useReducedMotion } from "../motion";
import { useTheme } from "../themeMode";
export default function SessionScreen({
  navigation,
  route,
}: Props<"DailyPlay"> | Props<"Practice">) {
  const { C } = useTheme();
  const s = useS();
  const { game, dispatch } = useGame(),
    p = productOf(game);
  const { day: today, dispatch: discover } = useDiscovery();
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
  const [sheet, setSheet] = useState<"extra" | "letter" | null>(null);
  // Daily jokers: İpucu removes the pool's decoy letters, Harf Aç fixes the next letter.
  const fixed = session.locked?.[q.id] ?? 0;
  const pooled = session.pooled?.includes(q.id) ?? false;
  const letterPrice = p.freeLetters > 0 ? 0 : costs.letter;
  const canOpenLetter = fixed < q.term.length - 1;
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
    if (correct) announce(`Doğru: ${q.term}`);
    else announceOnIOS("Henüz değil. Bir kez daha dene.");
    dispatch({ type: "session-submit", puzzleDate: day, mode });
    if (!correct)
      discover({ type: "struggle", id: q.id, points: strugglePoints.wrong });
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
  function buy(hint: "extra" | "letter") {
    setSheet(null);
    setFailed(false);
    dispatch({ type: "session-hint", mode: "daily", puzzleDate: day, hint });
    discover({ type: "struggle", id: q.id, points: strugglePoints[hint] });
    announce(
      hint === "extra"
        ? "Fazla harfler havuzdan kaldırıldı."
        : `Harf açıldı: ${q.term[fixed]}`,
    );
  }
  const confirm =
    sheet === "letter"
      ? {
          title: "Harf aç",
          body:
            letterPrice === 0
              ? `Sıradaki harf ücretsiz açılır. ${p.freeLetters} ücretsiz hakkın var.`
              : `Sıradaki harf ${letterPrice} Mühür karşılığında açılır.`,
          action:
            letterPrice === 0
              ? "ÜCRETSİZ · HARF AÇ"
              : `${letterPrice} MÜHÜR · HARF AÇ`,
          disabled: !canOpenLetter || game.seals < letterPrice,
          run: () => buy("letter"),
        }
      : {
          title: "İpucu al",
          body: `Harf havuzundaki fazla harfler kaldırılır; yalnızca kelimenin kendi harfleri kalır (${costs.extra} Mühür).`,
          action: `${costs.extra} MÜHÜR · İPUCU AL`,
          disabled: pooled || game.seals < costs.extra,
          run: () => buy("extra"),
        };
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
                  Bu alıştırma XP veya Mühür kazandırmaz.
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
                  accessibilityLabel={`${i + 1}. soru, ${item.term.length} harf${session.solved.includes(item.id) ? ", çözüldü" : ""}`}
                  accessibilityState={{ selected: i === session.selected }}
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
                            : i < fixed || i === draft.length
                              ? C.gold
                              : C.line,
                          backgroundColor: i < fixed ? C.panel : C.raised,
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
                    decoys={!pooled}
                    onLetter={(letter) => type(live.current + letter)}
                  />
                ) : null}
                {daily ? (
                  <View style={st.boosters}>
                    {[
                      {
                        key: "extra" as const,
                        Icon: MagnifyingGlassIcon,
                        title: "İpucu",
                        price: costs.extra,
                        disabled: pooled || game.seals < costs.extra,
                      },
                      {
                        key: "letter" as const,
                        Icon: KeyIcon,
                        title: "Harf Aç",
                        price: letterPrice,
                        disabled: !canOpenLetter || game.seals < letterPrice,
                      },
                    ].map((b) => (
                      <Pressable
                        key={b.key}
                        accessibilityRole="button"
                        accessibilityLabel={`${b.title}, ${b.price === 0 ? "ücretsiz" : `${b.price} Mühür`}`}
                        accessibilityState={{ disabled: b.disabled }}
                        disabled={b.disabled}
                        onPress={() => setSheet(b.key)}
                        style={[st.booster, b.disabled && { opacity: 0.4 }]}
                      >
                        <View
                          style={[
                            st.boosterIcon,
                            { borderColor: C.gold, backgroundColor: C.panel },
                          ]}
                        >
                          <b.Icon size={22} weight="bold" color={C.gold} />
                        </View>
                        <View style={{ gap: 2 }}>
                          <Text
                            style={[
                              s.small,
                              { fontWeight: "800", color: C.ink },
                            ]}
                          >
                            {b.title}
                          </Text>
                          <View style={st.cost}>
                            {b.price === 0 ? null : <SealCoin size={16} />}
                            <Text
                              style={[
                                s.small,
                                { color: C.gold, fontWeight: "700" },
                              ]}
                            >
                              {b.price === 0 ? "Ücretsiz" : b.price}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Button
                      secondary
                      title="⌫ SİL"
                      disabled={draft.length <= fixed}
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
      <Modal
        visible={sheet !== null}
        transparent
        animationType={reduced ? "none" : "slide"}
        onRequestClose={() => setSheet(null)}
      >
        <View style={st.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pencereyi kapat"
            style={StyleSheet.absoluteFill}
            onPress={() => setSheet(null)}
          />
          <SafeAreaView
            edges={["bottom"]}
            style={[st.sheet, { backgroundColor: C.panel }]}
            accessibilityViewIsModal
          >
            <Text style={s.hero}>{confirm.title}</Text>
            <Text style={s.text}>{confirm.body}</Text>
            <Button
              title={confirm.action}
              disabled={confirm.disabled}
              onPress={confirm.run}
            />
            <Button secondary title="VAZGEÇ" onPress={() => setSheet(null)} />
          </SafeAreaView>
        </View>
      </Modal>
      {done || daily ? null : (
        <NativeLetterInput
          ref={input}
          onLetters={(letters) => {
            const value = (live.current + letters.join("")).slice(
              0,
              q.term.length,
            );
            type(value);
            // A completed word is checked right away; Enter is no longer needed.
            if (value.length === q.term.length) check(value);
          }}
          onDelete={() => live.current && type(live.current.slice(0, -1))}
          onSubmit={() => (solved ? next() : check())}
        />
      )}
    </Shell>
  );
}
const st = StyleSheet.create({
  boosters: { flexDirection: "row", gap: 8, justifyContent: "center" },
  booster: {
    flex: 1,
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  boosterIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cost: { flexDirection: "row", alignItems: "center", gap: 3 },
  overlay: { flex: 1, backgroundColor: "#0009", justifyContent: "flex-end" },
  sheet: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    padding: 24,
    gap: 16,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
});
