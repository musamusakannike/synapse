import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sparkles,
  History,
  FileText,
  Video,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Crown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/components/Toast';
import { Avatar } from '@/components/Avatar';
import { haptics } from '@/lib/haptics';
import { typography, spacing, fontSize, radius } from '@/constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
  badge?: string;
}

function MenuItem({ icon, label, onPress, rightContent, danger, badge }: MenuItemProps) {
  const { c } = useTheme();

  return (
    <Pressable
      onPress={() => { haptics.light(); onPress(); }}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? c.bgHover : 'transparent' },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? `${c.danger}18` : c.bgTertiary }]}>
        {icon}
      </View>
      <Text
        style={[
          styles.menuLabel,
          {
            color: danger ? c.danger : c.textPrimary,
            fontFamily: typography.body.medium,
          },
        ]}
      >
        {label}
      </Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: c.accent }]}>
          <Text style={[styles.badgeText, { fontFamily: typography.body.bold }]}>{badge}</Text>
        </View>
      ) : null}
      {rightContent ?? (
        <ChevronRight size={16} color={c.textMuted} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { c } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: c.textMuted, fontFamily: typography.body.medium }]}>
      {title}
    </Text>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { c, toggleTheme, isDark } = useTheme();
  const toast = useToast();

  const handleLogout = async () => {
    haptics.heavy();
    await logout();
    toast.success('Signed out', 'See you next time!');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bgPrimary }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* User card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.userCard, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}
        >
          <Avatar name={user?.name} size={48} />
          <View style={styles.userInfo}>
            <Text
              style={[styles.userName, { color: c.textPrimary, fontFamily: typography.display.bold }]}
              numberOfLines={1}
            >
              {user?.name ?? 'User'}
            </Text>
            <Text
              style={[styles.userEmail, { color: c.textMuted, fontFamily: typography.body.regular }]}
              numberOfLines={1}
            >
              {user?.email ?? ''}
            </Text>
          </View>
          {user?.premium ? (
            <View style={[styles.premiumBadge, { backgroundColor: `${c.accent}22`, borderColor: `${c.accent}44` }]}>
              <Crown size={12} color={c.accent} strokeWidth={2} />
              <Text style={[styles.premiumText, { color: c.accent, fontFamily: typography.body.bold }]}>
                Premium
              </Text>
            </View>
          ) : (
            <View style={[styles.premiumBadge, { backgroundColor: c.bgTertiary, borderColor: c.border }]}>
              <Text style={[styles.premiumText, { color: c.textMuted, fontFamily: typography.body.medium }]}>
                Free
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Learning */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <SectionHeader title="LEARN" />
          <View style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
            <MenuItem
              icon={<Sparkles size={18} color={c.accent} strokeWidth={1.5} />}
              label="Ask AI"
              onPress={() => router.push('/ask')}
            />
            <View style={[styles.divider, { backgroundColor: c.borderSubtle }]} />
            <MenuItem
              icon={<History size={18} color={c.textSecondary} strokeWidth={1.5} />}
              label="History"
              onPress={() => router.push('/history')}
            />
            <View style={[styles.divider, { backgroundColor: c.borderSubtle }]} />
            <MenuItem
              icon={<FileText size={18} color={c.textSecondary} strokeWidth={1.5} />}
              label="Documents"
              onPress={() => router.push('/documents')}
            />
            <View style={[styles.divider, { backgroundColor: c.borderSubtle }]} />
            <MenuItem
              icon={<Video size={18} color={c.textSecondary} strokeWidth={1.5} />}
              label="Videos"
              onPress={() => router.push('/videos')}
            />
          </View>
        </Animated.View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SectionHeader title="ACCOUNT" />
          <View style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
            <MenuItem
              icon={<CreditCard size={18} color={c.textSecondary} strokeWidth={1.5} />}
              label="Billing"
              onPress={() => router.push('/billing')}
              badge={user?.premium ? undefined : 'Upgrade'}
            />
            <View style={[styles.divider, { backgroundColor: c.borderSubtle }]} />
            <MenuItem
              icon={<Settings size={18} color={c.textSecondary} strokeWidth={1.5} />}
              label="Settings"
              onPress={() => router.push('/settings')}
            />
          </View>
        </Animated.View>

        {/* Preferences */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <SectionHeader title="PREFERENCES" />
          <View style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
            <MenuItem
              icon={isDark
                ? <Moon size={18} color={c.textSecondary} strokeWidth={1.5} />
                : <Sun size={18} color={c.textSecondary} strokeWidth={1.5} />
              }
              label={isDark ? 'Dark mode' : 'Light mode'}
              onPress={toggleTheme}
              rightContent={
                <Switch
                  value={isDark}
                  onValueChange={() => { haptics.light(); toggleTheme(); }}
                  trackColor={{ false: c.bgTertiary, true: c.accentMuted }}
                  thumbColor={isDark ? c.accent : c.textMuted}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Sign out */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={[styles.section, { backgroundColor: c.bgSecondary, borderColor: c.borderSubtle }]}>
            <MenuItem
              icon={<LogOut size={18} color={c.danger} strokeWidth={1.5} />}
              label="Sign out"
              onPress={handleLogout}
              danger
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing['4xl'],
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  userInfo: { flex: 1, gap: 2 },
  userName: {
    fontSize: fontSize.md,
    letterSpacing: -0.3,
  },
  userEmail: { fontSize: fontSize.xs },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  premiumText: { fontSize: fontSize['2xs'] },
  sectionHeader: {
    fontSize: fontSize['2xs'],
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize['2xs'],
    color: '#0C0C0E',
  },
  divider: {
    height: 1,
    marginLeft: 58,
  },
});
