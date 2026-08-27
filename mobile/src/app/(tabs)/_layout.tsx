import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconHome, IconBook, IconTrophy, IconTrendingUp, IconUser } from '@tabler/icons-react-native';
import { useTheme, fontFamilies, fontSizes, spacing } from '@/theme';
import * as haptics from '@/lib/haptics';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => haptics.selection(),
      }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 60 : 56 + insets.bottom,
          paddingBottom: Platform.OS === 'android' ? 8 : insets.bottom,
          paddingTop: spacing.xs,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.brandPrimaryHover,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: fontSizes.xs,
          fontFamily: fontFamilies.sansMedium,
          marginTop: 2,
        },
        tabBarIconStyle: { marginBottom: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconHome size={22} color={color} /> }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses', tabBarIcon: ({ color }) => <IconBook size={22} color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard', tabBarIcon: ({ color }) => <IconTrophy size={22} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }) => <IconTrendingUp size={22} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconUser size={22} color={color} /> }} />
    </Tabs>
  );
}
