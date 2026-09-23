import React from "react";
import {
  View,
} from "react-native";
import { Text } from "../AppText";
import { useGame } from "../store";
import { productOf } from "../product";
import { Button, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Seal } from "../art";
import { Props } from "../navigation";
export default function MilestoneScreen({
  navigation,
  route,
}: Props<"Milestone">) {
  const { game, dispatch } = useGame(),
    file = route.params.file,
    eligible = game.results.some((r) => r.file === file) && file % 5 === 0,
    claimed = productOf(game).claimedMilestones.includes(file);
  return (
    <Shell>
      <TopBar title="Kilometre taşı" back={() => navigation.goBack()} />
      <View style={{ alignItems: "center", padding: 30 }}>
        <Seal size={130} value="✦" />
      </View>
      <Label>BÖLÜM {file} TAMAMLANDI</Label>
      <Text style={s.hero}>Bir mühür daha, bir adım ileri.</Text>
      <GameCard style={{ gap: 20 }}>
        <Text style={s.hero}>+50 Mühür</Text>
        <Text style={s.text}>+1 ücretsiz Harf Aç</Text>
        <Text style={s.muted}>
          Ana bölümlerde kullanılır. Ödül tek seferliktir.
        </Text>
      </GameCard>
      <Button
        title={claimed ? "✓ ÖDÜL ALINDI" : "ÖDÜLÜ AL"}
        disabled={!eligible || claimed}
        onPress={() => dispatch({ type: "milestone", file })}
      />
      <Button secondary title="DEVAM ET" onPress={() => navigation.goBack()} />
    </Shell>
  );
}
