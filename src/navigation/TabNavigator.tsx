import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import AccountStack from "./AccountStack";
import HomeScreen from "../screens/HomeScreen";
import { useSettings } from "../context/SettingsContext";
import { RootTabParamList } from "../types";
import { getTabIcon } from "../utils/icons";
import LibraryStack from "./LibraryStack";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  const { colors } = useSettings();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) =>
          getTabIcon(route.name, focused, color, size),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Biblioteca"
        component={LibraryStack}
        options={{ tabBarLabel: "Biblioteca" }}
      />
      <Tab.Screen
        name="Conta"
        component={AccountStack}
        options={{ tabBarLabel: "Conta" }}
      />
    </Tab.Navigator>
  );
}
