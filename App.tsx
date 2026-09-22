import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GameProvider } from "./src/store";
import { DiscoveryProvider } from "./src/discovery/store";
import AppNavigation from "./src/AppNavigation";
export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <DiscoveryProvider>
          <AppNavigation />
        </DiscoveryProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
