import LeagueScreen from "./screens/LeagueScreen";
import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
import { logoFont, Text } from "./AppText";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "./store";
import { useReminderSync } from "./notifications";
import { useDiscovery } from "./discovery/store";
import { productOf } from "./product";
import { Button, useS } from "./ui";
import { Routes } from "./navigation";
import Home from "./screens/Home";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import AboutScreen from "./screens/AboutScreen";
import Profile from "./screens/Profile";
import ExploreScreen from "./screens/ExploreScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import CharacterSelectionScreen from "./screens/CharacterSelectionScreen";
import MapScreen from "./screens/MapScreen";
import DailyCalendarScreen from "./screens/DailyCalendarScreen";
import SessionScreen from "./screens/SessionScreen";
import ReviewScreen from "./screens/ReviewScreen";
import TasksScreen from "./screens/TasksScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import FinalIntroScreen from "./screens/FinalIntroScreen";
import MilestoneScreen from "./screens/MilestoneScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NameScreen from "./screens/NameScreen";
import Notices from "./Notices";
import { useTheme } from "./themeMode";
const Stack = createNativeStackNavigator<Routes>();
export default function AppNavigation() {
  useReminderSync();
  const { C, light } = useTheme();
  const s = useS();
  const { game, ready, error, retry, reset } = useGame(),
    discovery = useDiscovery(),
    p = productOf(game);
  // A save that cannot be read is never overwritten silently; the player may choose to start over.
  const [confirmReset, setConfirmReset] = useState(false);
  const startOver = async () => {
    await discovery.reset();
    await reset();
    setConfirmReset(false);
  };
  if (!ready)
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", padding: 24, gap: 14 }]}>
        {error ? (
          confirmReset ? (
            <>
              <Text style={s.text}>
                Kayıtlı ilerlemen silinecek ve oyun en baştan başlayacak. Bu işlem geri alınamaz.
              </Text>
              <Button title="EVET, BAŞTAN BAŞLA" onPress={() => void startOver()} />
              <Button secondary title="VAZGEÇ" onPress={() => setConfirmReset(false)} />
            </>
          ) : (
            <>
              <Text style={s.error}>{error}</Text>
              <Button title="TEKRAR DENE" onPress={retry} />
              <Button secondary title="BAŞTAN BAŞLA" onPress={() => setConfirmReset(true)} />
            </>
          )
        ) : (
          <View style={{ alignItems: "center", gap: 24 }}>
            <Text
              style={{
                color: C.ink,
                fontFamily: logoFont,
                fontSize: 48,
                letterSpacing: 5,
              }}
            >
              MÜHÜR
            </Text>
            <Text style={s.label}>HER KAVRAM BİR İZ</Text>
            <ActivityIndicator color={C.gold} />
          </View>
        )}
      </SafeAreaView>
    );
  const stage = !p.hasCompletedOnboarding
    ? "onboarding"
    : !p.firstName || !p.lastName
      ? "name"
      : !p.selectedCharacter
        ? "character"
        : "app";
  return (
    <NavigationContainer
      theme={{
        ...(light ? DefaultTheme : DarkTheme),
        colors: {
          ...(light ? DefaultTheme : DarkTheme).colors,
          background: C.bg,
        },
      }}
    >
      <View style={{ flex: 1 }}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            // Screens under the current one stop re-rendering on every state change (typing).
            freezeOnBlur: true,
            contentStyle: { backgroundColor: C.bg },
            animation: p.settings.reduceMotion ? "none" : "default",
          }}
        >
          {stage === "onboarding" ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : stage === "name" ? (
            <Stack.Screen name="Name" component={NameScreen} />
          ) : stage === "character" ? (
            <Stack.Screen
              name="Character"
              component={CharacterSelectionScreen}
            />
          ) : (
            <Stack.Group navigationKey="app">
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Name" component={NameScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="Explore" component={ExploreScreen} />
              <Stack.Screen name="Profile" component={Profile} />
              <Stack.Screen name="League" component={LeagueScreen} />
              <Stack.Screen name="Game" component={GameScreen} />
              <Stack.Screen name="Result" component={ResultScreen} />
              <Stack.Screen
                name="Character"
                component={CharacterSelectionScreen}
              />
              <Stack.Screen name="Daily" component={DailyCalendarScreen} />
              <Stack.Screen name="DailyPlay" component={SessionScreen} />
              <Stack.Screen name="Practice" component={SessionScreen} />
              <Stack.Screen name="Review" component={ReviewScreen} />
              <Stack.Screen name="Tasks" component={TasksScreen} />
              <Stack.Screen
                name="Achievements"
                component={AchievementsScreen}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
              <Stack.Screen name="FinalIntro" component={FinalIntroScreen} />
              <Stack.Screen name="Milestone" component={MilestoneScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
        {stage === "app" ? <Notices /> : null}
      </View>
    </NavigationContainer>
  );
}
