import { NavigationContainer, type NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LibraryProvider } from "./src/context/LibraryContext";
import { SettingsProvider } from "./src/context/SettingsContext";
import LoginScreen from "./src/screens/LoginScreen";
import TabNavigator from "./src/navigation/TabNavigator";
import StatsScreen from "./src/screens/StatsScreen";
import { RootStackParamList } from "./src/types";
import React, { useState, useEffect, useRef } from "react";
import SplashScreen from "./src/components/SplashScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);

  useEffect(() => {
    if (!navigationRef.current || isLoading) {
      return;
    }

    navigationRef.current.reset({
      index: 0,
      routes: [{ name: isAuthenticated ? "Main" : "Login" }],
    });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Stats" component={StatsScreen} />
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

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <LibraryProvider>
            <AppRouter />
          </LibraryProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
