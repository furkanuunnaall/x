import React, { useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  Switch,
  View,
} from "react-native";
import { CaretRightIcon } from "phosphor-react-native/src/icons/CaretRight";
import { CircleHalfIcon } from "phosphor-react-native/src/icons/CircleHalf";
import { InfoIcon } from "phosphor-react-native/src/icons/Info";
import { MoonIcon } from "phosphor-react-native/src/icons/Moon";
import { SunIcon } from "phosphor-react-native/src/icons/Sun";
import { Text } from "../AppText";
import { useGame } from "../store";
import { useDiscovery } from "../discovery/store";
import { productOf, ThemeMode } from "../product";
import { Button, GameCard, Label, Shell, TopBar, useS } from "../ui";
import { Props } from "../navigation";
import { useFeedback } from "../feedback";
import { useTheme } from "../themeMode";
import { askPermission } from "../notifications";
export default function SettingsScreen({ navigation }: Props<"Settings">) {
  const { C, tc } = useTheme();
  const s = useS();
  const { game, dispatch, reset } = useGame(),
    discovery = useDiscovery(),
    p = productOf(game),
    test = useFeedback();
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [denied, setDenied] = useState(false);
  async function toggleReminder(value: boolean) {
    setDenied(false);
    if (value && !(await askPermission())) return setDenied(true);
    dispatch({ type: "setting", key: "notifications", value });
  }
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
      <GameCard style={{ gap: 10, padding: 16 }}>
        <Label>GÖRÜNÜM</Label>
        <View
          accessibilityRole="radiogroup"
          style={{
            flexDirection: "row",
            gap: 4,
            padding: 4,
            borderRadius: 14,
            backgroundColor: C.raised,
          }}
        >
          {(
            [
              ["dark", "Gece", MoonIcon],
              ["light", "Gündüz", SunIcon],
              ["auto", "Otomatik", CircleHalfIcon],
            ] as const
          ).map(([mode, label, Icon]) => {
            const on = p.settings.theme === mode;
            return (
              <Pressable
                key={mode}
                accessibilityRole="radio"
                accessibilityLabel={`Tema: ${label}`}
                accessibilityState={{ checked: on }}
                onPress={() =>
                  dispatch({ type: "setting", key: "theme", value: mode as ThemeMode })
                }
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  backgroundColor: on ? C.panel : "transparent",
                  borderWidth: on ? 1 : 0,
                  borderColor: C.gold,
                }}
              >
                <Icon size={16} weight={on ? "fill" : "regular"} color={on ? C.gold : C.muted} />
                <Text style={[s.small, { fontWeight: "800", color: on ? C.ink : C.muted }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={s.small}>
          Otomatik: 07:00–19:00 arası gündüz, sonrası gece.
        </Text>
      </GameCard>
      <GameCard style={{ gap: 20 }}>
        {(
          [
            ["sound", "Ses efektleri"],
            ["vibration", "Titreşim"],
            ["reduceMotion", "Animasyonları azalt"],
          ] as ["sound" | "vibration" | "reduceMotion", string][]
        ).map(([key, label]) => (
          <View key={key} style={s.between}>
            <Text style={[s.text, { flex: 1 }]}>{label}</Text>
            <Switch
              accessibilityLabel={label}
              value={p.settings[key]}
              trackColor={{ false: C.raised, true: tc("#79692F") }}
              thumbColor={p.settings[key] ? C.gold : C.muted}
              onValueChange={(value) =>
                dispatch({ type: "setting", key, value })
              }
            />
          </View>
        ))}
      </GameCard>
      {Platform.OS !== "web" ? (
        <GameCard style={{ gap: 10, padding: 16 }}>
          <Label>BİLDİRİMLER</Label>
          <View style={s.between}>
            <Text style={[s.text, { flex: 1 }]}>Günlük hatırlatma</Text>
            <Switch
              accessibilityLabel="Günlük hatırlatma"
              value={p.settings.notifications}
              trackColor={{ false: C.raised, true: tc("#79692F") }}
              thumbColor={p.settings.notifications ? C.gold : C.muted}
              onValueChange={(value) => void toggleReminder(value)}
            />
          </View>
          <Text style={s.small}>
            Her gün 13:00'te: günlük bulmaca ve istikrar serin için tek bir hatırlatma.
          </Text>
          {denied ? (
            <>
              <Text style={[s.small, { color: C.red }]}>
                Bildirim izni kapalı. Telefonun ayarlarından MÜHÜR için bildirimlere izin ver.
              </Text>
              <Button
                small
                secondary
                title="TELEFON AYARLARINI AÇ"
                onPress={() => void Linking.openSettings()}
              />
            </>
          ) : null}
        </GameCard>
      ) : null}
      <Button
        secondary
        title="SES VE TİTREŞİMİ DENE"
        onPress={() => test(true)}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hakkında"
        onPress={() => navigation.navigate("About")}
        style={({ pressed }) => pressed && { opacity: 0.75 }}
      >
        <GameCard style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
          <InfoIcon size={24} weight="regular" color={C.gold} />
          <Text style={[s.text, { flex: 1, fontWeight: "800" }]}>Hakkında</Text>
          <CaretRightIcon size={18} weight="bold" color={C.muted} />
        </GameCard>
      </Pressable>
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
            backgroundColor: tc("#030917DD"),
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
              Tüm bölümler, XP, Mühür, karakter, günlük ödüller ve favoriler bu
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
