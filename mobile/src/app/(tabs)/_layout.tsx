import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { IconHome, IconBook, IconTrophy, IconTrendingUp, IconUser } from '@tabler/icons-react-native';
import { fontFamilies } from '@/theme';
import { isLiquidGlassSupported } from '@/hooks/useLiquidGlass';
import FallbackTabBar, { type FallbackTabBarProps } from '@/components/navigation/FallbackTabBar';
import * as haptics from '@/lib/haptics';

const ACCENT = '#FF8A1E';
const MUTED = '#8E8E9F';
const PAGE = '#FFFFFF';

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
  if (isLiquidGlassSupported()) {
    return <IosLiquidGlassTabs />;
  }
  return <FallbackTabs />;
}
