import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageSourcePropType,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";
import { useReducedMotion } from "./motion";

// Natural size of assets/courtyard.png; light positions below are in these pixels.
const IMAGE = { width: 941, height: 1672 };

type Light = {
  x: number;
  y: number;
  rx: number;
  ry?: number;
  color: string;
  peak: number;
};

const lamps: Light[] = [
  { x: 73, y: 912, rx: 62, color: "#FFC36A", peak: 0.55 },
  { x: 868, y: 910, rx: 62, color: "#FFC36A", peak: 0.55 },
  { x: 228, y: 988, rx: 42, color: "#FFC36A", peak: 0.5 },
  { x: 713, y: 988, rx: 42, color: "#FFC36A", peak: 0.5 },
  { x: 287, y: 1016, rx: 30, color: "#FFC36A", peak: 0.45 },
  { x: 655, y: 1016, rx: 30, color: "#FFC36A", peak: 0.45 },
  { x: 390, y: 972, rx: 28, color: "#FFC36A", peak: 0.45 },
  { x: 550, y: 972, rx: 28, color: "#FFC36A", peak: 0.45 },
  { x: 470, y: 965, rx: 110, ry: 130, color: "#FFCB7A", peak: 0.3 },
  { x: 45, y: 790, rx: 70, ry: 110, color: "#FFB45A", peak: 0.22 },
  { x: 895, y: 790, rx: 70, ry: 110, color: "#FFB45A", peak: 0.22 },
];

const reflection: Light = { x: 470, y: 1190, rx: 340, ry: 80, color: "#FFC06A", peak: 0.24 };

const clouds: (Light & { travel: number; duration: number })[] = [
  { x: 480, y: 420, rx: 210, ry: 34, color: "#F6B88E", peak: 0.14, travel: 70, duration: 46000 },
  { x: 250, y: 575, rx: 230, ry: 42, color: "#F6B88E", peak: 0.18, travel: -60, duration: 38000 },
  { x: 710, y: 695, rx: 250, ry: 40, color: "#F3A77E", peak: 0.16, travel: 80, duration: 52000 },
];

// Irregular, per-lamp rhythm so the flicker never looks synchronized.
const flickerSteps = [
  [0.72, 900],
  [1, 1400],
  [0.86, 700],
  [0.97, 1700],
  [0.64, 520],
  [1, 1200],
  [0.9, 950],
] as const;

type LeafSpec = {
  x: number;
  drift: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  sway: number;
  spin: 1 | -1;
};

// Leaves start under the two maple trees in the top corners.
const leaves: LeafSpec[] = [
  { x: 0.06, drift: 0.18, size: 14, color: "#E0762B", duration: 11000, delay: 0, sway: 18, spin: 1 },
  { x: 0.2, drift: 0.12, size: 11, color: "#C4501E", duration: 13500, delay: 4200, sway: 14, spin: -1 },
  { x: 0.32, drift: 0.1, size: 9, color: "#F2A33A", duration: 12500, delay: 8200, sway: 12, spin: 1 },
  { x: 0.12, drift: 0.22, size: 12, color: "#D9622A", duration: 14500, delay: 11000, sway: 20, spin: -1 },
  { x: 0.94, drift: -0.2, size: 13, color: "#E0762B", duration: 12000, delay: 1800, sway: 16, spin: -1 },
  { x: 0.8, drift: -0.14, size: 10, color: "#F2A33A", duration: 14000, delay: 6000, sway: 13, spin: 1 },
  { x: 0.7, drift: -0.08, size: 12, color: "#C4501E", duration: 11500, delay: 9600, sway: 17, spin: -1 },
  { x: 0.88, drift: -0.24, size: 9, color: "#D9622A", duration: 15000, delay: 13000, sway: 11, spin: 1 },
];

const sine = Easing.inOut(Easing.sin);

// Memoized: Home stays mounted under the game screen and re-renders on every keystroke.
export const LivingBackground = React.memo(function LivingBackground({
  source,
}: {
  source: ImageSourcePropType;
}) {
  const reduced = useReducedMotion();
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 12000, easing: sine, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 12000, easing: sine, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, breath]);

  // Same math as resizeMode="cover": scale to fill, then center.
  const scale = Math.max(size.width / IMAGE.width, size.height / IMAGE.height);
  const offsetX = (size.width - IMAGE.width * scale) / 2;
  const offsetY = (size.height - IMAGE.height * scale) / 2;
  const place = (light: Light) => ({
    cx: offsetX + light.x * scale,
    cy: offsetY + light.y * scale,
    rx: light.rx * scale,
    ry: (light.ry ?? light.rx) * scale,
  });

  return (
    <View
      pointerEvents="none"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [
              { scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1.03, 1.09] }) },
              { translateY: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
            ],
          },
        ]}
      >
        <Animated.Image
          source={source}
          resizeMode="cover"
          // Without explicit size, react-native-web falls back to the image's intrinsic size.
          style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
        />
        {reduced ? null : (
          <>
            {clouds.map((cloud, i) => (
              <Cloud key={`c${i}`} id={`cloud${i}`} {...place(cloud)} light={cloud} travel={cloud.travel * scale} duration={cloud.duration} />
            ))}
            <Reflection id="reflection" {...place(reflection)} light={reflection} />
            {lamps.map((lamp, i) => (
              <Lamp key={`l${i}`} id={`lamp${i}`} index={i} {...place(lamp)} light={lamp} />
            ))}
          </>
        )}
      </Animated.View>
      {reduced ? null : leaves.map((leaf, i) => <Leaf key={i} {...leaf} />)}
    </View>
  );
});

type Placed = { id: string; cx: number; cy: number; rx: number; ry: number; light: Light };

function Glow({ id, cx, cy, rx, ry, light, opacity, translateX }: Placed & {
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
  translateX?: Animated.AnimatedInterpolation<number>;
}) {
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: cx - rx,
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        opacity,
        transform: translateX ? [{ translateX }] : [],
      }}
    >
      <Svg width={rx * 2} height={ry * 2}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor={light.color} stopOpacity={light.peak} />
            <Stop offset="0.45" stopColor={light.color} stopOpacity={light.peak * 0.45} />
            <Stop offset="1" stopColor={light.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={rx} cy={ry} rx={rx} ry={ry} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

function Lamp(props: Placed & { index: number }) {
  const flicker = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const steps = flickerSteps.map((_, i) => flickerSteps[(i + props.index * 2) % flickerSteps.length]);
    const loop = Animated.loop(
      Animated.sequence(
        steps.map(([toValue, duration]) =>
          Animated.timing(flicker, { toValue, duration: duration + props.index * 37, easing: sine, useNativeDriver: true }),
        ),
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [flicker, props.index]);
  return <Glow {...props} opacity={flicker} />;
}

function Reflection(props: Placed) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 3800, easing: sine, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 4600, easing: sine, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  return (
    <Glow
      {...props}
      opacity={shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] })}
      translateX={shimmer.interpolate({ inputRange: [0, 1], outputRange: [-props.rx * 0.06, props.rx * 0.06] })}
    />
  );
}

function Cloud(props: Placed & { travel: number; duration: number }) {
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: props.duration / 2, easing: sine, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: props.duration / 2, easing: sine, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, props.duration]);
  return (
    <Glow
      {...props}
      opacity={drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1, 0.7] })}
      translateX={drift.interpolate({ inputRange: [0, 1], outputRange: [0, props.travel] })}
    />
  );
}

function Leaf({ x, drift, size, color, duration, delay, sway, spin }: LeafSpec) {
  const { width, height } = useWindowDimensions();
  const fall = useRef(new Animated.Value(0)).current;
  const swing = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const falling = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
      ]),
    );
    const swinging = Animated.loop(
      Animated.sequence([
        Animated.timing(swing, { toValue: 1, duration: duration / 5, easing: sine, useNativeDriver: true }),
        Animated.timing(swing, { toValue: 0, duration: duration / 5, easing: sine, useNativeDriver: true }),
      ]),
    );
    falling.start();
    swinging.start();
    return () => {
      falling.stop();
      swinging.stop();
    };
  }, [fall, swing, duration, delay]);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        opacity: fall.interpolate({ inputRange: [0, 0.08, 0.8, 1], outputRange: [0, 0.9, 0.9, 0] }),
        transform: [
          { translateX: fall.interpolate({ inputRange: [0, 1], outputRange: [x * width, (x + drift) * width] }) },
          { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [height * 0.05, height * 0.95] }) },
          { translateX: swing.interpolate({ inputRange: [0, 1], outputRange: [-sway, sway] }) },
          { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${spin * 540}deg`] }) },
        ],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderTopLeftRadius: size,
          borderBottomRightRadius: size,
          borderTopRightRadius: 2,
          borderBottomLeftRadius: 2,
        }}
      />
    </Animated.View>
  );
}
