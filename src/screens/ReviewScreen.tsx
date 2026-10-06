import { announce, announceOnIOS } from "../a11y";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TextInput, View, useWindowDimensions } from "react-native";
import { Text } from "../AppText";
import { questions } from "../content";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { hardWords, REVIEW_SIZE, strugglePoints } from "../discovery/model";
import { Button, GameCard, Label, Shell, TopBar, useS } from "../ui";
import { NativeLetterInput, showKeyboard } from "../NativeLetterInput";
import { Props } from "../navigation";
import { useFeedback } from "../feedback";
import { useReducedMotion } from "../motion";
import { useTheme } from "../themeMode";

type Outcome = "first" | "later" | "revealed";
const outcomeText: Record<Outcome, string> = {
  first: "İlk denemede doğru",
  later: "Doğru",
  revealed: "Cevap gösterildi",
};

/**
 * A short, reward-free round over "Zor kelimelerim": no jokers, only "show the answer".
 * A term answered right on the first try loses struggle points and slowly leaves the list;
 * wrong tries and shown answers add points. The round itself is not saved.
 */
export default function ReviewScreen({ navigation }: Props<"Review">) {
  const { C } = useTheme();
  const s = useS();
  const { game } = useGame();
  const { data, dispatch } = useDiscovery();
  const pick = () => hardWords(game, data).slice(0, REVIEW_SIZE).map((q) => q.id);
  const [ids, setIds] = useState(pick);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [tries, setTries] = useState(0);
  const [failed, setFailed] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const q = questions.find((item) => item.id === ids[index]);
  const outcome = outcomes[index];
  const done = index >= ids.length;
  const live = useRef(draft);
  live.current = draft;
  const input = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current,
    reduced = useReducedMotion(),
    feedback = useFeedback();
  const { width } = useWindowDimensions();
  const length = q?.term.length ?? 1;
  const available = Math.min(width, 560) * 0.94 - 32;
  const slotWidth = Math.min(30, Math.floor((available - (length - 1) * 4) / length));
  useEffect(() => {
    if (q && !outcome) showKeyboard(input.current);
  }, [index]);

  const struggle = (points: number) =>
    q && dispatch({ type: "struggle", id: q.id, points });
  function finish(result: Outcome) {
    setOutcomes((list) => {
      const next = [...list];
      next[index] = result;
      return next;
    });
    input.current?.blur();
  }
  function check(answer: string) {
    if (!q || outcome) return;
    const correct = answer === q.term;
    feedback(correct);
    setFailed(!correct);
    if (correct) {
      announce(`Doğru: ${q.term}`);
      if (tries === 0) struggle(strugglePoints.reviewed);
      finish(tries === 0 ? "first" : "later");
      return;
    }
    announceOnIOS("Henüz değil. Bir kez daha dene.");
    struggle(strugglePoints.wrong);
    setTries((n) => n + 1);
    setDraft("");
    if (!reduced)
      Animated.sequence(
        [-6, 6, -3, 3, 0].map((toValue) =>
          Animated.timing(shake, { toValue, duration: 65, useNativeDriver: true }),
        ),
      ).start();
  }
  function reveal() {
    if (!q || outcome) return;
    struggle(strugglePoints.reveal);
    setFailed(false);
    finish("revealed");
    announce(`Cevap: ${q.term}`);
  }
  function next() {
    setIndex((i) => i + 1);
    setDraft("");
    setTries(0);
    setFailed(false);
  }
  function restart() {
    setIds(pick());
    setIndex(0);
    setOutcomes([]);
    setDraft("");
    setTries(0);
    setFailed(false);
  }

  const header = <TopBar title="Zor kelimelerim" back={() => navigation.goBack()} />;
  if (!ids.length)
    return (
      <Shell header={header}>
        <GameCard style={{ gap: 10, padding: 16 }}>
          <Text style={s.hero}>Tekrar edilecek kavram kalmadı</Text>
          <Text style={s.muted}>
            Yanlış yaptığın veya jokerle açtığın kavramlar burada toplanır.
          </Text>
        </GameCard>
        <Button title="KAVRAMLARA DÖN" onPress={() => navigation.goBack()} />
      </Shell>
    );
  if (done) {
    const first = outcomes.filter((o) => o === "first").length;
    const remaining = hardWords(game, data).length;
    return (
      // Keys keep the summary's scroll position from carrying over into the next round.
      <Shell key="summary" scroll header={header}>
        <GameCard style={{ gap: 10, padding: 16, alignItems: "center", borderColor: C.gold }}>
          <Text style={{ fontSize: 40, color: C.gold }}>✦</Text>
          <Text style={s.hero}>TEKRAR TURU BİTTİ</Text>
          <Text style={s.text}>
            {first}/{ids.length} kavram ilk denemede doğru
          </Text>
          <Text style={[s.muted, { textAlign: "center" }]}>
            İlk denemede bildiğin kavramlar listeden yavaş yavaş çıkar.
          </Text>
        </GameCard>
        {ids.map((id, i) => {
          const item = questions.find((x) => x.id === id)!;
          return (
            <GameCard key={id} style={{ gap: 6, padding: 16 }}>
              <View style={s.between}>
                <Text style={[s.text, { fontWeight: "800", flex: 1 }]}>{item.term}</Text>
                <Text
                  style={[
                    s.small,
                    { fontWeight: "800", color: outcomes[i] === "first" ? C.green : C.muted },
                  ]}
                >
                  {outcomeText[outcomes[i]]}
                </Text>
              </View>
              <Text style={s.muted}>{item.explanation}</Text>
            </GameCard>
          );
        })}
        {remaining ? (
          <Button title={`YENİ TUR · ${Math.min(remaining, REVIEW_SIZE)} KAVRAM`} onPress={restart} />
        ) : null}
        <Button secondary title="KAVRAMLARA DÖN" onPress={() => navigation.goBack()} />
      </Shell>
    );
  }
  return (
    <Shell key="round" header={header}>
      <View style={{ gap: 10 }}>
        <Label>
          TEKRAR · {index + 1}/{ids.length} · ÖDÜLSÜZ
        </Label>
        <GameCard style={{ gap: 10, padding: 16, borderColor: outcome ? C.green : C.line }}>
          <Label>
            {q!.category.toLocaleUpperCase("tr-TR")} · {q!.term.length} HARF
          </Label>
          <Text style={s.text}>{q!.clue}</Text>
          {outcome ? (
            <>
              <Text style={[s.small, { fontWeight: "800", color: outcome === "revealed" ? C.muted : C.green }]}>
                {outcomeText[outcome].toLocaleUpperCase("tr-TR")}
              </Text>
              <Text style={s.hero}>{q!.term}</Text>
              <Text style={s.muted}>{q!.explanation}</Text>
            </>
          ) : null}
        </GameCard>
        {outcome ? (
          <Button title={index + 1 < ids.length ? "DEVAM ET" : "TURU BİTİR"} onPress={next} />
        ) : (
          <>
            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Cevap kutuları, ${q!.term.length} harf, klavyeyi aç`}
                onPress={() => showKeyboard(input.current)}
                style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}
              >
                {q!.term.split("").map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: slotWidth,
                      height: 40,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: failed ? C.red : i === draft.length ? C.gold : C.line,
                      backgroundColor: C.raised,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={[s.text, { fontWeight: "800" }]}>{draft[i] ?? "·"}</Text>
                  </View>
                ))}
              </Pressable>
            </Animated.View>
            {failed ? (
              <Text accessibilityLiveRegion="polite" style={[s.small, { color: C.red }]}>
                Henüz değil. Bir kez daha dene.
              </Text>
            ) : null}
            <Button secondary title="CEVABI GÖSTER" onPress={reveal} />
          </>
        )}
      </View>
      <NativeLetterInput
        ref={input}
        editable={!outcome}
        onLetters={(letters) => {
          if (!q || outcome) return;
          const value = (live.current + letters.join("")).slice(0, q.term.length);
          live.current = value;
          setDraft(value);
          setFailed(false);
          if (value.length === q.term.length) check(value);
        }}
        onDelete={() => {
          const value = live.current.slice(0, -1);
          live.current = value;
          setDraft(value);
        }}
        onSubmit={() => (outcome ? next() : undefined)}
        resetKey={`${index}:${tries}`}
      />
    </Shell>
  );
}
