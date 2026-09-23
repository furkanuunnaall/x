import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
} from "react-native";
import { Text } from "./AppText";
import { useGame } from "./store";
import { productOf } from "./product";
import { Button, C, GameCard, Label, s } from "./ui";
import { Seal } from "./art";
export default function Notices() {
  const { game, dispatch } = useGame(),
    p = productOf(game),
    n = p.notices[0];
  useEffect(() => {
    if (n?.kind !== "badge") return;
    const timer = setTimeout(
      () => dispatch({ type: "notice-dismiss", id: n.id }),
      3500,
    );
    return () => clearTimeout(timer);
  }, [n?.id]);
  if (!n || !p.selectedCharacter) return null;
  const dismiss = () => dispatch({ type: "notice-dismiss", id: n.id });
  if (n.kind === "badge")
    return (
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 70,
          left: 20,
          right: 20,
          alignItems: "center",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Başarım açıldı: ${n.title}. Kapat`}
          onPress={dismiss}
        >
          <GameCard style={{ gap: 6, borderColor: C.gold, padding: 16 }}>
            <Label>BAŞARIM AÇILDI</Label>
            <Text style={s.text}>✦ {n.title}</Text>
          </GameCard>
        </Pressable>
      </View>
    );
  return (
    <Modal
      transparent
      visible
      onRequestClose={dismiss}
      animationType={p.settings.reduceMotion ? "none" : "fade"}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#030917DD",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <GameCard
          style={{
            gap: 24,
            alignItems: "center",
            borderColor: C.gold,
            width: "100%",
            maxWidth: 460,
            alignSelf: "center",
          }}
        >
          <Seal size={100} value="✦" />
          <Label>SEVİYE ATLADIN</Label>
          <Text style={s.hero}>{n.title}</Text>
          <Text style={s.gold}>+{n.amount} Mühür eklendi</Text>
          <View style={{ alignSelf: "stretch" }}>
            <Button title="DEVAM" onPress={dismiss} />
          </View>
        </GameCard>
      </View>
    </Modal>
  );
}
