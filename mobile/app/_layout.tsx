import { Stack } from "expo-router";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/appwrite";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load fonts
  const [fontsLoaded, fontsError] = useFonts({
    "JetBrainsMono-Medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
    "JetBrainsMono-Bold": require("@/assets/fonts/JetBrainsMono-Bold.ttf"),
  });

  // Handle font loading errors
  useEffect(() => {
    if (fontsError) {
      console.error("Error loading fonts:", fontsError);
    }
  }, [fontsError]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (fontsLoaded) {
      checkAuth();
    }
  }, [fontsLoaded]);

  // Show loading indicator while checking auth or loading fonts
  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#100A1F' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <StatusBar
        barStyle={"light-content"}
        backgroundColor="#100A1F"
        animated
      />
      <Stack.Protected guard={isAuthenticated === true}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Screen name="auth" />
    </Stack>
  );
}
