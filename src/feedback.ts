import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useGame } from "./store";
import { productOf } from "./product";
export function useFeedback() {
  const { game } = useGame();
  const correct = useAudioPlayer(require("../assets/correct.wav"));
  const wrong = useAudioPlayer(require("../assets/wrong.wav"));
  return (success: boolean) => {
    const settings = productOf(game).settings;
    if (settings.sound) {
      const player = success ? correct : wrong;
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => {});
    }
    if (settings.vibration)
      void Haptics.notificationAsync(
        success
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      ).catch(() => {});
  };
}
