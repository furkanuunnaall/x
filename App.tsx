import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { GameProvider } from "./src/store";
import { DiscoveryProvider } from "./src/discovery/store";
import AppNavigation from "./src/AppNavigation";
import { fontAssets } from "./src/AppText";
import { ThemeProvider, useTheme } from "./src/themeMode";

function ThemedStatusBar() {
  return <StatusBar style={useTheme().light ? "dark" : "light"} />;
}
export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  if (!fontsLoaded && !fontError) return null;
  return (
    <SafeAreaProvider>
      <GameProvider>
        <ThemeProvider>
          <ThemedStatusBar />
          <DiscoveryProvider>
            <AppNavigation />
          </DiscoveryProvider>
        </ThemeProvider>
      </GameProvider>
    </SafeAreaProvider>
  );
}
