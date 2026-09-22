import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { C } from "./ui";
import { Gender, Role } from "./product";
const portraits = {
  Kadın: require("../assets/characters/woman.png"),
  Erkek: require("../assets/characters/man.png"),
};
export function Avatar({
  gender,
  role,
  size = 64,
  source,
  borderColor = C.gold,
}: {
  gender: Gender | null;
  role: Role | null;
  size?: number;
  source?: ImageSourcePropType;
  borderColor?: string;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor,
        overflow: "hidden",
        backgroundColor: C.panel,
      }}
    >
      <Image
        accessibilityLabel={`${gender ?? "Kadın"} oyun karakteri${role ? ` · ${role}` : ""}`}
        source={source ?? portraits[gender ?? "Kadın"]}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
}
