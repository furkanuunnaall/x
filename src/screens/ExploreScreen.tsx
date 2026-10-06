import React, { useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "../AppText";
import { CaretDownIcon } from "phosphor-react-native/src/icons/CaretDown";
import { CaretUpIcon } from "phosphor-react-native/src/icons/CaretUp";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import {
  achievements,
  dailySolved,
  hardWords,
  LEARN_AFTER,
  REVIEW_SIZE,
  unlockedQuestions,
} from "../discovery/model";
import { DiscoveryStatus } from "../discovery/ui";
import { normalize } from "../game";
import { questions } from "../content";
import { exampleSentences } from "../exampleSentences";
import { categoriesOf } from "../termCategories";
import {
  Button,
  GameCard,
  Label,
  ProgressBar,
  Shell,
  TopBar,
  useS,
} from "../ui";
import { Props } from "../navigation";
import { useTheme } from "../themeMode";
import { colors as N } from "../theme";
export default function ExploreScreen({ navigation, route }: Props<"Explore">) {
  const { C, sx, tc } = useTheme();
  const s = useS();
  const e = sx(eN);
  const { game } = useGame();
  const { data, ready, dispatch } = useDiscovery();
  const [category, setCategory] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(false);
  const [hardOnly, setHardOnly] = useState(false);
  const [open, setOpen] = useState<string[]>([]);
  const closeKeyboard = () => {
    Keyboard.dismiss();
    return false;
  };
  const unlocked = unlockedQuestions(game);
  const hard = hardWords(game, data);
  // Falls back to the whole collection once review rounds have emptied the list.
  const hardView = hardOnly && hard.length > 0;
  // Only terms are searched; categories have their own chips above.
  const search = normalize(query);
  const shown = (hardView ? hard : unlocked).filter(
    (q) =>
      (category === "Tümü" || categoriesOf(q).includes(category)) &&
      (!favorites || data.favorites.includes(q.id)) &&
      normalize(q.term).includes(search),
  );
  // Why the shelf is empty decides what the player is told to do next.
  const empty = !unlocked.length
    ? {
        title: "İlk kartın seni bekliyor.",
        body: "Ana oyunda bir kelime çöz; kartı burada açılsın.",
      }
    : search
      ? {
          title: "Bu aramayla eşleşen kart yok.",
          body: "Kartlar, kavramı çözdükten sonra koleksiyona eklenir. Yazımı ve seçili kategoriyi kontrol et.",
        }
      : favorites
        ? {
            title: "Henüz favori kartın yok.",
            body: "Bir kartı favorilerine eklemek için kartın yanındaki yıldıza dokun.",
          }
        : {
            title: "Bu kategoride henüz kart yok.",
            body: "Bu kategorideki kavramları çözdükçe kartları burada görünür.",
          };
  return (
    <Shell
      scroll
      header={
        <TopBar
          title="Kavram koleksiyonu"
          back={() => navigation.popTo("Home")}
        />
      }
    >
      {/* A tap anywhere but the search field closes the keyboard; the tap itself still works. */}
      <View
        style={{ gap: 20 }}
        onStartShouldSetResponderCapture={closeKeyboard}
      >
        <DiscoveryStatus />
        <View style={{ gap: 8 }}>
          <View style={s.between}>
            <Text style={e.title}>Koleksiyonun</Text>
            <Text style={s.gold}>
              {unlocked.length}/{questions.length}
            </Text>
          </View>
          <ProgressBar value={unlocked.length} total={questions.length} />
        </View>
        {/* "Zor kelimelerim": terms with the most wrong answers and jokers, and a short review round. */}
        <GameCard style={{ gap: 8, padding: 14 }}>
          <View style={s.between}>
            <Label>ZOR KELİMELERİM</Label>
            <Text style={s.gold}>{hard.length} kavram</Text>
          </View>
          <Text style={s.small}>
            {hard.length
              ? "En çok yanlış yaptığın ve jokerle açtığın kavramlar."
              : "Yanlış yaptığın veya jokerle açtığın kavramlar burada toplanır."}
          </Text>
          {hard.length ? (
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Button
                  small
                  secondary
                  title={hardView ? "TÜMÜNÜ GÖSTER" : "LİSTEYİ GÖR"}
                  onPress={() => setHardOnly(!hardView)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  small
                  title={`TEKRAR ET · ${Math.min(hard.length, REVIEW_SIZE)}`}
                  disabled={!ready}
                  onPress={() => navigation.navigate("Review")}
                />
              </View>
            </View>
          ) : null}
        </GameCard>
        {/* Filters wrap onto rows instead of scrolling sideways; Favoriler sits first. */}
        <View style={e.chips}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorites
                ? "Favoriler gösteriliyor. Tümünü göster"
                : "Yalnızca favorileri göster"
            }
            accessibilityState={{ selected: favorites }}
            onPress={() => setFavorites(!favorites)}
            hitSlop={4}
            style={[
              e.chip,
              {
                backgroundColor: favorites ? tc("#3A3540") : C.panel,
                borderColor: favorites ? C.gold : C.line,
              },
            ]}
          >
            <Text style={[e.chipText, { color: C.gold }]}>
              {favorites ? "★" : "☆"} Favoriler
            </Text>
          </Pressable>
          {["Tümü", ...new Set(questions.map((q) => q.category))].map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={
                c === "Tümü" ? "Bütün kategoriler" : `${c} kategorisi`
              }
              accessibilityState={{ selected: category === c }}
              onPress={() => setCategory(c)}
              hitSlop={4}
              style={[
                e.chip,
                {
                  backgroundColor: category === c ? tc("#3A3540") : C.panel,
                  borderColor: category === c ? C.gold : C.line,
                },
              ]}
            >
              <Text
                style={[e.chipText, { color: category === c ? C.gold : C.ink }]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <TextInput
        accessibilityLabel="Koleksiyonda kavram ara"
        placeholder="Kavram ara…"
        placeholderTextColor={C.muted}
        value={query}
        onChangeText={setQuery}
        style={e.search}
      />
      <View onStartShouldSetResponderCapture={closeKeyboard}>
        <View style={{ gap: 12 }}>
          {shown.map((q) => {
            const isOpen = open.includes(q.id);
            const favorite = data.favorites.includes(q.id);
            return (
              // Cards stay closed to keep the list short; a tap opens the full text and the example.
              <Pressable
                key={q.id}
                accessibilityRole="button"
                accessibilityLabel={`${q.term}, ${categoriesOf(q).join(", ")}`}
                accessibilityHint={
                  isOpen ? "Kartı kapatır" : "Açıklamayı ve örneği açar"
                }
                accessibilityState={{ expanded: isOpen }}
                onPress={() =>
                  setOpen((ids) =>
                    ids.includes(q.id)
                      ? ids.filter((id) => id !== q.id)
                      : [...ids, q.id],
                  )
                }
              >
                <GameCard style={{ gap: 10, padding: 14 }}>
                  <View style={e.head}>
                    <View style={e.name}>
                      <Text style={e.title}>{q.term}</Text>
                      <Text style={e.category}>
                        {categoriesOf(q).join(", ")}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${q.term} ${favorite ? "favorilerden çıkar" : "favorilere ekle"}`}
                      disabled={!ready}
                      onPress={() => dispatch({ type: "favorite", id: q.id })}
                      style={e.favorite}
                    >
                      <Text style={{ color: C.gold, fontSize: 25 }}>
                        {favorite ? "★" : "☆"}
                      </Text>
                    </Pressable>
                    {isOpen ? (
                      <CaretUpIcon size={16} weight="bold" color={C.muted} />
                    ) : (
                      <CaretDownIcon size={16} weight="bold" color={C.muted} />
                    )}
                  </View>
                  {isOpen ? (
                    <>
                      <Text style={s.text}>{q.explanation}</Text>
                      {exampleSentences[q.term] ? (
                        <Example text={exampleSentences[q.term]} />
                      ) : null}
                      {hardView ? (
                        <Text style={[s.small, { color: C.gold }]}>
                          Zorlanma puanı: {data.struggles[q.id]} · Tekrarda
                          bilinen: {data.learned[q.id] ?? 0}/{LEARN_AFTER}
                        </Text>
                      ) : null}
                    </>
                  ) : null}
                </GameCard>
              </Pressable>
            );
          })}
          {!shown.length ? (
            <GameCard style={{ gap: 12 }}>
              <Text style={e.title}>{empty.title}</Text>
              <Text style={s.muted}>{empty.body}</Text>
              {!unlocked.length ? (
                <Button
                  title="BÖLÜME DÖN"
                  onPress={() =>
                    navigation.navigate(
                      game.results.some((r) => r.file === game.file)
                        ? "Result"
                        : "Game",
                    )
                  }
                />
              ) : null}
            </GameCard>
          ) : null}
        </View>
      </View>
    </Shell>
  );
}
/** The card's example sentence; the *marked* word (the term as used in the sentence) is bold. */
function Example({ text }: { text: string }) {
  const { C } = useTheme();
  const s = useS();
  return (
    <View
      accessible
      accessibilityLabel={`Örnek: ${text.replace(/\*/g, "")}`}
      style={{
        borderLeftWidth: 3,
        borderLeftColor: C.gold,
        paddingLeft: 10,
        gap: 3,
      }}
    >
      <Label>ÖRNEK</Label>
      <Text style={[s.text, { fontStyle: "italic" }]}>
        {text.split("*").map((part, i) =>
          i % 2 ? (
            <Text key={i} style={{ fontWeight: "800", fontStyle: "normal" }}>
              {part}
            </Text>
          ) : (
            part
          ),
        )}
      </Text>
    </View>
  );
}
const eN = StyleSheet.create({
  daily: { gap: 18, borderColor: "#756744" },
  title: { color: N.ink, fontSize: 19, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1D2C45",
    padding: 5,
    borderRadius: 15,
    gap: 5,
  },
  tab: { flex: 1, padding: 14, alignItems: "center", borderRadius: 11 },
  active: { backgroundColor: "#314159" },
  tabText: { color: N.muted, fontSize: 16, fontWeight: "700" },
  search: {
    color: N.ink,
    backgroundColor: "#192A44",
    borderColor: "#3D4E6C",
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    fontSize: 16,
    minHeight: 50,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 11,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "700" },
  head: { flexDirection: "row", alignItems: "center", gap: 4 },
  name: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    columnGap: 10,
    rowGap: 2,
  },
  category: {
    color: N.gold,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  favorite: {
    width: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#24344C",
    borderWidth: 1,
    borderColor: "#43526B",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeDone: { borderColor: "#C7A54C", backgroundColor: "#392C35" },
  badgeIcon: { color: N.muted, fontSize: 26, fontWeight: "800" },
  stamps: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stamp: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#5A654A",
    alignItems: "center",
    gap: 6,
  },
});
