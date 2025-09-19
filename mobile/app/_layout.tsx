import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { useFonts } from "expo-font";

const isAuthenticated = false;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
    "JetBrainsMono-Bold": require("@/assets/fonts/JetBrainsMono-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar
        barStyle={"light-content"}
        backgroundColor="#100A1F"
        animated
      />
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Screen name="auth" />
    </Stack>
  );
}
