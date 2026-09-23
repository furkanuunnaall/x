import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "../AppText";
import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { useDiscovery } from "../discovery/store";
import {
  dailyQuestion,
  dailySolved,
  Mark,
  roundFor,
  scoreGuess,
} from "../discovery/model";
import { DiscoveryStatus, markColors } from "../discovery/ui";
import { Button, C, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
import { useReducedMotion } from "../motion";
export default function DailyScreen({ navigation }: Props<"Daily">) {
  const { data, day, ready, dispatch } = useDiscovery();
  const q = dailyQuestion(day),
    round = roundFor(data, day),
    solved = dailySolved(data, day);
  const [showClue, setShowClue] = useState(false);
  const [history, setHistory] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const input = useRef<TextInput>(null);
  useEffect(() => {
    setShowClue(false);
    setHistory(false);
  }, [day]);
  useEffect(() => {
    if (ready && !solved) showKeyboard(input.current);
  }, [ready, solved]);
  function submit() {
    if (round.draft.length !== q.term.length) return;
    dispatch({ type: "guess", day });
    if (round.draft !== q.term && !reduced) {
      shake.stopAnimation();
      shake.setValue(0);
      Animated.sequence(
        [-5, 5, -3, 3, 0].map((toValue) =>
          Animated.timing(shake, {
            toValue,
            duration: 60,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }
  }
  return (
    <Shell
      header={<TopBar title="Günün şifresi" back={() => navigation.goBack()} />}
    >
      <DiscoveryStatus />
      <GameCard style={d.hero}>
        <Label>GÜNLÜK KEŞİF · {day.split("-").reverse().join(".")}</Label>
        <Text style={s.hero}>
          {solved ? "Şifre çözüldü." : "Bugünün izi sende."}
        </Text>
        <Text style={s.muted}>
          {solved
            ? `${round.guesses.length} tahminde buldun. Bugünün damgası senin.`
            : `${q.term.length} harfli hukuk kavramını bul. Renkler yol göstersin.`}
        </Text>
        {solved ? (
          <View style={d.stamp}>
            <Text style={d.stampText}>✓ GÜNÜN DAMGASI</Text>
          </View>
        ) : (
          <View style={d.legend}>
            {[
              ["✓", "Doğru yer", "correct"],
              ["↔", "Farklı yer", "present"],
              ["–", "Yok", "absent"],
            ].map(([symbol, title, mark]) => (
              <View key={mark} style={d.legendItem}>
                <Text
                  style={[
                    d.mark,
                    { backgroundColor: markColors[mark as Mark] },
                  ]}
                >
                  {symbol}
                </Text>
                <Text style={s.small}>{title}</Text>
              </View>
            ))}
          </View>
        )}
      </GameCard>
      {round.guesses.length > 4 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setHistory(!history)}
          style={d.history}
        >
          <Text style={s.gold}>
            {history
              ? "Son 4 tahmini göster"
              : `Tüm tahminler (${round.guesses.length})`}
          </Text>
        </Pressable>
      ) : null}
      <View style={{ gap: 8 }}>
        {(history ? round.guesses : round.guesses.slice(-4)).map(
          (guess, row) => (
            <View key={`${row}-${guess}`} style={d.row}>
              {scoreGuess(guess, q.term).map((mark, i) => (
                <View
                  key={i}
                  accessible
                  accessibilityLabel={`${guess[i]}: ${mark === "correct" ? "doğru yerde" : mark === "present" ? "başka yerde var" : "yok"}`}
                  style={[d.slot, { backgroundColor: markColors[mark] }]}
                >
                  <Text style={d.letter}>{guess[i]}</Text>
                  <Text style={d.miniMark}>
                    {mark === "correct" ? "✓" : mark === "present" ? "↔" : "–"}
                  </Text>
                </View>
              ))}
            </View>
          ),
        )}
        {!solved ? (
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tahmin satırı, klavyeyi aç"
              onPress={() => showKeyboard(input.current)}
              style={d.row}
            >
              {Array.from({ length: q.term.length }, (_, i) => (
                <View
                  key={i}
                  style={[
                    d.slot,
                    i === round.draft.length && {
                      borderColor: C.gold,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text style={d.letter}>{round.draft[i] || "·"}</Text>
                </View>
              ))}
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
      {solved ? (
        <>
          <GameCard>
            <Label>{q.term}</Label>
            <Text style={s.text}>{q.explanation}</Text>
          </GameCard>
          <Button title="KEŞFE DÖN" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <>
          <Text accessibilityLiveRegion="polite" style={s.small}>
            {round.guesses.length
              ? "Yeni bir tahmin yapabilirsin. Deneme sınırı yok."
              : "Herhangi bir harf dizisiyle başlayabilirsin."}
          </Text>
          {showClue ? (
            <GameCard>
              <Text style={s.text}>{q.clue}</Text>
            </GameCard>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowClue(true)}
              style={d.history}
            >
              <Text style={s.gold}>Tanımı göster · ücretsiz</Text>
            </Pressable>
          )}
          <NativeLetterInput
            ref={input}
            editable={ready}
            onLetters={(letters) =>
              dispatch({
                type: "draft",
                day,
                value: (round.draft + letters.join("")).slice(
                  0,
                  q.term.length,
                ),
              })
            }
            onDelete={() =>
              dispatch({ type: "draft", day, value: round.draft.slice(0, -1) })
            }
            onSubmit={submit}
          />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                title="⌫ SİL"
                disabled={!ready || !round.draft.length}
                onPress={() =>
                  dispatch({
                    type: "draft",
                    day,
                    value: round.draft.slice(0, -1),
                  })
                }
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                title="TAHMİN ET"
                disabled={!ready || round.draft.length !== q.term.length}
                onPress={submit}
              />
            </View>
          </View>
        </>
      )}
      <Text style={s.note}>
        Her gün yeni bir şifre. Günlük damgalar ayrı bir koleksiyon; XP, Mühür
        ve bölüm serin ana oyunda devam eder.
      </Text>
    </Shell>
  );
}
const d = StyleSheet.create({
  hero: { gap: 12, borderColor: "#64755C" },
  row: { flexDirection: "row", gap: 4, justifyContent: "center" },
  slot: {
    flex: 1,
    maxWidth: 53,
    minHeight: 57,
    backgroundColor: C.raised,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  letter: { color: C.ink, fontSize: 22, fontWeight: "800" },
  miniMark: { color: C.ink, fontSize: 10 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  mark: { color: C.ink, borderRadius: 5, padding: 5, fontWeight: "700" },
  stamp: {
    borderColor: C.green,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#173E37",
  },
  stampText: {
    color: C.green,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1,
  },
  history: { minHeight: 44, justifyContent: "center" },
});
