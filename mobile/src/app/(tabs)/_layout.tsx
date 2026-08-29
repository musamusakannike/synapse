import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconHome, IconBook, IconTrophy, IconTrendingUp, IconUser } from '@tabler/icons-react-native';
import { fontFamilies, fontSizes, shadows } from '@/theme';
import GlassSurface from '@/components/ui/GlassSurface';
import * as haptics from '@/lib/haptics';

const ACCENT = '#FF8A1E';
const MUTED = '#8E8E9F';
const PAGE = '#FFFFFF';

const TAB_ICONS = {
  index: IconHome,
  courses: IconBook,
  leaderboard: IconTrophy,
  progress: IconTrendingUp,
  profile: IconUser,
} as const;

type FallbackTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string; href?: string | null; tabBarAccessibilityLabel?: string } }>;
  navigation: { emit: (e: object) => { defaultPrevented: boolean }; navigate: (name: string) => void };
};

function FallbackTabBar({ state, descriptors, navigation }: FallbackTabBarProps) {
  const insets = useSafeAreaInsets();
  const visible = state.routes.filter((route) => descriptors[route.key]?.options?.href !== null);

  return (
    <View style={[styles.fallbackWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <GlassSurface style={styles.fallbackBar} fallbackStyle={styles.fallbackBarSolid} tintColor="rgba(255,255,255,0.55)">
        {visible.map((route) => {
          const isFocused = state.routes[state.index]?.key === route.key;
          const options = descriptors[route.key]?.options;
          const label = options?.title ?? route.name;
          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? IconHome;
          const color = isFocused ? ACCENT : MUTED;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
              onPress={() => {
                haptics.selection();
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={({ pressed }) => [styles.fallbackItem, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.fallbackIconWell, isFocused && styles.fallbackIconWellActive]}>
                <Icon size={22} color={color} />
              </View>
              <Text style={[styles.fallbackLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </GlassSurface>
    </View>
  );
}

function IosLiquidGlassTabs() {
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={ACCENT}
      iconColor={{ default: MUTED, selected: ACCENT }}
      labelStyle={{
        default: { color: MUTED, fontFamily: fontFamilies.sansMedium, fontSize: 11 },
        selected: { color: ACCENT, fontFamily: fontFamilies.sansBold, fontSize: 11 },
      }}
      blurEffect="systemChromeMaterialLight"
      shadowColor="transparent"
      disableTransparentOnScrollEdge
      screenListeners={{
        tabPress: () => haptics.selection(),
      }}
    >
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: PAGE }}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="courses" contentStyle={{ backgroundColor: PAGE }}>
        <NativeTabs.Trigger.Label>Courses</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leaderboard" contentStyle={{ backgroundColor: PAGE }}>
        <NativeTabs.Trigger.Label>Leaderboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} md="emoji_events" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress" contentStyle={{ backgroundColor: PAGE }}>
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis' }}
          md="trending_up"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" contentStyle={{ backgroundColor: PAGE }}>
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function FallbackTabs() {
  return (
    <Tabs
      tabBar={(props) => <FallbackTabBar {...(props as unknown as FallbackTabBarProps)} />}
      screenListeners={{
        tabPress: () => haptics.selection(),
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: MUTED,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconHome size={22} color={color} /> }} />
      <Tabs.Screen name="courses" options={{ title: 'Courses', tabBarIcon: ({ color }) => <IconBook size={22} color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard', tabBarIcon: ({ color }) => <IconTrophy size={22} color={color} /> }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ color }) => <IconTrendingUp size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconUser size={22} color={color} /> }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  if (Platform.OS === 'ios') {
    return <IosLiquidGlassTabs />;
  }
  return <FallbackTabs />;
}

const styles = StyleSheet.create({
  fallbackWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  fallbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    overflow: 'hidden',
    ...shadows.md,
  },
  fallbackBarSolid: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8EE',
  },
  fallbackItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  fallbackIconWell: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIconWellActive: {
    backgroundColor: 'rgba(255,138,30,0.14)',
  },
  fallbackLabel: {
    fontSize: fontSizes.xs,
    fontFamily: fontFamilies.sansMedium,
  },
});
