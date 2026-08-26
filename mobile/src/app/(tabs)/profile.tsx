import { View, Text, Image, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconUser, IconSettings, IconLogout, IconChevronRight } from '@tabler/icons-react-native';
import { useAuthStore } from '@/store/auth.store';
import { useTheme, fontFamilies, fontSizes, radii, spacing, shadows } from '@/theme';
import Badge from '@/components/ui/Badge';
import * as haptics from '@/lib/haptics';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          haptics.medium();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgApp }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>

        <View style={[styles.profileCard, { backgroundColor: colors.surfaceCard }, shadows.sm]}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.brandPrimarySoft }]}>
              <IconUser size={28} color={colors.brandPrimaryHover} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`}</Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
            {user?.level && <Badge variant={user.level}>{user.level}</Badge>}
          </View>
        </View>

        <View style={styles.menu}>
          <MenuRow icon={<IconSettings size={18} color={colors.textSecondary} />} label="Settings" onPress={() => router.push('/settings')} />
          <MenuRow icon={<IconLogout size={18} color={colors.danger} />} label="Sign out" labelColor={colors.danger} onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, labelColor, onPress }: { icon: React.ReactNode; label: string; labelColor?: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => { haptics.light(); onPress(); }}
      style={({ pressed }) => [styles.menuRow, { backgroundColor: colors.surfaceCard, opacity: pressed ? 0.9 : 1 }]}
    >
      {icon}
      <Text style={[styles.menuLabel, { color: labelColor ?? colors.textPrimary }]}>{label}</Text>
      <IconChevronRight size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing['2xl'], gap: spacing.xl },
  title: { fontSize: fontSizes.xl, fontFamily: fontFamilies.displaySemiBold },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.base, padding: spacing.base, borderRadius: radii.lg },
  avatar: { width: 56, height: 56, borderRadius: radii.full },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: fontSizes.base, fontFamily: fontFamilies.sansSemiBold, marginBottom: 2 },
  email: { fontSize: fontSizes.sm, fontFamily: fontFamilies.sans, marginBottom: spacing.xs },
  menu: { gap: spacing.sm },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.base, borderRadius: radii.md },
  menuLabel: { flex: 1, fontSize: fontSizes.base, fontFamily: fontFamilies.sansMedium },
});
