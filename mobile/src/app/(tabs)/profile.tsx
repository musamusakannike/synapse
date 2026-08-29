import { View, Text, Image, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconUser, IconSettings, IconLogout, IconChevronRight } from '@tabler/icons-react-native';
import { useAuthStore } from '@/store/auth.store';
import { fontFamilies, spacing } from '@/theme';
import { ACCENT, INK, MUTED, TINT_GLASS, TINT_ORANGE } from '@/theme/brand';
import Badge from '@/components/ui/Badge';
import GlassSurface from '@/components/ui/GlassSurface';
import ScreenBackdrop from '@/components/common/ScreenBackdrop';
import ScreenHeader from '@/components/common/ScreenHeader';
import * as haptics from '@/lib/haptics';
import type { ReactNode } from 'react';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
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
    <View collapsable={false} style={styles.container}>
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]} showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Profile" subtitle="Your account and preferences." />

        <GlassSurface style={styles.profileCard} tintColor={TINT_ORANGE}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <IconUser size={28} color={ACCENT} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.level && <Badge variant={user.level}>{user.level}</Badge>}
          </View>
        </GlassSurface>

        <View style={styles.menu}>
          <MenuRow icon={<IconSettings size={20} color={INK} />} label="Settings" onPress={() => router.push('/settings')} />
          <MenuRow icon={<IconLogout size={20} color="#E5484D" />} label="Sign out" danger onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <GlassSurface style={styles.menuRow} isInteractive tintColor={TINT_GLASS}>
        {icon}
        <Text style={[styles.menuLabel, danger && { color: '#E5484D' }]}>{label}</Text>
        <IconChevronRight size={16} color={MUTED} />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'] },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    padding: spacing.base,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,138,30,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 18, fontFamily: fontFamilies.sansBold, color: INK, letterSpacing: -0.2, marginBottom: 2 },
  email: { fontSize: 14, fontFamily: fontFamilies.sans, color: MUTED, marginBottom: spacing.xs },
  menu: { gap: spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: fontFamilies.sansMedium, color: INK },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
