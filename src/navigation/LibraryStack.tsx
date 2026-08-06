import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ContentDetailScreen from "../screens/ContentDetailScreen";
import FlashcardStudyScreen from "../screens/FlashcardStudyScreen";
import LibraryScreen from "../screens/LibraryScreen";
import { LibraryStackParamList } from "../types";

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
      <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
      <Stack.Screen name="FlashcardStudy" component={FlashcardStudyScreen} />
    </Stack.Navigator>
  );
}