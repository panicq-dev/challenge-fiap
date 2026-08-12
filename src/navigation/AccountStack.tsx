import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AccountScreen from "../screens/AccountScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import HelpScreen from "../screens/account/HelpScreen";
import PrivacyScreen from "../screens/account/PrivacyScreen";
import SettingsScreen from "../screens/account/SettingsScreen";
import { AccountStackParamList } from "../types";

const Stack = createNativeStackNavigator<AccountStackParamList>();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountMain" component={AccountScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}
