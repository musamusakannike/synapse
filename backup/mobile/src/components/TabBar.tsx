import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, BookOpen, HelpCircle, MoreHorizontal } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { typography, spacing, radius, fontSize } from '@/constants/theme';
import { haptics } from '@/lib/haptics';

interface TabRoute {
  key: string;
  name: string;
}

interface BottomTabBarProps {
  state: { routes: TabRoute[]; index: number };
  descriptors: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}

const TAB_ICONS = {
  index: Home,
  courses: BookOpen,
  quizzes: HelpCircle,
  more: MoreHorizontal,
};

const TAB_LABELS = {
  index: 'Home',
  courses: 'Courses',
  quizzes: 'Quizzes',
  more: 'More',
};

function TabItem({
  routeName,
  isFocused,
  onPress,
  onLongPress,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { c } = useTheme();
  const scale = useSharedValue(1);
  const progress = useSharedValue(isFocused ? 1 : 0);

  if (progress.value !== (isFocused ? 1 : 0)) {
    progress.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.1]) }],
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: progress.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = TAB_ICONS[routeName as keyof typeof TAB_ICONS];
  const label = TAB_LABELS[routeName as keyof typeof TAB_LABELS];

  if (!IconComponent) return null;

  return (
    <Pressable
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      onLongPress={onLongPress}
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 400 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); }}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabInner, animatedContainerStyle]}>
        <Animated.View
          style={[
            styles.activePill,
            { backgroundColor: c.accentMuted },
            animatedPillStyle,
          ]}
        />
        <Animated.View style={animatedIconStyle}>
          <IconComponent
            size={22}
            color={isFocused ? c.accent : c.textMuted}
            strokeWidth={isFocused ? 2 : 1.5}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            {
              color: isFocused ? c.accent : c.textMuted,
              fontFamily: isFocused ? typography.body.semiBold : typography.body.regular,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.bgSecondary,
          borderTopColor: c.borderSubtle,
          paddingBottom: insets.bottom + spacing.xs,
        },
      ]}
    >
      {state.routes.map((route: TabRoute, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
  },
  tabLabel: {
    fontSize: fontSize['2xs'],
    letterSpacing: 0.1,
  },
});
