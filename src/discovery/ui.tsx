import {
  Pressable,
} from "react-native";
import { Text } from "../AppText";
import { useS } from "../ui";
import { useDiscovery } from "./store";
export function DiscoveryStatus() {
  const s = useS();
  const { ready, error, retry } = useDiscovery();
  return error ? (
    <Pressable accessibilityRole="button" accessibilityHint="Tekrar dener" onPress={retry}>
      <Text style={s.error}>{error}</Text>
    </Pressable>
  ) : !ready ? (
    <Text style={s.muted}>Kayıt açılıyor…</Text>
  ) : null;
}
