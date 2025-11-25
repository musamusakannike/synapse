import { Stack } from "expo-router";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
} from "@expo-google-fonts/outfit";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../contexts/AuthContext";
import { SidebarProvider } from "../contexts/SidebarContext";

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SidebarProvider>
    </AuthProvider>
  );
}
