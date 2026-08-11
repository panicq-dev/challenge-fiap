import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LibraryProvider } from "./src/context/LibraryContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import LoginScreen from "./src/screens/LoginScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import { RootStackParamList } from "./src/types";
import React, { useState, useEffect } from "react";
import SplashScreen from "./src/components/SplashScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent({ showSplash }: { showSplash: boolean }) {
  const { mode } = useTheme();

  return showSplash ? (
    <>
      <StatusBar style="light" />
      <SplashScreen />
    </>
  ) : (
    <NavigationContainer>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LibraryProvider>
          <AppContent showSplash={showSplash} />
        </LibraryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
