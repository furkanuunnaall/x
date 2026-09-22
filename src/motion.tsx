import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, ViewStyle } from "react-native";
import { useGame } from "./store";
import { productOf } from "./product";
export function useReducedMotion() {
  const { game } = useGame();
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (active) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduced || productOf(game).settings.reduceMotion;
}
export function Reveal({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const reduced = useReducedMotion(),
    value = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) {
      value.setValue(1);
      return;
    }
    value.setValue(0);
    const animation = Animated.timing(value, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reduced, value]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            {
              translateY: value.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
