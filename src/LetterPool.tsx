import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./AppText";
import { poolTiles } from "./poolTiles";
import { radius } from "./theme";
import { useTheme } from "./themeMode";
import { colors as N } from "./theme";

/** Shuffled answer letters plus three decoys; tapping a tile appends its letter. */
export function LetterPool({
  term,
  seed,
  draft,
  size = 44,
  disabled = false,
  onLetter,
}: {
  term: string;
  seed: string;
  draft: string[];
  size?: number;
  disabled?: boolean;
  onLetter: (letter: string) => void;
}) {
  const { C, sx } = useTheme();
  const styles = sx(stylesN);
  return (
    <View accessibilityLabel="Harf havuzu" style={styles.pool}>
      {poolTiles(term, seed, draft).map((tile) => {
        const off = disabled || tile.used;
        return (
          <Pressable
            key={tile.id}
            accessibilityRole="button"
            accessibilityLabel={`${tile.letter} harfi, taş ${tile.id + 1}`}
            accessibilityState={{ disabled: off, selected: tile.used }}
            disabled={off}
            onPress={() => onLetter(tile.letter)}
            style={({ pressed }) => [
              styles.tile,
              { width: size, height: size },
              tile.used && styles.used,
              pressed && styles.pressed,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.letter,
                  { fontSize: size * 0.48 },
                  pressed && { color: C.bg },
                ]}
              >
                {tile.letter}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const stylesN = StyleSheet.create({
  pool: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  tile: {
    backgroundColor: N.raised,
    borderRadius: radius.sm,
    borderBottomWidth: 3,
    borderColor: "#111C32",
    alignItems: "center",
    justifyContent: "center",
  },
  used: { backgroundColor: N.bg, opacity: 0.35 },
  pressed: { backgroundColor: N.gold, transform: [{ scale: 0.95 }] },
  letter: { color: N.ink, fontWeight: "800" },
});
