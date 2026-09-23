import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import {
  achievements,
  dailySolved,
  unlockedQuestions,
} from "../discovery/model";
import { DiscoveryStatus } from "../discovery/ui";
import { normalize } from "../game";
import { files, questions } from "../content";
import {
  Button,
  C,
  GameCard,
  Label,
  ProgressBar,
  Shell,
  TopBar,
  s,
} from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";
export default function ExploreScreen({ navigation, route }: Props<"Explore">) {
  const { game } = useGame();
  const { data, ready, dispatch } = useDiscovery();
  const [category, setCategory] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(false);
  const unlocked = unlockedQuestions(game);
  const shown = unlocked.filter(
    (q) =>
      (category === "Tümü" || q.category === category) &&
      (!favorites || data.favorites.includes(q.id)) &&
      normalize(`${q.term} ${q.category}`).includes(normalize(query)),
  );
  return (
    <Shell
      header={
        <TopBar
          title="Kavram koleksiyonu"
          back={() => navigation.navigate("Home")}
        />
      }
    >
      <DiscoveryStatus />
      <View style={{ gap: 9 }}>
        <View style={s.between}>
          <Text style={e.title}>Kavram koleksiyonun</Text>
          <Text style={s.gold}>
            {unlocked.length}/{questions.length}
          </Text>
        </View>
        <ProgressBar value={unlocked.length} total={questions.length} />
        <Text style={s.muted}>Çözdüğün her kavram burada bir kart olur.</Text>
      </View>
      <View style={e.shelf}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={e.book}>
            <Text style={e.bookNumber}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={s.small}>CİLT</Text>
            <Text style={s.gold}>
              {
                game.results.filter(
                  (r) => r.file > i * 10 && r.file <= (i + 1) * 10,
                ).length
              }
              /10 bölüm
            </Text>
          </View>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["Tümü", ...new Set(questions.map((q) => q.category))].map((c) => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: category === c }}
            onPress={() => setCategory(c)}
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              justifyContent: "center",
              borderRadius: 14,
              backgroundColor: category === c ? "#3A3540" : C.panel,
              borderWidth: 1,
              borderColor: category === c ? C.gold : C.line,
            }}
          >
            <Text style={{ color: category === c ? C.gold : C.ink }}>{c}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <TextInput
        accessibilityLabel="Koleksiyonda kavram veya kategori ara"
        placeholder="Kavram veya kategori ara…"
        placeholderTextColor={C.muted}
        value={query}
        onChangeText={setQuery}
        style={e.search}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: favorites }}
        onPress={() => setFavorites(!favorites)}
        style={e.filter}
      >
        <Text style={s.gold}>
          {favorites
            ? "★ Yalnızca favoriler · Tümünü göster"
            : "☆ Favorilerimi göster"}
        </Text>
      </Pressable>
      {shown.map((q) => (
        <GameCard key={q.id} style={{ gap: 10 }}>
          <View style={s.between}>
            <View style={{ flex: 1, gap: 5 }}>
              <Label>{q.category}</Label>
              <Text style={e.title}>{q.term}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${q.term} ${data.favorites.includes(q.id) ? "favorilerden çıkar" : "favorilere ekle"}`}
              disabled={!ready}
              onPress={() => dispatch({ type: "favorite", id: q.id })}
              style={e.favorite}
            >
              <Text style={{ color: C.gold, fontSize: 27 }}>
                {data.favorites.includes(q.id) ? "★" : "☆"}
              </Text>
            </Pressable>
          </View>
          <Text style={s.text}>{q.explanation}</Text>
          <Text style={s.small}>
            İlk çözüm · Bölüm{" "}
            {
              files.find((f) => f.questions.some((item) => item.id === q.id))
                ?.id
            }
          </Text>
        </GameCard>
      ))}
      {!shown.length ? (
        <GameCard style={{ gap: 12 }}>
          <Text style={e.title}>
            {unlocked.length
              ? "Bu rafta henüz kart yok."
              : "İlk kartın seni bekliyor."}
          </Text>
          <Text style={s.muted}>
            {unlocked.length
              ? "Aramanı değiştir veya başka bir karta yıldız ekle."
              : "Ana oyunda bir kelime çöz; kartı burada açılsın."}
          </Text>
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
    </Shell>
  );
}
const e = StyleSheet.create({
  daily: { gap: 18, borderColor: "#756744" },
  title: { color: C.ink, fontSize: 19, fontWeight: "800" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1D2C45",
    padding: 5,
    borderRadius: 15,
    gap: 5,
  },
  tab: { flex: 1, padding: 14, alignItems: "center", borderRadius: 11 },
  active: { backgroundColor: "#314159" },
  tabText: { color: C.muted, fontSize: 16, fontWeight: "700" },
  shelf: {
    flexDirection: "row",
    gap: 6,
    borderBottomWidth: 5,
    borderBottomColor: "#46516C",
    paddingBottom: 6,
  },
  book: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 3,
    backgroundColor: "#24344C",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#5F718C",
    borderWidth: 1,
    borderColor: "#3E526E",
    alignItems: "center",
  },
  bookNumber: {
    color: C.ink,
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 8,
  },
  search: {
    color: C.ink,
    backgroundColor: "#192A44",
    borderColor: "#3D4E6C",
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    fontSize: 16,
    minHeight: 50,
  },
  filter: { minHeight: 44, justifyContent: "center" },
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
  badgeIcon: { color: C.muted, fontSize: 26, fontWeight: "800" },
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
