import LeagueScreen from "./screens/LeagueScreen";
import React from "react";
import {
  ActivityIndicator,
  View,
} from "react-native";
import { logoFont, Text } from "./AppText";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "./store";
import { productOf } from "./product";
import { Button, C, s } from "./ui";
import { Routes } from "./navigation";
import Home from "./screens/Home";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import Profile from "./screens/Profile";
import ExploreScreen from "./screens/ExploreScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import CharacterSelectionScreen from "./screens/CharacterSelectionScreen";
import MapScreen from "./screens/MapScreen";
import DailyCalendarScreen from "./screens/DailyCalendarScreen";
import SessionScreen from "./screens/SessionScreen";
import TasksScreen from "./screens/TasksScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import FinalIntroScreen from "./screens/FinalIntroScreen";
import MilestoneScreen from "./screens/MilestoneScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NameScreen from "./screens/NameScreen";
import Notices from "./Notices";
const Stack = createNativeStackNavigator<Routes>();
export default function AppNavigation() {
  const { game, ready, error, retry } = useGame(),
    p = productOf(game);
  if (!ready)
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", padding: 24 }]}>
        {error ? (
          <>
            <Text style={s.error}>{error}</Text>
            <Button title="TEKRAR DENE" onPress={retry} />
          </>
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
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: C.bg },
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
              <Stack.Screen name="Tasks" component={TasksScreen} />
              <Stack.Screen
                name="Achievements"
                component={AchievementsScreen}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} />
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
