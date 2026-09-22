import React, { useState } from "react";
import { Modal, Switch, Text, View } from "react-native";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { productOf, Settings } from "../product";
import { Button, C, GameCard, Label, Shell, TopBar, s } from "../ui";
import { Props } from "../navigation";
import { useFeedback } from "../feedback";
export default function SettingsScreen({ navigation }: Props<"Settings">) {
  const { game, dispatch, reset } = useGame(),
    discovery = useDiscovery(),
    p = productOf(game),
    test = useFeedback();
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function resetAll() {
    setBusy(true);
    try {
      await discovery.reset();
      await reset();
    } catch {
      setError("Sıfırlama tamamlanamadı. Tekrar dene.");
      setBusy(false);
    }
  }
  return (
    <Shell header={<TopBar title="Ayarlar" back={() => navigation.goBack()} />}>
      <GameCard style={{ gap: 24 }}>
        {(
          [
            ["sound", "Ses efektleri"],
            ["vibration", "Titreşim"],
            ["reduceMotion", "Animasyonları azalt"],
          ] as [keyof Settings, string][]
        ).map(([key, label]) => (
          <View key={key} style={s.between}>
            <Text style={[s.text, { flex: 1 }]}>{label}</Text>
            <Switch
              accessibilityLabel={label}
              value={p.settings[key]}
              trackColor={{ false: C.raised, true: "#79692F" }}
              thumbColor={p.settings[key] ? C.gold : C.muted}
              onValueChange={(value) =>
                dispatch({ type: "setting", key, value })
              }
            />
          </View>
        ))}
      </GameCard>
      <Button
        secondary
        title="SES VE TİTREŞİMİ DENE"
        onPress={() => test(true)}
      />
      <GameCard style={{ gap: 12 }}>
        <Label>HAKKINDA · MÜHÜR V1</Label>
        <Text style={s.text}>
          Hukuk kavramlarıyla oynanan bağımsız bir kelime oyunu.
        </Text>
        <Text style={s.muted}>
          Kurgusal karakterler, 30 dosya ve günlük keşifler. İlerleme bu cihazda
          saklanır. İçerik oyun amaçlı kısa tanımlardan oluşur.
        </Text>
      </GameCard>
      <Button
        secondary
        title="OYUN VERİSİNİ SIFIRLA"
        onPress={() => {
          setError("");
          setConfirm(true);
        }}
      />
      <Modal
        transparent
        visible={confirm}
        onRequestClose={() => {
          if (!busy) setConfirm(false);
        }}
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
              gap: 18,
              maxWidth: 460,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text style={s.hero}>Baştan başlamak mı?</Text>
            <Text style={s.text}>
              Tüm dosyalar, XP, Mühür, karakter, günlük ödüller ve favoriler bu
              cihazdan silinecek. Bu işlem geri alınamaz.
            </Text>
            {error ? <Text style={s.error}>{error}</Text> : null}
            <Button
              secondary
              title="VAZGEÇ"
              disabled={busy}
              onPress={() => setConfirm(false)}
            />
            <Button
              title={busy ? "SIFIRLANIYOR…" : "EVET, TÜMÜNÜ SIFIRLA"}
              disabled={busy}
              onPress={() => void resetAll()}
            />
          </GameCard>
        </View>
      </Modal>
    </Shell>
  );
}
