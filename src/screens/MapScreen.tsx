import React from "react";
import LevelMapScreen from "./LevelMapScreen";
import { useGame } from "../store";
import { Props } from "../navigation";
export default function MapScreen({ navigation }: Props<"Map">) {
  const { game, dispatch } = useGame();
  return (
    <LevelMapScreen
      onClose={() => navigation.popTo("Home")}
      onReward={(file) => navigation.navigate("Milestone", { file })}
      onPlay={(file = game.file) => {
        if (game.results.some((r) => r.file === file)) {
          dispatch({ type: "replay-start", file });
          navigation.navigate("Practice", { file });
        } else navigation.navigate(file % 10 === 0 ? "FinalIntro" : "Game");
      }}
    />
  );
}
