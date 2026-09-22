import React from "react";
import { View } from "react-native";
import { LetterTile } from "./ui";
import { poolTiles } from "./poolTiles";
export function LetterPool({
  term,
  seed,
  draft,
  revealed = {},
  disabled = false,
  onLetter,
}: {
  term: string;
  seed: string;
  draft: string[];
  revealed?: Record<number, string>;
  disabled?: boolean;
  onLetter: (letter: string) => void;
}) {
  return (
    <View
      accessibilityLabel="Harf havuzu"
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 9,
        paddingVertical: 16,
      }}
    >
      {poolTiles(term, seed, draft, revealed).map((tile) => (
        <LetterTile
          key={tile.id}
          letter={tile.letter}
          used={tile.used}
          disabled={disabled || tile.used}
          size={48}
          label={`${tile.letter} harfi, taş ${tile.id + 1}`}
          onPress={() => onLetter(tile.letter)}
        />
      ))}
    </View>
  );
}
